"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Bell, Search, Sun, Moon, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { NotificationDropdown } from "@/components/layout/notification-dropdown"
import { useTheme } from "next-themes"

interface AdminHeaderProps {
  title: string
  description?: string
}

export function AdminHeader({ title, description }: AdminHeaderProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="border-b border-slate-200/60 dark:border-slate-900 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40 transition-colors duration-300">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h1 className="text-lg font-serif font-normal text-slate-900 dark:text-white tracking-tight">{title}</h1>
          {description && <p className="text-slate-450 dark:text-slate-500 text-[10px] uppercase font-mono font-bold tracking-wider mt-0.5">{description}</p>}
        </div>

        <div className="flex items-center gap-3">
          {/* Back to Site Button */}
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-[#e65737]/10 dark:hover:bg-[#e65737]/10 hover:text-[#e65737] dark:hover:text-[#e65737] border border-slate-200/80 dark:border-slate-800 transition-all font-mono uppercase tracking-wider text-[10px] font-bold"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Site</span>
            </Button>
          </Link>

          {/* Theme Toggle */}

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl hover:bg-[#e65737]/10 dark:hover:bg-[#e65737]/10 text-slate-500 dark:text-slate-400 hover:text-[#e65737] dark:hover:text-[#e65737] transition-all duration-200 cursor-pointer"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle Theme"
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Notifications */}
          <NotificationDropdown />
        </div>
      </div>
    </header>
  )
}

