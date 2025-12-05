const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }

  // Add auth token if available
  const token = localStorage.getItem("auth_token")
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(response.status, errorData.message || "API request failed")
  }

  return response.json()
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ access_token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (userData: { email: string; password: string; first_name: string; last_name: string }) =>
    apiRequest<{ access_token: string; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  getProfile: () => apiRequest<any>("/auth/me"),
}

// Products API
export const productsApi = {
  getAll: (params?: { category?: string; search?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.set("category", params.category)
    if (params?.search) searchParams.set("search", params.search)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    return apiRequest<{ products: any[]; total: number; page: number; pages: number }>(
      `/products?${searchParams.toString()}`,
    )
  },

  getFeatured: (limit?: number) => {
    const searchParams = new URLSearchParams()
    if (limit) searchParams.set("limit", limit.toString())
    
    return apiRequest<any[]>(`/products/featured?${searchParams.toString()}`)
  },

  getById: (id: string) => apiRequest<any>(`/products/${id}`),

  getCategories: () => apiRequest<any[]>("/categories"),
}

// Orders API
export const ordersApi = {
  create: (orderData: any) =>
    apiRequest<any>("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    }),

  getAll: () => apiRequest<any[]>("/orders"),

  getById: (id: string) => apiRequest<any>(`/orders/${id}`),
}

// Cart API
export const cartApi = {
  get: () => apiRequest<any>("/cart"),

  addItem: (productId: string, quantity: number) =>
    apiRequest<any>("/cart/items", {
      method: "POST",
      body: JSON.stringify({ product_id: productId, quantity }),
    }),

  updateItem: (itemId: string, quantity: number) =>
    apiRequest<any>(`/cart/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    }),

  removeItem: (itemId: string) =>
    apiRequest<any>(`/cart/items/${itemId}`, {
      method: "DELETE",
    }),

  clear: () =>
    apiRequest<any>("/cart", {
      method: "DELETE",
    }),
}
