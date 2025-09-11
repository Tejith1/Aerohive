from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from typing import List, Optional

from database import get_db
from models import Review, Product, Order, OrderItem, User
from schemas import ReviewResponse, ReviewCreate, PaginatedResponse
from auth import get_current_user

router = APIRouter(prefix="/reviews", tags=["reviews"])

@router.get("/product/{product_id}", response_model=PaginatedResponse)
async def get_product_reviews(
    product_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get reviews for a specific product."""
    
    query = db.query(Review).filter(
        and_(Review.product_id == product_id, Review.is_approved == True)
    ).order_by(desc(Review.created_at))
    
    total = query.count()
    offset = (page - 1) * limit
    reviews = query.offset(offset).limit(limit).all()
    
    return PaginatedResponse(
        success=True,
        data=[review.__dict__ for review in reviews],
        pagination={
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": (total + limit - 1) // limit
        }
    )

@router.post("/", response_model=ReviewResponse)
async def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a product review."""
    
    # Check if product exists
    product = db.query(Product).filter(Product.id == review_data.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check if user has purchased this product
    order_item = db.query(OrderItem).join(Order).filter(
        and_(
            Order.user_id == current_user.id,
            OrderItem.product_id == review_data.product_id,
            Order.status == "delivered"
        )
    ).first()
    
    if not order_item:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can only review products you have purchased"
        )
    
    # Check if user already reviewed this product
    existing_review = db.query(Review).filter(
        and_(
            Review.user_id == current_user.id,
            Review.product_id == review_data.product_id
        )
    ).first()
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this product"
        )
    
    # Create review
    review = Review(
        user_id=current_user.id,
        order_id=order_item.order_id,
        is_verified=True,  # Since we verified the purchase
        **review_data.dict()
    )
    
    db.add(review)
    db.commit()
    db.refresh(review)
    
    return review
