import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

/**
 * Custom fetch with extended timeout (60s) for slow connections.
 * Server-side only — used by the admin Supabase client.
 */
const serverFetch = async (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
  const controller = new AbortController()
  const timeoutMs = 60000 // 60 seconds

  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error: any) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error(`Supabase request timed out after ${timeoutMs}ms`)
    }
    throw error
  }
}

/**
 * Helper to retry a Supabase operation with exponential backoff.
 * Accepts both Promises and Supabase PromiseLike query builders.
 */
export async function withRetry<T>(
  operation: () => PromiseLike<T> | Promise<T>,
  maxRetries: number = 3,
  label: string = 'operation'
): Promise<T> {
  let lastError: any = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error
      const errorMsg = error?.message || error?.originalError?.message || ''
      const errorCause = error?.originalError?.cause?.code || error?.code || ''
      const isTimeoutOrNetwork =
        errorMsg.includes('fetch failed') ||
        errorMsg.includes('timeout') ||
        errorMsg.includes('ECONNREFUSED') ||
        errorMsg.includes('UND_ERR_CONNECT_TIMEOUT') ||
        errorCause === 'UND_ERR_CONNECT_TIMEOUT'

      if (!isTimeoutOrNetwork || attempt >= maxRetries - 1) {
        throw error
      }

      const delay = Math.min(2000 * Math.pow(2, attempt), 10000) // 2s, 4s, 8s max 10s
      console.log(`🔄 ${label} failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

let adminClient: ReturnType<typeof createClient> | null = null

/**
 * Get a Supabase admin client with extended timeouts.
 * Uses the service role key — bypasses ALL RLS.
 * SERVER-SIDE ONLY.
 */
export function getSupabaseAdminWithRetry() {
  if (typeof window !== 'undefined') {
    console.error('❌ getSupabaseAdminWithRetry must only be used server-side')
    return null
  }

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    return null
  }

  if (!adminClient) {
    adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        fetch: serverFetch,
      },
    })
  }

  return adminClient
}
