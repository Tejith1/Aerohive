"use client"

import { useState, useEffect } from "react"
import { Search, Eye, Mail, Ban, Loader2, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdminHeader } from "@/components/admin/admin-header"
import { getAllUsers, User } from "@/lib/supabase"

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const data = await getAllUsers()
      setCustomers(data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && customer.is_active) ||
      (statusFilter === 'inactive' && !customer.is_active)

    return matchesSearch && matchesStatus
  })

  return (
    <>
      <AdminHeader title="Customers" description="Manage customer accounts and relationships" />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search customers by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={fetchCustomers} variant="outline" className="rounded-xl border-gray-200">
              Refresh
            </Button>
          </div>
        </div>

        {/* Customer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="border-0 shadow-sm border border-gray-100 rounded-2xl">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">{customers.length}</div>
              <p className="text-sm text-muted-foreground">Registered Users</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm border border-gray-100 rounded-2xl">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">
                {customers.filter(c => c.is_active).length}
              </div>
              <p className="text-sm text-muted-foreground">Active Accounts</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm border border-gray-100 rounded-2xl">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-indigo-600">
                {customers.filter(c => c.is_admin).length}
              </div>
              <p className="text-sm text-muted-foreground">Admin Roles</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm border border-gray-100 rounded-2xl">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round((customers.filter(c => c.is_active).length / (customers.length || 1)) * 100)}%
              </div>
              <p className="text-sm text-muted-foreground">Engagement Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Customers Table */}
        <Card className="border-0 shadow-lg border border-gray-100 rounded-3xl overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-50 pb-4">
            <CardTitle>User Directory</CardTitle>
            <CardDescription>Live list of all platform registered users</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                <p className="text-sm text-gray-500">Syncing with user database...</p>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-20 bg-gray-50/30">
                <UserIcon className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500">No users found matching your criteria</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead className="font-bold text-gray-900">User Details</TableHead>
                    <TableHead className="font-bold text-gray-900">Account Type</TableHead>
                    <TableHead className="font-bold text-gray-900">Status</TableHead>
                    <TableHead className="font-bold text-gray-900">Phone</TableHead>
                    <TableHead className="font-bold text-gray-900 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-blue-50/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm uppercase">
                            {customer.first_name[0]}{customer.last_name[0] || ''}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 leading-none">
                              {customer.first_name} {customer.last_name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{customer.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={customer.is_admin ? "default" : "secondary"} className={customer.is_admin ? "bg-indigo-100 text-indigo-700 border-indigo-200" : ""}>
                          {customer.is_admin ? "Administrator" : "User"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={customer.is_active ? "default" : "outline"} className={customer.is_active ? "bg-green-100 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-100"}>
                          {customer.is_active ? "Active" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 font-medium">
                        {customer.phone || 'Not provided'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white hover:text-blue-600 transition-all">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white hover:text-red-500 transition-all">
                            <Ban className="h-4 w-4" />
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
