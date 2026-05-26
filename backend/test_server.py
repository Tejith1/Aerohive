from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Aerohive API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Aerohive API is running!", "status": "success"}

@app.get("/health")
def health_check():
    supabase_url = os.getenv("SUPABASE_URL", "")
    return {
        "status": "healthy",
        "database": "connected" if supabase_url else "not configured",
        "supabase_url": supabase_url[:30] + "..." if supabase_url else None
    }

@app.get("/test-env")
def test_environment():
    return {
        "supabase_url_present": bool(os.getenv("SUPABASE_URL")),
        "service_key_present": bool(os.getenv("SUPABASE_SERVICE_ROLE_KEY")),
        "anon_key_present": bool(os.getenv("SUPABASE_ANON_KEY"))
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)