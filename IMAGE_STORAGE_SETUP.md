# Image Storage System Setup

## Problem Solved
This system handles very long image URLs (up to 70,000 characters) that exceed database VARCHAR(500) limits by storing them in a separate table with short reference IDs.

## Database Setup

### Step 1: Create the Image Storage Table
Run this SQL in your Supabase SQL editor:

```sql
-- Image Storage Table for handling long URLs
CREATE TABLE IF NOT EXISTS image_storage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_url TEXT NOT NULL,
    short_id VARCHAR(50) UNIQUE NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_image_storage_short_id ON image_storage(short_id);
CREATE INDEX IF NOT EXISTS idx_image_storage_original_url ON image_storage(original_url);
```

### Step 2: Enable Row Level Security (Optional but Recommended)
```sql
-- Enable RLS
ALTER TABLE image_storage ENABLE ROW LEVEL SECURITY;

-- Allow read access to all users
CREATE POLICY "Allow read access to all" ON image_storage
FOR SELECT USING (true);

-- Allow insert/update for authenticated users
CREATE POLICY "Allow insert for authenticated users" ON image_storage
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

## How It Works

### 1. **URL Length Detection**
- URLs under 450 characters: Stored directly in products table
- URLs over 450 characters: Stored in image_storage table with short reference

### 2. **Storage Process**
```typescript
// Long URL gets stored and returns short reference
const longUrl = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..." // 70,000 chars
const shortRef = await storeImageUrl(longUrl) // Returns "/api/images/abc123def456"
```

### 3. **Retrieval Process**
```typescript
// Short reference gets resolved to original URL
const originalUrl = await getImageUrl("/api/images/abc123def456")
// Returns the full 70,000 character URL
```

### 4. **API Endpoint**
- `/api/images/[shortId]` - Serves images directly or redirects to original URLs
- Handles both data URLs and external URLs
- Includes proper caching headers

## Usage in Components

### Using the ProductImage Component
```tsx
import { ProductImage } from '@/components/product/product-image'

<ProductImage 
  src="/api/images/abc123def456" // Short reference
  alt="Product image"
  className="w-full h-full object-cover"
  fallback="/placeholder.jpg"
/>
```

### Manual URL Resolution
```tsx
import { getImageUrl } from '@/lib/supabase'

const [imageUrl, setImageUrl] = useState('')

useEffect(() => {
  const loadImage = async () => {
    const url = await getImageUrl(product.image_url)
    setImageUrl(url)
  }
  loadImage()
}, [product.image_url])
```

## Features

✅ **Supports very long URLs** (up to 70,000 characters)
✅ **Automatic URL shortening** for database compatibility
✅ **Deduplication** - Same URL stored only once
✅ **Fast retrieval** with indexed lookups
✅ **Fallback handling** for broken images
✅ **Data URL support** for base64 images
✅ **Caching** for better performance

## Benefits

1. **Database Compatibility**: No more VARCHAR(500) errors
2. **Performance**: Short references are faster to query
3. **Storage Efficiency**: Long URLs stored once, referenced many times
4. **Flexibility**: Supports any image URL length (up to 70,000 characters)
5. **Backward Compatibility**: Short URLs still work as before