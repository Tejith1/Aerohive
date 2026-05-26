// TypeScript types for the e-commerce application

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  phone?: string
  isAdmin: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: number
  name: string
  description?: string
  slug: string
  imageUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: number
  name: string
  description?: string
  shortDescription?: string
  price: number
  comparePrice?: number
  sku?: string
  stockQuantity: number
  categoryId?: number
  category?: Category
  imageUrl?: string
  images: string[]
  isActive: boolean
  isFeatured: boolean
  weight?: number
  dimensions?: Record<string, any>
  metaTitle?: string
  metaDescription?: string
  slug: string
  createdAt: string
  updatedAt: string
  averageRating?: number
  reviewCount?: number
}

export interface Address {
  id: number
  userId: number
  type: "shipping" | "billing"
  firstName: string
  lastName: string
  company?: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  id: number
  userId: number
  productId: number
  product?: Product
  quantity: number
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: number
  userId?: number
  user?: User
  orderNumber: string
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  paymentMethod?: string
  paymentId?: string
  subtotal: number
  taxAmount: number
  shippingAmount: number
  discountAmount: number
  totalAmount: number
  currency: string

  // Shipping address
  shippingFirstName?: string
  shippingLastName?: string
  shippingCompany?: string
  shippingAddressLine1?: string
  shippingAddressLine2?: string
  shippingCity?: string
  shippingState?: string
  shippingPostalCode?: string
  shippingCountry?: string
  shippingPhone?: string

  // Billing address
  billingFirstName?: string
  billingLastName?: string
  billingCompany?: string
  billingAddressLine1?: string
  billingAddressLine2?: string
  billingCity?: string
  billingState?: string
  billingPostalCode?: string
  billingCountry?: string
  billingPhone?: string

  notes?: string
  shippedAt?: string
  deliveredAt?: string
  createdAt: string
  updatedAt: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: number
  orderId: number
  productId?: number
  product?: Product
  productName: string
  productSku?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  createdAt: string
}

export interface Review {
  id: number
  productId: number
  userId: number
  user?: User
  orderId?: number
  rating: number
  title?: string
  comment?: string
  isVerified: boolean
  isApproved: boolean
  createdAt: string
  updatedAt: string
}

export interface Coupon {
  id: number
  code: string
  type: "percentage" | "fixed"
  value: number
  minimumAmount?: number
  maximumDiscount?: number
  usageLimit?: number
  usedCount: number
  isActive: boolean
  startsAt?: string
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T = any> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone?: string
}

export interface CheckoutForm {
  email: string
  shippingAddress: Omit<Address, "id" | "userId" | "type" | "isDefault" | "createdAt" | "updatedAt">
  billingAddress: Omit<Address, "id" | "userId" | "type" | "isDefault" | "createdAt" | "updatedAt">
  paymentMethod: string
  couponCode?: string
}
