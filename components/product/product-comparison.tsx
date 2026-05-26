"use client"

import { useState, useEffect } from "react"
import { X, Plus, Star, Battery, Camera, Navigation, Package, Timer, Zap, Weight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface DroneProduct {
  id: string
  name: string
  brand: string
  price: number
  comparePrice?: number
  imageUrl: string
  rating: number
  reviewCount: number
  specifications: {
    flightTime: number // minutes
    maxSpeed: number // km/h
    maxRange: number // km
    payloadCapacity: number // grams
    cameraResolution: string
    batteryCapacity: number // mAh
    weight: number // grams
    maxAltitude: number // meters
    chargingTime: number // minutes
    gpsAccuracy: string
    windResistance: number // km/h
    operatingTemp: string
  }
  features: string[]
  category: string
}

interface ProductComparisonProps {
  products: DroneProduct[]
  maxProducts?: number
}

const sampleDrones: DroneProduct[] = [
  {
    id: "1",
    name: "AeroMax Pro 4K",
    brand: "SkyTech",
    price: 2499,
    comparePrice: 2999,
    imageUrl: "/placeholder.svg?height=200&width=300&text=AeroMax+Pro",
    rating: 4.8,
    reviewCount: 324,
    specifications: {
      flightTime: 45,
      maxSpeed: 68,
      maxRange: 15,
      payloadCapacity: 2000,
      cameraResolution: "4K 60fps",
      batteryCapacity: 8000,
      weight: 1250,
      maxAltitude: 5000,
      chargingTime: 75,
      gpsAccuracy: "±0.5m",
      windResistance: 40,
      operatingTemp: "-10°C to 50°C"
    },
    features: ["3-axis Gimbal", "Obstacle Avoidance", "Follow Me", "RTH", "FPV Mode"],
    category: "Photography"
  },
  {
    id: "2",
    name: "RacerX Elite",
    brand: "VelocityDrones",
    price: 899,
    comparePrice: 1199,
    imageUrl: "/placeholder.svg?height=200&width=300&text=RacerX+Elite",
    rating: 4.6,
    reviewCount: 156,
    specifications: {
      flightTime: 12,
      maxSpeed: 140,
      maxRange: 2,
      payloadCapacity: 0,
      cameraResolution: "1080p 120fps",
      batteryCapacity: 1800,
      weight: 350,
      maxAltitude: 1000,
      chargingTime: 25,
      gpsAccuracy: "±3m",
      windResistance: 60,
      operatingTemp: "0°C to 40°C"
    },
    features: ["High Speed", "Acro Mode", "Racing Optimized", "Carbon Fiber", "Manual Control"],
    category: "Racing"
  },
  {
    id: "3",
    name: "AgriSpray 2000",
    brand: "FarmDrone Co",
    price: 15999,
    comparePrice: 18999,
    imageUrl: "/placeholder.svg?height=200&width=300&text=AgriSpray+2000",
    rating: 4.9,
    reviewCount: 89,
    specifications: {
      flightTime: 25,
      maxSpeed: 45,
      maxRange: 8,
      payloadCapacity: 20000,
      cameraResolution: "2K Agricultural",
      batteryCapacity: 22000,
      weight: 8500,
      maxAltitude: 500,
      chargingTime: 120,
      gpsAccuracy: "±0.1m RTK",
      windResistance: 35,
      operatingTemp: "-20°C to 60°C"
    },
    features: ["Precision Spraying", "RTK GPS", "Weather Resistant", "Auto Refill", "Field Mapping"],
    category: "Agricultural"
  },
  {
    id: "4",
    name: "SurveillanceEye Pro",
    brand: "SecureTech",
    price: 8999,
    comparePrice: 10999,
    imageUrl: "/placeholder.svg?height=200&width=300&text=Surveillance+Pro",
    rating: 4.7,
    reviewCount: 67,
    specifications: {
      flightTime: 90,
      maxSpeed: 55,
      maxRange: 25,
      payloadCapacity: 1500,
      cameraResolution: "4K + Thermal",
      batteryCapacity: 15000,
      weight: 2100,
      maxAltitude: 8000,
      chargingTime: 90,
      gpsAccuracy: "±1m",
      windResistance: 45,
      operatingTemp: "-30°C to 55°C"
    },
    features: ["Thermal Imaging", "Night Vision", "Stealth Mode", "Encrypted Comms", "Auto Patrol"],
    category: "Surveillance"
  }
]

export default function ProductComparison({ products = sampleDrones, maxProducts = 4 }: ProductComparisonProps) {
  const [selectedProducts, setSelectedProducts] = useState<DroneProduct[]>([])
  const [availableProducts, setAvailableProducts] = useState<DroneProduct[]>(products)

  const addProduct = (product: DroneProduct) => {
    if (selectedProducts.length < maxProducts && !selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, product])
      setAvailableProducts(availableProducts.filter(p => p.id !== product.id))
    }
  }

  const removeProduct = (productId: string) => {
    const product = selectedProducts.find(p => p.id === productId)
    if (product) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== productId))
      setAvailableProducts([...availableProducts, product])
    }
  }

  const comparisonSpecs = [
    { key: "price", label: "Price", icon: Zap, format: (value: any) => `₹${value.toLocaleString('en-IN')}`, type: "price" },
    { key: "flightTime", label: "Flight Time", icon: Timer, format: (value: any) => `${value} min`, type: "performance" },
    { key: "maxSpeed", label: "Max Speed", icon: Zap, format: (value: any) => `${value} km/h`, type: "performance" },
    { key: "maxRange", label: "Max Range", icon: Navigation, format: (value: any) => `${value} km`, type: "performance" },
    { key: "payloadCapacity", label: "Payload", icon: Package, format: (value: any) => value > 0 ? `${value}g` : "None", type: "performance" },
    { key: "cameraResolution", label: "Camera", icon: Camera, format: (value: any) => value, type: "camera" },
    { key: "batteryCapacity", label: "Battery", icon: Battery, format: (value: any) => `${value} mAh`, type: "power" },
    { key: "weight", label: "Weight", icon: Weight, format: (value: any) => `${value}g`, type: "physical" },
    { key: "maxAltitude", label: "Max Altitude", icon: Navigation, format: (value: any) => `${value}m`, type: "performance" },
    { key: "chargingTime", label: "Charging Time", icon: Battery, format: (value: any) => `${value} min`, type: "power" },
    { key: "gpsAccuracy", label: "GPS Accuracy", icon: Navigation, format: (value: any) => value, type: "navigation" },
    { key: "windResistance", label: "Wind Resistance", icon: Zap, format: (value: any) => `${value} km/h`, type: "performance" },
    { key: "operatingTemp", label: "Operating Temp", icon: Timer, format: (value: any) => value, type: "physical" }
  ]

  const getSpecValue = (product: DroneProduct, key: string) => {
    if (key === "price") return product.price
    if (key === "rating") return product.rating
    return product.specifications[key as keyof typeof product.specifications]
  }

  const getBestValue = (key: string) => {
    if (selectedProducts.length === 0) return null
    
    const values = selectedProducts.map(product => getSpecValue(product, key))
    
    if (key === "price") {
      return Math.min(...values as number[])
    } else if (typeof values[0] === "number") {
      return Math.max(...values as number[])
    }
    return null
  }

  const isHighlighted = (product: DroneProduct, key: string) => {
    const value = getSpecValue(product, key)
    const bestValue = getBestValue(key)
    return value === bestValue && bestValue !== null
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Compare Drones</h2>
        <p className="text-gray-600">
          Compare specifications, features, and pricing to find the perfect drone for your needs.
        </p>
      </div>

      {/* Add Products Section */}
      {availableProducts.length > 0 && selectedProducts.length < maxProducts && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Products to Compare
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {availableProducts.slice(0, 8).map(product => (
                <div
                  key={product.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => addProduct(product)}
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                  <h4 className="font-medium text-sm">{product.name}</h4>
                  <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-xs">{product.rating}</span>
                  </div>
                  <p className="font-bold text-blue-600">₹{product.price.toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison Table */}
      {selectedProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Header Row */}
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-4 text-left font-medium text-gray-900 w-48">Specification</th>
                  {selectedProducts.map(product => (
                    <th key={product.id} className="p-4 text-center min-w-64">
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-red-100 hover:bg-red-200"
                          onClick={() => removeProduct(product.id)}
                        >
                          <X className="w-3 h-3 text-red-600" />
                        </Button>
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-24 h-16 object-cover rounded mx-auto mb-2"
                        />
                        <h3 className="font-semibold text-gray-900 text-sm">{product.name}</h3>
                        <p className="text-xs text-gray-500">{product.brand}</p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs">{product.rating}</span>
                          <span className="text-xs text-gray-400">({product.reviewCount})</span>
                        </div>
                        <Badge className="mt-2">{product.category}</Badge>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {comparisonSpecs.map((spec, index) => {
                  const Icon = spec.icon
                  return (
                    <tr key={spec.key} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="p-4 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-gray-600" />
                          {spec.label}
                        </div>
                      </td>
                      {selectedProducts.map(product => {
                        const value = getSpecValue(product, spec.key)
                        const highlighted = isHighlighted(product, spec.key)
                        
                        return (
                          <td
                            key={`${product.id}-${spec.key}`}
                            className={`p-4 text-center ${
                              highlighted 
                                ? "bg-green-50 border border-green-200 font-bold text-green-800" 
                                : ""
                            }`}
                          >
                            <span className={highlighted ? "text-green-800" : "text-gray-900"}>
                              {spec.format(value)}
                            </span>
                            {highlighted && (
                              <div className="text-xs text-green-600 mt-1">Best Value</div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}

                {/* Features Row */}
                <tr className="bg-gray-50 border-t-2">
                  <td className="p-4 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-gray-600" />
                      Key Features
                    </div>
                  </td>
                  {selectedProducts.map(product => (
                    <td key={`${product.id}-features`} className="p-4">
                      <div className="space-y-1">
                        {product.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs mr-1 mb-1">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Action Row */}
                <tr className="bg-white border-t-2">
                  <td className="p-4 font-medium text-gray-900">Actions</td>
                  {selectedProducts.map(product => (
                    <td key={`${product.id}-actions`} className="p-4 text-center">
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-gray-900">
                          ₹{product.price.toLocaleString('en-IN')}
                        </div>
                        {product.comparePrice && (
                          <div className="text-sm text-gray-500 line-through">
                            ₹{product.comparePrice.toLocaleString('en-IN')}
                          </div>
                        )}
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
                          Add to Cart
                        </Button>
                        <Button variant="outline" className="w-full" size="sm">
                          View Details
                        </Button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            Select products from above to start comparing
          </div>
          <p className="text-gray-400">
            Compare up to {maxProducts} drones side by side to find the perfect match for your needs.
          </p>
        </div>
      )}
    </div>
  )
}
