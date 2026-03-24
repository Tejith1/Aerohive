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
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
          Account Settings
        </h1>
        <p className="text-slate-500 mt-1">Manage your administrator account credentials.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Profile Card */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="bg-slate-50/50 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <CardTitle className="text-lg">Admin Profile</CardTitle>
                <CardDescription>Your current account details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label className="text-slate-500">Full Name</Label>
                <div className="font-medium text-lg text-slate-900 mt-1">
                  {user?.first_name} {user?.last_name}
                </div>
              </div>
              <div className="h-px bg-slate-100" />
              <div>
                <Label className="text-slate-500">Email Address</Label>
                <div className="font-medium text-lg text-slate-900 mt-1">
                  {user?.email}
                </div>
              </div>
              <div className="h-px bg-slate-100" />
              <div>
                <Label className="text-slate-500">Role</Label>
                <div className="mt-2 flex items-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium text-sm">
                    <Shield className="w-3.5 h-3.5" />
                    Administrator
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="bg-slate-50/50 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <KeyRound className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <CardTitle className="text-lg">Change Password</CardTitle>
                <CardDescription>Update your login credentials securely</CardDescription>
              </div>
            </div>
          </CardHeader>
          <form onSubmit={handlePasswordChange}>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.newPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50/50 border-t py-4">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
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
