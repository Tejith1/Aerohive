"use client"

import { useState, useEffect } from "react"
import { Plus, Minus, Camera, Battery, Navigation, Package, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface CustomizationOption {
  id: string
  name: string
  description: string
  price: number
  category: string
  icon: any
  specifications?: Record<string, string>
  compatibility?: string[]
}

interface DroneCustomizationProps {
  droneId: string
  basePrice: number
  onConfigurationChange: (config: any, totalPrice: number) => void
}

const customizationOptions: CustomizationOption[] = [
  // Camera Options
  {
    id: "camera-basic",
    name: "Basic 1080p Camera",
    description: "Standard HD camera with basic stabilization",
    price: 0,
    category: "camera",
    icon: Camera,
    specifications: {
      "Resolution": "1920x1080",
      "Frame Rate": "30fps",
      "Stabilization": "Digital"
    }
  },
  {
    id: "camera-4k",
    name: "4K Professional Camera",
    description: "Ultra HD camera with 3-axis gimbal stabilization",
    price: 500,
    category: "camera",
    icon: Camera,
    specifications: {
      "Resolution": "3840x2160",
      "Frame Rate": "60fps",
      "Stabilization": "3-axis gimbal"
    }
  },
  {
    id: "camera-thermal",
    name: "Thermal Imaging Camera",
    description: "FLIR thermal camera for professional applications",
    price: 2000,
    category: "camera",
    icon: Camera,
    specifications: {
      "Resolution": "640x512",
      "Temperature Range": "-40°C to 550°C",
      "Accuracy": "±2°C"
    }
  },

  // GPS Options
  {
    id: "gps-basic",
    name: "Standard GPS",
    description: "Basic GPS navigation and positioning",
    price: 0,
    category: "gps",
    icon: Navigation,
    specifications: {
      "Accuracy": "±3m",
      "Satellites": "GPS only",
      "Return to Home": "Yes"
    }
  },
  {
    id: "gps-rtk",
    name: "RTK GPS System",
    description: "High-precision GPS with centimeter accuracy",
    price: 800,
    category: "gps",
    icon: Navigation,
    specifications: {
      "Accuracy": "±2cm",
      "Satellites": "GPS, GLONASS, Galileo",
      "Real-time correction": "Yes"
    }
  },

  // Battery Options
  {
    id: "battery-standard",
    name: "Standard Battery (5000mAh)",
    description: "Standard lithium battery for 25-30 minutes flight",
    price: 0,
    category: "battery",
    icon: Battery,
    specifications: {
      "Capacity": "5000mAh",
      "Flight Time": "25-30 min",
      "Charging Time": "60 min"
    }
  },
  {
    id: "battery-extended",
    name: "Extended Battery (8000mAh)",
    description: "High-capacity battery for 40-45 minutes flight",
    price: 200,
    category: "battery",
    icon: Battery,
    specifications: {
      "Capacity": "8000mAh",
      "Flight Time": "40-45 min",
      "Charging Time": "90 min"
    }
  },
  {
    id: "battery-pro",
    name: "Professional Battery Pack",
    description: "Dual battery system with hot-swappable design",
    price: 600,
    category: "battery",
    icon: Battery,
    specifications: {
      "Capacity": "2x 6000mAh",
      "Flight Time": "60-70 min",
      "Hot-swappable": "Yes"
    }
  },

  // Payload Options
  {
    id: "payload-none",
    name: "No Additional Payload",
    description: "Standard drone configuration",
    price: 0,
    category: "payload",
    icon: Package,
    specifications: {
      "Max Weight": "0g",
      "Mount Type": "None"
    }
  },
  {
    id: "payload-delivery",
    name: "Delivery System",
    description: "Automated package delivery mechanism",
    price: 400,
    category: "payload",
    icon: Package,
    specifications: {
      "Max Weight": "2kg",
      "Mount Type": "Release mechanism",
      "Control": "Automated"
    }
  },
  {
    id: "payload-sprayer",
    name: "Agricultural Sprayer",
    description: "Precision spraying system for agriculture",
    price: 1200,
    category: "payload",
    icon: Package,
    specifications: {
      "Tank Capacity": "10L",
      "Spray Rate": "Adjustable",
      "Coverage": "1 hectare/tank"
    }
  }
]

export default function DroneCustomization({ droneId, basePrice, onConfigurationChange }: DroneCustomizationProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({
    camera: "camera-basic",
    gps: "gps-basic",
    battery: "battery-standard",
    payload: "payload-none"
  })

  const [totalPrice, setTotalPrice] = useState(basePrice)

  useEffect(() => {
    calculateTotalPrice()
  }, [selectedOptions, basePrice])

  const calculateTotalPrice = () => {
    let additionalCost = 0
    Object.values(selectedOptions).forEach(optionId => {
      const option = customizationOptions.find(opt => opt.id === optionId)
      if (option) {
        additionalCost += option.price
      }
    })
    const newTotal = basePrice + additionalCost
    setTotalPrice(newTotal)
    onConfigurationChange(selectedOptions, newTotal)
  }

  const handleOptionChange = (category: string, optionId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [category]: optionId
    }))
  }

  const getOptionsByCategory = (category: string) => {
    return customizationOptions.filter(option => option.category === category)
  }

  const getSelectedOption = (category: string) => {
    const optionId = selectedOptions[category]
    return customizationOptions.find(option => option.id === optionId)
  }

  const categories = [
    { id: "camera", name: "Camera System", icon: Camera },
    { id: "gps", name: "Navigation & GPS", icon: Navigation },
    { id: "battery", name: "Battery & Power", icon: Battery },
    { id: "payload", name: "Payload & Accessories", icon: Package }
  ]

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Customize Your Drone</h2>
        <p className="text-gray-600">Configure your drone with professional-grade components and accessories</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-8">
          {categories.map(category => {
            const Icon = category.icon
            const options = getOptionsByCategory(category.id)
            const selectedOption = getSelectedOption(category.id)

            return (
              <Card key={category.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50">
                  <CardTitle className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-blue-600" />
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 gap-4">
                    {options.map(option => {
                      const isSelected = selectedOptions[category.id] === option.id
                      const OptionIcon = option.icon

                      return (
                        <div
                          key={option.id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? "border-blue-500 bg-blue-50 shadow-md"
                              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                          }`}
                          onClick={() => handleOptionChange(category.id, option.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <OptionIcon className={`w-5 h-5 mt-1 ${
                                isSelected ? "text-blue-600" : "text-gray-400"
                              }`} />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className={`font-semibold ${
                                    isSelected ? "text-blue-900" : "text-gray-900"
                                  }`}>
                                    {option.name}
                                  </h4>
                                  {option.price > 0 && (
                                    <Badge variant={isSelected ? "default" : "secondary"}>
                                      +${option.price}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-gray-600 text-sm mb-3">{option.description}</p>
                                
                                {option.specifications && (
                                  <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(option.specifications).map(([key, value]) => (
                                      <div key={key} className="text-xs">
                                        <span className="font-medium text-gray-500">{key}:</span>
                                        <span className="ml-1 text-gray-700">{value}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? "border-blue-500 bg-blue-500"
                                : "border-gray-300"
                            }`}>
                              {isSelected && (
                                <div className="w-2 h-2 bg-white rounded-full" />
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Summary Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Configuration Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {categories.map(category => {
                const selectedOption = getSelectedOption(category.id)
                if (!selectedOption) return null

                const Icon = selectedOption.icon

                return (
                  <div key={category.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Icon className="w-4 h-4 text-blue-600 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900">{category.name}</p>
                      <p className="text-xs text-gray-600 truncate">{selectedOption.name}</p>
                    </div>
                    {selectedOption.price > 0 && (
                      <span className="text-sm font-medium text-green-600">
                        +${selectedOption.price}
                      </span>
                    )}
                  </div>
                )
              })}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Base Price</span>
                  <span>${basePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Customizations</span>
                  <span>${(totalPrice - basePrice).toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Price</span>
                  <span className="text-blue-600">${totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                <Zap className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              
              <Button variant="outline" className="w-full">
                Save Configuration
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
