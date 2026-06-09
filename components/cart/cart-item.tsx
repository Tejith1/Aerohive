"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCartStore } from "@/lib/cart-store"

interface CartItemProps {
  item: {
    id: number
    name: string
    price: number
    imageUrl: string
    slug: string
    quantity: number
    stockQuantity: number
  }
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore()

  const handleQuantityChange = (newQuantity: number) => {
    updateQuantity(item.id, newQuantity)
  }

  const handleRemove = () => {
    removeItem(item.id)
  }

  return (
    <Card className="border border-border/40 shadow-sm bg-card hover:border-primary/30 transition-all duration-300 rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Product Image */}
          <Link href={`/products/${item.slug}`} className="flex-shrink-0">
            <div className="w-24 h-24 relative rounded-xl overflow-hidden border border-border/40 bg-secondary/30">
              <Image src={item.imageUrl || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
            </div>
          </Link>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <Link
              href={`/products/${item.slug}`}
              className="font-bold text-foreground hover:text-primary transition-colors line-clamp-2 text-sm uppercase tracking-wide font-sans"
            >
              {item.name}
            </Link>
            <p className="text-base font-bold text-primary mt-1">₹{item.price.toLocaleString('en-IN')}</p>
            <p className="text-[10px] uppercase font-mono-tech tracking-wider text-muted-foreground mt-1">In stock: {item.stockQuantity}</p>
          </div>

          {/* Quantity Controls */}
          <div className="flex flex-col items-end justify-between min-h-[96px] gap-2">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg bg-transparent border-border hover:bg-muted transition-colors cursor-pointer"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>

              <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg bg-transparent border-border hover:bg-muted transition-colors cursor-pointer"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={item.quantity >= item.stockQuantity}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg px-2.5 h-8 font-bold tracking-wider uppercase font-mono-tech transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Remove
            </Button>
          </div>
        </div>

        {/* Total for this item */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-border/40">
          <span className="text-[10px] uppercase tracking-wider font-mono-tech text-muted-foreground">
            Subtotal ({item.quantity} item{item.quantity > 1 ? "s" : ""})
          </span>
          <span className="font-bold text-base text-foreground">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
        </div>
      </CardContent>
    </Card>
  )
}
