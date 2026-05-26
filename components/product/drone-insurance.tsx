"use client"

import { useState } from "react"
import { Shield, CheckCircle, AlertTriangle, Clock, FileText, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface InsurancePlan {
  id: string
  name: string
  type: "basic" | "standard" | "premium" | "enterprise"
  pricePercentage: number
  duration: number // months
  coverage: {
    accidents: boolean
    theft: boolean
    waterDamage: boolean
    fireProtection: boolean
    partsCoverage: boolean
    dataRecovery: boolean
    worldwideCoverage: boolean
    commercialUse: boolean
  }
  benefits: string[]
  exclusions: string[]
  maxClaims: number
  deductible: number
  response24h: boolean
  priority: "standard" | "priority" | "premium"
  popular?: boolean
}

interface DroneInsuranceProps {
  dronePrice: number
  onInsuranceSelect: (plan: InsurancePlan | null, cost: number) => void
}

const insurancePlans: InsurancePlan[] = [
  {
    id: "basic",
    name: "Basic Protection",
    type: "basic",
    pricePercentage: 5,
    duration: 12,
    coverage: {
      accidents: true,
      theft: false,
      waterDamage: true,
      fireProtection: true,
      partsCoverage: false,
      dataRecovery: false,
      worldwideCoverage: false,
      commercialUse: false
    },
    benefits: [
      "Accidental damage coverage",
      "Fire and natural disaster protection",
      "Basic water damage protection",
      "Email support within 48h"
    ],
    exclusions: [
      "Theft and burglary",
      "Commercial use",
      "International coverage",
      "Parts replacement"
    ],
    maxClaims: 2,
    deductible: 100,
    response24h: false,
    priority: "standard"
  },
  {
    id: "standard",
    name: "Standard Shield",
    type: "standard",
    pricePercentage: 8,
    duration: 12,
    coverage: {
      accidents: true,
      theft: true,
      waterDamage: true,
      fireProtection: true,
      partsCoverage: true,
      dataRecovery: false,
      worldwideCoverage: false,
      commercialUse: false
    },
    benefits: [
      "Comprehensive accident coverage",
      "Theft and burglary protection",
      "Complete water damage coverage",
      "Parts replacement included",
      "Priority email support within 24h",
      "Phone support during business hours"
    ],
    exclusions: [
      "Commercial use",
      "International coverage",
      "Data recovery services"
    ],
    maxClaims: 3,
    deductible: 75,
    response24h: false,
    priority: "standard",
    popular: true
  },
  {
    id: "premium",
    name: "Premium Care",
    type: "premium",
    pricePercentage: 12,
    duration: 24,
    coverage: {
      accidents: true,
      theft: true,
      waterDamage: true,
      fireProtection: true,
      partsCoverage: true,
      dataRecovery: true,
      worldwideCoverage: true,
      commercialUse: true
    },
    benefits: [
      "Complete protection coverage",
      "Worldwide coverage included",
      "Professional data recovery",
      "Commercial use permitted",
      "24/7 phone support",
      "Express replacement service",
      "Annual maintenance check"
    ],
    exclusions: [
      "Intentional damage",
      "War and terrorism"
    ],
    maxClaims: 5,
    deductible: 50,
    response24h: true,
    priority: "premium"
  },
  {
    id: "enterprise",
    name: "Enterprise Solution",
    type: "enterprise",
    pricePercentage: 15,
    duration: 36,
    coverage: {
      accidents: true,
      theft: true,
      waterDamage: true,
      fireProtection: true,
      partsCoverage: true,
      dataRecovery: true,
      worldwideCoverage: true,
      commercialUse: true
    },
    benefits: [
      "Ultimate protection package",
      "Fleet management support",
      "Dedicated account manager",
      "Custom coverage options",
      "Priority parts allocation",
      "Training and certification support",
      "Legal liability coverage",
      "Business interruption insurance"
    ],
    exclusions: [
      "Intentional damage"
    ],
    maxClaims: 10,
    deductible: 25,
    response24h: true,
    priority: "premium"
  }
]

export default function DroneInsurance({ dronePrice, onInsuranceSelect }: DroneInsuranceProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handlePlanSelect = (planId: string | null) => {
    setSelectedPlan(planId)
    if (planId) {
      const plan = insurancePlans.find(p => p.id === planId)
      if (plan) {
        const cost = Math.round((dronePrice * plan.pricePercentage) / 100)
        onInsuranceSelect(plan, cost)
        return
      }
    }
    onInsuranceSelect(null, 0)
  }

  const formatPrice = (percentage: number) => {
    const cost = Math.round((dronePrice * percentage) / 100)
    return `₹${cost.toLocaleString('en-IN')}`
  }

  const getPlanColor = (type: InsurancePlan['type']) => {
    switch (type) {
      case 'basic': return 'border-gray-300 hover:border-gray-400'
      case 'standard': return 'border-blue-300 hover:border-blue-400'
      case 'premium': return 'border-purple-300 hover:border-purple-400'
      case 'enterprise': return 'border-gold-300 hover:border-gold-400'
    }
  }

  const getSelectedColor = (type: InsurancePlan['type']) => {
    switch (type) {
      case 'basic': return 'border-gray-500 bg-gray-50'
      case 'standard': return 'border-blue-500 bg-blue-50'
      case 'premium': return 'border-purple-500 bg-purple-50'
      case 'enterprise': return 'border-yellow-500 bg-yellow-50'
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Protect Your Investment</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choose comprehensive insurance coverage to safeguard your drone against accidents, theft, and damage.
          Get peace of mind with professional support and quick claims processing.
        </p>
      </div>

      {/* No Insurance Option */}
      <Card className={`mb-6 cursor-pointer transition-all duration-200 ${selectedPlan === null ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
        }`} onClick={() => handlePlanSelect(null)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPlan === null ? "border-red-500 bg-red-500" : "border-gray-300"
                }`}>
                {selectedPlan === null && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">No Insurance</h3>
                <p className="text-gray-600 text-sm">Continue without insurance coverage</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">₹0</div>
              <div className="text-sm text-gray-500">No additional cost</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insurance Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {insurancePlans.map((plan) => {
          const isSelected = selectedPlan === plan.id
          const monthlyPrice = Math.round((dronePrice * plan.pricePercentage) / 100 / plan.duration)

          return (
            <Card
              key={plan.id}
              className={`relative cursor-pointer transition-all duration-200 ${isSelected ? getSelectedColor(plan.type) : getPlanColor(plan.type)
                } hover:shadow-lg`}
              onClick={() => handlePlanSelect(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mx-auto mb-3 ${isSelected
                    ? plan.type === 'basic' ? "border-gray-500 bg-gray-500"
                      : plan.type === 'standard' ? "border-blue-500 bg-blue-500"
                        : plan.type === 'premium' ? "border-purple-500 bg-purple-500"
                          : "border-yellow-500 bg-yellow-500"
                    : "border-gray-300"
                  }`}>
                  {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>

                <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-gray-900">
                  {formatPrice(plan.pricePercentage)}
                </div>
                <div className="text-sm text-gray-500">
                  ₹{monthlyPrice}/month for {plan.duration} months
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Coverage Details */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Coverage
                    </h4>
                    <div className="space-y-1 text-sm">
                      {Object.entries(plan.coverage).map(([key, covered]) => {
                        const labels: Record<string, string> = {
                          accidents: "Accidental damage",
                          theft: "Theft protection",
                          waterDamage: "Water damage",
                          fireProtection: "Fire protection",
                          partsCoverage: "Parts replacement",
                          dataRecovery: "Data recovery",
                          worldwideCoverage: "Worldwide coverage",
                          commercialUse: "Commercial use"
                        }
                        return (
                          <div key={key} className="flex items-center gap-2">
                            {covered ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <div className="w-3 h-3 rounded-full border border-gray-300" />
                            )}
                            <span className={covered ? "text-gray-700" : "text-gray-400"}>
                              {labels[key]}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <Separator />

                  {/* Key Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Claims</span>
                      <span className="font-medium">{plan.maxClaims}/year</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deductible</span>
                      <span className="font-medium">₹{plan.deductible}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Response Time</span>
                      <span className="font-medium">
                        {plan.response24h ? "24 hours" : "48 hours"}
                      </span>
                    </div>
                  </div>

                  {/* Support Level */}
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    {plan.priority === "premium" ? (
                      <Phone className="w-4 h-4 text-green-600" />
                    ) : (
                      <FileText className="w-4 h-4 text-blue-600" />
                    )}
                    <span className="text-sm capitalize font-medium">
                      {plan.priority} Support
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {selectedPlan && (
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Important Coverage Information</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Coverage begins 24 hours after purchase</p>
                <p>• Claims must be reported within 48 hours of incident</p>
                <p>• Proof of purchase and ownership required for all claims</p>
                <p>• Professional inspection may be required for high-value claims</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
