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
ROLE:
You are "AeroBot", the expert AI Assistant for Aerohive Drones (aerohive.co.in).
Your goal is to sell products AND facilitate service bookings.

### 1. PRODUCT SALES
When users ask about drones or products, help them find the right drone for their needs.
Be knowledgeable about drone features, specifications, and use cases.

### 2. SERVICE CATALOG (Bookings)
Use these EXACT categories from the website when users ask for help:

**A. Pilot Services (Hire a Pilot):**
1. Surveying (Land mapping, construction)
2. Spraying (Agricultural crop spraying)
3. 3D Mapping (Topographical data)
4. Inspections (Towers, solar panels, bridges)

**B. Drone Care (Maintenance):**
1. General Checkup
2. Firmware Updates
3. Diagnostic Testing
4. Repair Services

### 3. BOOKING PROTOCOL
If a user wants to book a service or pilot:
1. **Identify Category:** Ask which specific service they need (e.g., "Do you need a pilot for Spraying or Surveying?").
2. **Collect Details:** Once they choose, ask for their **Name, Phone Number, and Location**.
3. **Confirm:** Say "Thank you. Our team will contact you at [Phone Number] to schedule your [Service Name] in [Location]."

### BEHAVIORAL RULES
- If the user asks "What services do you have?", list the headers under "Pilot Services" and "Drone Care".
- Keep answers professional and concise.
- Do not make up services that are not listed here.

Current App State: {state}
User Context: {context}

Analyze the user message and respond with a STRICT JSON object:
1. "intent": ["greet", "list_services", "provide_requirements", "provide_location", "select_radius", "select_pilot", "select_slot", "provide_contact", "confirm_booking", "unknown"]
2. "category": ["Surveying", "Spraying", "3D Mapping", "Inspections", "General Checkup", "Firmware Updates", "Diagnostic Testing", "Repair Services"]
3. "radius_km": [10, 20, 50]
4. "requirements": JSON object with specific details (e.g., acres, hours, problem type).
5. "location_name": Extracted city/area.
6. "response_text": Professional, concise response.
7. "next_state": [INIT, REQUIREMENTS, LOCATION, RADIUS, RESULTS, SLOT, CONTACT, PAYMENT, CONFIRM, SUCCESS]
8. "action": ["request_location", "show_results", "request_radius", "process_booking", "typing", "null"]

