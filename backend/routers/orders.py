from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from typing import List, Optional
from datetime import datetime

from database import get_db
from models import Order, OrderItem, Product, CartItem, User, Coupon
from schemas import OrderResponse, OrderCreate, PaginatedResponse
from auth import get_current_user, get_current_admin_user
from utils import generate_order_number, calculate_order_totals

router = APIRouter(prefix="/orders", tags=["orders"])

@router.get("/", response_model=PaginatedResponse)
async def get_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's orders."""
    
    query = db.query(Order).filter(Order.user_id == current_user.id)
    
    if status:
        query = query.filter(Order.status == status)
    
    query = query.order_by(desc(Order.created_at))
    
    total = query.count()
    offset = (page - 1) * limit
    orders = query.offset(offset).limit(limit).all()
    
    return PaginatedResponse(
        success=True,
        data=[order.__dict__ for order in orders],
        pagination={
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": (total + limit - 1) // limit
        }
    )

@router.get("/admin", response_model=PaginatedResponse)
async def get_all_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    status: Optional[str] = None,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all orders (admin only)."""
    
    query = db.query(Order)
    
    if status:
        query = query.filter(Order.status == status)
    
    query = query.order_by(desc(Order.created_at))
    
    total = query.count()
    offset = (page - 1) * limit
    orders = query.offset(offset).limit(limit).all()
    
    return PaginatedResponse(
        success=True,
        data=[order.__dict__ for order in orders],
        pagination={
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": (total + limit - 1) // limit
        }
    )

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific order."""
    
    order = db.query(Order).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user owns the order or is admin
    if order.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order"
        )
    
    return order

@router.post("/", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new order from cart items."""
    
    # Get cart items
    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    
    if not cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty"
        )
    
    # Validate stock availability
    for cart_item in cart_items:
        product = db.query(Product).filter(Product.id == cart_item.product_id).first()
        if not product or not product.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {cart_item.product_id} is no longer available"
            )
        if product.stock_quantity < cart_item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {product.name}"
            )
    
    # Calculate totals
    subtotal = sum(
        float(db.query(Product).filter(Product.id == item.product_id).first().price) * item.quantity
        for item in cart_items
    )
    
    # Apply coupon if provided
    discount_amount = 0
    if order_data.coupon_code:
        coupon = db.query(Coupon).filter(
            and_(
                Coupon.code == order_data.coupon_code,
                Coupon.is_active == True
            )
        ).first()
        
        if coupon:
            # Validate coupon
            now = datetime.utcnow()
            if coupon.starts_at and coupon.starts_at > now:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Coupon is not yet active"
                )
            if coupon.expires_at and coupon.expires_at < now:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Coupon has expired"
                )
            if coupon.minimum_amount and subtotal < coupon.minimum_amount:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Minimum order amount of ${coupon.minimum_amount} required"
                )
            if coupon.usage_limit and coupon.used_count >= coupon.usage_limit:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Coupon usage limit exceeded"
                )
            
            # Calculate discount
            if coupon.type == "percentage":
                discount_amount = subtotal * (float(coupon.value) / 100)
            else:  # fixed
                discount_amount = float(coupon.value)
            
            if coupon.maximum_discount and discount_amount > coupon.maximum_discount:
                discount_amount = float(coupon.maximum_discount)
    
    # Calculate other amounts
    shipping_amount = 830 if subtotal < 8300 else 0  # Free shipping over ₹8,300
    tax_amount = (subtotal - discount_amount) * 0.08  # 8% tax
    total_amount = subtotal + shipping_amount + tax_amount - discount_amount
    
    # Create order
    order = Order(
        user_id=current_user.id,
        order_number=generate_order_number(),
        subtotal=subtotal,
        tax_amount=tax_amount,
        shipping_amount=shipping_amount,
        discount_amount=discount_amount,
        total_amount=total_amount,
        **order_data.dict(exclude={"items", "coupon_code"})
    )
    
    db.add(order)
    db.commit()
    db.refresh(order)
    
    # Create order items and update stock
    for cart_item in cart_items:
        product = db.query(Product).filter(Product.id == cart_item.product_id).first()
        
        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            product_name=product.name,
            product_sku=product.sku,
            quantity=cart_item.quantity,
            unit_price=float(product.price),
            total_price=float(product.price) * cart_item.quantity
        )
        db.add(order_item)
        
        # Update stock
        product.stock_quantity -= cart_item.quantity
    
    # Update coupon usage
    if order_data.coupon_code and 'coupon' in locals():
        coupon.used_count += 1
    
    # Clear cart
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    
    db.commit()
    db.refresh(order)
    
    return order

@router.put("/{order_id}/status")
async def update_order_status(
    order_id: int,
    status: str,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update order status (admin only)."""
    
    valid_statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    order.status = status
    
    # Set timestamps for specific statuses
    if status == "shipped":
        order.shipped_at = datetime.utcnow()
    elif status == "delivered":
        order.delivered_at = datetime.utcnow()
    
    db.commit()
    
    return {"success": True, "message": f"Order status updated to {status}"}
