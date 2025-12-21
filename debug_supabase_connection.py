import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load env vars
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env.local'))

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

print(f"URL: {url}")
# print(f"KEY: {key}") # Don't print secret

if not url or not key:
    print("ERROR: Missing URL or KEY in .env.local")
    exit(1)

try:
    supabase = create_client(url, key)
    print("Client initialized. Fetching drone_pilots...")
    
    # 1. Try Simple Select
    res = supabase.table('drone_pilots').select('*').execute()
    print(f"Simple Query: Got {len(res.data)} rows")
    if len(res.data) > 0:
        print("Sample Row:", res.data[0])
    
    # 2. Try Join
    print("\nAttempting Join with users...")
    try:
        res_join = supabase.table('drone_pilots').select('*, users(first_name, last_name)').execute()
        print(f"Join Query: Got {len(res_join.data)} rows")
    except Exception as e:
        print(f"Join Failed: {e}")

except Exception as e:
    print(f"FATAL ERROR: {e}")
