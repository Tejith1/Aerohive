import requests
import json

BASE_URL = "http://localhost:8000/api/chat"

def print_step(name, res):
    print(f"--- {name} ---")
    print(json.dumps(res, indent=2))

try:
    # Step 1: Init
    res1 = requests.post(BASE_URL, json={"message": "hello", "state": "INIT"}).json()
    print_step("INIT Response", res1)

    # Step 2: Requirements
    res2 = requests.post(BASE_URL, json={"message": "I need a wedding photographer", "state": "REQUIREMENTS"}).json()
    print_step("REQUIREMENTS Response", res2)

    # Step 3: Location
    res3 = requests.post(BASE_URL, json={
        "message": "Location Shared", 
        "state": "LOCATION", 
        "context": {"lat": 37.7749, "lng": -122.4194}
    }).json()
    print_step("LOCATION Response", res3)

except Exception as e:
    print("Error:", e)
