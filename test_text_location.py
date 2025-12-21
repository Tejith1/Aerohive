import requests
import json

BASE_URL = "http://localhost:8000/api/chat"

def test_coords(lat, lng):
    print(f"Testing Coords: {lat}, {lng}")
    res = requests.post(BASE_URL, json={
        "message": "Location Shared", 
        "state": "LOCATION", 
        "context": {"lat": lat, "lng": lng}
    }).json()
    
    print("Response Message:", res.get('message'))
    if res.get('action') == 'show_results':
        pilots = res['data']['pilots']
        print(f"PASS: Got {len(pilots)} pilots")
        for p in pilots:
            print(f" - {p['full_name']} ({p['distance_km']} km)")
    else:
        print("FAIL: Did not show results")

try:
    # Test Hyderabad, India coordinates
    test_coords(17.385, 78.486)
except Exception as e:
    print("Error:", e)
