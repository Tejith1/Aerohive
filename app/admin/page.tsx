import { Package, ShoppingCart, Users, DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminHeader } from "@/components/admin/admin-header"

// Mock data - replace with actual API calls
const stats = [
  {
    title: "Total Revenue",
    value: "₹37,54,230",
    change: "+20.1%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "Orders",
    value: "2,350",
    change: "+180.1%",
    trend: "up",
    icon: ShoppingCart,
  },
  {
    title: "Products",
    value: "1,234",
    change: "+19%",
    trend: "up",
    icon: Package,
  },
  {
    title: "Customers",
    value: "573",
    change: "+201",
    trend: "up",
    icon: Users,
  },
]

const recentOrders = [
  {
    id: "ORD-001",
    customer: "John Doe",
    email: "john@example.com",
    amount: "₹20,750",
    status: "completed",
    date: "2024-01-15",
  },
  {
    id: "ORD-002",
    customer: "Jane Smith",
    email: "jane@example.com",
    amount: "₹12,450",
    status: "pending",
    date: "2024-01-15",
  },
  {
    id: "ORD-003",
    customer: "Bob Johnson",
    email: "bob@example.com",
    amount: "₹29,050",
    status: "shipped",
    date: "2024-01-14",
  },
]

export default function AdminDashboard() {
  return (
    <>
      <AdminHeader title="Dashboard" description="Welcome back! Here's what's happening with your store today." />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown

            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <TrendIcon className={`h-4 w-4 mr-1 ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`} />
                    <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>{stat.change}</span>
                    <span className="ml-1">from last month</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium">{order.customer}</p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{order.email}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-semibold">{order.amount}</span>
                        <span className="text-sm text-muted-foreground">{order.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <Package className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Add Product</p>
                      <p className="text-sm text-muted-foreground">Create new product</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">View Orders</p>
                      <p className="text-sm text-muted-foreground">Manage orders</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Customers</p>
                      <p className="text-sm text-muted-foreground">View customers</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Analytics</p>
                      <p className="text-sm text-muted-foreground">View reports</p>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
