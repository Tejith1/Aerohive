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
    <>
      <AdminHeader title="Order & Mission Management" description="Monitor customer drone missions and fulfillment" />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search missions by ref, client or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 rounded-xl">
                <SelectValue placeholder="Mission Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={fetchOrders} variant="outline" className="rounded-xl">
              Refresh
            </Button>
          </div>
        </div>

        {/* Orders Table */}
        <Card className="border-0 shadow-lg border border-gray-100 rounded-3xl overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-50 pb-4">
            <CardTitle>Mission Directory</CardTitle>
            <CardDescription>Live tracking of all scheduled drone flights</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                <p className="text-sm text-gray-500">Accessing flight data...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-20 bg-gray-50/30">
                <Package className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500">No missions found</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead className="font-bold text-gray-900">Reference</TableHead>
                    <TableHead className="font-bold text-gray-900">Client</TableHead>
                    <TableHead className="font-bold text-gray-900">Service Type</TableHead>
                    <TableHead className="font-bold text-gray-900">Amount</TableHead>
                    <TableHead className="font-bold text-gray-900">Status</TableHead>
                    <TableHead className="font-bold text-gray-900">Mission Date</TableHead>
                    <TableHead className="font-bold text-gray-900 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-blue-50/10 transition-colors">
                      <TableCell className="font-mono text-sm font-bold text-blue-600">
                        {order.booking_reference}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{order.client?.first_name} {order.client?.last_name}</p>
                            <p className="text-[10px] text-gray-500">{order.client?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{order.service_type}</TableCell>
                      <TableCell className="font-bold text-gray-900">₹{order.total_amount?.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          {new Date(order.scheduled_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-blue-600">
                            <Truck className="h-4 w-4" />
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
    </>
  )
}
