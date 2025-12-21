import requests
import json

BASE_URL = "http://localhost:8000/api/chat"

def test_discovery_flow():
    # 1. Start interaction
    payload = {
        "message": "Hi, I need drone mapping",
        "state": "INIT",
        "context": {}
    }
    print("--- Step 1: Greeting ---")
    res = requests.post(BASE_URL, json=payload).json()
    print(f"Bot: {res['message']}")
    print(f"Next State: {res['next_state']}")
    
    # 2. Provide location text (testing Demo Mode coordinate extraction)
    payload = {
        "message": "nizampet",
        "state": "LOCATION",
        "context": {}
    }
    print("\n--- Step 2: Location Text ---")
    res = requests.post(BASE_URL, json=payload).json()
    print(f"Bot: {res['message']}")
    print(f"Next State: {res['next_state']}")
    print(f"Coordinates in data: {res.get('data')}")
    
    # Verify coordinates are present
    if res.get('data') and res['data'].get('lat'):
        print("Success: Coordinates extracted!")
        coords = res['data']
    else:
        print("Error: Coordinates NOT extracted!")
        return

    # 3. Select radius (testing if coordinates persist and lead to results)
    payload = {
        "message": "20 km",
        "state": "RADIUS",
        "context": {
            "lat": coords['lat'],
            "lng": coords['lng'],
            "radius_km": 20
        }
    }
    print("\n--- Step 3: Radius Selection ---")
    res = requests.post(BASE_URL, json=payload).json()
    print(f"Bot: {res['message']}")
    print(f"Next State: {res['next_state']}")
    print(f"Action: {res['action']}")
    
    if res['action'] == "show_results":
        print("Success: Results action triggered!")
    else:
        print(f"Error: Expected 'show_results' action, got '{res['action']}'")

if __name__ == "__main__":
    test_discovery_flow()
