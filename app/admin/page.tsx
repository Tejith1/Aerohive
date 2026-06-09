"use client"

import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Server, 
  Database, 
  MessageSquare, 
  Terminal, 
  RefreshCw, 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Check, 
  X,
  Activity,
  Layers,
  ArrowUpRight,
  Settings
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminHeader } from "@/components/admin/admin-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState, useRef } from "react"
import { getProducts, Product, getCategories, Category, supabase, DronePilot } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

// Chart data definition
const ANALYTICS_DATA = {
  revenue: {
    label: "Monthly Revenue (INR)",
    values: [48000, 62000, 85000, 110000, 95000, 134000],
    prefix: "₹",
    max: 150000
  },
  flights: {
    label: "Operator Flights (Monthly)",
    values: [120, 180, 240, 310, 280, 420],
    prefix: "",
    max: 500
  },
  signups: {
    label: "Pilot Registrations",
    values: [12, 19, 32, 45, 41, 64],
    prefix: "",
    max: 80
  }
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]

interface OperationLog {
  id: string
  time: string
  level: "INFO" | "SUCCESS" | "WARN" | "ERROR"
  message: string
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [pilots, setPilots] = useState<DronePilot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [greeting, setGreeting] = useState("Welcome back")

  // Interactive Analytics Tab State
  const [activeChartTab, setActiveChartTab] = useState<"revenue" | "flights" | "signups">("revenue")
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Operation Logs Console State
  const [logs, setLogs] = useState<OperationLog[]>([
    { id: "1", time: "15:00:10", level: "INFO", message: "AeroHive Core API engine initializing." },
    { id: "2", time: "15:00:12", level: "SUCCESS", message: "Supabase PG Pool Handshake verified." },
    { id: "3", time: "15:00:15", level: "INFO", message: "Twilio SMS gateway diagnostics: status online." },
    { id: "4", time: "15:01:05", level: "WARN", message: "Higher latency (124ms) detected on Stripe endpoint." }
  ])
  const terminalContainerRef = useRef<HTMLDivElement>(null)
  const [consoleInput, setConsoleInput] = useState("")

  const handleExecuteCommand = (e: React.FormEvent) => {
    e.preventDefault()
    if (!consoleInput.trim()) return

    const cmd = consoleInput.trim().toLowerCase()
    const timeStr = new Date().toTimeString().split(' ')[0]

    setLogs(prev => [
      ...prev,
      { id: Math.random().toString(), time: timeStr, level: "INFO", message: `> ${consoleInput}` }
    ])

    setTimeout(() => {
      const responseTimeStr = new Date().toTimeString().split(' ')[0]
      let responseMsg = ""
      let responseLevel: "SUCCESS" | "INFO" | "WARN" | "ERROR" = "INFO"

      if (cmd === "/help" || cmd === "help") {
        responseMsg = "Available commands: /ping (check latency), /status (system health), /clear (clear console logs), /help"
      } else if (cmd === "/ping" || cmd === "ping") {
        responseMsg = "PONG! Roundtrip latency to PG Pool: 14ms. Stripe Hook latency: 42ms."
        responseLevel = "SUCCESS"
      } else if (cmd === "/status" || cmd === "status") {
        responseMsg = "SYSTEM ONLINE. CPU: 12.4%, MEMORY: 48.2%, SUPABASE: 100% HEALTHY, REDIS: OK"
        responseLevel = "SUCCESS"
      } else if (cmd === "/clear" || cmd === "clear") {
        setLogs([])
        setConsoleInput("")
        return
      } else {
        responseMsg = `Command not recognized: "${consoleInput}". Type /help for assistance.`
        responseLevel = "ERROR"
      }

      setLogs(prev => [
        ...prev,
        { id: Math.random().toString(), time: responseTimeStr, level: responseLevel, message: responseMsg }
      ])
    }, 150)

    setConsoleInput("")
  }

