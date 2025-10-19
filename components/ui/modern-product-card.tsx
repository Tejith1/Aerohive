"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Heart, Star, Eye, Zap, Award } from "lucide-react"

interface ModernProductCardProps {
  id: string
  name: string
  price: number
  comparePrice?: number
  imageUrl: string
  slug: string
  rating?: number
  reviewCount?: number
  isNew?: boolean
  isFeatured?: boolean
  isOnSale?: boolean
  stockQuantity: number
  onAddToCart: () => void
  onToggleWishlist?: () => void
  isInWishlist?: boolean
}

export function ModernProductCard({
  id,
  name,
  price,
  comparePrice,
  imageUrl,
  slug,
  rating = 0,
  reviewCount = 0,
  isNew = false,
  isFeatured = false,
  isOnSale = false,
  stockQuantity,
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false
}: ModernProductCardProps) {
  const discountPercentage = comparePrice 
    ? Math.round(((comparePrice - price) / comparePrice) * 100) 
    : 0

  return (
    <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 rounded-2xl">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <Link href={`/products/${slug}`}>
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNew && (
            <div className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-lg">
              <Zap className="h-3 w-3 inline mr-1" />
              NEW
            </div>
          )}
          {isFeatured && (
            <div className="px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold rounded-full shadow-lg">
              <Award className="h-3 w-3 inline mr-1" />
              FEATURED
            </div>
          )}
          {isOnSale && discountPercentage > 0 && (
            <div className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
              -{discountPercentage}% OFF
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
          {onToggleWishlist && (
            <button
              onClick={onToggleWishlist}
              className={`p-2 rounded-full backdrop-blur-md border shadow-lg transition-all duration-300 hover:scale-110 ${
                isInWishlist 
                  ? 'bg-red-500 text-white border-red-500' 
                  : 'bg-white/90 text-gray-700 border-white/50 hover:bg-white hover:text-red-500'
              }`}
            >
              <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
            </button>
          )}
          
          <Link href={`/products/${slug}`}>
            <button className="p-2 rounded-full bg-white/90 text-gray-700 border border-white/50 backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white">
              <Eye className="h-4 w-4" />
            </button>
          </Link>
        </div>

        {/* Quick add to cart (hover) */}
        <div className="absolute bottom-3 left-3 right-3 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <Button
            onClick={onAddToCart}
            disabled={stockQuantity === 0}
            className={`w-full rounded-xl font-medium shadow-lg ${
              stockQuantity === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-xl'
            } transition-all duration-300`}
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {stockQuantity === 0 ? 'Out of Stock' : 'Quick Add'}
          </Button>
        </div>

        {/* Stock indicator */}
        {stockQuantity === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
              Out of Stock
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-6">
        <Link href={`/products/${slug}`}>
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors duration-300">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(rating) 
                      ? "fill-amber-400 text-amber-400" 
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">({reviewCount})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl font-bold text-gray-900">
            ₹{price.toLocaleString('en-IN')}
          </span>
          {comparePrice && (
            <span className="text-lg text-gray-500 line-through">
              ₹{comparePrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          <Button
            onClick={onAddToCart}
            disabled={stockQuantity === 0}
            className={`w-full rounded-xl font-medium ${
              stockQuantity === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg'
            } transition-all duration-300`}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
          
          <Button
            variant="outline"
            asChild
            className="w-full border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl transition-all duration-300"
          >
            <Link href={`/products/${slug}`}>
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}