
import React from 'react'
import { Lock } from 'lucide-react'

interface ComingSoonOverlayProps {
    title?: string
    description?: string
    show?: boolean
    className?: string
}

export function ComingSoonOverlay({
    title = "Coming Soon",
    description = "This section is currently under development. Stay tuned for exclusive updates!",
    show = true,
    className = ""
}: ComingSoonOverlayProps) {
    if (!show) return null

    return (
        <div className={`absolute inset-0 flex items-center justify-center z-50 px-4 ${className}`}>
            <div className="max-w-md w-full bg-white/95 backdrop-blur-md border border-gray-200 p-8 rounded-3xl shadow-2xl text-center transform transition-all duration-500 animate-in fade-in zoom-in slide-in-from-bottom-4 sticky top-1/2">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200 animate-bounce">
                    <Lock className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    )
}
