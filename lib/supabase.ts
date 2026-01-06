import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('🔧 Supabase Configuration:')
console.log('URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
console.log('Anon Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ CRITICAL: Missing Supabase environment variables!')
  console.error('Please ensure .env.local exists with:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=your_url')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key')
}

// Custom storage adapter with better error handling
const getStorage = () => {
  if (typeof window === 'undefined') return undefined

  try {
    // Test if localStorage is available and working
    const testKey = '__supabase_test__'
    window.localStorage.setItem(testKey, 'test')
    window.localStorage.removeItem(testKey)
    return window.localStorage
  } catch (e) {
    console.warn('⚠️ localStorage not available, using memory storage')
    return undefined
  }
}

// Custom fetch with timeout and retry logic for connection resilience
const customFetch = async (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
  const maxRetries = 3
  const timeoutMs = 30000 // 30 seconds timeout
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
        console.warn(`⏱️ Request timeout after ${timeoutMs}ms`)
      }, timeoutMs)

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // If we get a response, return it (even if it's an error status)
      return response
    } catch (error: any) {
      lastError = error

      // Don't retry on abort errors (user cancelled) or if we're offline
      if (error.name === 'AbortError' && typeof navigator !== 'undefined' && !navigator.onLine) {
        console.warn('📴 Offline - not retrying')
        throw error
      }

      // Log retry attempt
      if (attempt < maxRetries - 1) {
        const delay = 1000 * Math.pow(2, attempt) // Exponential backoff: 1s, 2s, 4s
        console.warn(`🔄 Request failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      } else {
        console.error(`❌ Request failed after ${maxRetries} attempts`)
      }
    }
  }

  throw lastError || new Error('Request failed after maximum retries')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: getStorage(),
    storageKey: 'sb-aerohive-auth-token',
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development',
  },
  global: {
    fetch: customFetch,
    headers: {
      'x-client-info': 'aerohive-web',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  db: {
    schema: 'public',
  },
})

// Server-side admin client for bypassing RLS (only use on server-side)
let supabaseAdmin: ReturnType<typeof createClient> | null = null

export const getSupabaseAdmin = () => {
  // Only create admin client on server-side
  if (typeof window !== 'undefined') {
    console.warn('⚠️ getSupabaseAdmin should only be used on server-side')
    return null
  }

  if (!supabaseAdmin) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY for admin operations')
      // Fallback to using the regular client if no service key
      return supabase
    }

    supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return supabaseAdmin
}

// Database types
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  is_admin: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description?: string
  slug: string
  image_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// New interface for storing images directly in DB
export interface StoredImage {
  id: string
  filename: string
  mime_type: string
  file_size?: number
  image_data: string // Base64 encoded
  created_at: string
}

// New interface for storing long image URLs
export interface ImageStorage {
  id: string
  original_url: string
  short_id: string
  file_size?: number
  mime_type?: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  description?: string | null
  short_description?: string | null
  price: number
  compare_price?: number | null
  sku?: string | null
  stock_quantity: number
  category_id?: string | null
  image_url?: string | null
  images: string[]
  specifications?: Record<string, any> | null
  is_active: boolean
  is_featured: boolean
  weight?: number | null
  dimensions?: Record<string, any> | null
  battery_life?: number | null
  max_range?: number | null
  max_speed?: number | null
  camera_resolution?: string | null
  has_gps: boolean
  has_obstacle_avoidance: boolean
  warranty_months?: number | null
  slug: string
  meta_title?: string | null
  meta_description?: string | null
  average_rating?: number | null
  created_at: string
  updated_at: string
  category?: Category
}

export interface DronePilot {
  id: string
  user_id?: string | null
  full_name: string
  email: string
  phone: string
  location: string
  area: string
  experience: string
  certifications: string
  specializations: string
  hourly_rate: number
  about: string
  dgca_number: string
  profile_image_url?: string | null
  certificate_image_url?: string | null
  rating: number
  completed_jobs: number
  is_verified: boolean
  is_active: boolean
  latitude?: number | null
  longitude?: number | null
  distance_km?: number | null
  created_at: string
  updated_at: string
}

// Auth functions
export const signUp = async (email: string, password: string, firstName: string, lastName: string, phone?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        is_admin: false
      }
    }
  })

  if (error) throw error
  return data
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Product functions
export const getProducts = async (filters?: {
  category?: string
  featured?: boolean
  active?: boolean
  limit?: number
}, retryCount = 0): Promise<Product[]> => {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .order('created_at', { ascending: false })

    if (filters?.category) {
      query = query.eq('category.slug', filters.category)
    }

    if (filters?.featured !== undefined) {
      query = query.eq('is_featured', filters.featured)
    }

    if (filters?.active !== undefined) {
      query = query.eq('is_active', filters.active)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Database query error:', error)
      throw error
    }

    return data as Product[]
  } catch (error: any) {
    // Retry on network/connection errors
    if (retryCount < 2 && (error.message?.includes('Failed to fetch') || error.message?.includes('network') || error.code === 'PGRST301')) {
      console.log(`🔄 Retrying getProducts (attempt ${retryCount + 1})...`)
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
      return getProducts(filters, retryCount + 1)
    }
    throw error
  }
}

export const getProductBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data as Product
}

export const createProduct = async (product: any) => {
  console.log('Creating product with data:', JSON.stringify(product, null, 2))

  try {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw new Error(`Database error: ${error.message || 'Unknown database error'}`)
    }

    console.log('Product created successfully:', data)
    return data
  } catch (error) {
    console.error('createProduct catch block:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Unknown error occurred while creating product')
  }
}

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  const { data, error } = await supabase
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Product
}

// Image Storage Functions
export const generateShortId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Convert File to Base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

// Convert URL to Base64 (for external URLs)
export const urlToBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    throw new Error(`Failed to convert URL to base64: ${error}`)
  }
}

// Store image data directly in database
export const storeImageData = async (imageData: string, filename: string, mimeType?: string): Promise<string> => {
  try {
    // Extract mime type and base64 data from data URL
    let actualMimeType = mimeType
    let base64Data = imageData

    if (imageData.startsWith('data:')) {
      const [header, data] = imageData.split(',')
      actualMimeType = header.match(/data:([^;]+)/)?.[1] || 'image/jpeg'
      base64Data = data
    }

    // Calculate file size (approximate)
    const fileSize = Math.round((base64Data.length * 3) / 4)

    const { data, error } = await supabase
      .from('stored_images')
      .insert({
        filename: filename || `image_${Date.now()}`,
        mime_type: actualMimeType || 'image/jpeg',
        file_size: fileSize,
        image_data: base64Data
      })
      .select()
      .single()

    if (error) {
      console.error('Error storing image data:', error)
      throw error
    }

    return `/api/stored-images/${data.id}`
  } catch (error) {
    console.error('Failed to store image data:', error)
    throw error
  }
}

// SIMPLE IMAGE PROCESSING - NO DATABASE CHANGES NEEDED!
export const processAndStoreImage = async (input: File | string): Promise<string> => {
  try {
    if (input instanceof File) {
      // Convert file to data URL directly
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          console.log('File converted to data URL successfully');
          resolve(result);
        };
        reader.onerror = (error) => {
          console.error('File reader error:', error);
          reject(error);
        };
        reader.readAsDataURL(input);
      });
    } else if (typeof input === 'string') {
      if (input.startsWith('data:')) {
        // Already a data URL, return as-is
        return input;
      } else if (input.startsWith('http')) {
        // Fetch URL and convert to data URL
        const response = await fetch(input);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            console.log('URL converted to data URL successfully');
            resolve(result);
          };
          reader.onerror = (error) => {
            console.error('URL conversion error:', error);
            reject(error);
          };
          reader.readAsDataURL(blob);
        });
      } else {
        throw new Error('Invalid URL format');
      }
    } else {
      throw new Error('Invalid input type');
    }
  } catch (error) {
    console.error('processAndStoreImage error:', error);
    throw new Error('Failed to process image');
  }
};

// Get stored image data
export const getStoredImageData = async (imageId: string): Promise<StoredImage | null> => {
  try {
    const { data, error } = await supabase
      .from('stored_images')
      .select('*')
      .eq('id', imageId)
      .single()

    if (error) {
      console.error('Error retrieving stored image:', error)
      return null
    }

    return data as StoredImage
  } catch (error) {
    console.error('Failed to get stored image data:', error)
    return null
  }
}

export const storeImageUrl = async (originalUrl: string): Promise<string> => {
  // If URL is short enough, return as-is
  if (originalUrl.length <= 450) {
    return originalUrl
  }

  try {
    // Check if this URL is already stored
    const { data: existing, error: selectError } = await supabase
      .from('image_storage')
      .select('short_id')
      .eq('original_url', originalUrl)
      .single()

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking existing image URL:', selectError)
      // If image_storage table doesn't exist, fallback to truncated URL
      if (selectError.message?.includes('relation "public.image_storage" does not exist')) {
        console.warn('image_storage table not found, using truncated URL')
        return originalUrl.substring(0, 450) + '...'
      }
      throw selectError
    }

    if (existing) {
      return `/api/images/${existing.short_id}`
    }

    // Store new long URL
    const shortId = generateShortId()
    const { data, error } = await supabase
      .from('image_storage')
      .insert({
        original_url: originalUrl,
        short_id: shortId,
        mime_type: getImageMimeType(originalUrl)
      })
      .select()
      .single()

    if (error) {
      console.error('Error storing image URL:', error)
      // If image_storage table doesn't exist, fallback to truncated URL
      if (error.message?.includes('relation "public.image_storage" does not exist')) {
        console.warn('image_storage table not found, using truncated URL')
        return originalUrl.substring(0, 450) + '...'
      }
      throw error
    }

    return `/api/images/${shortId}`
  } catch (error) {
    console.error('Failed to store image URL:', error)
    // Fallback: truncate the URL if storage fails
    return originalUrl.substring(0, 450) + '...'
  }
}

export const getImageUrl = async (shortIdOrUrl: string): Promise<string> => {
  // If it's already a full URL, return as-is
  if (shortIdOrUrl.startsWith('http') || shortIdOrUrl.startsWith('data:')) {
    return shortIdOrUrl
  }

  // If it's a short reference, get the original URL
  if (shortIdOrUrl.startsWith('/api/images/')) {
    const shortId = shortIdOrUrl.replace('/api/images/', '')
    const { data, error } = await supabase
      .from('image_storage')
      .select('original_url')
      .eq('short_id', shortId)
      .single()

    if (error || !data) {
      console.error('Error retrieving image URL:', error)
      return shortIdOrUrl // Return the short reference if retrieval fails
    }

    return data.original_url
  }

  return shortIdOrUrl
}

const getImageMimeType = (url: string): string => {
  const extension = url.split('.').pop()?.toLowerCase()
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'gif':
      return 'image/gif'
    case 'webp':
      return 'image/webp'
    default:
      return 'image/jpeg'
  }
}

export const deleteProduct = async (id: string) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Storage functions for image uploads
export const createStorageBucket = async (bucketName: string = 'product-images') => {
  try {
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    })

    if (error && error.message.includes('already exists')) {
      console.log('Bucket already exists')
      return true
    }

    if (error) throw error
    console.log('Bucket created successfully:', data)
    return true
  } catch (error) {
    console.error('Error creating bucket:', error)
    return false
  }
}

export const uploadImage = async (file: File, bucket: string = 'product-images'): Promise<string> => {
  try {
    // Ensure bucket exists
    console.log('Ensuring bucket exists...')
    await createStorageBucket(bucket)

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${fileName}`

    console.log('Uploading image:', { fileName, fileSize: file.size, fileType: file.type, bucket })

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error details:', {
        message: error.message,
        error: error
      })
      throw new Error(`Upload failed: ${error.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    console.log('Upload successful:', { filePath, publicUrl: urlData.publicUrl })
    return urlData.publicUrl
  } catch (error) {
    console.error('Upload function error:', error)
    throw error
  }
}

export const deleteImage = async (url: string, bucket: string = 'product-images') => {
  try {
    // Extract file path from URL
    const urlParts = url.split('/')
    const filePath = urlParts[urlParts.length - 1]

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) throw error
  } catch (error) {
    console.error('Error deleting image:', error)
    // Don't throw error for image deletion failures
  }
}

// Category functions
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return data as Category[]
}

export const createCategory = async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single()

  if (error) throw error
  return data as Category
}

// Drone Pilot functions
export const getDronePilots = async (filters?: {
  location?: string
  area?: string
  search?: string
}) => {
  let query = supabase
    .from('drone_pilots')
    .select('*')
    .eq('is_verified', true)
    .eq('is_active', true)
    .order('rating', { ascending: false })

  if (filters?.location && filters.location !== 'All Locations') {
    query = query.eq('location', filters.location)
  }

  if (filters?.area && filters.area !== 'All Areas') {
    query = query.eq('area', filters.area)
  }

  if (filters?.search) {
    query = query.or(`full_name.ilike.%${filters.search}%,specializations.ilike.%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) throw error
  return data as DronePilot[]
}

