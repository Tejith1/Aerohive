from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID, uuid4
from decimal import Decimal

from database import get_db, db
from schemas_supabase import OrderResponse, OrderCreate, OrderUpdate, ResponseModel, PaginatedResponse
from auth import get_current_user, get_current_admin_user
from utils import calculate_order_totals

router = APIRouter(prefix="/orders", tags=["orders"])

def generate_order_number() -> str:
    """Generate a unique order number."""
    import time
    timestamp = str(int(time.time()))
    return f"ORD-{timestamp}"

@router.get("/", response_model=PaginatedResponse)
async def get_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get current user's orders."""
    
    try:
        # Build filters
        filters = {"user_id": current_user["id"]}
        if status:
            filters["status"] = status
        
        # Get total count
        total_result = db.select("orders", columns="count(*)", filters=filters)
        total = total_result.data[0]["count"] if total_result.data else 0
        
        # Get paginated orders
        offset = (page - 1) * limit
        orders_result = db.client.table("orders").select("*").match(filters).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        orders = orders_result.data if orders_result.data else []
        
        # Get order items for each order
        for order in orders:
            items_result = db.select("order_items", filters={"order_id": order["id"]})
            order["items"] = items_result.data if items_result.data else []
        
        return PaginatedResponse(
            data=orders,
            meta={
                "page": page,
                "per_page": limit,
                "total": total,
                "pages": (total + limit - 1) // limit
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch orders: {str(e)}"
        )

@router.get("/admin", response_model=PaginatedResponse)
async def get_all_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    status: Optional[str] = None,
    user_id: Optional[UUID] = None,
    current_admin: dict = Depends(get_current_admin_user)
):
    """Get all orders (admin only)."""
    
    try:
        # Build filters
        filters = {}
        if status:
            filters["status"] = status
        if user_id:
            filters["user_id"] = str(user_id)
        
        # Get total count
        if filters:
            total_result = db.client.table("orders").select("count(*)", count="exact").match(filters).execute()
        else:
            total_result = db.client.table("orders").select("count(*)", count="exact").execute()
        
        total = total_result.count if hasattr(total_result, 'count') else 0
        
        # Get paginated orders
        offset = (page - 1) * limit
        query = db.client.table("orders").select("*")
        
        if filters:
            query = query.match(filters)
            
        orders_result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        orders = orders_result.data if orders_result.data else []
        
        # Get order items and user info for each order
        for order in orders:
            # Get order items
            items_result = db.select("order_items", filters={"order_id": order["id"]})
            order["items"] = items_result.data if items_result.data else []
            
            # Get user info
            if order.get("user_id"):
                user_result = db.select("users", 
                                      columns="id,email,first_name,last_name", 
                                      filters={"id": order["user_id"]})
                order["user"] = user_result.data[0] if user_result.data else None
        
        return PaginatedResponse(
            data=orders,
            meta={
                "page": page,
                "per_page": limit,
                "total": total,
                "pages": (total + limit - 1) // limit
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch orders: {str(e)}"
        )

@router.get("/{order_id}", response_model=ResponseModel)
async def get_order(
    order_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific order."""
    
    try:
        # Get order
        order_result = db.select("orders", filters={"id": str(order_id)})
        
        if not order_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        order = order_result.data[0]
        
        # Check if user owns the order or is admin
        if order["user_id"] != current_user["id"] and not current_user.get("is_admin", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this order"
            )
        
        # Get order items
        items_result = db.select("order_items", filters={"order_id": str(order_id)})
        order["items"] = items_result.data if items_result.data else []
        
        return ResponseModel(
            success=True,
            message="Order retrieved successfully",
            data=order
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch order: {str(e)}"
        )

@router.post("/", response_model=ResponseModel)
async def create_order(
    order_data: OrderCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new order from cart."""
    
    try:
        # Get user's cart items
        cart_result = db.select("cart_items", filters={"user_id": current_user["id"]})
        
        if not cart_result.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cart is empty"
            )
        
        cart_items = cart_result.data
        
        # Calculate order totals
        subtotal = 0
        order_items = []
        
        for cart_item in cart_items:
            # Get product details
            product_result = db.select("products", filters={"id": cart_item["product_id"]})
            if not product_result.data:
                continue
                
            product = product_result.data[0]
            
            # Check stock
            if product["stock_quantity"] < cart_item["quantity"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for product: {product['name']}"
                )
            
            item_total = Decimal(str(product["price"])) * cart_item["quantity"]
            subtotal += item_total
            
            order_items.append({
                "product_id": cart_item["product_id"],
                "product_name": product["name"],
                "product_sku": product.get("sku"),
                "quantity": cart_item["quantity"],
                "unit_price": Decimal(str(product["price"])),
                "total_price": item_total
            })
        
        # Calculate shipping and tax
        shipping_amount = 830 if subtotal < 8300 else 0  # Free shipping over ₹8,300
        tax_amount = subtotal * Decimal("0.08")  # 8% tax
        total_amount = subtotal + shipping_amount + tax_amount
        
        # Create order
        order_id = uuid4()
        order_number = generate_order_number()
        
        order_record = {
            "id": str(order_id),
            "user_id": current_user["id"],
            "order_number": order_number,
            "status": "pending",
            "payment_status": "pending",
            "subtotal": float(subtotal),
            "tax_amount": float(tax_amount),
            "shipping_amount": float(shipping_amount),
            "total_amount": float(total_amount),
            "currency": "INR",
            **order_data.model_dump(exclude_unset=True)
        }
        
        # Insert order
        order_result = db.insert("orders", order_record)
        
        if not order_result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create order"
            )
        
        # Insert order items
        for item in order_items:
            item["id"] = str(uuid4())
            item["order_id"] = str(order_id)
            item["unit_price"] = float(item["unit_price"])
            item["total_price"] = float(item["total_price"])
            
            db.insert("order_items", item)
        
        # Update product stock
        for cart_item in cart_items:
            product_result = db.select("products", filters={"id": cart_item["product_id"]})
            if product_result.data:
                product = product_result.data[0]
                new_stock = product["stock_quantity"] - cart_item["quantity"]
                db.update("products", 
                         {"stock_quantity": new_stock}, 
                         {"id": cart_item["product_id"]})
        
        # Clear cart
        db.delete("cart_items", {"user_id": current_user["id"]})
        
        return ResponseModel(
            success=True,
            message="Order created successfully",
            data={
                "order_id": str(order_id),
                "order_number": order_number,
                "total_amount": float(total_amount)
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create order: {str(e)}"
        )

@router.put("/{order_id}/status", response_model=ResponseModel)
async def update_order_status(
    order_id: UUID,
    order_update: OrderUpdate,
    current_admin: dict = Depends(get_current_admin_user)
):
    """Update order status (admin only)."""
    
    try:
        # Check if order exists
        order_result = db.select("orders", filters={"id": str(order_id)})
        
        if not order_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        # Update order
        update_data = order_update.model_dump(exclude_unset=True)
        
        # Add timestamp fields based on status
        if order_update.status == "shipped" and "shipped_at" not in update_data:
            update_data["shipped_at"] = datetime.utcnow().isoformat()
        elif order_update.status == "delivered" and "delivered_at" not in update_data:
            update_data["delivered_at"] = datetime.utcnow().isoformat()
        
        result = db.update("orders", update_data, {"id": str(order_id)})
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update order"
            )
        
        return ResponseModel(
            success=True,
            message="Order updated successfully",
            data=result.data[0]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update order: {str(e)}"
        )

@router.delete("/{order_id}", response_model=ResponseModel)
async def cancel_order(
    order_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """Cancel an order (if pending)."""
    
    try:
        # Get order
        order_result = db.select("orders", filters={"id": str(order_id)})
        
        if not order_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        order = order_result.data[0]
        
        # Check if user owns the order
        if order["user_id"] != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to cancel this order"
            )
        
        # Check if order can be cancelled
        if order["status"] not in ["pending", "confirmed"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order cannot be cancelled"
            )
        
        # Update order status to cancelled
        result = db.update("orders", 
                          {"status": "cancelled"}, 
                          {"id": str(order_id)})
        
        # Restore product stock
        items_result = db.select("order_items", filters={"order_id": str(order_id)})
        
        for item in items_result.data:
            if item.get("product_id"):
                product_result = db.select("products", filters={"id": item["product_id"]})
                if product_result.data:
                    product = product_result.data[0]
                    new_stock = product["stock_quantity"] + item["quantity"]
                    db.update("products", 
                             {"stock_quantity": new_stock}, 
                             {"id": item["product_id"]})
        
        return ResponseModel(
            success=True,
            message="Order cancelled successfully",
            data={"order_id": str(order_id)}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cancel order: {str(e)}"
        )
