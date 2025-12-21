import requests
import json
import os
from dotenv import load_dotenv

BASE_URL = "http://localhost:8000/api/chat"

def final_verification():
    print("--- Final Verification: Unified Data Sync ---")
    
    # 1. Test search with coordinates (Tests the new RPC on drone_pilots table)
    payload = {
        "message": "20 km",
        "state": "RADIUS",
        "context": {
            "lat": 17.5169, 
            "lng": 78.3856,
            "radius_km": 20
        }
    }
    
    try:
        response = requests.post(BASE_URL, json=payload)
        res = response.json()
        
        print(f"Status Code: {response.status_code}")
        print(f"Bot Message: {res.get('message')}")
        
        pilots = res.get('data', {}).get('pilots', [])
        print(f"Pilots Found: {len(pilots)}")
        
        if pilots:
            for p in pilots:
                print(f"- {p['full_name']} ({p.get('specialization', 'N/A')}) - {p.get('distance_km', '?')} km")
            print("\nSUCCESS: Data sync verified. Results are pulling from the database.")
        else:
            print("\nWARNING: No pilots found in DB. Ensure you have registered pilots with coordinates near Nizampet (17.5169, 78.3856).")
            print("Also ensure 'unify_pilot_data.sql' has been applied in Supabase SQL Editor.")

    except Exception as e:
        print(f"ERROR: Verification failed: {e}")

if __name__ == "__main__":
    final_verification()