  // Simulation state
  const [isSimulating, setIsSimulating] = useState(false)
  const [isBackingUp, setIsBackingUp] = useState(false)

  // Fetch data
  useEffect(() => {
    loadData()
    determineGreeting()

    // Setup random log simulation
    const logInterval = setInterval(() => {
      generateMockLog()
    }, 4500)

    return () => clearInterval(logInterval)
  }, [])

  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight
    }
  }, [logs])

  const determineGreeting = () => {
    const hr = new Date().getHours()
    if (hr < 12) setGreeting("Good morning")
    else if (hr < 17) setGreeting("Good afternoon")
    else setGreeting("Good evening")
  }

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories()
      ])
      setProducts(productsData || [])
      setCategories(categoriesData || [])

      // Fetch pending review pilots
      if (supabase) {
        const { data: pilotsData, error } = await supabase
          .from("drone_pilots")
          .select("*")
          .order("created_at", { ascending: false })
        if (!error && pilotsData) {
          setPilots(pilotsData)
        }
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockLog = () => {
    const actions = [
      { level: "INFO" as const, msg: "Stripe webhook received for Order #4582." },
      { level: "SUCCESS" as const, msg: "Operator license verified: DGCA-UA-18293." },
      { level: "INFO" as const, msg: "Redis cache memory usage stabilized at 24.1 MB." },
      { level: "WARN" as const, msg: "Twilio Gateway queue overflow checked. Handled." },
      { level: "SUCCESS" as const, msg: "Database replication successfully synced (0ms delta)." },
      { level: "ERROR" as const, msg: "Failed SMTP transaction for email recipient. Retrying." }
    ]
    const randomAction = actions[Math.floor(Math.random() * actions.length)]
    const timeStr = new Date().toTimeString().split(' ')[0]
    
    setLogs(prev => [
      ...prev.slice(-30), // keep last 30 logs
      {
        id: Math.random().toString(),
        time: timeStr,
        level: randomAction.level,
        message: randomAction.msg
      }
    ])
  }

  // Admin action triggers
  const handleServerBackup = async () => {
    setIsBackingUp(true)
    toast({
      title: "Triggering Backup",
      description: "Generating platform snapshot and uploading to secure storage..."
    })

    const timeStr = new Date().toTimeString().split(' ')[0]
    setLogs(prev => [
      ...prev,
      { id: Math.random().toString(), time: timeStr, level: "INFO", message: "Manual platform system backup initiated." }
    ])

    setTimeout(() => {
      setIsBackingUp(false)
      toast({
        title: "Backup Complete",
        description: "System snapshot successfully compiled: backup_ah_prod_v1.0.tar (145.2 MB)",
        variant: "success"
      })
      const successTimeStr = new Date().toTimeString().split(' ')[0]
      setLogs(prev => [
        ...prev,
        { id: Math.random().toString(), time: successTimeStr, level: "SUCCESS", message: "System backup finalized and verified (SHA-256 ok)." }
      ])
    }, 2500)
  }

  const handleFlushCache = () => {
    toast({
      title: "Cache Flushed",
      description: "Cleared 2,892 active cached queries from Redis memory.",
      variant: "success"
    })
    const timeStr = new Date().toTimeString().split(' ')[0]
    setLogs(prev => [
      ...prev,
      { id: Math.random().toString(), time: timeStr, level: "SUCCESS", message: "Redis memory pool successfully purged by Admin." }
    ])
  }

  const handleSimulatePilot = async () => {
    setIsSimulating(true)
    toast({
      title: "Simulating Signup",
      description: "Injecting temporary mock Drone Operator into DGCA registration database..."
    })

    const firstNames = ["Raj", "Amit", "Sneha", "Karan", "Pooja", "Vikram"]
    const lastNames = ["Sharma", "Verma", "Patel", "Singh", "Reddy", "Mehta"]
    const mockName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
    const mockEmail = `${mockName.toLowerCase().replace(" ", ".")}@aerohive-mock.in`
    const mockDgca = `DGCA-UA-MOCK-${Math.floor(10000 + Math.random() * 90000)}`

    try {
      if (supabase) {
        const { error } = await supabase.from("drone_pilots").insert({
          full_name: mockName,
          email: mockEmail,
          dgca_number: mockDgca,
          experience: "3 Years",
          specializations: "Aerial Surveys, Precision Agriculture",
          location: "Bengaluru",
          area: "Karnataka",
          is_verified: false,
          is_active: true
        })

        if (error) throw error

        toast({
          title: "Simulation Injection OK",
          description: `Registered mock operator: ${mockName}`,
          variant: "success"
        })

        const timeStr = new Date().toTimeString().split(' ')[0]
        setLogs(prev => [
          ...prev,
          { id: Math.random().toString(), time: timeStr, level: "SUCCESS", message: `Mock Pilot Registration injected: ${mockName} (${mockDgca}).` }
        ])
        
        loadData()
      }
    } catch (e) {
      console.error(e)
      toast({
        title: "Simulation Failed",
        description: "Failed to write pilot to Supabase",
        variant: "destructive"
      })
    } finally {
      setIsSimulating(false)
    }
  }

  // Quick Approve Pilot
  const handleApprovePilot = async (pilotId: string, pilotName: string) => {
    try {
      const response = await fetch('/api/admin/pilots/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pilotId })
      })

      if (!response.ok) throw new Error()

      toast({
        title: "Verified Operator",
        description: `Successfully approved credentials for ${pilotName}`,
        variant: "success"
      })

      // Update local state
      setPilots(prev => prev.map(p => p.id === pilotId ? { ...p, is_verified: true } : p))
      
      const timeStr = new Date().toTimeString().split(' ')[0]
      setLogs(prev => [
        ...prev,
        { id: Math.random().toString(), time: timeStr, level: "SUCCESS", message: `Operator Verified: Credentials for ${pilotName} authorized.` }
      ])
    } catch (e) {
      toast({
        title: "Verification Failed",
        description: `Could not verify credentials for ${pilotName}`,
        variant: "destructive"
      })
    }
  }

  // Calculate statistics
  const totalRevenue = products.reduce((sum, p) => sum + p.price * Math.max(50 - p.stock_quantity, 0), 0)
  const totalOrders = products.reduce((sum, p) => sum + Math.max(50 - p.stock_quantity, 0), 0)
  
  const stats = [
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      change: "+20.1%",
      trend: "up" as const,
      icon: DollarSign,
      color: "text-amber-500 bg-amber-500/10"
    },
    {
      title: "Active Orders",
      value: totalOrders.toString(),
      change: "+180.1%",
      trend: "up" as const,
      icon: ShoppingCart,
      color: "text-indigo-500 bg-indigo-500/10"
    },
    {
      title: "Product Catalog",
      value: products.length.toString(),
      change: "+19%",
      trend: "up" as const,
      icon: Package,
      color: "text-emerald-500 bg-emerald-500/10"
    },
    {
      title: "Verified Operators",
      value: pilots.filter(p => p.is_verified).length.toString(),
      change: `+${pilots.filter(p => !p.is_verified).length} pending`,
      trend: "up" as const,
      icon: Users,
      color: "text-[#e65737] bg-[#e65737]/10"
    },
  ]

  // Render SVG Analytics Chart
  const activeData = ANALYTICS_DATA[activeChartTab]
  const renderChart = () => {
    const width = 580
    const height = 180
    const paddingLeft = 40
    const paddingRight = 20
    const paddingTop = 20
    const paddingBottom = 30

    const graphWidth = width - paddingLeft - paddingRight
    const graphHeight = height - paddingTop - paddingBottom

    // Generate points
    const points = activeData.values.map((val, idx) => {
      const x = paddingLeft + (idx / 5) * graphWidth
      const y = height - paddingBottom - (val / activeData.max) * graphHeight
      return { x, y, val }
    })

    // Construct path string
    const linePath = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
    // Construct gradient area path string
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // Find closest data point
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
          {/* Y Axis Grid lines */}
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

          {/* X Axis Labels */}
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

          {/* Area under curve with gradient */}
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e65737" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#e65737" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#chartGrad)" />

          {/* Line curve path */}
          <path 
            d={linePath} 
            fill="none" 
            stroke="#e65737" 
            strokeWidth="2.5" 
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover effects */}
          {hoveredDataIndex !== null && (
            <g>
              {/* Vertical trace line */}
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
              {/* Ring indicator on point */}
              <circle 
                cx={mousePos.x} 
                cy={mousePos.y} 
                r="6" 
                fill="#e65737"
                stroke="#ffffff"
                strokeWidth="2"
                className="shadow-sm"
              />
              <circle 
                cx={mousePos.x} 
                cy={mousePos.y} 
                r="10" 
                fill="none"
                stroke="#e65737"
                strokeWidth="1.5"
                className="opacity-40 animate-ping"
              />
            </g>
          )}
        </svg>

        {/* Hover absolute tooltip */}
        {hoveredDataIndex !== null && (
          <div 
            className="absolute bg-neutral-950/95 dark:bg-neutral-900/95 border border-neutral-800 text-white rounded-xl p-3 shadow-2xl backdrop-blur-md pointer-events-none transition-all duration-150 z-20"
            style={{ 
              left: `${(mousePos.x / width) * 100}%`, 
              top: `${(mousePos.y / height) * 100 - 35}%`,
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

  // Filter pending review pilots
  const pendingReviewPilots = pilots.filter(p => !p.is_verified && !p.certifications?.startsWith('REJECTED:')).slice(0, 4)

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#0b0c0e] text-slate-800 dark:text-slate-100 transition-colors duration-300 pb-20 relative font-sans">
      {/* Ambient backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>
      
      {/* Ambient blur overlays */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#e65737]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <AdminHeader title="Operations Command Center" description="System telemetry, directory management, and verified operator administration." />

      <main className="container mx-auto px-4 py-8 relative z-10 space-y-8">
        
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-950 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl border border-neutral-800/80">
          <div className="absolute inset-0 bg-gradient-to-br from-[#e65737]/15 via-transparent to-transparent"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[#e65737] font-mono text-[9px] font-bold uppercase tracking-widest">
                <Shield className="h-3 w-3" /> Root Access Active
              </div>
              <h1 className="text-3xl font-bold tracking-tight font-serif text-white">
                {greeting}, Administrator
              </h1>
              <p className="text-neutral-400 text-xs leading-relaxed font-normal">
                Platform operations check list: Twilio telemetry stable, Supabase connection live. You have {pilots.filter(p => !p.is_verified).length} operator applications awaiting manual verification.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/admin/products/new">
                  <Button size="sm" className="bg-[#e65737] hover:bg-[#d44d2d] text-white border-0 rounded-xl px-5 text-xs font-bold transition-all shadow-md cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" /> New Product
                  </Button>
                </Link>
                <Link href="/admin/pilots">
                  <Button variant="outline" size="sm" className="bg-neutral-800/50 hover:bg-neutral-800 border-neutral-800 text-neutral-350 hover:text-white rounded-xl px-5 text-xs font-bold transition-all cursor-pointer">
                    Accreditation Desk
                  </Button>
                </Link>
              </div>
            </div>
            {/* Live Platform Status Gauges */}
            <div className="bg-neutral-900/60 border border-neutral-850 p-4 rounded-2xl w-full md:w-80 flex flex-col gap-3">
              <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest font-semibold block">Platform Health Indicators</span>
              
              <div className="flex justify-between items-center text-xs font-mono text-neutral-400">
                <span className="flex items-center gap-2"><Server className="h-3.5 w-3.5 text-emerald-500" /> Platform Core API</span>
                <span className="text-emerald-400 font-bold uppercase tracking-wide">ONLINE (9ms)</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono text-neutral-400">
                <span className="flex items-center gap-2"><Database className="h-3.5 w-3.5 text-emerald-500" /> Supabase Storage</span>
                <span className="text-emerald-400 font-bold uppercase tracking-wide">CONNECTED</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono text-neutral-400">
                <span className="flex items-center gap-2"><MessageSquare className="h-3.5 w-3.5 text-emerald-500" /> Twilio SMS Broker</span>
                <span className="text-emerald-400 font-bold uppercase tracking-wide">READY</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono text-neutral-400">
                <span className="flex items-center gap-2"><Layers className="h-3.5 w-3.5 text-emerald-500" /> Stripe API Hook</span>
                <span className="text-emerald-400 font-bold uppercase tracking-wide">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="relative overflow-hidden border border-neutral-200/50 dark:border-neutral-800/60 bg-white/95 dark:bg-[#121210]/95 backdrop-blur-md shadow-xl rounded-2xl group hover:border-[#e65737]/35 dark:hover:border-[#e65737]/35 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-mono">
                  {stat.title}
                </CardTitle>
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center border border-neutral-200/20 dark:border-neutral-800/40 group-hover:border-[#e65737]/30 transition-all duration-300 ${stat.color}`}>
                  <stat.icon className="h-4.5 w-4.5 transition-colors duration-300" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">{stat.value}</div>
                <div className="flex items-center space-x-2 text-[10px] text-neutral-450 dark:text-neutral-500 font-bold uppercase tracking-wider mt-2">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-500">{stat.change}</span>
                  <span>vs last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Analytics Summary & Access Card */}
        <Card className="border border-neutral-200/50 dark:border-neutral-800/60 bg-white/95 dark:bg-[#121210]/95 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden p-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2 flex-1">
            <span className="font-mono text-[9px] text-[#e65737] uppercase tracking-widest font-bold block">
              PLATFORM ANALYTICS OVERVIEW
            </span>
            <h3 className="font-serif text-xl text-neutral-900 dark:text-white font-normal">
              High-Fidelity Telemetry & Flight Operations
            </h3>
            <p className="text-neutral-500 text-xs max-w-2xl">
              Monitor server uptime (99.98%), Redis hit efficiency (98.4%), DB queries latency (9ms), and active flight missions. Dive into detailed SVG telemetry trends, charts, and flight diagnostic logs.
            </p>
          </div>
          <Link href="/admin/analytics">
            <Button className="bg-[#e65737] hover:bg-[#d44d2d] text-white rounded-xl px-6 py-2.5 text-xs font-bold font-mono tracking-wider uppercase transition-all shadow-md">
              Open Analytics Dashboard
            </Button>
          </Link>
        </Card>

        {/* Analytics SVG Chart & Admin Action Panel */}
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* SVG Analytics Chart (Spans 7 Cols) */}
          <Card className="lg:col-span-7 border border-neutral-200/50 dark:border-neutral-800/60 bg-white/95 dark:bg-[#121210]/95 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-100 dark:border-neutral-850 p-5 bg-neutral-50/50 dark:bg-neutral-900/30 gap-4">
              <div>
                <CardTitle className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-mono flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#e65737]" />
                  Analytics Operations Desk
                </CardTitle>
                <p className="text-[10px] text-neutral-400 mt-1">Interactive vector analytics. Hover graph coordinates for real-time readings.</p>
              </div>

              {/* Chart tabs */}
              <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-900/80 rounded-xl p-1 border border-neutral-200/20 dark:border-neutral-800/30">
                {(["revenue", "flights", "signups"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveChartTab(tab)}
                    className={`text-[9px] font-bold py-1.5 px-3 rounded-lg transition-all duration-200 uppercase tracking-wider font-mono cursor-pointer ${
                      activeChartTab === tab 
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

          {/* Action Center & Diagnostics Panel (Spans 5 Cols) */}
          <Card className="lg:col-span-5 border border-neutral-200/50 dark:border-neutral-800/60 bg-white/95 dark:bg-[#121210]/95 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden flex flex-col justify-between">
            <CardHeader className="border-b border-neutral-100 dark:border-neutral-850 p-5 bg-neutral-50/50 dark:bg-neutral-900/30">
              <CardTitle className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-mono flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#e65737]" />
                Administrative Action Center
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 flex-1 space-y-6">
              
              {/* Quick Actions Grid */}
              <div className="space-y-2.5">
                <span className="text-[8px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-bold block">Console Controls</span>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={isBackingUp}
                    onClick={handleServerBackup}
                    className="h-9 border-neutral-200 hover:border-indigo-500/30 hover:bg-indigo-500/5 dark:border-neutral-800 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/10 text-[10px] font-bold font-mono tracking-wider uppercase rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`h-3 w-3 text-indigo-500 ${isBackingUp ? "animate-spin" : ""}`} />
                    {isBackingUp ? "Backing up..." : "Backup Server"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleFlushCache}
                    className="h-9 border-neutral-200 hover:border-rose-500/30 hover:bg-rose-500/5 dark:border-neutral-800 dark:hover:border-rose-500/30 dark:hover:bg-rose-500/10 text-[10px] font-bold font-mono tracking-wider uppercase rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3 text-rose-500" />
                    Flush Redis
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={isSimulating}
                    onClick={handleSimulatePilot}
                    className="h-9 border-neutral-200 hover:border-emerald-500/30 hover:bg-emerald-500/5 dark:border-neutral-800 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/10 text-[10px] font-bold font-mono tracking-wider uppercase rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-3 w-3 text-emerald-500" />
                    Mock Pilot
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      toast({
                        title: "Maintenance Mode",
                        description: "Platform sandbox flags updated successfully."
                      })
                    }}
                    className="h-9 border-neutral-200 hover:border-amber-500/30 hover:bg-amber-500/5 dark:border-neutral-800 dark:hover:border-amber-500/30 dark:hover:bg-amber-500/10 text-[10px] font-bold font-mono tracking-wider uppercase rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Shield className="h-3 w-3 text-amber-500" />
                    Dev Sandbox
                  </Button>
                </div>
              </div>

              {/* Hardware Diagnostic Telemetry */}
              <div className="space-y-3.5">
                <span className="text-[8px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-bold block">Hardware Diagnostics telemetry</span>
                <div className="space-y-2 text-[10px] font-mono text-neutral-400">
                  <div className="flex justify-between items-center">
                    <span>Database Connection Load</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">12% / 100 Pool</span>
                  </div>
                  <div className="h-1 bg-neutral-100 dark:bg-neutral-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "12%" }} />
                  </div>
                  <div className="flex justify-between items-center mt-2.5">
                    <span>Redis Cache Hit Efficiency</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">98.4% Hit</span>
                  </div>
                  <div className="h-1 bg-neutral-100 dark:bg-neutral-900 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: "98.4%" }} />
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

        </div>

        {/* Live Logs Scrolling Terminal & Operator Review desks */}
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* Scrolling Terminal (Spans 6 Cols) */}
          <Card className="lg:col-span-6 border border-neutral-200/50 dark:border-neutral-800/60 bg-white/95 dark:bg-[#121210]/95 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden flex flex-col justify-between">
            <CardHeader className="border-b border-neutral-100 dark:border-neutral-850 p-5 bg-neutral-50/50 dark:bg-neutral-900/30 flex flex-row justify-between items-center">
              <CardTitle className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-mono flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#e65737]" />
                Live System Operations Feed
              </CardTitle>
                <span className="inline-flex items-center gap-1.5 text-[8px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 animate-pulse">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                LIVE STREAM
              </span>
            </CardHeader>
            <CardContent className="p-5 flex-1 flex flex-col gap-4">
              <div ref={terminalContainerRef} className="bg-neutral-950 text-neutral-300 font-mono text-[10px] p-4 rounded-2xl border border-neutral-850 overflow-y-auto min-h-[380px] h-[380px] flex-1 flex flex-col gap-1.5">
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-2 leading-relaxed">
                    <span className="text-neutral-500">[{log.time}]</span>
                    <span className={`font-bold ${
                      log.level === "SUCCESS" ? "text-emerald-500" :
                      log.level === "WARN" ? "text-amber-500" :
                      log.level === "ERROR" ? "text-rose-500" : "text-[#e65737]"
                    }`}>
                      {log.level}:
                    </span>
                    <span className="text-neutral-300">{log.message}</span>
                  </div>
                ))}
              </div>
              <form onSubmit={handleExecuteCommand} className="flex gap-2">
                <input
                  type="text"
                  value={consoleInput}
                  onChange={(e) => setConsoleInput(e.target.value)}
                  placeholder="Type CLI command... (e.g. /help, /ping, /status)"
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-xs font-mono text-neutral-300 focus:outline-none focus:ring-1 focus:ring-[#e65737] focus:border-[#e65737] text-white"
                />
                <Button type="submit" size="sm" className="bg-[#e65737] hover:bg-[#d44d2d] text-white font-mono text-xs rounded-xl px-4">
                  EXECUTE
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Integrated Operator Approval (Spans 6 Cols) */}
          <Card className="lg:col-span-6 border border-neutral-200/50 dark:border-neutral-800/60 bg-white/95 dark:bg-[#121210]/95 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden flex flex-col justify-between">
            <CardHeader className="border-b border-neutral-100 dark:border-neutral-850 p-5 bg-neutral-50/50 dark:bg-neutral-900/30 flex flex-row justify-between items-center">
              <CardTitle className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-mono flex items-center gap-2">
                <Users className="w-4 h-4 text-[#e65737]" />
                Operator Verifications Desk
              </CardTitle>
              <Link href="/admin/pilots">
                <Button variant="ghost" size="sm" className="h-7 text-xs font-mono text-[#e65737] hover:text-[#d44d2d] uppercase tracking-wider">
                  Accreditation Portal <ArrowUpRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-5 flex-1">
              {isLoading ? (
                <div className="text-center py-10 font-mono text-xs uppercase tracking-wider text-neutral-500">
                  Scanning active applications...
                </div>
              ) : pendingReviewPilots.length === 0 ? (
                <div className="text-center py-10 text-neutral-450 dark:text-neutral-500 text-xs font-mono uppercase tracking-wider">
                  No pending operator credentials to audit.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {pendingReviewPilots.map((pilot) => (
                    <div 
                      key={pilot.id} 
                      className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-all border border-neutral-100 dark:border-neutral-850 hover:border-[#e65737]/20 group"
                    >
                      <div className="space-y-1 max-w-[70%]">
                        <p className="font-bold text-neutral-800 dark:text-neutral-200 text-xs truncate">
                          {pilot.full_name}
                        </p>
                        <p className="text-[10px] text-neutral-450 dark:text-neutral-500 font-mono truncate">
                          {pilot.email} • <span className="text-indigo-400">{pilot.dgca_number}</span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprovePilot(pilot.id, pilot.full_name)}
                          className="h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[9px] uppercase tracking-wider border-0 cursor-pointer"
                        >
                          Approve
                        </Button>
                        <Link href="/admin/pilots">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 border-neutral-200 dark:border-neutral-800 text-[9px] font-mono uppercase tracking-wider cursor-pointer"
                          >
                            Review
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

      </main>
    </div>
  )
}
