from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID

from database import get_supabase_db, SupabaseDB
from schemas_supabase import CartItemResponse, CartItemCreate, User
from auth import get_current_user

router = APIRouter(prefix="/cart", tags=["cart"])

@router.get("/", response_model=List[CartItemResponse])
async def get_cart_items(
    current_user: User = Depends(get_current_user),
    db: SupabaseDB = Depends(get_supabase_db)
):
    """Get current user's cart items."""
    try:
        response = db.supabase.table("cart_items").select("""
            *,
            product:products(id, name, price, image_url, stock_quantity, is_active)
        """).eq("user_id", current_user.id).execute()
        
        return response.data if response.data else []
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching cart items: {str(e)}"
        )

@router.post("/", response_model=CartItemResponse)
async def add_to_cart(
    item_data: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: SupabaseDB = Depends(get_supabase_db)
):
    """Add item to cart or update quantity if exists."""
    try:
        # Validate product ID format
        try:
            UUID(item_data.product_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid product ID format"
            )
        
        # Check if product exists and is active
        product_response = db.supabase.table("products").select("id, stock_quantity, is_active").eq("id", item_data.product_id).eq("is_active", True).execute()
        
        if not product_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        product = product_response.data[0]
        
        # Check stock availability
        if product["stock_quantity"] < item_data.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient stock"
            )
        
        # Check if item already in cart
        existing_item_response = db.supabase.table("cart_items").select("*").eq("user_id", current_user.id).eq("product_id", item_data.product_id).execute()
        
        if existing_item_response.data:
            # Update quantity
            existing_item = existing_item_response.data[0]
            new_quantity = existing_item["quantity"] + item_data.quantity
            
            if product["stock_quantity"] < new_quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Insufficient stock"
                )
            
            update_response = db.supabase.table("cart_items").update({
                "quantity": new_quantity
            }).eq("id", existing_item["id"]).execute()
            
            if not update_response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update cart item"
                )
            
            # Get updated item with product details
            updated_item_response = db.supabase.table("cart_items").select("""
                *,
                product:products(id, name, price, image_url, stock_quantity, is_active)
            """).eq("id", existing_item["id"]).execute()
            
            return updated_item_response.data[0]
        else:
            # Create new cart item
            cart_item_data = {
                "user_id": current_user.id,
                "product_id": item_data.product_id,
                "quantity": item_data.quantity
            }
            
            insert_response = db.supabase.table("cart_items").insert(cart_item_data).execute()
            
            if not insert_response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to add item to cart"
                )
            
            # Get created item with product details
            created_item_response = db.supabase.table("cart_items").select("""
                *,
                product:products(id, name, price, image_url, stock_quantity, is_active)
            """).eq("id", insert_response.data[0]["id"]).execute()
            
            return created_item_response.data[0]
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding item to cart: {str(e)}"
        )

@router.put("/{item_id}")
async def update_cart_item(
    item_id: str,
    quantity: int,
    current_user: User = Depends(get_current_user),
    db: SupabaseDB = Depends(get_supabase_db)
):
    """Update cart item quantity."""
    try:
        # Validate UUID format
        try:
            UUID(item_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid cart item ID format"
            )
        
        # Validate quantity
        if quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quantity must be greater than 0"
            )
        
        # Check if cart item exists and belongs to current user
        cart_item_response = db.supabase.table("cart_items").select("*, product:products(stock_quantity)").eq("id", item_id).eq("user_id", current_user.id).execute()
        
        if not cart_item_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item not found"
            )
        
        cart_item = cart_item_response.data[0]
        
        # Check stock availability
        if cart_item["product"]["stock_quantity"] < quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient stock"
            )
        
        # Update quantity
        update_response = db.supabase.table("cart_items").update({
            "quantity": quantity
        }).eq("id", item_id).execute()
        
        if not update_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update cart item"
            )
        
        return {"success": True, "message": "Cart item updated"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating cart item: {str(e)}"
        )

@router.delete("/{item_id}")
async def remove_from_cart(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: SupabaseDB = Depends(get_supabase_db)
):
    """Remove item from cart."""
    try:
        # Validate UUID format
        try:
            UUID(item_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid cart item ID format"
            )
        
        # Check if cart item exists and belongs to current user
        cart_item_response = db.supabase.table("cart_items").select("id").eq("id", item_id).eq("user_id", current_user.id).execute()
        
        if not cart_item_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item not found"
            )
        
        # Delete cart item
        delete_response = db.supabase.table("cart_items").delete().eq("id", item_id).execute()
        
        if not delete_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to remove item from cart"
            )
        
        return {"success": True, "message": "Item removed from cart"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error removing item from cart: {str(e)}"
        )

@router.delete("/")
async def clear_cart(
    current_user: User = Depends(get_current_user),
    db: SupabaseDB = Depends(get_supabase_db)
):
    """Clear all items from cart."""
    try:
        # Delete all cart items for current user
        delete_response = db.supabase.table("cart_items").delete().eq("user_id", current_user.id).execute()
        
        return {"success": True, "message": "Cart cleared"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error clearing cart: {str(e)}"
        )

@router.get("/count")
async def get_cart_count(
    current_user: User = Depends(get_current_user),
    db: SupabaseDB = Depends(get_supabase_db)
):
    """Get total number of items in cart."""
    try:
        response = db.supabase.table("cart_items").select("quantity").eq("user_id", current_user.id).execute()
        
        total_items = sum(item["quantity"] for item in response.data) if response.data else 0
        
        return {"count": total_items}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting cart count: {str(e)}"
        )
