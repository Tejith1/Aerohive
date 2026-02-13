import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import dynamic from 'next/dynamic'
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import { NotificationProvider } from "@/contexts/notification-context"
import "./globals.css"

const Chatbot = dynamic(() => import('@/components/Chatbot'), {
  ssr: false,
})

export const metadata: Metadata = {
  title: "AeroHive Drones - Professional Drones for Every Mission",
  description:
    "Discover cutting-edge drones for professional photography, racing, surveillance, and agricultural operations. Expert support and training included.",
  generator: "v0.app",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/placeholder-logo.svg', type: 'image/svg+xml' }
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          <NotificationProvider>
            <Suspense fallback={null}>{children}</Suspense>
            <Chatbot />
            <Toaster />
          </NotificationProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}

