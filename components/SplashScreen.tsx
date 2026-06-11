"use client"

import { useState, useEffect } from "react"

export default function SplashScreen() {
  const [isFadeOut, setIsFadeOut] = useState(false)
  const [isMounted, setIsMounted] = useState(true)

  useEffect(() => {
    // Block scrolling on body while splash screen is active for a premium, lock-screen feel
    document.body.style.overflow = "hidden"

    // Start fading out the splash screen at 1.8 seconds to allow full animation appreciation
    const fadeTimer = setTimeout(() => {
      setIsFadeOut(true)
    }, 1800)

    // Completely unmount the splash screen at 2.3 seconds
    const mountTimer = setTimeout(() => {
      setIsMounted(false)
      document.body.style.overflow = "unset"
    }, 2300)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(mountTimer)
      document.body.style.overflow = "unset"
    }
  }, [])

  if (!isMounted) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none transition-opacity duration-500 splash-bg ${
        isFadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >


      {/* Futuristic Grid and CRT Screen Overlays */}
      <div className="splash-grid"></div>
      <div className="splash-scanlines"></div>

      {/* Ambient glowing dust aura behind loader */}
      <div 
        className="absolute w-[300px] h-[300px] rounded-full blur-[80px] pointer-events-none css-glowing-aura"
        style={{
          left: "calc(50% - 150px)",
          top: "calc(50% - 210px)"
        }}
      ></div>

      {/* Main Loader Scene */}
      <div className="flex flex-col items-center gap-10 z-10">
        
        {/* 3D Viewport Container */}
        <div
          className="relative w-[280px] h-[280px]"
          style={{
            perspective: "1000px",
            transformStyle: "preserve-3d"
          }}
        >
          <div className="css-logo-container">
            <svg
              width="240"
              height="240"
              viewBox="0 0 240 240"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <defs>
                {/* Custom glowing filter graphs for extreme neon illumination */}
                <filter id="neonGlowOuter" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1" />
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur2" />
                  <feMerge>
                    <feMergeNode in="blur1" />
                    <feMergeNode in="blur2" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <filter id="neonGlowInner" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                
                <filter id="coreGlow" x="-150%" y="-150%" width="400%" height="400%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Premium Enterprise Gradients */}
                <linearGradient id="titaniumGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" stopOpacity="0.98" />
                  <stop offset="100%" stopColor="#0b0f17" stopOpacity="0.98" />
                </linearGradient>

                <linearGradient id="titaniumGradLight" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.99" />
                  <stop offset="100%" stopColor="#f8fafc" stopOpacity="0.99" />
                </linearGradient>

                <linearGradient id="outlineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>

                <linearGradient id="outlineGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>

                <linearGradient id="orbitOuterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>

                <linearGradient id="orbitInnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>

                {/* Single Definition of Letter A Path */}
                <path
                  id="logoPathA"
                  d="M120 30 L185 190 H150 L138 155 H102 L90 190 H55 L120 30 Z M120 70 L133 115 H107 L120 70 Z"
                  fillRule="evenodd"
                />

                {/* Clip Path clipping the foreground to the top apex + cutout window (Y < 115) */}
                <clipPath id="topClip">
                  <rect x="0" y="0" width="240" height="115" />
                </clipPath>
              </defs>

              {/* LAYER 1: Background A Body */}
              <g>
                <use
                  href="#logoPathA"
                  fill="#030712"
                  stroke="#1e3a8a"
                  strokeWidth="5"
                  opacity="0.4"
                  filter="url(#neonGlowInner)"
                  className="css-logo-glow"
                />
                <use
                  href="#logoPathA"
                  strokeWidth="1.5"
                  className="css-logo-body"
                />
              </g>

              {/* LAYER 2: 3D Orbital Rings & Energy Waves */}
              {/* This coordinate space is rotated by -20deg and squashed to 35% height to create 3D tilt */}
              <g transform="translate(120 92.5) rotate(-20) scale(1 0.35) translate(-120 -92.5)">
                
                {/* 3D Pulsing Energy Ripples */}
                <circle cx="120" cy="92.5" r="6" fill="none" stroke="#06b6d4" strokeWidth="1.5" filter="url(#neonGlowInner)" className="css-logo-ripple">
                  <animate attributeName="r" values="6;60" dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.85;0" dur="2.2s" repeatCount="indefinite" />
                </circle>
                <circle cx="120" cy="92.5" r="6" fill="none" stroke="#8b5cf6" strokeWidth="1.5" filter="url(#neonGlowInner)" className="css-logo-ripple">
                  <animate attributeName="r" values="6;60" dur="2.2s" begin="1.1s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.85;0" dur="2.2s" begin="1.1s" repeatCount="indefinite" />
                </circle>

                {/* Outer Orbit Ring (Clockwise Rotation) */}
                <g>
                  <circle
                    cx="120"
                    cy="92.5"
                    r="78"
                    stroke="url(#orbitOuterGrad)"
                    strokeWidth="3.5"
                    strokeDasharray="170 90"
                    strokeLinecap="round"
                    fill="none"
                    filter="url(#neonGlowOuter)"
                  />
                  {/* Glowing Satellite Dot */}
                  <circle cx="120" cy="14.5" r="3" fill="#f97316" filter="url(#neonGlowInner)" />
                  
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 120 92.5"
                    to="360 120 92.5"
                    dur="2.8s"
                    repeatCount="indefinite"
                  />
                </g>

                {/* Inner Orbit Ring (Counter-Clockwise Rotation) */}
                <g>
                  <circle
                    cx="120"
                    cy="92.5"
                    r="65"
                    stroke="url(#orbitInnerGrad)"
                    strokeWidth="2"
                    strokeDasharray="100 120 30 70"
                    strokeLinecap="round"
                    fill="none"
                    filter="url(#neonGlowInner)"
                  />
                  {/* Glowing Satellite Dot */}
                  <circle cx="120" cy="27.5" r="2.2" fill="#22d3ee" filter="url(#neonGlowInner)" />

                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="360 120 92.5"
                    to="0 120 92.5"
                    dur="1.9s"
                    repeatCount="indefinite"
                  />
                </g>
              </g>

              {/* LAYER 3: Central Glowing Energy Core */}
              <circle
                cx="120"
                cy="92.5"
                r="6"
                filter="url(#coreGlow)"
                className="css-logo-core"
              >
                <animate attributeName="r" values="4.5;6.5;4.5" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.75;1.0;0.75" dur="1.5s" repeatCount="indefinite" />
              </circle>

              {/* LAYER 4: Foreground A Body (Clipped to Y < 115) */}
              {/* This covers the back parts of the orbits while showing the front parts */}
              {/* cleanly overlaying the crossbar without any seams or coordinate splits! */}
              <g clipPath="url(#topClip)">
                <use
                  href="#logoPathA"
                  strokeWidth="1.5"
                  className="css-logo-body-fg"
                />
              </g>
            </svg>
          </div>
        </div>

        {/* Fading Futuristic Typography and System Status */}
        <div className="flex flex-col items-center gap-4 text-center mt-2">
          <div>
            <h1
              className="text-3xl font-extrabold tracking-widest font-sans css-title"
              style={{ letterSpacing: "0.3em" }}
            >
              AEROHIVE
            </h1>
            <p
              className="text-[10px] font-mono tracking-widest uppercase mt-2.5 css-subtitle"
              style={{ letterSpacing: "0.2em" }}
            >
              DRONE TECH INTELLIGENCE
            </p>
          </div>

          {/* Subtitle status pill */}
          <div className="css-status-bar mt-2">
            <div className="css-status-dot"></div>
            <span className="text-[9px] font-mono tracking-wider font-medium uppercase">
              BOOTING MISSION CONTROL...
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
