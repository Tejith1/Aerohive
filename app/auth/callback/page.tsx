"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { supabase } from "@/lib/supabase"

function CallbackHandler() {
    const searchParams = useSearchParams()

    useEffect(() => {
        // Check for OAuth errors
        const error = searchParams.get("error")
        if (error) {
            console.error("OAuth error:", error)
            window.location.href = `/login?error=${encodeURIComponent(error)}`
            return
        }

        // Wait for Supabase to establish the session (PKCE code exchange)
        // before redirecting — the old 100ms timeout was firing before
        // the exchange completed, destroying the session

        let attempts = 0
        const maxAttempts = 25 // 25 * 200ms = 5 seconds max wait

        const checkSession = async () => {
            attempts++
            console.log(`🔄 Checking for session (attempt ${attempts})...`)

            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (session) {
                    console.log('✅ Session established, redirecting to home...')
                    window.location.replace("/")
                    return
                }
            } catch (e) {
                console.warn('⚠️ Session check error:', e)
            }

            if (attempts >= maxAttempts) {
                console.warn('⏱️ Session wait timed out, redirecting anyway...')
                window.location.replace("/")
                return
            }

            // Poll again in 200ms
            setTimeout(checkSession, 200)
        }

        // Start polling after a brief delay to let Supabase init
        setTimeout(checkSession, 300)
    }, [searchParams])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-white mb-2">Completing Sign In</h2>
                    <p className="text-gray-400">Setting up your session...</p>
                </div>
            </div>
        </div>
    )
}

function LoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-white mb-2">Completing Sign In</h2>
                    <p className="text-gray-400">Processing...</p>
                </div>
            </div>
        </div>
    )
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <CallbackHandler />
        </Suspense>
    )
}
