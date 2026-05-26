from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from uuid import UUID

from database import get_supabase_db, SupabaseDB
from schemas_supabase import ReviewResponse, ReviewCreate, PaginatedResponse, User
from auth import get_current_user

router = APIRouter(prefix="/reviews", tags=["reviews"])

@router.get("/product/{product_id}", response_model=PaginatedResponse)
async def get_product_reviews(
    product_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: SupabaseDB = Depends(get_supabase_db)
):
    """Get reviews for a specific product."""
    try:
        # Validate UUID format
        try:
            UUID(product_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid product ID format"
            )
        
        # Get total count
        count_response = db.supabase.table("reviews").select("id", count="exact").eq("product_id", product_id).eq("is_approved", True).execute()
        total = count_response.count if count_response.count is not None else 0
        
        # Get reviews with pagination
        offset = (page - 1) * limit
        response = db.supabase.table("reviews").select("""
            *,
            user:users(first_name, last_name),
            product:products(name)
        """).eq("product_id", product_id).eq("is_approved", True).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        reviews = response.data if response.data else []
        
        return PaginatedResponse(
            success=True,
            data=reviews,
            pagination={
                "page": page,
                "limit": limit,
                "total": total,
                "total_pages": (total + limit - 1) // limit
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching reviews: {str(e)}"
        )

@router.get("/user", response_model=List[ReviewResponse])
async def get_user_reviews(
    current_user: User = Depends(get_current_user),
    db: SupabaseDB = Depends(get_supabase_db)
):
    """Get current user's reviews."""
    try:
        response = db.supabase.table("reviews").select("""
            *,
            product:products(id, name, image_url)
        """).eq("user_id", current_user.id).order("created_at", desc=True).execute()
        
        return response.data if response.data else []
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user reviews: {str(e)}"
        )

@router.post("/", response_model=ReviewResponse)
async def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: SupabaseDB = Depends(get_supabase_db)
):
    """Create a product review."""
    try:
        # Validate product ID format
        try:
            UUID(review_data.product_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid product ID format"
            )
        
        # Check if product exists
        product_response = db.supabase.table("products").select("id").eq("id", review_data.product_id).execute()
        if not product_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Check if user has purchased this product
        order_check_response = db.supabase.table("order_items").select("""
            id,
            order:orders(id, status, user_id)
        """).eq("product_id", review_data.product_id).execute()
        
        has_purchased = False
        order_id = None
        
        if order_check_response.data:
            for item in order_check_response.data:
                if (item["order"]["user_id"] == current_user.id and 
                    item["order"]["status"] == "delivered"):
                    has_purchased = True
                    order_id = item["order"]["id"]
                    break
        
        if not has_purchased:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You can only review products you have purchased"
            )
        
        # Check if user already reviewed this product
        existing_review_response = db.supabase.table("reviews").select("id").eq("user_id", current_user.id).eq("product_id", review_data.product_id).execute()
        
        if existing_review_response.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already reviewed this product"
            )
        
        # Create review
        review_dict = review_data.dict()
        review_dict.update({
            "user_id": current_user.id,
            "order_id": order_id,
            "is_verified": True,  # Since we verified the purchase
            "is_approved": True   # Auto-approve verified reviews
        })
        
        response = db.supabase.table("reviews").insert(review_dict).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create review"
            )
        
        # Get created review with related data
        created_review_response = db.supabase.table("reviews").select("""
            *,
            user:users(first_name, last_name),
            product:products(name)
        """).eq("id", response.data[0]["id"]).execute()
        
        return created_review_response.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating review: {str(e)}"
        )

@router.put("/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: str,
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: SupabaseDB = Depends(get_supabase_db)
):
    """Update a review (only by the review author)."""
    try:
        # Validate UUID format
        try:
            UUID(review_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid review ID format"
            )
        
        # Check if review exists and belongs to current user
        review_response = db.supabase.table("reviews").select("*").eq("id", review_id).eq("user_id", current_user.id).execute()
        
        if not review_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found"
            )
        
        # Update review (may require re-approval)
        update_data = review_data.dict()
        update_data["is_approved"] = False  # Require re-approval after edit
        
        response = db.supabase.table("reviews").update(update_data).eq("id", review_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update review"
            )
        
        return response.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating review: {str(e)}"
        )

@router.delete("/{review_id}")
async def delete_review(
    review_id: str,
    current_user: User = Depends(get_current_user),
    db: SupabaseDB = Depends(get_supabase_db)
):
    """Delete a review (only by the review author)."""
    try:
        # Validate UUID format
        try:
            UUID(review_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid review ID format"
            )
        
        # Check if review exists and belongs to current user
        review_response = db.supabase.table("reviews").select("id").eq("id", review_id).eq("user_id", current_user.id).execute()
        
        if not review_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found"
            )
        
        # Delete review
        delete_response = db.supabase.table("reviews").delete().eq("id", review_id).execute()
        
        if not delete_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete review"
            )
        
        return {"success": True, "message": "Review deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting review: {str(e)}"
        )

# Admin endpoints
@router.get("/admin/pending", response_model=List[ReviewResponse])
async def get_pending_reviews(
    current_user: User = Depends(get_current_user),
    db: SupabaseDB = Depends(get_supabase_db)
):
    """Get pending reviews for admin approval."""
    try:
        # Check if user is admin (you may want to implement proper admin check)
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        response = db.supabase.table("reviews").select("""
            *,
            user:users(first_name, last_name, email),
            product:products(name)
        """).eq("is_approved", False).order("created_at", desc=False).execute()
        
        return response.data if response.data else []
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching pending reviews: {str(e)}"
        )

@router.put("/admin/{review_id}/approve")
async def approve_review(
    review_id: str,
    current_user: User = Depends(get_current_user),
    db: SupabaseDB = Depends(get_supabase_db)
):
    """Approve a review (admin only)."""
    try:
        # Check if user is admin
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        # Validate UUID format
        try:
            UUID(review_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid review ID format"
            )
        
        # Update review approval status
        response = db.supabase.table("reviews").update({
            "is_approved": True
        }).eq("id", review_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found"
            )
        
        return {"success": True, "message": "Review approved"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error approving review: {str(e)}"
        )
