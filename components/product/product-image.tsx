"use client"

import { useEffect, useState } from 'react'
import { getImageUrl } from '@/lib/supabase'

interface ProductImageProps {
  src: string
  alt: string
  className?: string
  fallback?: string
}

export function ProductImage({ src, alt, className = '', fallback = '/placeholder.jpg' }: ProductImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(src)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true)
        setError(false)
        
        // Get the actual image URL (handle short references)
        const actualUrl = await getImageUrl(src)
        setImageSrc(actualUrl)
      } catch (err) {
        console.error('Error loading image:', err)
        setError(true)
        setImageSrc(fallback)
      } finally {
        setIsLoading(false)
      }
    }

    if (src) {
      loadImage()
    } else {
      setImageSrc(fallback)
      setIsLoading(false)
    }
  }, [src, fallback])

  const handleImageError = () => {
    if (!error) {
      setError(true)
      setImageSrc(fallback)
    }
  }

  if (isLoading) {
    return (
      <div className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}>
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={handleImageError}
      loading="lazy"
    />
  )
}