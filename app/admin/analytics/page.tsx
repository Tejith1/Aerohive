"use client"

import { useState, useEffect } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Activity, BarChart3, Clock, DollarSign, ShieldAlert, Cpu, Database, Server, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Mission {
  id: string
  drone: string
  pilot: string
  location: string
  status: "COMPLETED" | "IN_PROGRESS" | "FAILED"
  battery: number
  signal: string
  time: string
}

const initialMissions: Mission[] = [
  { id: "MS-492", drone: "AeroHive X1-Pro", pilot: "Raj Sharma", location: "Bengaluru, KA", status: "COMPLETED", battery: 94, signal: "98% (Ex)", time: "10 mins ago" },
  { id: "MS-493", drone: "AeroHive Sentinel", pilot: "Karan Singh", location: "Kochi, KL", status: "IN_PROGRESS", battery: 72, signal: "84% (Good)", time: "Active Now" },
  { id: "MS-494", drone: "AeroHive Heavy-Lift", pilot: "Pooja Reddy", location: "Hyderabad, TS", status: "COMPLETED", battery: 100, signal: "99% (Ex)", time: "1 hour ago" },
  { id: "MS-495", drone: "AeroHive X1-Pro", pilot: "Vikram Mehta", location: "Chennai, TN", status: "FAILED", battery: 12, signal: "0% (Lost)", time: "2 hours ago" },
  { id: "MS-496", drone: "AeroHive Recon", pilot: "Sneha Patel", location: "Mumbai, MH", status: "COMPLETED", battery: 88, signal: "91% (Good)", time: "4 hours ago" }
]

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]

const chartData = {
  flights: {
    label: "Monthly Flights Completed",
    values: [142, 185, 230, 310, 280, 385],
    max: 500,
    prefix: ""
  },
  revenue: {
    label: "Monthly Revenue Generated",
    values: [4200, 5800, 7100, 9400, 8900, 12500],
    max: 15000,
    prefix: "$"
  }
}

