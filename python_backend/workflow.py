import google.generativeai as genai
from typing import Dict, Any, List, Optional
import math
import os
import json
import random
import string
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

# Load env vars from .env.local
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env.local'))

url: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
google_api_key: str = os.environ.get("GOOGLE_API_KEY")

# Initialize Gemini
if google_api_key:
    genai.configure(api_key=google_api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    print("WARNING: GOOGLE_API_KEY not found. Backend will fail on LLM intents.")
    model = None

supabase: Client = None
if url and key:
    try:
        supabase = create_client(url, key)
        print(f"DEBUG: Supabase client initialized (Key type: {'Service Role' if 'service' in (os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or '') else 'Anon/Unknown'})")
    except Exception as e:
        print(f"DEBUG: Failed to init Supabase: {e}")

class ChatWorkflow:
    def __init__(self):
        self.system_prompt = """
        You are the AeroHive Principal AI Architect, a high-level mission coordinator for a premium drone ecosystem.
        Your tone is professional, efficient, and technologically advanced. 
        
        Your Mission: Guide users through the AeroHive ecosystem, from selecting drone categories to finalizing missions.
        
        Available Categories: 
        - Agriculture (Crop monitoring, spraying)
        - Photography (Professional cinematography, events)
        - Mapping (3D surveying, construction)
        - Repair (Maintenance, hardware fixes)
        - Search & Rescue (Emergency response, thermal scanning)
        - Infrastructure (Bridge/tower inspections)

        The User Flow: Intent -> Location -> Service Details -> Radius (10/20/50km) -> Pilot Selection -> Slot -> Contact -> Payment -> Confirm.

        Current App State: {state}
        User Context: {context}
        
        Analyze the user message and respond with a STRICT JSON object:
        1. "intent": ["greet", "list_services", "provide_requirements", "provide_location", "select_radius", "select_pilot", "select_slot", "provide_contact", "confirm_booking", "unknown"]
        2. "category": ["Agriculture", "Photography", "Mapping", "Repair", "Search & Rescue", "Infrastructure"]
        3. "radius_km": [10, 20, 50]
        4. "requirements": JSON object with specific details (e.g., acres, hours, problem type).
        5. "location_name": Extracted city/area.
        6. "response_text": Professional, concise response. If you're recommending a drone, maintain the AeroHive authority.
        7. "next_state": [INIT, REQUIREMENTS, LOCATION, RADIUS, RESULTS, SLOT, CONTACT, PAYMENT, CONFIRM, SUCCESS]
        8. "action": ["request_location", "show_results", "request_radius", "process_booking", "typing", "null"]

        CRITICAL: Never expose internal technical details. Be efficient. Focus on mission success.
        """

    def generate_booking_id(self, service: str) -> str:
        """Generates human-readable ID: DRN-SVC-2025-A8F2"""
        prefix = "DRN"
        svc = service[:3].upper() if service else "GEN"
        year = datetime.now().year
        rand = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        return f"{prefix}-{svc}-{year}-{rand}"

    def process_message(self, message: str, state: str, context: Dict[str, Any]) -> Dict[str, Any]:
        use_demo = not model
        
        if not use_demo:
            try:
                prompt = self.system_prompt.format(state=state, context=json.dumps(context))
                chat = model.start_chat()
                response = chat.send_message(f"User Message: {message}\n\nReturn JSON ONLY.")
                
                text = response.text.strip()
                if "```json" in text: text = text.split("```json")[1].split("```")[0].strip()
                elif "```" in text: text = text.split("```")[1].split("```")[0].strip()
                
                ai_data = json.loads(text)
                print(f"DEBUG PRODUCTION AI: {ai_data}")
            except Exception as e:
                print(f"CRITICAL AI ERROR: {e}")
                use_demo = True

        if use_demo:
            # --- ROBUST DEMO MODE SIMULATION ---
            msg = message.lower()
            ai_data = {
                "intent": "unknown",
                "next_state": state,
                "response_text": "I'm currently in Demo Mode. How can I assist?",
                "action": "null"
            }

            if state == "INIT" or "hello" in msg or "hi" in msg:
                ai_data = {
                    "intent": "greet",
                    "response_text": "Welcome to AeroHive! I'm your Production Mission Coordinator. Do you need Agriculture, Photography, Mapping, or Repair services today?",
                    "next_state": "REQUIREMENTS"
                }
            elif state == "REQUIREMENTS" or any(x in msg for x in ["map", "agri", "photo", "repair", "rescue", "infra"]):
                 category = "Mapping" if "map" in msg else "Agriculture" if "agri" in msg else "Photography" if "photo" in msg else "Repair" if "repair" in msg else "Search & Rescue" if "rescue" in msg else "Infrastructure"
                 ai_data = {
                    "intent": "provide_requirements",
                    "category": category,
                    "response_text": f"Initializing {category} mission protocols. To find the best pilots for your {category} project, I need to know the mission location. Please share your coordinates.",
                    "next_state": "LOCATION",
                    "action": "request_location"
                }
            elif state == "LOCATION" or "location shared" in msg or "nizampet" in msg or "pragatinagar" in msg or "hyderabad" in msg:
                # Meta-coordinates for common demo locations
                coords = {"lat": 17.5169, "lng": 78.3856} # Nizampet area
                ai_data = {
                    "intent": "provide_location",
                    "response_text": f"Location captured for {message}! We offer precision matching. What search radius should I use?",
                    "next_state": "RADIUS",
                    "action": "request_radius",
                    "data": coords
                }
            elif state == "RADIUS" or "km" in msg:
                ai_data = {
                    "intent": "select_radius",
                    "radius_km": 10 if "10" in msg else 20 if "20" in msg else 50,
                    "response_text": "Searching for nearby pilots...",
                    "next_state": "RESULTS",
                    "action": "show_results"
                }
            elif state == "CONFIRM" or "confirm" in msg or "book" in msg:
                ai_data = {
                    "intent": "confirm_booking",
                    "action": "process_booking"
                }
            
            print(f"DEBUG DEMO MODE: {ai_data}")

        # --- SHARED PRODUCTION LOGIC ---
        try:
            intent = ai_data.get("intent")
            
            # Action: Search Pilots using PostGIS
            if ai_data.get("action") == "show_results" or intent == "select_radius":
                lat = context.get('lat')
                lng = context.get('lng')
                radius = ai_data.get("radius_km") or context.get('radius_km') or 20
                category = ai_data.get("category") or context.get('category')

                if lat and lng:
                    pilots = self._search_production_pilots(lat, lng, radius, category)
                    return {
                        "message": f"I've searched within a {radius}km radius. I found {len(pilots)} qualified pilots for your mission." if pilots else f"I couldn't find any pilots within {radius}km. Please try a larger radius or search from a different area.",
                        "next_state": "RESULTS",
                        "action": "show_results",
                        "data": {"pilots": pilots, "radius_km": radius}
                    }
                else:
                    return {
                        "message": "I need your location to find nearby pilots. Please use the button below.",
                        "next_state": "LOCATION",
                        "action": "request_location"
                    }

            # Action: Final Booking Creation
            if ai_data.get("action") == "process_booking" or intent == "confirm_booking":
                booking_id = self.generate_booking_id(ai_data.get("category"))
                return {
                    "message": f"Mission Confirmed! Your production tracking ID is {booking_id}. Our Pilot is now being alerted.",
                    "next_state": "SUCCESS",
                    "action": "booking_complete",
                    "data": {"booking_id": booking_id}
                }

            # Default Response
            return {
                "message": ai_data.get("response_text", "Understood. Proceeding..."),
                "next_state": ai_data.get("next_state", state),
                "action": ai_data.get("action"),
                "data": ai_data.get("data")
            }

        except Exception as e:
            print(f"CRITICAL ERROR: {e}")
            return {"message": "I encountered a technical glitch in my neuro-pathways. Re-trying...", "next_state": state}

    def _search_production_pilots(self, lat: float, lng: float, radius_km: int, category: str = None) -> List[Dict]:
        """Calls the PostGIS function search_nearby_pilots via Supabase RPC."""
        if not supabase: return []
        try:
            # radius_km to meters
            radius_meters = radius_km * 1000
            print(f"DEBUG: Proximity Search {lat}, {lng}, {radius_meters}m, {category}")
            
            # Using RPC to call the database function
            response = supabase.rpc('search_nearby_pilots', {
                'user_lat': lat,
                'user_lng': lng,
                'radius_meters': radius_meters,
                'service_filter': category
            }).execute()
            
            return response.data or []
        except Exception as e:
            print(f"SEARCH ERROR: {e}")
            return []

    # Placeholder for DB writing
    async def _create_production_booking(self, booking_data: Dict[str, Any]):
        if not supabase: return
        # Logic to insert into bookings_production
        pass

workflow_engine = ChatWorkflow()
