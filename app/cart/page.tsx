"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingBag, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CartItem } from "@/components/cart/cart-item"
import { ModernHeader } from "@/components/layout/modern-header"
import { ModernFooter } from "@/components/layout/modern-footer"
import { useCartStore } from "@/lib/cart-store"
import { useAuth } from "@/contexts/auth-context"
import { useSettings } from "@/contexts/settings-context"
import { ComingSoonOverlay } from "@/components/ui/coming-soon-overlay"

export default function CartPage() {
  const { items, getTotalPrice, getTotalItems, clearCart } = useCartStore()
  const { isAdmin, isLoading: authLoading } = useAuth()
  const { settings: siteSettings, isLoading: settingsLoading } = useSettings()

  const subtotal = getTotalPrice()
  const shipping = subtotal >= 8300 ? 0 : 830
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const showOverlay = siteSettings?.hide_sections && siteSettings?.hide_cart && !isAdmin && !authLoading && !settingsLoading

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
        <ModernHeader />

        <main className="flex-1 flex items-center justify-center py-12 relative">
          <div className={showOverlay ? "opacity-20 blur-sm pointer-events-none transition-all duration-300 w-full" : "transition-all duration-300 w-full"}>
            <div className="text-center max-w-md mx-auto px-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-10 w-10 text-primary" />
              </div>
              <h1 className="font-display text-3xl font-black uppercase tracking-tight text-foreground mb-3">Your cart is empty</h1>
              <p className="text-muted-foreground mb-8 leading-relaxed font-mono-tech text-xs uppercase tracking-wider">
                Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
              </p>
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-none rounded-[14px] px-8 py-6 font-semibold uppercase tracking-wider font-mono-tech text-xs">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          </div>

          <ComingSoonOverlay
            show={showOverlay}
            title="Access Restricted"
            description="This section is locked for regular customers. Only administrators can access this content."
          />
        </main>

        <ModernFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <ModernHeader />

      <main className="flex-1 py-12 relative">
        <div className={showOverlay ? "opacity-20 blur-sm pointer-events-none transition-all duration-300" : "transition-all duration-300"}>
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="mb-12 text-center">
              <span className="font-mono-tech text-[11px] uppercase tracking-[0.2em] text-primary mb-3 block">
                [ SHOPPING CART ]
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tighter uppercase text-foreground mb-3">Your Selection</h1>
              <p className="text-muted-foreground font-mono-tech text-xs uppercase tracking-wider">
                {getTotalItems()} item{getTotalItems() > 1 ? "s" : ""} currently in your cart
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}

                <div className="flex justify-between items-center pt-6">
                  <Button variant="outline" onClick={clearCart} className="border-primary/30 text-primary hover:bg-primary/5 rounded-[14px]">
                    Clear Cart
                  </Button>
                  <Button variant="outline" asChild className="border-border hover:bg-muted rounded-[14px]">
                    <Link href="/products">Continue Shopping</Link>
                  </Button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24 shadow-sm bg-card border border-border/40 rounded-2xl overflow-hidden p-6">
                  <CardHeader className="p-0 pb-6">
                    <CardTitle className="font-display text-xl font-black uppercase text-foreground tracking-tight">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-4">
                    <div className="flex justify-between font-mono-tech text-xs uppercase text-muted-foreground">
                      <span>Subtotal ({getTotalItems()} items)</span>
                      <span className="text-foreground font-semibold">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex justify-between font-mono-tech text-xs uppercase text-muted-foreground">
                      <span>Shipping</span>
                      <span className="text-foreground font-semibold">
                        {shipping === 0 ? <span className="text-green-600">Free</span> : `₹${shipping.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </span>
                    </div>

                    <div className="flex justify-between font-mono-tech text-xs uppercase text-muted-foreground">
                      <span>Tax</span>
                      <span className="text-foreground font-semibold">₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    {shipping === 0 && (
                      <div className="text-xs text-green-600 bg-green-500/10 p-3 rounded-lg border border-green-500/20 font-mono-tech uppercase tracking-wider text-center">
                        🎉 Free Shipping Applied
                      </div>
                    )}

                    {subtotal < 8300 && (
                      <div className="text-xs text-muted-foreground bg-secondary/50 p-3 rounded-lg border border-border/40 font-mono-tech uppercase tracking-wider text-center">
                        Add ₹{(8300 - subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} more for free shipping
                      </div>
                    )}

                    <Separator className="my-4" />

                    <div className="flex justify-between text-lg font-black uppercase font-display text-foreground">
                      <span>Total</span>
                      <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-none rounded-[14px] py-6 font-semibold uppercase tracking-wider font-mono-tech text-xs" size="lg" asChild>
                      <Link href="/checkout">
                        Proceed to Checkout
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>

                    <div className="text-[10px] font-mono-tech uppercase tracking-widest text-muted-foreground text-center">
                      Secure checkout powered by industry-standard encryption
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <ComingSoonOverlay
          show={showOverlay}
          title="Access Restricted"
          description="This section is locked for regular customers. Only administrators can access this content."
        />
      </main>

      <ModernFooter />
    </div>
  )
}
