"use client"

import React, { useRef, useState, useEffect } from "react"
import { Battery, Zap, Shield, Cpu, RotateCcw, Compass, Activity } from "lucide-react"

interface Drone3DCanvasProps {
  isCompiling?: boolean
  onTelemetryUpdate?: (telemetry: {
    pitch: number
    roll: number
    yaw: number
    altitude: number
    rpm: number[]
  }) => void
}

export function Drone3DCanvas({ isCompiling = false, onTelemetryUpdate }: Drone3DCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Drone Control States
  const [pitch, setPitch] = useState<number>(12) // degrees
  const [roll, setRoll] = useState<number>(-8) // degrees
  const [yaw, setYaw] = useState<number>(45) // degrees
  const [throttle, setThrottle] = useState<number>(65) // percentage
  
  // Camera View States (For dragging)
  const [camPitch, setCamPitch] = useState<number>(-0.35) // radians
  const [camYaw, setCamYaw] = useState<number>(0.6) // radians
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const lastCam = useRef({ pitch: -0.35, yaw: 0.6 })

  // Props animation angle
  const propAngleRef = useRef<number>(0)

  // Diagnostics and Noise States
  const [temperature, setTemperature] = useState<number>(42.8)
  const [signalStrength, setSignalStrength] = useState<number>(98)
  const [batteryVoltage, setBatteryVoltage] = useState<number>(15.4)

  // Track motor RPMs based on throttle + pitch + roll
  const getMotorRPMs = () => {
    const baseRPM = (throttle / 100) * 8500
    if (baseRPM === 0) return [0, 0, 0, 0]
    
    // Distribute RPM modifications based on flight physics
    // pitch > 0 means nose down (rear motors speed up, front motors slow down)
    // roll > 0 means tilt right (left motors speed up, right motors slow down)
    const fl = Math.max(0, Math.min(12000, baseRPM - pitch * 25 - roll * 25))
    const fr = Math.max(0, Math.min(12000, baseRPM - pitch * 25 + roll * 25))
    const bl = Math.max(0, Math.min(12000, baseRPM + pitch * 25 - roll * 25))
    const br = Math.max(0, Math.min(12000, baseRPM + pitch * 25 + roll * 25))
    
    return [Math.round(fl), Math.round(fr), Math.round(bl), Math.round(br)]
  }

  const rpms = getMotorRPMs()

  // Notify parent on state changes
  useEffect(() => {
    if (onTelemetryUpdate) {
      onTelemetryUpdate({
        pitch,
        roll,
        yaw,
        altitude: Math.round((throttle / 100) * 150), // Map throttle to max 150m altitude
        rpm: rpms
      })
    }
  }, [pitch, roll, yaw, throttle])

  // Small random telemetry fluctuations
  useEffect(() => {
    const timer = setInterval(() => {
      setTemperature(prev => +(prev + (Math.random() - 0.5) * 0.2).toFixed(1))
      setSignalStrength(prev => Math.max(95, Math.min(100, prev + Math.floor((Math.random() - 0.5) * 2))))
      setBatteryVoltage(prev => {
        const rate = (throttle / 100) * 0.002 + 0.0005
        return +(Math.max(14.2, prev - rate)).toFixed(2)
      })
    }, 1500)
    return () => clearInterval(timer)
  }, [throttle])

  // Reset controls to perfect hover stability
  const handleReset = () => {
    setPitch(0)
    setRoll(0)
    setYaw(0)
    setThrottle(50)
    setCamPitch(-0.35)
    setCamYaw(0.6)
    lastCam.current = { pitch: -0.35, yaw: 0.6 }
  }

  // Mouse Drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    
    setCamYaw(lastCam.current.yaw + dx * 0.007)
    setCamPitch(Math.max(-Math.PI / 2, Math.min(Math.PI / 2, lastCam.current.pitch + dy * 0.007)))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    lastCam.current = { pitch: camPitch, yaw: camYaw }
  }

  const handleMouseLeave = () => {
    if (isDragging) handleMouseUp()
  }

  // 3D Rendering Code
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number

    // Helper functions for 3D rotations
    interface Point3D { x: number; y: number; z: number }

    const rotateX = (p: Point3D, angle: number): Point3D => {
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      return {
        x: p.x,
        y: p.y * cos - p.z * sin,
        z: p.y * sin + p.z * cos
      }
    }

    const rotateY = (p: Point3D, angle: number): Point3D => {
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      return {
        x: p.x * cos + p.z * sin,
        y: p.y,
        z: -p.x * sin + p.z * cos
      }
    }

    const rotateZ = (p: Point3D, angle: number): Point3D => {
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      return {
        x: p.x * cos - p.y * sin,
        y: p.x * sin + p.y * cos,
        z: p.z
      }
    }

    const render = () => {
      const width = canvas.width
      const height = canvas.height
      ctx.clearRect(0, 0, width, height)

      const isDark = document.documentElement.classList.contains("dark")
      const textPrimary = isDark ? "#f1f5f9" : "#0f172a"
      const textMuted = isDark ? "#64748b" : "#475569"
      const accentColor = "#e65737"

      // Background HUD grid and telemetry info (very subtle)
      ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(15, 23, 42, 0.03)"
      ctx.lineWidth = 1
      for (let r = 80; r <= 240; r += 80) {
        ctx.beginPath()
        ctx.arc(width / 2, height / 2, r, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Collect solid faces here
      interface Face3D {
        vertices: Point3D[]
        colorClass: "orange" | "carbon" | "metal" | "glass"
        localNormal: Point3D
        isGimbal?: boolean
      }
      const allFaces: Face3D[] = []

      // 2. Helper to add solid boxes for arms and landing gear
      const addSolidBox = (
        p1: Point3D,
        p2: Point3D,
        w: number,
        h: number,
        colorClass: "orange" | "carbon" | "metal" | "glass"
      ) => {
        const dx = p2.x - p1.x
        const dy = p2.y - p1.y
        const dz = p2.z - p1.z
        const len = Math.sqrt(dx*dx + dy*dy + dz*dz)
        if (len === 0) return

        const ux = 0, uy = 1, uz = 0
        let rx = dy * uz - dz * uy
        let ry = dz * ux - dx * uz
        let rz = dx * uy - dy * ux
        const rlen = Math.sqrt(rx*rx + ry*ry + rz*rz)
        if (rlen > 0) {
          rx /= rlen; ry /= rlen; rz /= rlen
        } else {
          rx = 1; ry = 0; rz = 0
        }

        const hw = w / 2
        const hh = h / 2
        const v = [
          { x: p1.x - rx * hw - ux * hh, y: p1.y - ry * hw - uy * hh, z: p1.z - rz * hw - uz * hh },
          { x: p1.x + rx * hw - ux * hh, y: p1.y - ry * hw - uy * hh, z: p1.z + rz * hw - uz * hh },
          { x: p1.x + rx * hw + ux * hh, y: p1.y + ry * hw + uy * hh, z: p1.z + rz * hw + uz * hh },
          { x: p1.x - rx * hw + ux * hh, y: p1.y - ry * hw + uy * hh, z: p1.z - rz * hw + uz * hh },
          { x: p2.x - rx * hw - ux * hh, y: p2.y - ry * hw - uy * hh, z: p2.z - rz * hw - uz * hh },
          { x: p2.x + rx * hw - ux * hh, y: p2.y - ry * hw - uy * hh, z: p2.z + rz * hw - uz * hh },
          { x: p2.x + rx * hw + ux * hh, y: p2.y + ry * hw + uy * hh, z: p2.z + rz * hw + uz * hh },
          { x: p2.x - rx * hw + ux * hh, y: p2.y - ry * hw + uy * hh, z: p2.z - rz * hw + uz * hh }
        ]

        const faces = [
          { indices: [0, 1, 5, 4], normal: { x: -ux, y: -uy, z: -uz } },
          { indices: [1, 2, 6, 5], normal: { x: rx, y: ry, z: rz } },
          { indices: [2, 3, 7, 6], normal: { x: ux, y: uy, z: uz } },
          { indices: [3, 0, 4, 7], normal: { x: -rx, y: -ry, z: -rz } },
          { indices: [0, 3, 2, 1], normal: { x: -dx/len, y: -dy/len, z: -dz/len } },
          { indices: [4, 5, 6, 7], normal: { x: dx/len, y: dy/len, z: dz/len } }
        ]

        faces.forEach(f => {
          allFaces.push({
            vertices: f.indices.map(idx => v[idx]),
            colorClass,
            localNormal: f.normal
          })
        })
      }

      // 3. Helper to add solid cylinders for motor mounts
      const addSolidCylinder = (
        center: Point3D,
        r: number,
        h: number,
        colorClass: "orange" | "carbon" | "metal" | "glass"
      ) => {
        const segments = 6
        const topV: Point3D[] = []
        const botV: Point3D[] = []
        for (let i = 0; i < segments; i++) {
          const ang = (i * 2 * Math.PI) / segments
          topV.push({ x: center.x + r * Math.cos(ang), y: center.y - h/2, z: center.z + r * Math.sin(ang) })
          botV.push({ x: center.x + r * Math.cos(ang), y: center.y + h/2, z: center.z + r * Math.sin(ang) })
        }

        allFaces.push({ vertices: [...topV].reverse(), colorClass, localNormal: { x: 0, y: -1, z: 0 } })
        allFaces.push({ vertices: botV, colorClass, localNormal: { x: 0, y: 1, z: 0 } })

        for (let i = 0; i < segments; i++) {
          const next = (i + 1) % segments
          const ang = ((i + 0.5) * 2 * Math.PI) / segments
          allFaces.push({
            vertices: [topV[i], topV[next], botV[next], botV[i]],
            colorClass,
            localNormal: { x: Math.cos(ang), y: 0, z: Math.sin(ang) }
          })
        }
      }

      // 1. Sleek hexagonal fuselage pod
      const L_T0 = { x: -22, y: -12, z: -35 }
      const L_T1 = { x: 22, y: -12, z: -35 }
      const L_T2 = { x: 32, y: -12, z: 0 }
      const L_T3 = { x: 22, y: -12, z: 35 }
      const L_T4 = { x: -22, y: -12, z: 35 }
      const L_T5 = { x: -32, y: -12, z: 0 }

      const L_B0 = { x: -16, y: 12, z: -25 }
      const L_B1 = { x: 16, y: 12, z: -25 }
      const L_B2 = { x: 24, y: 12, z: 0 }
      const L_B3 = { x: 16, y: 12, z: 25 }
      const L_B4 = { x: -16, y: 12, z: 25 }
      const L_B5 = { x: -24, y: 12, z: 0 }

      // Top Pod Cover (Orange base)
      allFaces.push({
        vertices: [L_T0, L_T1, L_T2, L_T3, L_T4, L_T5],
        colorClass: "orange",
        localNormal: { x: 0, y: -1, z: 0 }
      })

      // Bottom Pod Cover (Carbon carbon)
      allFaces.push({
        vertices: [L_B5, L_B4, L_B3, L_B2, L_B1, L_B0],
        colorClass: "carbon",
        localNormal: { x: 0, y: 1, z: 0 }
      })

      // Side Pod panels (Carbon/Orange alternate)
      allFaces.push({ vertices: [L_T0, L_T1, L_B1, L_B0], colorClass: "carbon", localNormal: { x: 0, y: 0, z: -1 } })
      allFaces.push({ vertices: [L_T1, L_T2, L_B2, L_B1], colorClass: "orange", localNormal: { x: 0.9, y: 0, z: -0.4 } })
      allFaces.push({ vertices: [L_T2, L_T3, L_B3, L_B2], colorClass: "carbon", localNormal: { x: 0.9, y: 0, z: 0.4 } })
      allFaces.push({ vertices: [L_T3, L_T4, L_B4, L_B3], colorClass: "carbon", localNormal: { x: 0, y: 0, z: 1 } })
      allFaces.push({ vertices: [L_T4, L_T5, L_B5, L_B4], colorClass: "orange", localNormal: { x: -0.9, y: 0, z: 0.4 } })
      allFaces.push({ vertices: [L_T5, L_T0, L_B0, L_B5], colorClass: "carbon", localNormal: { x: -0.9, y: 0, z: -0.4 } })

      // Canopy Wedge (Glass look)
      const CP = { x: 0, y: -22, z: -8 }
      allFaces.push({ vertices: [L_T0, L_T1, CP], colorClass: "glass", localNormal: { x: 0, y: -0.8, z: -0.6 } })
      allFaces.push({ vertices: [L_T1, L_T2, CP], colorClass: "glass", localNormal: { x: 0.8, y: -0.6, z: 0 } })
      allFaces.push({ vertices: [L_T2, L_T5, CP], colorClass: "glass", localNormal: { x: 0, y: -1, z: 0.2 } })
      allFaces.push({ vertices: [L_T5, L_T0, CP], colorClass: "glass", localNormal: { x: -0.8, y: -0.6, z: 0 } })

      // addSolidBox helper removed from here (now declared at the top)

      // Add carbon-fiber arms
      const armLength = 95
      const armY = -4
      const flTipLocal = { x: -armLength, y: armY, z: -armLength }
      const frTipLocal = { x: armLength, y: armY, z: -armLength }
      const blTipLocal = { x: -armLength, y: armY, z: armLength }
      const brTipLocal = { x: armLength, y: armY, z: armLength }

      // 1. Arm spars
      addSolidBox({ x: 0, y: 0, z: 0 }, flTipLocal, 8, 8, "carbon")
      addSolidBox({ x: 0, y: 0, z: 0 }, frTipLocal, 8, 8, "carbon")
      addSolidBox({ x: 0, y: 0, z: 0 }, blTipLocal, 8, 8, "carbon")
      addSolidBox({ x: 0, y: 0, z: 0 }, brTipLocal, 8, 8, "carbon")

      // 2. High-detail ESC Power wires along the bottom of the arms (metal/coppery look)
      addSolidBox({ x: -15, y: 4, z: -15 }, { x: -80, y: 2, z: -80 }, 2.5, 2.5, "metal")
      addSolidBox({ x: 15, y: 4, z: -15 }, { x: 80, y: 2, z: -80 }, 2.5, 2.5, "metal")
      addSolidBox({ x: -15, y: 4, z: 15 }, { x: -80, y: 2, z: 80 }, 2.5, 2.5, "metal")
      addSolidBox({ x: 15, y: 4, z: 15 }, { x: 80, y: 2, z: 80 }, 2.5, 2.5, "metal")

      // 3. Outer carbon protection/rigging rails linking motor tips for high detailed geometry
      addSolidBox(flTipLocal, frTipLocal, 3, 3, "carbon")
      addSolidBox(frTipLocal, brTipLocal, 3, 3, "carbon")
      addSolidBox(brTipLocal, blTipLocal, 3, 3, "carbon")
      addSolidBox(blTipLocal, flTipLocal, 3, 3, "carbon")

      // 4. GPS Dome Stalk and Receiver on top cover
      addSolidBox({ x: 0, y: -12, z: 18 }, { x: 0, y: -26, z: 18 }, 3, 3, "metal")
      addSolidCylinder({ x: 0, y: -28, z: 18 }, 9, 5, "orange")

      // A. Carbon Battery Pack (top carbon battery pack block)
      addSolidBox({ x: -10, y: -18, z: -15 }, { x: 10, y: -13, z: 25 }, 12, 12, "carbon")
      addSolidBox({ x: -8, y: -18, z: -12 }, { x: 8, y: -17, z: 22 }, 2, 2, "metal")

      // B. Rear High-Gain Dual Antennas
      addSolidBox({ x: -12, y: -12, z: 28 }, { x: -18, y: -38, z: 34 }, 2.2, 2.2, "metal")
      addSolidCylinder({ x: -18, y: -40, z: 34 }, 4.5, 6, "orange")
      addSolidBox({ x: 12, y: -12, z: 28 }, { x: 18, y: -38, z: 34 }, 2.2, 2.2, "metal")
      addSolidCylinder({ x: 18, y: -40, z: 34 }, 4.5, 6, "orange")

      // C. Front LIDAR / Laser Sensor / Nose Camera
      addSolidBox({ x: -7, y: -2, z: -35 }, { x: 7, y: 5, z: -48 }, 5, 5, "metal")
      addSolidCylinder({ x: 0, y: 1.5, z: -49 }, 3.5, 4, "orange")

      // D. Arm Support Struts
      addSolidBox({ x: -22, y: 4, z: -15 }, { x: -45, y: 0, z: -45 }, 3, 3, "carbon")
      addSolidBox({ x: 22, y: 4, z: -15 }, { x: 45, y: 0, z: -45 }, 3, 3, "carbon")
      addSolidBox({ x: -22, y: 4, z: 15 }, { x: -45, y: 0, z: 45 }, 3, 3, "carbon")
      addSolidBox({ x: 22, y: 4, z: 15 }, { x: 45, y: 0, z: 45 }, 3, 3, "carbon")

      // Add motors
      addSolidCylinder(flTipLocal, 10, 14, "metal")
      addSolidCylinder(frTipLocal, 10, 14, "metal")
      addSolidCylinder(blTipLocal, 10, 14, "metal")
      addSolidCylinder(brTipLocal, 10, 14, "metal")

      // 4. Solid Landing Gear
      const landingWidth = 28
      const landingHeight = 46
      const lgY1 = 12
      const lgY2 = landingHeight

      // Left leg brackets
      addSolidBox({ x: -15, y: lgY1, z: -15 }, { x: -landingWidth, y: lgY2, z: -25 }, 5, 5, "carbon")
      addSolidBox({ x: -15, y: lgY1, z: 15 }, { x: -landingWidth, y: lgY2, z: 25 }, 5, 5, "carbon")
      // Left Runner
      addSolidBox({ x: -landingWidth, y: lgY2, z: -40 }, { x: -landingWidth, y: lgY2, z: 40 }, 6, 6, "metal")

      // Right leg brackets
      addSolidBox({ x: 15, y: lgY1, z: -15 }, { x: landingWidth, y: lgY2, z: -25 }, 5, 5, "carbon")
      addSolidBox({ x: 15, y: lgY1, z: 15 }, { x: landingWidth, y: lgY2, z: 25 }, 5, 5, "carbon")
      // Right Runner
      addSolidBox({ x: landingWidth, y: lgY2, z: -40 }, { x: landingWidth, y: lgY2, z: 40 }, 6, 6, "metal")

      // 5. Gimbal Stabilized camera under body
      const radRoll = (roll * Math.PI) / 180
      const radPitch = (pitch * Math.PI) / 180
      const radYaw = (yaw * Math.PI) / 180

      const gimbalMountLocal = { x: 0, y: 15, z: -12 }
      let gimbalCenterWorld = rotateZ(gimbalMountLocal, radRoll)
      gimbalCenterWorld = rotateX(gimbalCenterWorld, radPitch)
      gimbalCenterWorld = rotateY(gimbalCenterWorld, radYaw)

      // Add gimbal camera cylinder (rotated only by drone yaw to look straight, remaining level in pitch/roll)
      const gimbalSegs = 6
      const gRadius = 8
      const gHeight = 16
      const gTopV: Point3D[] = []
      const gBotV: Point3D[] = []

      for (let i = 0; i < gimbalSegs; i++) {
        const ang = (i * 2 * Math.PI) / gimbalSegs
        const localT = { x: gRadius * Math.cos(ang), y: gRadius * Math.sin(ang), z: -gHeight/2 }
        const localB = { x: gRadius * Math.cos(ang), y: gRadius * Math.sin(ang), z: gHeight/2 }
        
        const rotT = rotateY(localT, radYaw)
        const rotB = rotateY(localB, radYaw)

        gTopV.push({ x: gimbalCenterWorld.x + rotT.x, y: gimbalCenterWorld.y + rotT.y, z: gimbalCenterWorld.z + rotT.z })
        gBotV.push({ x: gimbalCenterWorld.x + rotB.x, y: gimbalCenterWorld.y + rotB.y, z: gimbalCenterWorld.z + rotB.z })
      }

      // Add gimbal camera faces (pre-rotated to world)
      allFaces.push({ vertices: [...gTopV].reverse(), colorClass: "orange", localNormal: rotateY({ x: 0, y: 0, z: -1 }, radYaw), isGimbal: true })
      allFaces.push({ vertices: gBotV, colorClass: "metal", localNormal: rotateY({ x: 0, y: 0, z: 1 }, radYaw), isGimbal: true })
      for (let i = 0; i < gimbalSegs; i++) {
        const next = (i + 1) % gimbalSegs
        const ang = ((i + 0.5) * 2 * Math.PI) / gimbalSegs
        allFaces.push({
          vertices: [gTopV[i], gTopV[next], gBotV[next], gBotV[i]],
          colorClass: "carbon",
          localNormal: rotateY({ x: Math.cos(ang), y: Math.sin(ang), z: 0 }, radYaw),
          isGimbal: true
        })
      }

      // 6. Projection and Light shading
      const focalLength = 400
      const translateZ = 100
      const light = { x: 0.3, y: -0.9, z: -0.3 }

      const transformAndProject = (pt: Point3D, isAlreadyWorld: boolean = false) => {
        let worldPt = pt
        if (!isAlreadyWorld) {
          worldPt = rotateZ(pt, radRoll)
          worldPt = rotateX(worldPt, radPitch)
          worldPt = rotateY(worldPt, radYaw)
        }

        let camPt = rotateY(worldPt, camYaw)
        camPt = rotateX(camPt, camPitch)

        const scale = focalLength / (focalLength + camPt.z + translateZ)
        const projX = camPt.x * scale + width / 2
        const projY = camPt.y * scale + height / 2

        return { x: projX, y: projY, depth: camPt.z, scale }
      }

      const baseColors = {
        orange: { r: 230, g: 87, b: 55, a: 1.0 },
        carbon: { r: 24, g: 25, b: 26, a: 1.0 },
        metal: { r: 120, g: 130, b: 140, a: 1.0 },
        glass: { r: 14, g: 165, b: 233, a: 0.55 }
      }

      interface ProjectedFace {
        points: { x: number; y: number }[]
        depth: number
        color: string
      }

      const projectedFaces: ProjectedFace[] = allFaces.map(face => {
        let nWorld = face.localNormal
        if (!face.isGimbal) {
          nWorld = rotateZ(face.localNormal, radRoll)
          nWorld = rotateX(nWorld, radPitch)
          nWorld = rotateY(nWorld, radYaw)
        }

        const dot = nWorld.x * light.x + nWorld.y * light.y + nWorld.z * light.z
        const brightness = 0.35 + 0.65 * Math.max(0, dot)

        const base = baseColors[face.colorClass]
        const r = Math.round(base.r * brightness)
        const g = Math.round(base.g * brightness)
        const b = Math.round(base.b * brightness)
        const colorStr = face.colorClass === "glass" 
          ? `rgba(${r}, ${g}, ${b}, ${base.a})`
          : `rgb(${r}, ${g}, ${b})`

        const pts = face.vertices.map(v => transformAndProject(v, face.isGimbal))
        const avgDepth = pts.reduce((sum, p) => sum + p.depth, 0) / pts.length

        return {
          points: pts,
          depth: avgDepth,
          color: colorStr
        }
      })

      projectedFaces.sort((a, b) => b.depth - a.depth)

      projectedFaces.forEach(f => {
        if (f.points.length < 3) return
        ctx.beginPath()
        ctx.moveTo(f.points[0].x, f.points[0].y)
        for (let i = 1; i < f.points.length; i++) {
          ctx.lineTo(f.points[i].x, f.points[i].y)
        }
        ctx.closePath()
        ctx.fillStyle = f.color
        ctx.fill()
        
        ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.12)"
        ctx.lineWidth = 0.8
        ctx.stroke()
      })

      // 7. Render spinning rotors and propellers
      const flTipProj = transformAndProject(flTipLocal)
      const frTipProj = transformAndProject(frTipLocal)
      const blTipProj = transformAndProject(blTipLocal)
      const brTipProj = transformAndProject(brTipLocal)
      const droneCenterProj = transformAndProject({ x: 0, y: 0, z: 0 })

      const propSpeed = (throttle / 100) * 0.5
      propAngleRef.current += propSpeed
      const angle = propAngleRef.current

      const drawRotorProp = (tip: any, color: string) => {
        ctx.beginPath()
        ctx.arc(tip.x, tip.y, 5 * tip.scale, 0, Math.PI * 2)
        ctx.fillStyle = isDark ? "#ffffff" : "#000000"
        ctx.fill()

        const radGrad = ctx.createRadialGradient(tip.x, tip.y, 2, tip.x, tip.y, 35 * tip.scale)
        radGrad.addColorStop(0, "rgba(255, 255, 255, 0.15)")
        radGrad.addColorStop(0.3, "rgba(255, 255, 255, 0.08)")
        radGrad.addColorStop(1, "rgba(255, 255, 255, 0.0)")
        
        ctx.beginPath()
        ctx.ellipse(tip.x, tip.y, 35 * tip.scale, 8 * tip.scale, 0, 0, Math.PI * 2)
        ctx.fillStyle = radGrad
        ctx.fill()

        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        const bladeLen = 32 * tip.scale

        const drawBlade = (sign: number) => {
          const bx = tip.x + sign * bladeLen * cos
          const by = tip.y + sign * bladeLen * sin * 0.25
          
          ctx.beginPath()
          ctx.moveTo(tip.x, tip.y)
          ctx.lineTo(bx, by)
          ctx.strokeStyle = color
          ctx.lineWidth = 3.5 * tip.scale
          ctx.lineCap = "round"
          ctx.stroke()
        }
        drawBlade(1)
        drawBlade(-1)
      }

      const greenProp = "rgba(16, 185, 129, 0.9)"
      const orangeProp = "rgba(230, 87, 55, 0.9)"

      drawRotorProp(flTipProj, greenProp)
      drawRotorProp(frTipProj, greenProp)
      drawRotorProp(blTipProj, orangeProp)
      drawRotorProp(brTipProj, orangeProp)

      // Glowing/Blinking Navigation LEDs under each motor mount for high-detail realistic feel
      const drawLED = (proj: any, color: string) => {
        ctx.save()
        ctx.beginPath()
        ctx.arc(proj.x, proj.y + 10 * proj.scale, 5 * proj.scale, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.shadowColor = color
        ctx.shadowBlur = 18 * proj.scale
        ctx.fill()
        ctx.restore()
      }
      
      const isLEDOn = Math.floor(Date.now() / 450) % 2 === 0
      if (isLEDOn) {
        drawLED(flTipProj, "#10b981") // Front Left: Green
        drawLED(frTipProj, "#10b981") // Front Right: Green
        drawLED(blTipProj, "#ef4444") // Rear Left: Red
        drawLED(brTipProj, "#ef4444") // Rear Right: Red
      } else {
        drawLED(flTipProj, "rgba(16, 185, 129, 0.35)")
        drawLED(frTipProj, "rgba(16, 185, 129, 0.35)")
        drawLED(blTipProj, "rgba(239, 68, 68, 0.35)")
        drawLED(brTipProj, "rgba(239, 68, 68, 0.35)")
      }

      const nosePointLocal = { x: 0, y: armY, z: -armLength - 25 }
      const noseProj = transformAndProject(nosePointLocal)
      ctx.beginPath()
      ctx.moveTo(droneCenterProj.x, droneCenterProj.y)
      ctx.lineTo(noseProj.x, noseProj.y)
      ctx.strokeStyle = "rgba(16, 185, 129, 0.65)"
      ctx.lineWidth = 1.2
      ctx.setLineDash([4, 3])
      ctx.stroke()
      ctx.setLineDash([])

      // 8. HUD Overlays Disabled for Drone-Only Display
      // (Cockpit compass tape, altitude tapes, reticle, and horizon bars removed)

      animationId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [pitch, roll, yaw, throttle, camPitch, camYaw, isCompiling])

  return (
    <div className="bg-[#11110f] dark:bg-[#0b0c0d] border border-neutral-800 rounded-2xl p-6 shadow-2xl relative flex flex-col justify-between overflow-hidden group">
      {/* Outer ambient glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#cc6543]/5 blur-3xl rounded-full" />
      
      {/* Telemetry Header */}
      <div className="flex justify-between items-center border-b border-neutral-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#cc6543] animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-semibold">
            Live 3D Telemetry Feed
          </span>
        </div>
        <div className="text-[9px] font-mono text-neutral-500 bg-neutral-900 px-2.5 py-1 border border-neutral-800 rounded-md">
          DRAG TO ORBIT CAMERA
        </div>
      </div>

      {/* Simulator canvas and statistics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Render Canvas (Spans 8 columns) */}
        <div className="md:col-span-8 relative aspect-[4/3] bg-neutral-950/65 rounded-xl border border-neutral-800/80 overflow-hidden cursor-grab active:cursor-grabbing">
          {/* Canvas */}
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            className="w-full h-full object-contain block"
          />
          
          {/* Compass readout overlays */}
          <div className="absolute bottom-2 left-3 font-mono text-[9px] text-neutral-500 flex flex-col">
            <span>C-PITCH: {Math.round((camPitch * 180) / Math.PI)}°</span>
            <span>C-YAW: {Math.round((camYaw * 180) / Math.PI)}°</span>
          </div>

          <div className="absolute top-2.5 right-3 font-mono text-[9px] text-neutral-400 flex flex-col items-end gap-1">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
              GNSS LOCK: 18 SATs
            </span>
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-500" />
              {batteryVoltage}V (4S)
            </span>
          </div>
        </div>

        {/* Real-time stats readouts (Spans 4 columns) */}
        <div className="md:col-span-4 space-y-4">
          
          {/* Battery Status */}
          <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/50 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-mono text-neutral-500 uppercase">SYS_VOLTAGE</span>
              <Battery className="h-3 w-3 text-emerald-500" />
            </div>
            <p className="text-sm font-semibold font-mono text-neutral-200">
              {batteryVoltage}V <span className="text-xs text-neutral-500 font-light">({Math.round((batteryVoltage - 14.0) / 2.8 * 100)}%)</span>
            </p>
          </div>

          {/* Temperature */}
          <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/50 space-y-1">
            <span className="text-[9px] font-mono text-neutral-500 uppercase block">CORE_TEMP</span>
            <p className="text-sm font-semibold font-mono text-neutral-200">
              {temperature}°C <span className="text-xs text-emerald-500 font-light">NORMAL</span>
            </p>
          </div>

          {/* Motor RPM details */}
          <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/50 space-y-1.5">
            <span className="text-[9px] font-mono text-neutral-500 uppercase block">MOTOR_TELEMETRY</span>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 font-mono text-[9px] text-neutral-400">
              <div>FL: <span className="text-neutral-200 font-semibold">{rpms[0]}</span></div>
              <div>FR: <span className="text-neutral-200 font-semibold">{rpms[1]}</span></div>
              <div>RL: <span className="text-neutral-200 font-semibold">{rpms[2]}</span></div>
              <div>RR: <span className="text-neutral-200 font-semibold">{rpms[3]}</span></div>
            </div>
          </div>

          {/* Signals */}
          <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/50 space-y-1">
            <span className="text-[9px] font-mono text-neutral-500 uppercase block">LINK_QUALITY</span>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold font-mono text-neutral-200">{signalStrength}%</span>
              <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">98ms LATENCY</span>
            </div>
          </div>

        </div>
      </div>

      {/* Telemetry Interactive Sliders */}
      <div className="mt-6 border-t border-neutral-850 pt-5 space-y-4 relative z-10">
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          {/* Yaw */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[9px] font-mono">
              <span className="text-neutral-400 uppercase">Yaw (Direction)</span>
              <span className="text-[#cc6543] font-semibold">{yaw}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={yaw}
              onChange={(e) => setYaw(Number(e.target.value))}
              className="w-full accent-[#cc6543] bg-neutral-800 h-1 rounded-lg cursor-pointer"
            />
          </div>

          {/* Pitch */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[9px] font-mono">
              <span className="text-neutral-400 uppercase">Pitch (Nose tilt)</span>
              <span className="text-[#cc6543] font-semibold">{pitch}°</span>
            </div>
            <input
              type="range"
              min="-45"
              max="45"
              value={pitch}
              onChange={(e) => setPitch(Number(e.target.value))}
              className="w-full accent-[#cc6543] bg-neutral-800 h-1 rounded-lg cursor-pointer"
            />
          </div>

          {/* Roll */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[9px] font-mono">
              <span className="text-neutral-400 uppercase">Roll (Side tilt)</span>
              <span className="text-[#cc6543] font-semibold">{roll}°</span>
            </div>
            <input
              type="range"
              min="-45"
              max="45"
              value={roll}
              onChange={(e) => setRoll(Number(e.target.value))}
              className="w-full accent-[#cc6543] bg-neutral-800 h-1 rounded-lg cursor-pointer"
            />
          </div>

          {/* Throttle */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[9px] font-mono">
              <span className="text-neutral-400 uppercase">Throttle (Altitude)</span>
              <span className="text-[#cc6543] font-semibold">{throttle}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={throttle}
              onChange={(e) => setThrottle(Number(e.target.value))}
              className="w-full accent-[#cc6543] bg-neutral-800 h-1 rounded-lg cursor-pointer"
            />
          </div>

        </div>

        {/* Centered reset button */}
        <div className="flex justify-between items-center pt-2">
          <div className="text-[9px] font-mono text-neutral-500">
            ALTITUDE LIMIT: 150m AGL
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-200 font-mono text-[9px] uppercase tracking-wider bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" /> Stabilize Hover
          </button>
        </div>

      </div>
    </div>
  )
}
