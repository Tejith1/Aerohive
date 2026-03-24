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
  const { user, isAdmin, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        if (pathname !== '/admin/login') {
          router.push('/admin/login')
        }
      } else if (!isAdmin) {
        router.push('/')
      }
    }
  }, [user, isAdmin, isLoading, router, pathname])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-50">Loading admin portal...</div>
  }

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (!isAdmin) return null

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
    </div>
  )
}
