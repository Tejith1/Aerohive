"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { Lock, Shield, User, KeyRound } from "lucide-react"

export default function SettingsPage() {
  const { user, updatePassword } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  })

  // Change Password
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive"
      })
      return
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      const res = await updatePassword(formData.newPassword)
      if (res && res.error) {
         throw res.error
      }
      setFormData({ newPassword: "", confirmPassword: "" })
    } catch (error: any) {
      console.error(error)
      // Toast already handled in updatePassword
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 bg-background min-h-screen">
      <div>
        <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-[#e65737] mb-2 block">
          [ SYSTEM SECURITY & SETTINGS ]
        </span>
        <h1 className="font-display text-4xl font-black uppercase text-foreground">
          Account Settings
        </h1>
        <p className="text-muted-foreground font-mono-tech text-xs uppercase tracking-wider mt-1">Manage your administrator account credentials.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Profile Card */}
        <Card className="border border-border/40 shadow-sm bg-card rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/40 border-b border-border/40 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#e65737]/10 rounded-xl">
                <User className="w-5 h-5 text-[#e65737]" />
              </div>
              <div>
                <CardTitle className="font-display text-lg font-black uppercase text-foreground">Admin Profile</CardTitle>
                <CardDescription className="font-mono-tech text-xs uppercase tracking-wider text-muted-foreground">Your current account details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground font-mono-tech text-xs uppercase tracking-wider">Full Name</Label>
                <div className="font-bold text-lg text-foreground mt-1 font-display">
                  {user?.first_name} {user?.last_name}
                </div>
              </div>
              <div className="h-px bg-border/40" />
              <div>
                <Label className="text-muted-foreground font-mono-tech text-xs uppercase tracking-wider">Email Address</Label>
                <div className="font-medium text-base text-foreground mt-1">
                  {user?.email}
                </div>
              </div>
              <div className="h-px bg-border/40" />
              <div>
                <Label className="text-muted-foreground font-mono-tech text-xs uppercase tracking-wider">Role</Label>
                <div className="mt-2 flex items-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#e65737]/10 text-[#e65737] font-semibold text-xs font-mono-tech uppercase tracking-wider border border-[#e65737]/15">
                    <Shield className="w-3.5 h-3.5" />
                    Administrator
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="border border-border/40 shadow-sm bg-card rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/40 border-b border-border/40 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#e65737]/10 rounded-xl">
                <KeyRound className="w-5 h-5 text-[#e65737]" />
              </div>
              <div>
                <CardTitle className="font-display text-lg font-black uppercase text-foreground">Change Password</CardTitle>
                <CardDescription className="font-mono-tech text-xs uppercase tracking-wider text-muted-foreground">Update your login credentials securely</CardDescription>
              </div>
            </div>
          </CardHeader>
          <form onSubmit={handlePasswordChange}>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.newPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="pl-9 bg-background border-border rounded-[12px]"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="pl-9 bg-background border-border rounded-[12px]"
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/40 border-t border-border/40 p-4">
              <Button 
                type="submit" 
                className="w-full bg-[#e65737] hover:bg-[#cc5032] text-white rounded-[14px] font-mono-tech text-xs uppercase tracking-wider py-5"
                disabled={loading}
              >
                {loading ? "Updating Password..." : "Update Administrator Password"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
