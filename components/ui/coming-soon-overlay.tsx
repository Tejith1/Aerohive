
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
            <div className="max-w-md w-full bg-[#fbf9f6]/95 dark:bg-slate-900/95 border border-slate-200/50 dark:border-slate-800/80 p-10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] text-center transform transition-all duration-500 animate-in fade-in zoom-in slide-in-from-bottom-4 sticky top-1/2">
                
                {/* Sleek circular outline lock indicator */}
                <div className="w-16 h-16 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_4px_12px_rgba(0,0,0,0.015)]">
                    <Lock className="h-6 w-6 text-[#069494] stroke-[1.5]" />
                </div>

                {/* Editorial Typography */}
                <h3 className="text-3xl font-serif font-normal text-slate-900 dark:text-white mb-3">
                    {title}
                </h3>
                <p className="text-slate-600 dark:text-slate-350 font-serif text-[15px] leading-relaxed max-w-sm mx-auto">
                    {description}
                </p>
            </div>
        </div>
    )
}
