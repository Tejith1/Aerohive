from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from workflow import workflow_engine, supabase, model
import json
import asyncio
from datetime import datetime

app = FastAPI(title="AeroHive Production API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class ChatRequest(BaseModel):
    message: str
    state: str
    context: Optional[Dict[str, Any]] = {}

class ChatResponse(BaseModel):
    message: str
    next_state: str
    action: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

class LocationRequest(BaseModel):
    lat: float
    lng: float

class PilotSearchRequest(BaseModel):
    lat: float
    lng: float
    radius_km: int
    category: Optional[str] = None

class BookingRequest(BaseModel):
    client_id: str
    pilot_id: str
    service_type: str
    lat: float
    lng: float
    scheduled_at: str
    duration_hours: int
    payment_method: str
    requirements: Optional[Dict[str, Any]] = {}

# --- REST Endpoints ---

@app.get("/")
def read_root():
    return {"status": "AeroHive AI Backend Online", "version": "2.0.0-PROD"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        response = workflow_engine.process_message(request.message, request.state, request.context)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/location/detect")
async def detect_location(req: LocationRequest):
    # Reverse geocode or enrich location data
    return {"status": "success", "lat": req.lat, "lng": req.lng, "formatted_address": "Detected Location"}

@app.post("/api/pilots/search")
async def search_pilots(req: PilotSearchRequest):
    try:
        pilots = workflow_engine._search_production_pilots(req.lat, req.lng, req.radius_km, req.category)
        return {"status": "success", "results": pilots}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/bookings/create")
async def create_booking(req: BookingRequest):
    booking_id = workflow_engine.generate_booking_id(req.service_type)
    try:
        if supabase:
            # 1. Insert Booking
            res = supabase.table('bookings').insert({
                "id": booking_id,
                "client_id": req.client_id,
                "pilot_id": req.pilot_id,
                "service_type": req.service_type,
                "status": "confirmed",
                "scheduled_at": req.scheduled_at,
                "duration_hours": req.duration_hours,
                "payment_method": req.payment_method,
                "requirements": req.requirements
            }).execute()

            # 2. Trigger Notifications (In background)
            try:
                # Fetch Pilot & Client Details for the message
                pilot_res = supabase.table('drone_pilots').select("*").eq('id', req.pilot_id).single().execute()
                pilot_data = pilot_res.data or {}
                
                # Fetch Client Data (from auth.users if available, or just use what we have)
                # For demo, we assume the req contains enough or we fetch more
                user_data = {"name": "Valued Client", "email": "client@example.com", "phone": "1234567890"}
                
                from notifications import notifier
                notifier.send_booking_notifications(
                    booking_data={"id": booking_id, "service_type": req.service_type, "scheduled_at": req.scheduled_at, "requirements": req.requirements},
                    pilot_data=pilot_data,
                    user_data=user_data
                )
            except Exception as notify_err:
                print(f"DEBUG: Notification failed (continuing): {notify_err}")

        return {"status": "success", "booking_id": booking_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- WebSocket Live Tracking ---

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, booking_id: str):
        await websocket.accept()
        if booking_id not in self.active_connections:
            self.active_connections[booking_id] = []
        self.active_connections[booking_id].append(websocket)

    def disconnect(self, websocket: WebSocket, booking_id: str):
        if booking_id in self.active_connections:
            self.active_connections[booking_id].remove(websocket)

    async def broadcast_tracking(self, booking_id: str, data: dict):
        if booking_id in self.active_connections:
            for connection in self.active_connections[booking_id]:
                await connection.send_json(data)

manager = ConnectionManager()

@app.websocket("/ws/tracking/{booking_id}")
async def tracking_websocket(websocket: WebSocket, booking_id: str):
    # Production Auth Check would go here
    await manager.connect(websocket, booking_id)
    
    # Pre-select some random mock locations for simulation (moving slightly)
    # Start near common user areas
    base_lat, base_lng = 17.5169, 78.3856 # Default Nizampet
    
    simulation_task = None
    
    async def simulate_movement():
        try:
            curr_lat, curr_lng = base_lat, base_lng
            while True:
                # Move drone slightly closer or around
                curr_lat += (random.random() - 0.5) * 0.001
                curr_lng += (random.random() - 0.5) * 0.001
                
                await manager.broadcast_tracking(booking_id, {
                    "booking_id": booking_id,
                    "timestamp": datetime.now().isoformat(),
                    "location": {"lat": curr_lat, "lng": curr_lng},
                    "status": "in_transit"
                })
                await asyncio.sleep(3) # Update every 3 seconds
        except asyncio.CancelledError:
            pass
        except Exception as e:
            print(f"Simulation Error: {e}")

    # Start simulation in background
    import random
    simulation_task = asyncio.create_task(simulate_movement())
    
    try:
        while True:
            # Wait for any incoming messages (like client manual pings)
            data = await websocket.receive_text()
            try:
                location = json.loads(data)
                await manager.broadcast_tracking(booking_id, {
                    "booking_id": booking_id,
                    "timestamp": datetime.now().isoformat(),
                    "location": location,
                    "status": "custom_ping"
                })
            except json.JSONDecodeError:
                pass # Ignore malformed pings
    except WebSocketDisconnect:
        if simulation_task:
            simulation_task.cancel()
        manager.disconnect(websocket, booking_id)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "database": "connected" if supabase else "disconnected",
        "ai_orchestrator": "demo_mode" if not model else "gemini_online"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
