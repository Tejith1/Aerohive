"use client"

import React, { useEffect } from 'react'
import { Lock, Home, UserCheck } from 'lucide-react'
import Link from 'next/link'
import { Button } from './button'

interface ComingSoonOverlayProps {
    title?: string
    description?: string
    show?: boolean
    className?: string
    position?: "fixed" | "absolute"
}

export function ComingSoonOverlay({
    title = "Access Restricted",
    description = "This section is locked for regular customers. Only administrators can access this content.",
    show = true,
    className = "",
    position = "absolute"
}: ComingSoonOverlayProps) {
    
    // Prevent background scrolling ONLY when overlay is active and in fixed mode
    useEffect(() => {
        if (show && position === "fixed") {
            const originalStyle = window.getComputedStyle(document.body).overflow
            document.body.style.overflow = 'hidden'
            return () => {
                document.body.style.overflow = originalStyle
            }
        }
    }, [show, position])

    if (!show) return null

    const containerClasses = position === "fixed"
        ? `fixed inset-0 z-[9999] flex items-center justify-center p-6 ${className}`
        : `absolute inset-0 z-30 flex items-center justify-center p-6 rounded-3xl overflow-hidden min-h-[480px] ${className}`

    return (
        <div className={containerClasses}>
            {/* Ultra-premium editorial blur backdrop */}
            <div className="absolute inset-0 bg-[#fbf9f6]/40 dark:bg-slate-950/45 backdrop-blur-xl transition-all duration-700">
                {/* Dotted micro-grid */}
                <div className="absolute inset-0 bg-[radial-gradient(#8080800d_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
                
                {/* Tech grid line details */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:24px_36px]" />
                
                {/* Sophisticated ambient glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
            </div>

            {/* Premium, minimalist security capsule card */}
            <div className="relative max-w-md w-full bg-white/80 dark:bg-[#121211]/85 border border-slate-200/50 dark:border-zinc-800/60 p-8 md:p-10 rounded-[32px] shadow-[0_24px_50px_rgba(0,0,0,0.04)] dark:shadow-[0_24px_50px_rgba(0,0,0,0.3)] backdrop-blur-2xl text-center transform transition-all duration-500 animate-in fade-in zoom-in-95 slide-in-from-bottom-4">
                
                {/* Security Domain Status Badge */}
                <div className="relative inline-flex items-center gap-2 px-3.5 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-7 select-none">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    Protected Portal
                </div>

                {/* Animated security scanning circular system */}
                <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center">
                    
                    {/* Ring 1 - Outermost spinning tech dash circle */}
                    <svg className="absolute inset-0 w-full h-full animate-[spin_24s_linear_infinite]" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="1" strokeDasharray="3 6" className="text-slate-200 dark:text-zinc-800" fill="none" />
                    </svg>

                    {/* Ring 2 - Scanning/Pulsing circle */}
                    <div className="absolute inset-1.5 rounded-full border border-primary/15 animate-pulse" />
                    
                    {/* Ring 3 - Innermost rotating dash circle */}
                    <svg className="absolute inset-3 w-[calc(100%-24px)] h-[calc(100%-24px)] animate-[spin_12s_linear_infinite_reverse]" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="1.2" strokeDasharray="12 4" className="text-primary/30" fill="none" />
                    </svg>
                    
                    {/* Ring 4 - Biometric shield container */}
                    <div className="relative w-14 h-14 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800/80 shadow-[0_8px_16px_rgba(0,0,0,0.02)] flex items-center justify-center">
                        <Lock className="h-6 w-6 text-primary stroke-[1.25]" />
                    </div>
                </div>

                {/* Headline - Clean editorial look */}
                <h2 className="text-2xl font-normal tracking-tight text-slate-900 dark:text-white mb-3 font-serif">
                    {title}
                </h2>
                
                {/* Decentering description with soft contrast */}
                <p className="text-slate-500 dark:text-zinc-400 text-xs leading-relaxed max-w-sm mx-auto mb-8 font-sans">
                    {description}
                </p>

                {/* Premium Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center w-full">
                    <Button 
                        asChild 
                        className="w-full sm:w-auto bg-slate-950 hover:bg-slate-900 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-slate-950 font-sans text-[11px] font-semibold tracking-wider uppercase px-6 py-4.5 rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer border-0 flex items-center justify-center gap-2"
                    >
                        <Link href="/">
                            <Home className="w-3.5 h-3.5" />
                            Return Home
                        </Link>
                    </Button>
                    
                    <Button 
                        asChild 
                        variant="outline" 
                        className="w-full sm:w-auto border-slate-200 hover:bg-slate-50 dark:border-zinc-800 dark:hover:bg-zinc-900/60 font-sans text-[11px] font-semibold tracking-wider uppercase px-6 py-4.5 rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                    >
                        <Link href="/login">
                            <UserCheck className="w-3.5 h-3.5" />
                            Admin Console
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