export default function AnalyticsDashboard() {
  const [activeChart, setActiveChart] = useState<"flights" | "revenue">("flights")
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [loading, setLoading] = useState(false)
  const [pilotCount, setPilotCount] = useState(0)

  useEffect(() => {
    fetchPilotCount()
  }, [])

  const fetchPilotCount = async () => {
    try {
      if (supabase) {
        const { count, error } = await supabase
          .from("drone_pilots")
          .select("*", { count: "exact", head: true })
        if (!error && count !== null) {
          setPilotCount(count)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const renderChart = () => {
    const activeData = chartData[activeChart]
    const width = 600
    const height = 240
    const paddingLeft = 45
    const paddingRight = 20
    const paddingTop = 20
    const paddingBottom = 30

    const graphWidth = width - paddingLeft - paddingRight
    const graphHeight = height - paddingTop - paddingBottom

    const points = activeData.values.map((val, idx) => {
      const x = paddingLeft + (idx / 5) * graphWidth
      const y = height - paddingBottom - (val / activeData.max) * graphHeight
      return { x, y, val }
    })

    const linePath = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      let closestIdx = 0
      let minDiff = Infinity
      points.forEach((p, idx) => {
        const diff = Math.abs(p.x - mouseX)
        if (diff < minDiff) {
          minDiff = diff
          closestIdx = idx
        }
      })

      setHoveredDataIndex(closestIdx)
      setMousePos({ x: points[closestIdx].x, y: points[closestIdx].y })
    }

    return (
      <div className="relative">
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredDataIndex(null)}
          className="overflow-visible cursor-crosshair select-none"
        >
          {/* Grids */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((ratio, idx) => {
            const y = height - paddingBottom - ratio * graphHeight
            const gridVal = Math.round(ratio * activeData.max)
            return (
              <g key={idx} className="opacity-20 dark:opacity-10">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  className="text-neutral-500"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-neutral-500 font-mono text-[9px] font-semibold"
                >
                  {activeData.prefix}{gridVal.toLocaleString()}
                </text>
              </g>
            )
          })}

          {/* Month labels */}
          {points.map((p, idx) => (
            <text
              key={idx}
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              className="fill-neutral-400 dark:fill-neutral-500 font-mono text-[9px] font-semibold"
            >
              {MONTHS[idx]}
            </text>
          ))}

          {/* Area Area Path */}
          <defs>
            <linearGradient id="analyticsChartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e65737" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#e65737" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#analyticsChartGrad)" />

          {/* Path Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#e65737"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover coordinates indicator */}
          {hoveredDataIndex !== null && (
            <g>
              <line
                x1={mousePos.x}
                y1={paddingTop}
                x2={mousePos.x}
                y2={height - paddingBottom}
                stroke="#e65737"
                strokeWidth="1"
                strokeDasharray="2 2"
                className="opacity-60"
              />
              <circle
                cx={mousePos.x}
                cy={mousePos.y}
                r="6"
                fill="#e65737"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {hoveredDataIndex !== null && (
          <div
            className="absolute bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3 shadow-2xl backdrop-blur-md pointer-events-none transition-all duration-150 z-20"
            style={{
              left: `${(mousePos.x / width) * 100}%`,
              top: `${(mousePos.y / height) * 100 - 30}%`,
              transform: "translate(-50%, -100%)"
            }}
          >
            <p className="text-[8px] font-mono text-neutral-400 uppercase tracking-widest font-semibold">
              {MONTHS[hoveredDataIndex]} Metrics
            </p>
            <p className="text-sm font-bold font-mono text-[#e65737] mt-0.5">
              {activeData.prefix}{activeData.values[hoveredDataIndex].toLocaleString()}
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#0b0c0e] text-slate-800 dark:text-slate-100 transition-colors duration-300 pb-20 relative font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>

      <AdminHeader title="Platform Analytics Desk" description="Flight mission counts, diagnostic performance, and financial metrics." />

      <main className="container mx-auto px-4 py-8 relative z-10 space-y-8">
        
        {/* Core KPI cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border border-neutral-200/50 dark:border-neutral-800/60 bg-white/95 dark:bg-[#121210]/95 backdrop-blur-md shadow-xl rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-widest font-mono">
                Total Flight Missions
              </CardTitle>
              <Activity className="h-4.5 w-4.5 text-[#e65737]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif text-neutral-900 dark:text-white">1,532</div>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-wider mt-1.5">+14% Growth</p>
            </CardContent>
          </Card>

          <Card className="border border-neutral-200/50 dark:border-neutral-800/60 bg-white/95 dark:bg-[#121210]/95 backdrop-blur-md shadow-xl rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-widest font-mono">
                Total Flight Hours
              </CardTitle>
              <Clock className="h-4.5 w-4.5 text-[#e65737]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif text-neutral-900 dark:text-white">4,819 hrs</div>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-wider mt-1.5">+18.2% vs Last Month</p>
            </CardContent>
          </Card>

          <Card className="border border-neutral-200/50 dark:border-neutral-800/60 bg-white/95 dark:bg-[#121210]/95 backdrop-blur-md shadow-xl rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-widest font-mono">
                Platform Revenue
              </CardTitle>
              <DollarSign className="h-4.5 w-4.5 text-[#e65737]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif text-neutral-900 dark:text-white">$48,590</div>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-wider mt-1.5">+9.4% Growth Rate</p>
            </CardContent>
          </Card>

          <Card className="border border-neutral-200/50 dark:border-neutral-800/60 bg-white/95 dark:bg-[#121210]/95 backdrop-blur-md shadow-xl rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-widest font-mono">
                Active Operators
              </CardTitle>
              <Cpu className="h-4.5 w-4.5 text-[#e65737]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif text-neutral-900 dark:text-white">{pilotCount || 12}</div>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-wider mt-1.5">100% Accredited</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts & Diagnostics Grid */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Chart card */}
          <Card className="lg:col-span-8 border border-neutral-200/50 dark:border-neutral-800/60 bg-white/95 dark:bg-[#121210]/95 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-100 dark:border-neutral-850 p-5 bg-neutral-50/50 dark:bg-neutral-900/30 gap-4">
              <div>
                <CardTitle className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-mono flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#e65737]" />
                  Telemetry Flight Analysis
                </CardTitle>
              </div>

              <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-900/80 rounded-xl p-1">
                {(["flights", "revenue"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveChart(tab)}
                    className={`text-[9px] font-bold py-1 px-3 rounded-lg transition-all duration-200 uppercase tracking-wider font-mono cursor-pointer ${
                      activeChart === tab
                        ? "bg-white dark:bg-neutral-800 text-[#e65737] dark:text-white shadow-sm"
                        : "text-neutral-450 hover:text-[#e65737] dark:text-neutral-400 dark:hover:text-[#e65737]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {renderChart()}
            </CardContent>
          </Card>

          {/* Diagnostic status */}
          <Card className="lg:col-span-4 border border-neutral-200/50 dark:border-neutral-800/60 bg-white/95 dark:bg-[#121210]/95 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-neutral-100 dark:border-neutral-850 p-5 bg-neutral-50/50 dark:bg-neutral-900/30">
              <CardTitle className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-mono">
                System Diagnostics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span>API Broker Status</span>
                  <span className="font-semibold text-emerald-500">99.98% Uptime</span>
                </div>
                <div className="h-1 bg-neutral-100 dark:bg-neutral-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "99.98%" }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span>Redis Purge Load</span>
                  <span className="font-semibold text-neutral-850 dark:text-neutral-200">12% Cap</span>
                </div>
                <div className="h-1 bg-neutral-100 dark:bg-neutral-900 rounded-full overflow-hidden">
                  <div className="h-full bg-neutral-400 rounded-full" style={{ width: "12%" }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span>Database IO Latency</span>
                  <span className="font-semibold text-neutral-850 dark:text-neutral-200">9ms (Ex)</span>
                </div>
                <div className="h-1 bg-neutral-100 dark:bg-neutral-900 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: "94%" }} />
                </div>
              </div>

              <div className="p-4 bg-[#e65737]/5 border border-[#e65737]/15 rounded-2xl flex items-start gap-3">
                <ShieldAlert className="w-4 h-4 text-[#e65737] mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-bold text-[#e65737] uppercase tracking-wider font-mono">Failsafe Protocol Activated</h4>
                  <p className="text-[9px] text-neutral-500 mt-1">Automatic payload checks, landing coordinates, and air corridor reservations are executing correctly.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Flight mission logs */}
        <Card className="border border-neutral-200/50 dark:border-neutral-800/60 bg-white/95 dark:bg-[#121210]/95 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-neutral-100 dark:border-neutral-850 p-5 bg-neutral-50/50 dark:bg-neutral-900/30">
            <CardTitle className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-mono">
              Live Flight Missions Logging
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-mono text-[9px] uppercase tracking-wider py-4 pl-6">Mission ID</TableHead>
                  <TableHead className="font-mono text-[9px] uppercase tracking-wider py-4">Drone Model</TableHead>
                  <TableHead className="font-mono text-[9px] uppercase tracking-wider py-4">Assigned Pilot</TableHead>
                  <TableHead className="font-mono text-[9px] uppercase tracking-wider py-4">Coordinates/Home</TableHead>
                  <TableHead className="font-mono text-[9px] uppercase tracking-wider py-4">Health</TableHead>
                  <TableHead className="font-mono text-[9px] uppercase tracking-wider py-4">Status</TableHead>
                  <TableHead className="font-mono text-[9px] uppercase tracking-wider py-4 pr-6 text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialMissions.map(m => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-[10px] font-bold py-4 pl-6">{m.id}</TableCell>
                    <TableCell className="font-semibold py-4 text-xs">{m.drone}</TableCell>
                    <TableCell className="text-xs py-4">{m.pilot}</TableCell>
                    <TableCell className="text-xs py-4 text-neutral-500">{m.location}</TableCell>
                    <TableCell className="text-xs py-4 font-mono">
                      <span>🔋 {m.battery}%</span> <span className="text-[10px] text-neutral-400 ml-1">({m.signal})</span>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant="secondary" className={`text-[9px] font-mono uppercase font-bold tracking-wider ${
                        m.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                        m.status === "IN_PROGRESS" ? "bg-amber-500/10 text-amber-600 border border-amber-500/20 animate-pulse" :
                        "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                      }`}>
                        {m.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-[10px] text-right py-4 pr-6 text-neutral-450">{m.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
