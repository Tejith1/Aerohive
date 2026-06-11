"use client"

import { useState, useEffect } from "react"
import { Search, Eye, Package, Truck, Loader2, Calendar, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdminHeader } from "@/components/admin/admin-header"
import { getAllBookings } from "@/lib/supabase"

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await getAllBookings()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.booking_reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.client?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.client?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.service_type?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || order.status?.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase()
    switch (s) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case "confirmed":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Confirmed</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#0b0f19] text-slate-855 dark:text-slate-105 transition-colors duration-300 relative pb-20">
      {/* Background ambient grids */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>

      <AdminHeader title="Order & Mission Management" description="Monitor customer drone missions and fulfillment" />

      <main className="container mx-auto px-4 py-8 relative z-10 space-y-6">
        
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/70 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md">
          <div className="flex flex-1 flex-wrap gap-4 w-full">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search missions by ref, client or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl bg-white dark:bg-slate-950 border-slate-200/80 dark:border-slate-800 text-xs shadow-sm focus-visible:ring-slate-300"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 rounded-xl bg-white dark:bg-slate-950 border-slate-205 dark:border-slate-800 text-xs shadow-sm">
                <SelectValue placeholder="Mission Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={fetchOrders} variant="outline" className="rounded-xl bg-white dark:bg-slate-950 border-slate-205 dark:border-slate-800 text-xs shadow-sm hover:bg-slate-50 font-bold px-5">
              Refresh
            </Button>
          </div>
        </div>

        {/* Orders Table */}
        <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/60 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.01)] rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 p-5 bg-slate-50/50 dark:bg-slate-900/40">
            <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-300 uppercase tracking-widest font-mono">Mission Directory</CardTitle>
            <CardDescription className="text-[11px] text-slate-450 dark:text-slate-500 font-medium">Live tracking of all scheduled drone flights</CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#e65737] mb-3" />
                <p className="text-xs text-slate-500 font-mono font-bold uppercase tracking-wider">Accessing flight data...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-20">
                <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-xs">No missions found</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-955/20">
                  <TableRow className="border-b border-slate-150 dark:border-slate-850">
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono py-4">Reference</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono py-4">Client</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono py-4">Service Type</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono py-4">Amount</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono py-4">Status</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono py-4">Mission Date</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono py-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors border-b border-slate-100 dark:border-slate-850">
                      <TableCell className="font-mono text-xs font-bold text-[#e65737] dark:text-[#e65737]">
                        {order.booking_reference}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-center flex-shrink-0 text-xs">
                            👤
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">{order.client?.first_name} {order.client?.last_name}</p>
                            <p className="text-[9px] text-slate-450 dark:text-slate-550 font-mono truncate">{order.client?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-slate-700 dark:text-slate-300 text-xs">{order.service_type}</TableCell>
                      <TableCell className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">₹{order.total_amount?.toLocaleString("en-IN")}</TableCell>
                      <TableCell>
                        <Badge className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${
                          order.status?.toLowerCase() === "completed"
                            ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-655 dark:text-emerald-450 border-emerald-200/40 dark:border-emerald-900/30"
                            : order.status?.toLowerCase() === "pending"
                            ? "bg-amber-50 dark:bg-amber-950/20 text-amber-655 dark:text-amber-450 border-amber-200/40 dark:border-amber-900/30"
                            : order.status?.toLowerCase() === "confirmed"
                            ? "bg-[#e65737]/8 dark:bg-[#e65737]/12 text-[#e65737] dark:text-[#e65737] border-[#e65737]/20 dark:border-[#e65737]/20"
                            : "bg-rose-50 dark:bg-rose-950/20 text-rose-655 dark:text-rose-450 border-rose-200/40 dark:border-rose-900/30"
                        }`}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono font-bold">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {new Date(order.scheduled_at).toLocaleDateString("en-IN")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
                            <Eye className="h-3.5 w-3.5 text-slate-500" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-[#e65737] hover:text-[#cc5032] hover:bg-[#e65737]/5">
                            <Truck className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
