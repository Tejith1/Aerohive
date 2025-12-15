"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

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

        // Just redirect to home - auth-context will handle the session
        // The SIGNED_IN event has already fired before this page loads
        console.log("🔄 Redirecting to home, auth-context will handle session...")
        localStorage.setItem("oauth_success", "true")

        // Small delay then redirect
        setTimeout(() => {
            window.location.replace("/")
        }, 100)
    }, [searchParams])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-white mb-2">Completing Sign In</h2>
                    <p className="text-gray-400">Redirecting...</p>
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
