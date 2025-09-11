from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
from uuid import UUID

# Base model configuration
class BaseModelConfig(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        validate_assignment=True,
        arbitrary_types_allowed=True,
        json_encoders={
            datetime: lambda v: v.isoformat(),
            Decimal: float,
            UUID: str
        }
    )

# User Models
class UserBase(BaseModelConfig):
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    is_admin: bool = False
    is_active: bool = True

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModelConfig):
    email: EmailStr
    password: str

class UserUpdate(BaseModelConfig):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)

class User(UserBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

class UserResponse(UserBase):
    id: UUID
    created_at: datetime

class Token(BaseModelConfig):
    access_token: str
    token_type: str
    user: UserResponse

# Category Models
class CategoryBase(BaseModelConfig):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    slug: str = Field(..., min_length=1, max_length=100)
    image_url: Optional[str] = Field(None, max_length=500)
    is_active: bool = True

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModelConfig):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    image_url: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None

class Category(CategoryBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

class CategoryResponse(CategoryBase):
    id: UUID
    created_at: datetime

# Product Models
class ProductBase(BaseModelConfig):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    price: Decimal = Field(..., gt=0)
    compare_price: Optional[Decimal] = Field(None, gt=0)
    sku: Optional[str] = Field(None, max_length=100)
    stock_quantity: int = Field(default=0, ge=0)
    category_id: UUID
    image_url: Optional[str] = Field(None, max_length=500)
    images: List[str] = Field(default=[])
    is_active: bool = True
    is_featured: bool = False
    weight: Optional[Decimal] = Field(None, gt=0)
    dimensions: Optional[Dict[str, Any]] = None
    meta_title: Optional[str] = Field(None, max_length=255)
    meta_description: Optional[str] = None
    slug: str = Field(..., min_length=1, max_length=255)
    
    # Drone-specific fields
    product_type: str = Field(default="physical", max_length=50)
    flight_time: Optional[int] = Field(None, gt=0)  # in minutes
    max_speed: Optional[Decimal] = Field(None, gt=0)  # in km/h
    max_range: Optional[Decimal] = Field(None, gt=0)  # in meters
    payload_capacity: Optional[Decimal] = Field(None, gt=0)  # in grams
    camera_resolution: Optional[str] = Field(None, max_length=50)
    gps_enabled: bool = False
    obstacle_avoidance: bool = False
    return_to_home: bool = False
    follow_me_mode: bool = False
    max_altitude: Optional[int] = Field(None, gt=0)  # in meters
    battery_type: Optional[str] = Field(None, max_length=50)
    charging_time: Optional[int] = Field(None, gt=0)  # in minutes
    drone_specifications: Optional[Dict[str, Any]] = None
    customization_options: Optional[Dict[str, Any]] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModelConfig):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    price: Optional[Decimal] = Field(None, gt=0)
    compare_price: Optional[Decimal] = Field(None, gt=0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    category_id: Optional[UUID] = None
    image_url: Optional[str] = Field(None, max_length=500)
    images: Optional[List[str]] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None

class Product(ProductBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

class ProductResponse(ProductBase):
    id: UUID
    created_at: datetime

# Cart Item Models
class CartItemBase(BaseModelConfig):
    user_id: UUID
    product_id: UUID
    quantity: int = Field(default=1, gt=0)
    customization_id: Optional[UUID] = None
    insurance_id: Optional[UUID] = None

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModelConfig):
    quantity: Optional[int] = Field(None, gt=0)
    customization_id: Optional[UUID] = None
    insurance_id: Optional[UUID] = None

class CartItem(CartItemBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

class CartItemResponse(CartItemBase):
    id: UUID
    created_at: datetime

# Order Models
class OrderBase(BaseModelConfig):
    user_id: Optional[UUID] = None
    order_number: str = Field(..., min_length=1, max_length=50)
    status: str = Field(default="pending", max_length=20)
    payment_status: str = Field(default="pending", max_length=20)
    payment_method: Optional[str] = Field(None, max_length=50)
    payment_id: Optional[str] = Field(None, max_length=255)
    subtotal: Decimal = Field(..., ge=0)
    tax_amount: Decimal = Field(default=0, ge=0)
    shipping_amount: Decimal = Field(default=0, ge=0)
    discount_amount: Decimal = Field(default=0, ge=0)
    total_amount: Decimal = Field(..., ge=0)
    currency: str = Field(default="INR", max_length=3)
    
    # Shipping address fields
    shipping_first_name: Optional[str] = Field(None, max_length=100)
    shipping_last_name: Optional[str] = Field(None, max_length=100)
    shipping_company: Optional[str] = Field(None, max_length=100)
    shipping_address_line_1: Optional[str] = Field(None, max_length=255)
    shipping_address_line_2: Optional[str] = Field(None, max_length=255)
    shipping_city: Optional[str] = Field(None, max_length=100)
    shipping_state: Optional[str] = Field(None, max_length=100)
    shipping_postal_code: Optional[str] = Field(None, max_length=20)
    shipping_country: Optional[str] = Field(None, max_length=100)
    shipping_phone: Optional[str] = Field(None, max_length=20)
    
    # Billing address fields
    billing_first_name: Optional[str] = Field(None, max_length=100)
    billing_last_name: Optional[str] = Field(None, max_length=100)
    billing_company: Optional[str] = Field(None, max_length=100)
    billing_address_line_1: Optional[str] = Field(None, max_length=255)
    billing_address_line_2: Optional[str] = Field(None, max_length=255)
    billing_city: Optional[str] = Field(None, max_length=100)
    billing_state: Optional[str] = Field(None, max_length=100)
    billing_postal_code: Optional[str] = Field(None, max_length=20)
    billing_country: Optional[str] = Field(None, max_length=100)
    billing_phone: Optional[str] = Field(None, max_length=20)
    
    notes: Optional[str] = None

class OrderCreate(OrderBase):
    items: List[Dict[str, Any]] = []

class OrderUpdate(BaseModelConfig):
    status: Optional[str] = Field(None, max_length=20)
    payment_status: Optional[str] = Field(None, max_length=20)
    notes: Optional[str] = None

class Order(OrderBase):
    id: UUID
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

class OrderResponse(OrderBase):
    id: UUID
    created_at: datetime

# Order Item Models
class OrderItemBase(BaseModelConfig):
    order_id: UUID
    product_id: Optional[UUID] = None
    product_name: str = Field(..., min_length=1, max_length=255)
    product_sku: Optional[str] = Field(None, max_length=100)
    quantity: int = Field(..., gt=0)
    unit_price: Decimal = Field(..., ge=0)
    total_price: Decimal = Field(..., ge=0)

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase):
    id: UUID
    created_at: datetime

# Review Models
class ReviewBase(BaseModelConfig):
    product_id: UUID
    user_id: UUID
    order_id: Optional[UUID] = None
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = Field(None, max_length=255)
    comment: Optional[str] = None
    is_verified: bool = False
    is_approved: bool = True

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(BaseModelConfig):
    rating: Optional[int] = Field(None, ge=1, le=5)
    title: Optional[str] = Field(None, max_length=255)
    comment: Optional[str] = None
    is_approved: Optional[bool] = None

class Review(ReviewBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

class ReviewResponse(ReviewBase):
    id: UUID
    created_at: datetime

# Coupon Models
class CouponBase(BaseModelConfig):
    code: str = Field(..., min_length=1, max_length=50)
    type: str = Field(..., max_length=20)  # "percentage" or "fixed"
    value: Decimal = Field(..., gt=0)
    minimum_amount: Optional[Decimal] = Field(None, ge=0)
    maximum_discount: Optional[Decimal] = Field(None, gt=0)
    usage_limit: Optional[int] = Field(None, gt=0)
    is_active: bool = True
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

class CouponCreate(CouponBase):
    pass

class CouponUpdate(BaseModelConfig):
    code: Optional[str] = Field(None, min_length=1, max_length=50)
    value: Optional[Decimal] = Field(None, gt=0)
    is_active: Optional[bool] = None
    expires_at: Optional[datetime] = None

class Coupon(CouponBase):
    id: UUID
    used_count: int = 0
    created_at: datetime
    updated_at: datetime

# Response Models
class ResponseModel(BaseModelConfig):
    success: bool
    message: str
    data: Optional[Any] = None

class PaginationMeta(BaseModelConfig):
    page: int
    per_page: int
    total: int
    pages: int

class PaginatedResponse(BaseModelConfig):
    data: List[Any]
    meta: PaginationMeta
