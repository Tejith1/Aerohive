/**
 * Database utility functions for resilient database operations
 * Provides retry logic and connection health monitoring
 */

import { supabase } from './supabase'

interface RetryOptions {
    maxRetries?: number
    initialDelay?: number
    maxDelay?: number
    onRetry?: (attempt: number, error: Error) => void
}

/**
 * Execute a database operation with automatic retry on failure
 * Uses exponential backoff with configurable options
 */
export async function withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const {
        maxRetries = 3,
        initialDelay = 1000,
        maxDelay = 10000,
        onRetry
    } = options

    let lastError: Error | null = null

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await operation()
        } catch (error: any) {
            lastError = error

            // Check if it's a retryable error
            const isRetryable =
                error.message?.includes('Failed to fetch') ||
                error.message?.includes('network') ||
                error.message?.includes('timeout') ||
                error.message?.includes('PGRST') ||
                error.code === 'ECONNRESET' ||
                error.code === 'ETIMEDOUT'

            if (!isRetryable || attempt === maxRetries - 1) {
                throw error
            }

            // Calculate delay with exponential backoff
            const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay)

            console.warn(`🔄 Database operation failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms...`)

            if (onRetry) {
                onRetry(attempt + 1, error)
            }

            await new Promise(resolve => setTimeout(resolve, delay))
        }
    }

    throw lastError || new Error('Operation failed after maximum retries')
}

/**
 * Check if the database connection is healthy
 */
export async function checkDatabaseHealth(): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('categories')
            .select('id')
            .limit(1)
            .single()

        // PGRST116 means no rows found, which is still a successful connection
        return !error || error.code === 'PGRST116'
    } catch (error) {
        console.error('❌ Database health check failed:', error)
        return false
    }
}

/**
 * Check if the browser is online
 */
export function isOnline(): boolean {
    if (typeof navigator === 'undefined') return true
    return navigator.onLine
}

/**
 * Wait for the browser to come back online
 */
export function waitForOnline(): Promise<void> {
    return new Promise((resolve) => {
        if (isOnline()) {
            resolve()
            return
        }

        const handleOnline = () => {
            window.removeEventListener('online', handleOnline)
            resolve()
        }

        window.addEventListener('online', handleOnline)
    })
}

/**
 * Execute a database operation, waiting for online status if necessary
 */
export async function withOnlineCheck<T>(
    operation: () => Promise<T>
): Promise<T> {
    if (!isOnline()) {
        console.log('📴 Waiting for network connection...')
        await waitForOnline()
        console.log('🌐 Network restored, proceeding with operation...')
    }

    return operation()
}
