"use client"

import React from "react"
import { Drone3DCanvas } from "../ui/drone-3d-canvas"

export function TelemetryConsole() {
  return (
    <section className="py-20 bg-background transition-colors duration-300">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        
        {/* Section Heading */}
        <div className="mb-12 max-w-2xl">
          <span className="text-[10px] font-mono font-semibold tracking-[0.2em] text-[#cc6543] uppercase mb-4 block">
            AUTONOMOUS COCKPIT FEED
          </span>
          <h2 className="text-3xl md:text-5xl font-normal tracking-tight text-foreground font-display mb-4">
            Mission control, reimagined
          </h2>
          <p className="text-muted-foreground font-sans font-light text-base md:text-lg">
            Interact with live drone flight physics, orbit the camera orbit controls, and tune telemetry inputs on our unified simulation dashboard.
          </p>
        </div>

        {/* Focused Full-Width Container */}
        <div className="bg-[#b9d3eb]/60 dark:bg-[#0c1420]/80 border border-[#a2c1e0] dark:border-neutral-800/80 rounded-[32px] p-6 md:p-10 shadow-2xl relative overflow-hidden transition-all duration-300">
          {/* Ambient background grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(204,101,67,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(204,101,67,0.06)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40 dark:opacity-20" />
          
          <div className="relative z-10 w-full">
            <Drone3DCanvas />
          </div>
        </div>

      </div>
    </section>
  )
}
