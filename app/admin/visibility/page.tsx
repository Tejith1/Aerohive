"use client"

import React, { useState } from "react"
import { useSettings } from "@/contexts/settings-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { Shield, Eye, EyeOff, Lock, Unlock, HelpCircle } from "lucide-react"

export default function VisibilitySettingsPage() {
  const { settings: siteSettings, updateSettings } = useSettings()
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false)

  const handleToggleSetting = async (key: string) => {
    if (!siteSettings) return
    setIsUpdatingSettings(true)
    const currentVal = siteSettings[key as keyof typeof siteSettings]
    const success = await updateSettings({ [key]: !currentVal })
    setIsUpdatingSettings(false)
    if (success) {
      toast({
        title: "Access Policy Updated",
        description: `Successfully updated the section visibility settings.`,
        variant: "success"
      })
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 bg-background min-h-screen">
      <div>
        <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-[#e65737] mb-2 block">
          [ DEPLOYMENT & ROUTING CONTROLS ]
        </span>
        <h1 className="font-display text-4xl font-black uppercase text-foreground">
          Platform Visibility
        </h1>
        <p className="text-muted-foreground font-mono-tech text-xs uppercase tracking-wider mt-1">
          Control which site features and navigation links are visible to regular customers.
        </p>
      </div>

      <div className="grid gap-8">
        <Card className="border border-border/40 shadow-sm bg-card rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/40 border-b border-border/40 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#e65737]/10 rounded-xl">
                <Shield className="w-5 h-5 text-[#e65737]" />
              </div>
              <div>
                <CardTitle className="font-display text-lg font-black uppercase text-foreground">
                  Global Access Lock
                </CardTitle>
                <CardDescription className="font-mono-tech text-xs uppercase tracking-wider text-muted-foreground">
                  Master override for section filters
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {siteSettings ? (
              <div className="space-y-6">
                {/* Global access lock toggle */}
                <div className="flex items-center justify-between p-5 rounded-2xl bg-neutral-50/50 dark:bg-neutral-950/20 border border-neutral-150/40 dark:border-neutral-800/30">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-neutral-850 dark:text-neutral-100 uppercase tracking-wide">
                        Global Access Lock
                      </p>
                      {siteSettings.hide_sections ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 uppercase tracking-wider border border-amber-500/20 font-mono">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 uppercase tracking-wider border border-emerald-500/20 font-mono">
                          <Unlock className="w-3 h-3" /> Unlocked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      When enabled, the section-specific toggles below will take effect and hide selected pages from the top navigation.
                    </p>
                  </div>
                  <Switch 
                    checked={siteSettings.hide_sections} 
                    onCheckedChange={() => handleToggleSetting("hide_sections")} 
                    disabled={isUpdatingSettings}
                    className="scale-110"
                  />
                </div>

                {/* Sub-toggles list */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pl-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                      Individual Page & Feature Locks
                    </span>
                  </div>

                  <div className="grid gap-4 pl-3 border-l-2 border-neutral-200/50 dark:border-neutral-800/40">
                    {[
                      { key: "hide_drones", label: "Drones Section", desc: "Hides '/products' catalog page and sub-links from the header menu entirely." },
                      { key: "hide_categories", label: "Categories Section", desc: "Hides '/categories' navigation link from the header menu." },
                      { key: "hide_pilots", label: "Drone Pilots Section", desc: "Hides '/drone-pilots' directory and profile cards from the header menu." },
                      { key: "hide_services", label: "Drone Services Section", desc: "Hides '/drone-services' and '/repair-services' links from the header menu." },
                      { key: "hide_cart", label: "Shopping Cart Link", desc: "Hides the shopping cart icon and lock overlay from the top-right of the header." },
                      { key: "hide_training", label: "Training Academy Section", desc: "Hides '/training' academy links inside the header services dropdown." },
                      { key: "hide_about", label: "About Section", desc: "Hides '/about' informational page link from the header menu." },
                      { key: "hide_contact", label: "Contact Section", desc: "Hides '/contact' page link from the header menu." }
                    ].map((item) => {
                      const isLocked = siteSettings[item.key as keyof typeof siteSettings]
                      const isMasterEnabled = siteSettings.hide_sections

                      return (
                        <div 
                          key={item.key} 
                          className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                            !isMasterEnabled 
                              ? "bg-muted/10 border-border/20 opacity-40 cursor-not-allowed" 
                              : isLocked
                                ? "bg-rose-500/5 border-rose-500/10 hover:border-rose-500/20"
                                : "bg-card border-border hover:border-primary/20"
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className={`text-xs font-bold uppercase tracking-wider ${!isMasterEnabled ? "text-muted-foreground" : "text-foreground"}`}>
                                {item.label}
                              </p>
                              {isMasterEnabled && (
                                isLocked ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-rose-500/10 text-rose-500 uppercase tracking-wider border border-rose-500/20 font-mono">
                                    <EyeOff className="w-2.5 h-2.5" /> Hidden
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500/10 text-emerald-500 uppercase tracking-wider border border-emerald-500/20 font-mono">
                                    <Eye className="w-2.5 h-2.5" /> Visible
                                  </span>
                                )
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {item.desc}
                            </p>
                          </div>
                          <Switch 
                            checked={isLocked} 
                            onCheckedChange={() => handleToggleSetting(item.key)} 
                            disabled={isUpdatingSettings || !isMasterEnabled}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-10 space-y-2 flex-col">
                <div className="h-6 w-6 border-2 border-[#e65737] border-t-transparent animate-spin rounded-full" />
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest animate-pulse">
                  Syncing access policies...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
