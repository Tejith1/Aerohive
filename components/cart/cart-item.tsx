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
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Product Image */}
          <Link href={`/products/${item.slug}`} className="flex-shrink-0">
            <div className="w-20 h-20 relative rounded-md overflow-hidden">
              <Image src={item.imageUrl || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
            </div>
          </Link>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <Link
              href={`/products/${item.slug}`}
              className="font-semibold text-card-foreground hover:text-primary transition-colors line-clamp-2"
            >
              {item.name}
            </Link>
            <p className="text-lg font-bold text-primary mt-1">₹{item.price.toLocaleString('en-IN')}</p>
            <p className="text-sm text-muted-foreground">In stock: {item.stockQuantity}</p>
          </div>

          {/* Quantity Controls */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-transparent"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>

              <span className="w-12 text-center font-semibold">{item.quantity}</span>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-transparent"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={item.quantity >= item.stockQuantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>

        {/* Total for this item */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <span className="text-sm text-muted-foreground">
            Subtotal ({item.quantity} item{item.quantity > 1 ? "s" : ""})
          </span>
          <span className="font-bold text-lg">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
        </div>
      </CardContent>
    </Card>
  )
}
