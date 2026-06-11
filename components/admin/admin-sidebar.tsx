"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, BarChart3, LogOut, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { DronesIcon, MyOrdersIcon, DronePilotsIcon, ServicesIcon, AdminPanelIcon } from "@/components/ui/custom-icons"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: AdminPanelIcon },
  { name: "Products", href: "/admin/products", icon: DronesIcon },
  { name: "Orders", href: "/admin/orders", icon: MyOrdersIcon },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Drone Pilots", href: "/admin/pilots", icon: DronePilotsIcon },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: ServicesIcon },
  { name: "Back to Site", href: "/", icon: ArrowLeft },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className={cn(
      "flex h-screen sticky top-0 flex-col bg-[#11110f] border-r border-[#1c1c1a] backdrop-blur-xl transition-all duration-300 relative select-none shrink-0 z-40 shadow-[4px_0_24px_rgba(0,0,0,0.25)]",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Logo */}
      <div className={cn(
        "flex h-20 items-center border-b border-[#1c1c1a] bg-[#11110f] transition-all duration-300 overflow-hidden shrink-0",
        isCollapsed ? "justify-center px-0" : "px-6"
      )}>
        <Link href="/admin" className="flex items-center space-x-3.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#e65737] to-[#cc5032] flex items-center justify-center shadow-lg transition-transform hover:scale-105 duration-200 shrink-0">
            <span className="text-white font-bold">AH</span>
          </div>
          {!isCollapsed && (
            <div className="transition-opacity duration-300 opacity-100">
              <span className="font-serif font-normal text-base text-white tracking-wide">AeroHive</span>
              <div className="text-[9px] text-[#e65737] font-bold uppercase tracking-[0.15em] font-mono mt-0.5">Console</div>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden custom-scrollbar",
        isCollapsed ? "px-2" : "px-4"
      )}>
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group relative overflow-hidden font-mono uppercase tracking-wider",
                isCollapsed ? "justify-center px-0" : "px-3.5",
                isActive
                  ? "bg-[#e65737]/12 text-[#e65737] border border-[#e65737]/25 shadow-sm"
                  : "text-neutral-400 hover:text-slate-200 hover:bg-[#1c1c1a]/50 border border-transparent",
              )}
              title={isCollapsed ? item.name : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-[#e65737] z-20" />
              )}
              <Icon className="h-4 w-4 relative z-10 shrink-0 group-hover:scale-105 transition-transform duration-200" />
              {!isCollapsed && <span className="relative z-10 transition-opacity duration-300 opacity-100">{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Collapse Menu Toggle Row */}
      <div className="p-4 border-t border-[#1c1c1a] shrink-0">
        <Button
          onClick={() => setIsCollapsed(!isCollapsed)}
          variant="ghost"
          size="sm"
          className={cn(
            "w-full text-xs font-bold text-neutral-400 hover:text-white hover:bg-[#1c1c1a]/50 transition-all rounded-xl font-mono uppercase tracking-wider",
            isCollapsed ? "justify-center p-0 h-10 w-10" : "justify-start px-3.5 py-2.5"
          )}
          title={isCollapsed ? "Expand Menu" : "Collapse Menu"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4 mr-2" />}
          {!isCollapsed && "Collapse Menu"}
        </Button>
      </div>

      {/* User Actions */}
      <div className={cn(
        "p-4 border-t border-[#1c1c1a] shrink-0",
        isCollapsed ? "flex flex-col items-center gap-2" : ""
      )}>
        <div className={cn(
          "bg-[#1c1c1a]/40 backdrop-blur-sm rounded-2xl mb-3 border border-[#2a2a27]/40 overflow-hidden transition-all duration-300 hover:bg-[#1c1c1a]/60 hover:border-[#e65737]/20",
          isCollapsed ? "p-2 w-12 h-12 flex items-center justify-center mb-0" : "p-3"
        )}>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#e65737] to-[#cc5032] flex items-center justify-center shadow-sm text-xs shrink-0">
              👨‍✈️
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 transition-opacity duration-300 opacity-100">
                <p className="text-xs font-bold text-slate-200 truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-[9px] text-slate-500 font-mono truncate">{user?.email}</p>
              </div>
            )}
          </div>
        </div>
        
        {isCollapsed ? (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all rounded-xl"
            onClick={handleLogout}
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-xs font-bold text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all rounded-xl"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        )}
      </div>
    </div>
  )
}
