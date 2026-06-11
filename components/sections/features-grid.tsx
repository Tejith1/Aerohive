"use client"

import React from "react"
import { Check } from "lucide-react"

interface FeatureItem {
  title: string
  description: string
}

export function FeaturesGrid() {
  const features: FeatureItem[] = [
    {
      title: "AeroHive Managed Agents",
      description: "A suite of composable flight APIs for orchestrating, scheduling, and deploying autonomous drone fleets at scale."
    },
    {
      title: "Prompt Caching",
      description: "Cache airspace queries and weather lookups to reduce ground-station response times and minimize network traffic."
    },
    {
      title: "Real-time Telemetry Streams",
      description: "Augment operations with direct high-frequency telemetry pipelines and low-latency video streams from the cockpit."
    },
    {
      title: "Advanced Payload Control",
      description: "Interact with hundreds of external sensors, thermal sensors, LiDAR arrays, and servo mechanical drop assemblies."
    },
    {
      title: "Batch Mission Processing",
      description: "Execute large-scale, coordinated drone missions synchronously while optimizing power and payload resources."
    },
    {
      title: "Onboard Fleet Memory",
      description: "Enable rigs to store and consult localized heightmaps, weather corridors, and collision profiles in active onboard memory."
    },
    {
      title: "Dynamic Airspace Avoidance",
      description: "Automatically detect and avoid temporary flight restrictions, dynamic flight hazards, and manned aviation routes."
    },
    {
      title: "MCP Drone Gateway",
      description: "Connect custom autopilot hardware directly to our telemetry console using our open-source, universal gateway protocol."
    }
  ]

  return (
    <section className="py-24 bg-background border-t border-border">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        {/* Elegant Section Title */}
        <div className="mb-16 max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-normal tracking-tight text-foreground font-display mb-4">
            Built for operators
          </h2>
          <p className="text-muted-foreground font-sans font-light text-base md:text-lg">
            Deploy, monitor, and scale your aerial missions with developer-grade tools and robust hardware interfaces.
          </p>
        </div>

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
          {features.map((feature, idx) => (
            <div key={idx} className="flex gap-4 items-start group">
              {/* Premium Dark Checkmark Circle */}
              <div className="flex-shrink-0 mt-1 h-6 w-6 rounded-full bg-foreground text-background dark:bg-foreground dark:text-background flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-medium text-foreground tracking-tight font-sans">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm font-light leading-relaxed font-sans max-w-xl">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
