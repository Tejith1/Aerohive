"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { Star, ShoppingCart, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/lib/cart-store"
import { toast } from "@/hooks/use-toast"

interface ProductCardProps {
  product: {
    id: number
    name: string
    price: number
    comparePrice?: number
    imageUrl: string
    slug: string
    averageRating?: number
    reviewCount?: number
    isFeatured?: boolean
    stockQuantity: number
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore()

  const discountPercentage = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()

    if (product.stockQuantity === 0) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      })
      return
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      slug: product.slug,
      stockQuantity: product.stockQuantity,
    })

    toast({
      title: "🎉 Added to Cart!",
      description: `${product.name} has been added to your cart.`,
      className: "border-green-200 bg-green-50 text-green-900",
    })
  }

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.imageUrl || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {discountPercentage > 0 && (
            <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground">
              -{discountPercentage}%
            </Badge>
          )}
          {product.isFeatured && (
            <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">Featured</Badge>
          )}
          {product.stockQuantity === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive">Out of Stock</Badge>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-card-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.averageRating && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(product.averageRating!) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">({product.reviewCount || 0})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-primary">₹{product.price.toLocaleString('en-IN')}</span>
          {product.comparePrice && (
            <span className="text-sm text-muted-foreground line-through">₹{product.comparePrice.toLocaleString('en-IN')}</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="w-full space-y-2">
          <Button 
            onClick={handleAddToCart} 
            disabled={product.stockQuantity === 0} 
            className={`w-full ${product.stockQuantity === 0 ? 'bg-gray-400' : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'} text-white shadow-md hover:shadow-lg transition-all duration-300`}
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.stockQuantity === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
          
          <Link href={`/products/${product.slug}`} className="w-full">
            <Button variant="outline" className="w-full border-2 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Customize
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