export const createDronePilot = async (pilotData: Omit<DronePilot, 'id' | 'rating' | 'completed_jobs' | 'is_verified' | 'is_active' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('drone_pilots')
    .insert(pilotData)
    .select()
    .single()

  if (error) {
    console.error('Error creating drone pilot:', error)
    throw error
  }
  return data as DronePilot
}

export const updateDronePilot = async (id: string, updates: Partial<DronePilot>) => {
  const { data, error } = await supabase
    .from('drone_pilots')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as DronePilot
}

export const getDronePilotById = async (id: string) => {
  const { data, error } = await supabase
    .from('drone_pilots')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as DronePilot
}

// Get nearby pilots within a radius (for chatbot)
export const getNearbyPilots = async (lat: number, lng: number, radiusKm: number = 50): Promise<DronePilot[]> => {
  try {
    // First get all active pilots
    const { data: pilots, error } = await supabase
      .from('drone_pilots')
      .select('*')
      .eq('is_verified', true)
      .eq('is_active', true)
      .order('rating', { ascending: false })

    if (error) throw error
    if (!pilots) return []

    // Filter by distance (simple haversine calculation)
    const filteredPilots = pilots.filter(pilot => {
      if (!pilot.latitude || !pilot.longitude) return true // Include pilots without location
      const distance = calculateDistance(lat, lng, pilot.latitude, pilot.longitude)
      return distance <= radiusKm
    }).map(pilot => ({
      ...pilot,
      distance_km: pilot.latitude && pilot.longitude
        ? Math.round(calculateDistance(lat, lng, pilot.latitude, pilot.longitude) * 10) / 10
        : null
    }))

    return filteredPilots as DronePilot[]
  } catch (error) {
    console.error('Error getting nearby pilots:', error)
    return []
  }
}

// Haversine distance calculation - exported for use in other components
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Booking interface
export interface Booking {
  id?: string
  client_id: string
  pilot_id: string
  service_type: string
  latitude: number
  longitude: number
  // Aliases for backward compatibility with notifications
  client_location_lat?: number
  client_location_lng?: number
  scheduled_at: string
  duration_hours: number
  payment_method?: string
  requirements?: Record<string, any>
  status?: string
  total_amount?: number
  created_at?: string
}

// Create a booking
export const createBooking = async (bookingData: Omit<Booking, 'id' | 'created_at'>): Promise<Booking> => {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      ...bookingData,
      status: 'pending',
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating booking:', error)
    throw error
  }

  return data as Booking
}