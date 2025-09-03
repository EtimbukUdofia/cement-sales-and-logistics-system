import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users
} from "lucide-react"

interface RevenueMetricsProps {
  data: {
    totalRevenue: number
    totalOrders: number
    totalProducts: number
    totalCustomers: number
    revenueGrowth: number
    ordersGrowth: number
    averageOrderValue: number
    topSellingProduct: string
    revenueByMonth: Array<{
      month: string
      revenue: number
      orders: number
    }>
  }
}

export function RevenueMetrics({ data }: RevenueMetricsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    const isPositive = value >= 0
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        <span className="font-medium">{Math.abs(value).toFixed(1)}%</span>
      </div>
    )
  }

  const metrics = [
    {
      title: "Total Revenue",
      value: formatCurrency(data.totalRevenue),
      growth: data.revenueGrowth,
      icon: DollarSign,
      description: "Total sales revenue"
    },
    {
      title: "Total Orders",
      value: data.totalOrders.toLocaleString(),
      growth: data.ordersGrowth,
      icon: ShoppingCart,
      description: "Number of orders placed"
    },
    {
      title: "Average Order Value",
      value: formatCurrency(data.averageOrderValue),
      growth: null,
      icon: Package,
      description: "Average value per order"
    },
    {
      title: "Total Customers",
      value: data.totalCustomers.toLocaleString(),
      growth: null,
      icon: Users,
      description: "Unique customers served"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
                {metric.growth !== null && formatPercentage(metric.growth)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Insights */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top Selling Product</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{data.topSellingProduct}</div>
            <Badge variant="secondary" className="mt-2">
              Best Performer
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {formatPercentage(data.revenueGrowth)}
              <span className="text-sm text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Orders Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {formatPercentage(data.ordersGrowth)}
              <span className="text-sm text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
