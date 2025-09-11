from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional

from database import get_db
from models import Product, Category, Review, User
from schemas import (
    ProductResponse, ProductCreate, ProductUpdate, 
    CategoryResponse, PaginatedResponse
)
from auth import get_current_user, get_current_admin_user, get_optional_current_user

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/", response_model=PaginatedResponse)
async def get_products(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    sort_by: str = Query("created_desc"),
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    is_featured: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Get products with filtering, search, and pagination."""
    
    # Base query
    query = db.query(Product).filter(Product.is_active == True)
    
    # Apply filters
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_term),
                Product.description.ilike(search_term),
                Product.short_description.ilike(search_term)
            )
        )
    
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    
    if is_featured is not None:
        query = query.filter(Product.is_featured == is_featured)
    
    # Apply sorting
    if sort_by == "name_asc":
        query = query.order_by(Product.name.asc())
    elif sort_by == "name_desc":
        query = query.order_by(Product.name.desc())
    elif sort_by == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort_by == "created_desc":
        query = query.order_by(Product.created_at.desc())
    elif sort_by == "rating_desc":
        # Join with reviews to sort by average rating
        query = query.outerjoin(Review).group_by(Product.id).order_by(
            func.coalesce(func.avg(Review.rating), 0).desc()
        )
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * limit
    products = query.offset(offset).limit(limit).all()
    
    # Calculate average ratings
    product_data = []
    for product in products:
        reviews = db.query(Review).filter(
            and_(Review.product_id == product.id, Review.is_approved == True)
        ).all()
        
        avg_rating = sum(r.rating for r in reviews) / len(reviews) if reviews else None
        review_count = len(reviews)
        
        product_dict = {
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "short_description": product.short_description,
            "price": float(product.price),
            "compare_price": float(product.compare_price) if product.compare_price else None,
            "sku": product.sku,
            "stock_quantity": product.stock_quantity,
            "category_id": product.category_id,
            "image_url": product.image_url,
            "images": product.images,
            "is_active": product.is_active,
            "is_featured": product.is_featured,
            "slug": product.slug,
            "created_at": product.created_at,
            "average_rating": avg_rating,
            "review_count": review_count
        }
        product_data.append(product_dict)
    
    return PaginatedResponse(
        success=True,
        data=product_data,
        pagination={
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": (total + limit - 1) // limit
        }
    )

@router.get("/featured", response_model=List[ProductResponse])
async def get_featured_products(
    limit: int = Query(8, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """Get featured products."""
    products = db.query(Product).filter(
        and_(Product.is_active == True, Product.is_featured == True)
    ).limit(limit).all()
    
    return products

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Get a single product by ID."""
    product = db.query(Product).filter(
        and_(Product.id == product_id, Product.is_active == True)
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return product

@router.get("/slug/{slug}", response_model=ProductResponse)
async def get_product_by_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    """Get a single product by slug."""
    product = db.query(Product).filter(
        and_(Product.slug == slug, Product.is_active == True)
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return product

@router.post("/", response_model=ProductResponse)
async def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new product (admin only)."""
    
    # Check if slug already exists
    existing_product = db.query(Product).filter(Product.slug == product_data.slug).first()
    if existing_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product with this slug already exists"
        )
    
    # Check if SKU already exists
    if product_data.sku:
        existing_sku = db.query(Product).filter(Product.sku == product_data.sku).first()
        if existing_sku:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product with this SKU already exists"
            )
    
    # Create product
    db_product = Product(**product_data.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    return db_product

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update a product (admin only)."""
    
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Update fields
    update_data = product_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    
    return product

@router.delete("/{product_id}")
async def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Soft delete a product (admin only)."""
    
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    product.is_active = False
    db.commit()
    
    return {"success": True, "message": "Product deleted successfully"}
