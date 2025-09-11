from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_admin: bool
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Category schemas
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    slug: str
    image_url: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Product schemas
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: float
    compare_price: Optional[float] = None
    sku: Optional[str] = None
    stock_quantity: int = 0
    category_id: Optional[int] = None
    image_url: Optional[str] = None
    images: List[str] = []
    is_featured: bool = False
    weight: Optional[float] = None
    dimensions: Optional[dict] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    slug: str

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: Optional[float] = None
    compare_price: Optional[float] = None
    stock_quantity: Optional[int] = None
    category_id: Optional[int] = None
    image_url: Optional[str] = None
    images: Optional[List[str]] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None

class ProductResponse(ProductBase):
    id: int
    is_active: bool
    created_at: datetime
    category: Optional[CategoryResponse] = None
    average_rating: Optional[float] = None
    review_count: int = 0
    
    class Config:
        from_attributes = True

# Cart schemas
class CartItemBase(BaseModel):
    product_id: int
    quantity: int

class CartItemCreate(CartItemBase):
    pass

class CartItemResponse(CartItemBase):
    id: int
    product: ProductResponse
    created_at: datetime
    
    class Config:
        from_attributes = True

# Order schemas
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    unit_price: float

class OrderItemResponse(OrderItemBase):
    id: int
    product_name: str
    product_sku: Optional[str] = None
    total_price: float
    product: Optional[ProductResponse] = None
    
    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    shipping_first_name: str
    shipping_last_name: str
    shipping_address_line_1: str
    shipping_city: str
    shipping_state: str
    shipping_postal_code: str
    shipping_country: str
    payment_method: str

class OrderCreate(OrderBase):
    items: List[OrderItemBase]
    coupon_code: Optional[str] = None

class OrderResponse(OrderBase):
    id: int
    order_number: str
    status: str
    payment_status: str
    subtotal: float
    tax_amount: float
    shipping_amount: float
    discount_amount: float
    total_amount: float
    currency: str
    created_at: datetime
    items: List[OrderItemResponse] = []
    
    class Config:
        from_attributes = True

# Review schemas
class ReviewBase(BaseModel):
    rating: int
    title: Optional[str] = None
    comment: Optional[str] = None
    
    @validator('rating')
    def validate_rating(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Rating must be between 1 and 5')
        return v

class ReviewCreate(ReviewBase):
    product_id: int

class ReviewResponse(ReviewBase):
    id: int
    product_id: int
    user: UserResponse
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Generic response schemas
class ApiResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    data: Optional[dict] = None

class PaginatedResponse(BaseModel):
    success: bool
    data: List[dict]
    pagination: dict
