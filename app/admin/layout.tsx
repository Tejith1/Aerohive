"use client"

import type React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAdmin: originalIsAdmin, isLoading } = useAuth()
  const isAdmin = originalIsAdmin || process.env.NODE_ENV === 'development'
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading) {
      if (process.env.NODE_ENV === 'development') {
        return
      }
      if (!user) {
        if (pathname !== '/admin/login') {
          router.push('/admin/login')
        }
      } else if (!originalIsAdmin) {
        router.push('/')
      }
    }
  }, [user, originalIsAdmin, isLoading, router, pathname])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-50">Loading admin portal...</div>
  }

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (!isAdmin) return null

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#faf8f5] dark:bg-[#0b0c0e]">{children}</div>
    </div>
  )
}
