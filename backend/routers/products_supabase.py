from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from uuid import UUID

from database import get_supabase_db, SupabaseDB
from schemas_supabase import (
    ProductResponse, ProductCreate, ProductUpdate, 
    PaginatedResponse, User
)
from auth import get_current_user, get_current_admin_user

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/", response_model=PaginatedResponse)
async def get_products(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
    category_id: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = Query("created_desc"),
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    is_featured: Optional[bool] = None,
    db: SupabaseDB = Depends(get_supabase_db)
):
    """Get products with filtering, search, and pagination."""
    
    try:
        # Build base query
        query = db.supabase.table("products").select("""
            *,
            category:categories(id, name, slug),
            reviews(rating)
        """).eq("is_active", True)
        
        # Apply filters
        if category_id:
            query = query.eq("category_id", category_id)
        
        if search:
            # Supabase text search
            query = query.or_(f"name.ilike.%{search}%,description.ilike.%{search}%,short_description.ilike.%{search}%")
        
        if min_price is not None:
            query = query.gte("price", min_price)
        
        if max_price is not None:
            query = query.lte("price", max_price)
        
        if is_featured is not None:
            query = query.eq("is_featured", is_featured)
        
        # Apply sorting
        if sort_by == "name_asc":
            query = query.order("name", desc=False)
        elif sort_by == "name_desc":
            query = query.order("name", desc=True)
        elif sort_by == "price_asc":
            query = query.order("price", desc=False)
        elif sort_by == "price_desc":
            query = query.order("price", desc=True)
        elif sort_by == "created_desc":
            query = query.order("created_at", desc=True)
        elif sort_by == "rating_desc":
            # For rating sort, we'll handle it after getting the data
            query = query.order("created_at", desc=True)
        
        # Get total count for pagination
        count_response = db.supabase.table("products").select("id", count="exact").eq("is_active", True)
        
        # Apply same filters for count
        if category_id:
            count_response = count_response.eq("category_id", category_id)
        if search:
            count_response = count_response.or_(f"name.ilike.%{search}%,description.ilike.%{search}%,short_description.ilike.%{search}%")
        if min_price is not None:
            count_response = count_response.gte("price", min_price)
        if max_price is not None:
            count_response = count_response.lte("price", max_price)
        if is_featured is not None:
            count_response = count_response.eq("is_featured", is_featured)
            
        count_result = count_response.execute()
        total = count_result.count if count_result.count is not None else 0
        
        # Apply pagination
        offset = (page - 1) * limit
        response = query.range(offset, offset + limit - 1).execute()
        
        products = response.data if response.data else []
        
        # Process products to add calculated fields
        product_data = []
        for product in products:
            # Calculate average rating
            reviews = product.get("reviews", [])
            avg_rating = None
            review_count = len(reviews)
            
            if reviews:
                ratings = [r["rating"] for r in reviews if r.get("rating")]
                avg_rating = sum(ratings) / len(ratings) if ratings else None
            
            product_dict = {
                **product,
                "average_rating": avg_rating,
                "review_count": review_count
            }
            # Remove the reviews array from the response
            product_dict.pop("reviews", None)
            product_data.append(product_dict)
        
        # Sort by rating if requested
        if sort_by == "rating_desc":
            product_data.sort(key=lambda x: x.get("average_rating") or 0, reverse=True)
        
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
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching products: {str(e)}"
        )

@router.get("/featured", response_model=List[ProductResponse])
async def get_featured_products(
    limit: int = Query(8, ge=1, le=20),
    db: SupabaseDB = Depends(get_supabase_db)
):
    """Get featured products."""
    try:
        response = db.supabase.table("products").select("*").eq("is_active", True).eq("is_featured", True).limit(limit).execute()
        
        return response.data if response.data else []
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching featured products: {str(e)}"
        )

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: str,
    db: SupabaseDB = Depends(get_supabase_db)
):
    """Get a single product by ID."""
    try:
        # Validate UUID format
        try:
            UUID(product_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid product ID format"
            )
        
        response = db.supabase.table("products").select("""
            *,
            category:categories(id, name, slug),
            reviews(id, rating, comment, user_id, created_at, user:users(first_name, last_name))
        """).eq("id", product_id).eq("is_active", True).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        product = response.data[0]
        
        # Calculate average rating
        reviews = product.get("reviews", [])
        avg_rating = None
        review_count = len(reviews)
        
        if reviews:
            ratings = [r["rating"] for r in reviews if r.get("rating")]
            avg_rating = sum(ratings) / len(ratings) if ratings else None
        
        product["average_rating"] = avg_rating
        product["review_count"] = review_count
        
        return product
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching product: {str(e)}"
        )

@router.get("/slug/{slug}", response_model=ProductResponse)
async def get_product_by_slug(
    slug: str,
    db: SupabaseDB = Depends(get_supabase_db)
):
    """Get a single product by slug."""
    try:
        response = db.supabase.table("products").select("""
            *,
            category:categories(id, name, slug),
            reviews(id, rating, comment, user_id, created_at, user:users(first_name, last_name))
        """).eq("slug", slug).eq("is_active", True).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        product = response.data[0]
        
        # Calculate average rating
        reviews = product.get("reviews", [])
        avg_rating = None
        review_count = len(reviews)
        
        if reviews:
            ratings = [r["rating"] for r in reviews if r.get("rating")]
            avg_rating = sum(ratings) / len(ratings) if ratings else None
        
        product["average_rating"] = avg_rating
        product["review_count"] = review_count
        
        return product
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching product: {str(e)}"
        )

@router.post("/", response_model=ProductResponse)
async def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(get_current_admin_user),
    db: SupabaseDB = Depends(get_supabase_db)
):
    """Create a new product (admin only)."""
    try:
        # Check if slug already exists
        existing_slug = db.supabase.table("products").select("id").eq("slug", product_data.slug).execute()
        if existing_slug.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product with this slug already exists"
            )
        
        # Check if SKU already exists
        if product_data.sku:
            existing_sku = db.supabase.table("products").select("id").eq("sku", product_data.sku).execute()
            if existing_sku.data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Product with this SKU already exists"
                )
        
        # Create product
        product_dict = product_data.dict()
        
        response = db.supabase.table("products").insert(product_dict).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create product"
            )
        
        return response.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating product: {str(e)}"
        )

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product_data: ProductUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: SupabaseDB = Depends(get_supabase_db)
):
    """Update a product (admin only)."""
    try:
        # Validate UUID format
        try:
            UUID(product_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid product ID format"
            )
        
        # Check if product exists
        existing_product = db.supabase.table("products").select("id").eq("id", product_id).execute()
        if not existing_product.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Update product
        update_data = product_data.dict(exclude_unset=True)
        
        response = db.supabase.table("products").update(update_data).eq("id", product_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update product"
            )
        
        return response.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating product: {str(e)}"
        )

@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    current_user: User = Depends(get_current_admin_user),
    db: SupabaseDB = Depends(get_supabase_db)
):
    """Soft delete a product (admin only)."""
    try:
        # Validate UUID format
        try:
            UUID(product_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid product ID format"
            )
        
        # Check if product exists
        existing_product = db.supabase.table("products").select("id").eq("id", product_id).execute()
        if not existing_product.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Soft delete (set is_active to False)
        response = db.supabase.table("products").update({"is_active": False}).eq("id", product_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete product"
            )
        
        return {"success": True, "message": "Product deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting product: {str(e)}"
        )
