from supabase import create_client, Client
import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required")

# Create Supabase client with minimal configuration
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("Supabase client created successfully!")
except Exception as e:
    print(f"Failed to create Supabase client: {e}")
    raise

# Database helper functions
class SupabaseDB:
    def __init__(self):
        self.client = supabase
    
    def select(self, table: str, columns: str = "*", filters: Optional[dict] = None):
        """Select data from table with optional filters"""
        query = self.client.table(table).select(columns)
        
        if filters:
            for key, value in filters.items():
                if isinstance(value, dict):
                    # Handle operators like {"gte": 100} or {"ilike": "%search%"}
                    for operator, operand in value.items():
                        query = getattr(query, operator)(key, operand)
                else:
                    query = query.eq(key, value)
        
        return query.execute()
    
    def insert(self, table: str, data: dict):
        """Insert data into table"""
        return self.client.table(table).insert(data).execute()
    
    def update(self, table: str, data: dict, filters: dict):
        """Update data in table"""
        query = self.client.table(table).update(data)
        
        for key, value in filters.items():
            query = query.eq(key, value)
            
        return query.execute()
    
    def delete(self, table: str, filters: dict):
        """Delete data from table"""
        query = self.client.table(table).delete()
        
        for key, value in filters.items():
            query = query.eq(key, value)
            
        return query.execute()
    
    def upsert(self, table: str, data: dict):
        """Insert or update data"""
        return self.client.table(table).upsert(data).execute()
    
    def rpc(self, function_name: str, params: dict = None):
        """Call a PostgreSQL function"""
        return self.client.rpc(function_name, params or {}).execute()

# Create database instance
db = SupabaseDB()

# Dependency to get database client
def get_db():
    return db

# Authentication helpers
def verify_token(token: str):
    """Verify JWT token"""
    try:
        user = supabase.auth.get_user(token)
        return user
    except Exception:
        return None

def create_user(email: str, password: str, user_metadata: dict = None):
    """Create a new user"""
    return supabase.auth.sign_up({
        "email": email,
        "password": password,
        "options": {
            "data": user_metadata or {}
        }
    })

def authenticate_user(email: str, password: str):
    """Authenticate user"""
    return supabase.auth.sign_in_with_password({
        "email": email,
        "password": password
    })

def refresh_token(refresh_token: str):
    """Refresh access token"""
    return supabase.auth.refresh_session(refresh_token)

def sign_out():
    """Sign out user"""
    return supabase.auth.sign_out()
