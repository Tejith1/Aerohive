from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID

from database import get_supabase_db, SupabaseDB
from schemas_supabase import CategoryResponse, CategoryCreate, User
from auth import get_current_admin_user

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=List[CategoryResponse])
async def get_categories(db: SupabaseDB = Depends(get_supabase_db)):
    """Get all active categories."""
    try:
        response = db.supabase.table("categories").select("*").eq("is_active", True).order("name").execute()
        
        return response.data if response.data else []
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching categories: {str(e)}"
        )

@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(
    category_id: str,
    db: SupabaseDB = Depends(get_supabase_db)
):
    """Get a single category by ID."""
    try:
        # Validate UUID format
        try:
            UUID(category_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid category ID format"
            )
        
        response = db.supabase.table("categories").select("*").eq("id", category_id).eq("is_active", True).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
        
        return response.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching category: {str(e)}"
        )

@router.get("/slug/{slug}", response_model=CategoryResponse)
async def get_category_by_slug(
    slug: str,
    db: SupabaseDB = Depends(get_supabase_db)
):
    """Get a single category by slug."""
    try:
        response = db.supabase.table("categories").select("*").eq("slug", slug).eq("is_active", True).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
        
        return response.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching category: {str(e)}"
        )

@router.post("/", response_model=CategoryResponse)
async def create_category(
    category_data: CategoryCreate,
    current_user: User = Depends(get_current_admin_user),
    db: SupabaseDB = Depends(get_supabase_db)
):
    """Create a new category (admin only)."""
    try:
        # Check if slug already exists
        existing_slug = db.supabase.table("categories").select("id").eq("slug", category_data.slug).execute()
        if existing_slug.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category with this slug already exists"
            )
        
        # Create category
        category_dict = category_data.dict()
        
        response = db.supabase.table("categories").insert(category_dict).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create category"
            )
        
        return response.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating category: {str(e)}"
        )

@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: str,
    category_data: CategoryCreate,
    current_user: User = Depends(get_current_admin_user),
    db: SupabaseDB = Depends(get_supabase_db)
):
    """Update a category (admin only)."""
    try:
        # Validate UUID format
        try:
            UUID(category_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid category ID format"
            )
        
        # Check if category exists
        existing_category = db.supabase.table("categories").select("id").eq("id", category_id).execute()
        if not existing_category.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
        
        # Update category
        update_data = category_data.dict(exclude_unset=True)
        
        response = db.supabase.table("categories").update(update_data).eq("id", category_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update category"
            )
        
        return response.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating category: {str(e)}"
        )

@router.delete("/{category_id}")
async def delete_category(
    category_id: str,
    current_user: User = Depends(get_current_admin_user),
    db: SupabaseDB = Depends(get_supabase_db)
):
    """Soft delete a category (admin only)."""
    try:
        # Validate UUID format
        try:
            UUID(category_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid category ID format"
            )
        
        # Check if category exists
        existing_category = db.supabase.table("categories").select("id").eq("id", category_id).execute()
        if not existing_category.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
        
        # Soft delete (set is_active to False)
        response = db.supabase.table("categories").update({"is_active": False}).eq("id", category_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete category"
            )
        
        return {"success": True, "message": "Category deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting category: {str(e)}"
        )
