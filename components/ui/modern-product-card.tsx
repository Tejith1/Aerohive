"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Star, Heart } from "lucide-react"

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
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
      className="group relative flex flex-col justify-between bg-card/65 backdrop-blur-md border border-border hover:border-primary/50 hover:shadow-md rounded-2xl p-4 transition-all duration-300"
    >
      
      {/* Product Image Frame (Luxury rounded container) */}
      <div className="relative aspect-square overflow-hidden bg-background rounded-xl border border-border">
        <Link href={`/products/${slug}`} className="block w-full h-full">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
          />
          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-black/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Link>
 
        {/* Minimal uppercase tags */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isNew && (
            <span className="text-[9px] font-bold tracking-[0.15em] bg-foreground text-background px-2 py-1 rounded-full uppercase">
              NEW
            </span>
          )}
          {isFeatured && (
            <span className="text-[9px] font-bold tracking-[0.15em] bg-primary text-white px-2 py-1 rounded-full uppercase">
              FEATURED
            </span>
          )}
          {isOnSale && discountPercentage > 0 && (
            <span className="text-[9px] font-bold tracking-[0.15em] bg-primary text-white px-2 py-1 rounded-full uppercase font-mono">
              -{discountPercentage}%
            </span>
          )}
        </div>
 
        {/* Flat micro-action controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          {onToggleWishlist && (
            <button
              onClick={onToggleWishlist}
              className={`p-2 bg-card border border-border rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                isInWishlist ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label="Toggle Wishlist"
            >
              <Heart className={`h-3.5 w-3.5 ${isInWishlist ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
 
        {/* Clean Out-Of-Stock Overlay */}
        {stockQuantity === 0 && (
          <div className="absolute inset-0 bg-background/70 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl">
            <span className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase border border-border px-3 py-1.5 bg-background rounded-full shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>
 
      {/* Info Frame (Minimal text alignment, no heavy cards) */}
      <div className="pt-4 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <Link href={`/products/${slug}`} className="block">
            <h3 className="font-semibold text-base text-foreground line-clamp-1 hover:text-primary transition-colors leading-tight font-sans tracking-tight">
              {name}
            </h3>
          </Link>
          
          <div className="flex items-center justify-between">
            {/* Elegant raw pricing */}
            <div className="flex items-baseline space-x-1.5">
              <span className="text-sm font-semibold text-foreground font-mono">
                ₹{price.toLocaleString('en-IN')}
              </span>
              {comparePrice && (
                <span className="text-[10px] text-muted-foreground line-through font-mono">
                  ₹{comparePrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
 
            {/* Tiny stars */}
            {rating > 0 && (
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 fill-primary text-primary" />
                <span className="text-[9px] font-semibold text-muted-foreground font-mono">({reviewCount})</span>
              </div>
            )}
          </div>
        </div>
 
        {/* Premium Clicking Pill-Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <button
            onClick={onAddToCart}
            disabled={stockQuantity === 0}
            className={`flex-1 py-2 rounded-full text-[10px] font-semibold tracking-wide transition-all duration-300 shadow-sm hover:scale-[1.01] active:scale-[0.98] cursor-pointer ${
              stockQuantity === 0
                ? 'bg-muted border border-border text-muted-foreground cursor-not-allowed'
                : 'bg-foreground hover:bg-primary hover:text-primary-foreground text-background'
            }`}
          >
            Buy
          </button>
          
          <Link href={`/products/${slug}`} className="flex-1 block">
            <button className="w-full py-2 rounded-full text-[10px] font-semibold tracking-wide transition-all duration-300 border border-border text-foreground hover:bg-muted hover:scale-[1.01] active:scale-[0.98] cursor-pointer text-center bg-transparent">
              Details
            </button>
          </Link>
        </div>
      </div>

    </motion.div>
  )
}