CRITICAL: Never expose internal technical details. Be efficient and professional.
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
                "response_text": "I'm AeroChat, your Aerohive assistant. How can I help you today?",
                "action": "null"
            }

            if state == "INIT" or "hello" in msg or "hi" in msg or "hey" in msg:
                ai_data = {
                    "intent": "greet",
                    "response_text": "Hello! I'm AeroChat, your Aerohive assistant. I can help you with:\n\n**Pilot Services:** Surveying, Spraying, 3D Mapping, Inspections\n**Drone Care:** General Checkup, Firmware Updates, Diagnostic Testing, Repair Services\n\nWhat can I assist you with today?",
                    "next_state": "REQUIREMENTS"
                }
            elif "service" in msg or "what do you" in msg or "what can" in msg:
                ai_data = {
                    "intent": "list_services",
                    "response_text": "We offer:\n\n**Pilot Services (Hire a Pilot):**\n• Surveying - Land mapping, construction\n• Spraying - Agricultural crop spraying\n• 3D Mapping - Topographical data\n• Inspections - Towers, solar panels, bridges\n\n**Drone Care (Maintenance):**\n• General Checkup\n• Firmware Updates\n• Diagnostic Testing\n• Repair Services\n\nWhich service interests you?",
                    "next_state": "REQUIREMENTS"
                }
            elif state == "REQUIREMENTS" or any(x in msg for x in ["survey", "spray", "mapping", "3d", "inspect", "checkup", "firmware", "diagnostic", "repair"]):
                 category = "Surveying" if "survey" in msg else "Spraying" if "spray" in msg else "3D Mapping" if ("mapping" in msg or "3d" in msg) else "Inspections" if "inspect" in msg else "General Checkup" if "checkup" in msg else "Firmware Updates" if "firmware" in msg else "Diagnostic Testing" if "diagnostic" in msg else "Repair Services"
                 ai_data = {
                    "intent": "provide_requirements",
                    "category": category,
                    "response_text": f"Great choice! For {category}, I'll need a few details to connect you with the right professional. Could you please share your location?",
                    "next_state": "LOCATION",
                    "action": "request_location"
                }
            elif state == "LOCATION" or "location shared" in msg or "nizampet" in msg or "pragatinagar" in msg or "hyderabad" in msg:
                # Meta-coordinates for common demo locations
                coords = {"lat": 17.5169, "lng": 78.3856} # Nizampet area
                ai_data = {
                    "intent": "provide_location",
                    "response_text": f"Location captured! What search radius should I use to find professionals near you?",
                    "next_state": "RADIUS",
                    "action": "request_radius",
                    "data": coords
                }
            elif state == "RADIUS" or "km" in msg:
                ai_data = {
                    "intent": "select_radius",
                    "radius_km": 10 if "10" in msg else 20 if "20" in msg else 50,
                    "response_text": "Searching for professionals near you...",
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
                location_name = (context.get('location_name') or '').lower()
                
                # Geocode address fallback if coordinates are missing
                if not lat or not lng:
                    print(f"DEBUG: Missing coordinates, trying to resolve from location_name: '{location_name}'")
                    if "hyderabad" in location_name or "kphb" in location_name or "kukatpally" in location_name or "miyapur" in location_name:
                        lat, lng = 17.4855, 78.3885 # KPHB Colony coordinates
                        print(f"DEBUG: Resolved to KPHB coordinates: {lat}, {lng}")
                    elif "mumbai" in location_name or "vashi" in location_name:
                        lat, lng = 19.0760, 72.8777
                    elif "pune" in location_name:
                        lat, lng = 18.5204, 73.8567
                    elif "bangalore" in location_name:
                        lat, lng = 12.9716, 77.5946
                    elif "kolkata" in location_name:
                        lat, lng = 22.5726, 88.3639
                    else:
                        # Default to KPHB Colony for demo
                        lat, lng = 17.4855, 78.3885
                        print(f"DEBUG: Defaulted to KPHB Colony coordinates: {lat}, {lng}")

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
        """Queries drone_pilots table from Supabase, calculates distance, ranks and returns available pilots."""
        if not supabase: 
            print("DEBUG: Supabase not connected, returning empty pilot list")
            return []
        try:
            print(f"DEBUG: Searching pilots - lat: {lat}, lng: {lng}, radius: {radius_km}km, category: {category}")
            
            # 1. Fetch all active and verified pilots
            query = supabase.table('drone_pilots').select('*').eq('is_verified', True).eq('is_active', True)
            response = query.execute()
            pilots = response.data or []
            print(f"DEBUG: Found {len(pilots)} active and verified pilots in database")
            
            # Map category to matching keywords for priority sorting
            keywords = []
            if category:
                cat_lower = category.lower()
                if "spray" in cat_lower or "agri" in cat_lower:
                    keywords = ["agri", "crop", "spray", "spraying", "field"]
                elif "map" in cat_lower or "survey" in cat_lower or "3d" in cat_lower:
                    keywords = ["survey", "mapping", "map", "surveillance", "real estate", "photography", "wedding", "events"]
                elif "inspect" in cat_lower:
                    keywords = ["inspect", "inspection", "tower", "bridge", "solar", "surveillance"]
                else:
                    keywords = [cat_lower]

            area_coords = {
                # Hyderabad
                "miyapur": (17.4968, 78.3615),
                "kukatpally": (17.4855, 78.3885),
                "bachupally": (17.5345, 78.3662),
                "uppal": (17.4018, 78.5602),
                "hyderabad": (17.3850, 78.4867),
                # Mumbai / Navi Mumbai
                "mumbai": (19.0760, 72.8777),
                "vashi": (19.0748, 72.9978),
                "kurla": (19.0726, 72.8836),
                # Pune / Sangvi / Kothrud
                "pune": (18.5204, 73.8567),
                "sangvi": (18.5721, 73.8055),
                "kothrud": (18.5074, 73.8077),
                "maharashtra": (18.5204, 73.8567),
                # Bangalore
                "bangalore": (12.9716, 77.5946),
                "koromangla": (12.9352, 77.6244),
                "jb nagar": (12.9716, 77.5946),
                # Kolkata
                "kolkata": (22.5726, 88.3639),
                "north 24 parganas": (22.7230, 88.4873),
                # Solapur
                "solapur": (17.6599, 75.9064),
                # Coimbatore
                "coimbatore": (11.0168, 76.9558),
                "thudiyalur": (11.0742, 76.9406),
                "saravanapatty": (11.0772, 77.0097),
                # Mandi
                "mandi": (31.5892, 76.9182),
                # Kolhapur / Sangli / Beed
                "kolhapur": (16.7050, 74.2433),
                "sangli": (16.8524, 74.5815),
                "beed": (18.9891, 75.7601),
                "akola": (20.7002, 77.0082),
                # Others / Fallback
                "guntur": (16.3067, 80.4365),
                "andrapradesh": (16.3067, 80.4365),
                "bhopal": (23.2599, 77.4126),
            }

            def get_distance(lat1, lon1, lat2, lon2):
                R = 6371.0
                dlat = math.radians(lat2 - lat1)
                dlon = math.radians(lon2 - lon1)
                a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
                c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
                return R * c

            # Process and rank pilots
            processed_pilots = []
            for pilot in pilots:
                p_area = (pilot.get("area") or "").lower().strip()
                p_loc = (pilot.get("location") or "").lower().strip()
                
                # Resolve coordinates
                p_coords = None
                for key in area_coords:
                    if key in p_area or key in p_loc:
                        p_coords = area_coords[key]
                        break
                
                # If coordinates resolved, calculate distance
                if p_coords:
                    dist = get_distance(lat, lng, p_coords[0], p_coords[1])
                else:
                    # Fallback default distance
                    dist = 999.0
                
                # Calculate category relevance match
                relevance = 0
                specs = (pilot.get("specializations") or "").lower()
                for kw in keywords:
                    if kw in specs:
                        relevance += 1

                processed_pilots.append({
                    "pilot": pilot,
                    "distance_km": round(dist, 1) if p_coords else None,
                    "relevance": relevance
                })

            # Filter by radius
            filtered = []
            for item in processed_pilots:
                dist = item["distance_km"]
                if dist is not None and dist <= radius_km:
                    filtered.append(item)
            
            # Local testing fallback: If empty but user is in Hyderabad, let's keep all Hyderabad pilots!
            if not filtered and (17.0 <= lat <= 18.0 and 78.0 <= lng <= 79.0):
                print("DEBUG: No pilots inside strict radius. Bypassing limit for local Hyderabad testing.")
                for item in processed_pilots:
                    p_loc_lower = (item["pilot"].get("location") or "").lower()
                    if "hyderabad" in p_loc_lower:
                        filtered.append(item)

            # Sort by relevance descending, then by distance ascending
            filtered.sort(key=lambda x: (-x["relevance"], x["distance_km"] or 999.0))
            
            # Limit to top 3 and format for response
            formatted_pilots = []
            for item in filtered[:3]:
                pilot = item["pilot"]
                formatted_pilots.append({
                    "id": pilot.get("id"),
                    "full_name": pilot.get("full_name"),
                    "specialization": pilot.get("specializations"),
                    "hourly_rate": pilot.get("hourly_rate"),
                    "rating": float(pilot.get("rating", 0)) if pilot.get("rating") is not None else 5.0,
                    "location": pilot.get("location"),
                    "area": pilot.get("area"),
                    "experience": pilot.get("experience"),
                    "completed_jobs": pilot.get("completed_jobs", 0),
                    "distance_km": item["distance_km"]
                })

            print(f"DEBUG: Returning {len(formatted_pilots)} matched pilots: {formatted_pilots}")
            return formatted_pilots

        except Exception as e:
            print(f"SEARCH ERROR: {e}")
            return []

    # Placeholder for DB writing
    async def _create_production_booking(self, booking_data: Dict[str, Any]):
        if not supabase: return
        # Logic to insert into bookings_production
        pass

workflow_engine = ChatWorkflow()
