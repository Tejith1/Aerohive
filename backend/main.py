from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uvicorn
import os
from datetime import datetime, timedelta
from typing import Optional

from database import get_supabase_db, SupabaseDB
from schemas_supabase import UserCreate, UserLogin, UserResponse, Token, ResponseModel, User
from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    verify_token,
    get_current_user
)

# Import Supabase routers
from routers import (
    products_supabase as products,
    categories_supabase as categories,
    cart_supabase as cart,
    orders_supabase as orders,
    reviews_supabase as reviews
)

app = FastAPI(
    title="Aerohive Drone Store API",
    description="Drone E-commerce API with Supabase backend",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

app.include_router(products.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(cart.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "EcoShop API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Authentication endpoints
@app.post("/auth/register", response_model=ResponseModel)
async def register(user_data: UserCreate, db: SupabaseDB = Depends(get_supabase_db)):
    try:
        # Check if user already exists
        existing_user_response = db.supabase.table("users").select("id").eq("email", user_data.email).execute()
        if existing_user_response.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create user in Supabase Auth
        auth_response = db.supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "first_name": user_data.first_name,
                    "last_name": user_data.last_name,
                    "phone": user_data.phone
                }
            }
        })
        
        if auth_response.user:
            # Create user record in database
            user_record = {
                "id": auth_response.user.id,
                "email": user_data.email,
                "password_hash": get_password_hash(user_data.password),
                "first_name": user_data.first_name,
                "last_name": user_data.last_name,
                "phone": user_data.phone,
                "is_admin": user_data.is_admin,
                "is_active": user_data.is_active
            }
            
            db_result = db.supabase.table("users").insert(user_record).execute()
            
            return ResponseModel(
                success=True,
                message="User registered successfully",
                data={
                    "user_id": auth_response.user.id,
                    "email": user_data.email,
                    "confirmation_sent": True
                }
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@app.post("/auth/login", response_model=Token)
async def login(user_credentials: UserLogin, db: SupabaseDB = Depends(get_supabase_db)):
    try:
        # Authenticate with Supabase
        auth_response = db.supabase.auth.sign_in_with_password({
            "email": user_credentials.email,
            "password": user_credentials.password
        })
        
        if auth_response.user and auth_response.session:
            # Get user data from database
            user_data_response = db.supabase.table("users").select("*").eq("id", auth_response.user.id).execute()
            
            if not user_data_response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            user = user_data_response.data[0]
            
            if not user.get("is_active", True):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Account is deactivated"
                )
            
            return Token(
                access_token=auth_response.session.access_token,
                token_type="bearer",
                user=UserResponse(
                    id=user["id"],
                    email=user["email"],
                    first_name=user["first_name"],
                    last_name=user["last_name"],
                    phone=user.get("phone"),
                    is_admin=user.get("is_admin", False),
                    is_active=user.get("is_active", True),
                    created_at=user["created_at"]
                )
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )
@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        phone=current_user.phone,
        is_admin=current_user.is_admin,
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
