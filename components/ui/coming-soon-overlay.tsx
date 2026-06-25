import React from 'react'
import { Lock } from 'lucide-react'
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
    title = "Coming Soon",
    description = "This section is currently under development. Stay tuned for exclusive updates!",
    show = true,
    className = "",
    position = "absolute"
}: ComingSoonOverlayProps) {
    if (!show) return null

    const positionClasses = position === "fixed"
        ? "fixed inset-0 flex items-center justify-center z-[9999]"
        : "absolute inset-0 flex items-start justify-center pt-[20vh] md:pt-[25vh] z-[50]";

    return (
        <div className={`${positionClasses} px-4 pointer-events-none ${className}`}>
            {/* Premium glassmorphic card */}
            <div className="max-w-md w-full bg-white/60 dark:bg-[#0f172a]/60 border border-white/30 dark:border-slate-800/40 p-10 md:p-12 rounded-[40px] shadow-[0_32px_64px_rgba(0,0,0,0.06)] backdrop-blur-xl text-center transform transition-all duration-500 animate-in fade-in zoom-in-95 slide-in-from-bottom-6 pointer-events-auto relative overflow-hidden">
                
                {/* Ambient glowing radial backdrop behind the lock */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/10 dark:bg-primary/20 rounded-full blur-2xl pointer-events-none" />

                {/* Micro tech security tag */}
                <div className="relative inline-flex items-center gap-1.5 px-3 py-1 bg-[#069494]/8 dark:bg-[#069494]/12 border border-[#069494]/15 dark:border-[#069494]/25 rounded-full text-[10px] font-bold text-[#069494] uppercase tracking-wider mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#069494] animate-pulse"></span>
                    Access Restrictions Active
                </div>

                {/* Concentric pulsing radar lock rings */}
                <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center">
                    {/* Ring 1 - Radar Ping */}
                    <div className="absolute inset-0 rounded-full border border-primary/20 dark:border-primary/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-60"></div>
                    {/* Ring 2 - Pulse Ring */}
                    <div className="absolute inset-3 rounded-full border border-primary/10 dark:border-slate-800 animate-pulse"></div>
                    {/* Ring 3 - Dashed Rotating Tech Ring */}
                    <div className="absolute inset-5 rounded-full border border-dashed border-slate-300 dark:border-slate-700 animate-[spin_12s_linear_infinite] opacity-75"></div>
                    {/* Ring 4 - Solid Centered Lock Card */}
                    <div className="relative w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_4px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] flex items-center justify-center">
                        <Lock className="h-5 w-5 text-primary stroke-[1.75]" />
                    </div>
                </div>

                {/* Editorial Headline */}
                <h3 className="relative text-2xl md:text-3xl font-display font-black tracking-tight text-slate-900 dark:text-white uppercase mb-3 z-10">
                    {title}
                </h3>
                
                {/* Book-style description */}
                <p className="relative text-slate-650 dark:text-slate-300 font-serif text-[15px] leading-relaxed max-w-sm mx-auto mb-8 z-10">
                    {description}
                </p>

                {/* Premium Action Buttons */}
                <div className="relative flex flex-col sm:flex-row gap-3 justify-center items-center w-full z-10">
                    <Button asChild className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-150 text-white dark:text-slate-900 font-sans text-[12px] font-bold tracking-wider uppercase px-6 py-5 rounded-2xl transition-all duration-300 shadow-lg shadow-slate-950/10 hover:-translate-y-0.5 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer border-0">
                        <Link href="/">Return Home</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full sm:w-auto border-border/80 hover:bg-muted font-sans text-[12px] font-bold tracking-wider uppercase px-6 py-5 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                        <Link href="/login">Admin Console</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
