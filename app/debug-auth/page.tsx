"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugAuthPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    setLoading(true)
    const info: any = {}

    try {
      // Check environment variables
      info.envVars = {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING',
        supabaseKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      }

      // Check localStorage
      if (typeof window !== 'undefined') {
        const storageKeys = Object.keys(localStorage).filter(key => 
          key.includes('supabase') || key.includes('auth') || key.includes('sb-')
        )
        info.localStorage = {}
        storageKeys.forEach(key => {
          const value = localStorage.getItem(key)
          info.localStorage[key] = value ? 'EXISTS (' + value.length + ' chars)' : 'NULL'
        })
      }

      // Check session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      info.session = {
        exists: !!session,
        email: session?.user?.email || 'N/A',
        expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A',
        provider: session?.user?.app_metadata?.provider || 'N/A',
        error: sessionError?.message || 'None',
      }

      // Check user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      info.user = {
        exists: !!user,
        email: user?.email || 'N/A',
        id: user?.id || 'N/A',
        error: userError?.message || 'None',
      }

      // Check database connection
      try {
        const { data, error } = await supabase.from('users').select('count').limit(1)
        info.database = {
          connected: !error,
          error: error?.message || 'None',
        }
      } catch (e: any) {
        info.database = {
          connected: false,
          error: e.message,
        }
      }

      // Check cookies
      if (typeof document !== 'undefined') {
        info.cookies = document.cookie.split(';').map(c => c.trim().split('=')[0])
      }

    } catch (e: any) {
      info.error = e.message
    }

    setDebugInfo(info)
    setLoading(false)
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const handleClearStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear()
      alert('LocalStorage cleared! Refresh the page.')
    }
  }

  const handleRefreshSession = async () => {
    const { data, error } = await supabase.auth.refreshSession()
    if (error) {
      alert('Refresh failed: ' + error.message)
    } else {
      alert('Session refreshed!')
      checkAuth()
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">🔍 Auth Debug Info</h1>
      
      <div className="flex gap-4 mb-6">
        <Button onClick={checkAuth} disabled={loading}>
          {loading ? 'Checking...' : '🔄 Refresh Check'}
        </Button>
        <Button onClick={handleClearStorage} variant="destructive">
          🗑️ Clear Storage
        </Button>
        <Button onClick={handleRefreshSession} variant="outline">
          🔑 Refresh Session
        </Button>
      </div>

      <div className="space-y-4">
        {Object.entries(debugInfo).map(([key, value]) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="text-lg capitalize">{key}</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-50 p-4 rounded overflow-x-auto text-xs">
                {JSON.stringify(value, null, 2)}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-bold mb-2">🛠️ Troubleshooting Steps:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Check if session exists and hasn't expired</li>
          <li>Verify localStorage has auth tokens</li>
          <li>Confirm environment variables are set</li>
          <li>Test database connection</li>
          <li>If all fails, clear storage and login again</li>
        </ol>
      </div>
    </div>
  )
}
