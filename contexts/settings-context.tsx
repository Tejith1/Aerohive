"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

export interface SiteSettings {
  hide_sections: boolean // Master override (Global Access Lock)
  hide_drones: boolean
  hide_categories: boolean
  hide_services: boolean
  hide_cart: boolean
  hide_training: boolean
}

const defaultSettings: SiteSettings = {
  hide_sections: true,
  hide_drones: true,
  hide_categories: true,
  hide_services: true,
  hide_cart: true,
  hide_training: true,
}

interface SettingsContextType {
  settings: SiteSettings
  isLoading: boolean
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<boolean>
  refreshSettings: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("description")
        .eq("slug", "site-settings")
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          console.log("ℹ️ Site settings row not found, using defaults.")
          setSettings(defaultSettings)
        } else {
          console.error("❌ Error fetching site settings:", error)
        }
        return
      }

      if (data && data.description) {
        try {
          const parsed = JSON.parse(data.description)
          setSettings({
            ...defaultSettings,
            ...parsed,
          })
        } catch (e) {
          console.error("❌ Failed to parse site settings JSON:", e)
        }
      }
    } catch (err) {
      console.error("❌ Unexpected error fetching settings:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()

    // Polling fallback to synchronize settings across tabs every 1.5 seconds
    const interval = setInterval(() => {
      fetchSettings()
    }, 1500)

    // Realtime settings synchronization
    const channel = supabase
      .channel('site-settings-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories',
          filter: 'slug=eq.site-settings'
        },
        (payload: any) => {
          console.log('🔔 Realtime settings sync payload:', payload.new)
          const newRow = payload.new as { description?: string } | null | undefined
          if (newRow?.description) {
            try {
              const parsed = JSON.parse(newRow.description)
              setSettings({
                ...defaultSettings,
                ...parsed
              })
            } catch (e) {
              console.error('❌ Error parsing realtime description JSON:', e)
            }
          }
        }
      )
      .subscribe()

    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [])

  const updateSettings = async (newSettings: Partial<SiteSettings>): Promise<boolean> => {
    try {
      const updated = {
        ...settings,
        ...newSettings,
      }

      const { error } = await supabase
        .from("categories")
        .upsert({
          name: "Site Settings",
          slug: "site-settings",
          description: JSON.stringify(updated),
          is_active: false,
          image_url: "",
        }, { onConflict: "slug" })

      if (error) {
        console.error("❌ Error updating settings in Supabase:", error)
        toast({
          title: "Update Failed",
          description: error.message || "Failed to update platform settings.",
          variant: "destructive",
        })
        return false
      }

      setSettings(updated)
      return true
    } catch (err) {
      console.error("❌ Error updating settings:", err)
      return false
    }
  }

  return (
    <SettingsContext.Provider value={{ settings, isLoading, updateSettings, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
