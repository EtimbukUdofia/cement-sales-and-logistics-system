import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CalendarDateRangePicker, SalesPerformanceChart, CustomerActivity } from "@/components/reports"
// import { SalesGoals } from "@/components/reports/SalesGoals"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"
import { useAuthStore } from "@/store/authStore"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Target,
  Award,
  Calendar,
  RefreshCw,
  Download,
  Filter,
  BarChart3
} from "lucide-react"

interface SalesMetrics {
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  salesGrowth: number
  ordersGrowth: number
  monthlyTarget: number
  targetProgress: number
  rank: number
  totalSalespeople: number
}

interface SalesHistory {
  date: string
  amount: number
  orders: number
  customerName: string
  products: string[]
}

interface TopProducts {
  productName: string
  variant: string
  quantitySold: number
  revenue: number
  percentage: number
}

interface MonthlyPerformance {
  month: string
  sales: number
  orders: number
  target: number
}

interface CustomerInsights {
  totalCustomers: number
  newCustomers: number
  returningCustomers: number
  topCustomer: {
    name: string
    totalPurchases: number
  }
  customerList: Array<{
    id: string
    name: string
    email: string
    phone: string
    location: string
    totalPurchases: number
    lastOrderDate: string
    totalOrders: number
    status: 'active' | 'inactive' | 'new'
  }>
}

interface SalesReportData {
  metrics?: SalesMetrics
  salesHistory?: SalesHistory[]
  topProducts?: TopProducts[]
  monthlyPerformance?: MonthlyPerformance[]
  customerInsights?: CustomerInsights
}

interface DateRange {
  from: Date
  to: Date
}

export default function SalesReportsPage() {
  const { user } = useAuthStore()
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  })
  const [timeframe, setTimeframe] = useState<string>("month")
  const [isLoading, setIsLoading] = useState(false)
  const [reportData, setReportData] = useState<SalesReportData | null>(null)
  // const [salesGoals, setSalesGoals] = useState<Array<{
  //   id: string
  //   title: string
  //   target: number
  //   current: number
  //   deadline: string
  //   category: 'monthly' | 'quarterly' | 'yearly'
  //   status: 'on_track' | 'behind' | 'completed' | 'overdue'
  // }>>([]);

  const fetchSalesReports = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        timeframe,
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
        salesPersonId: user?.id || ''
      })

      const response = await apiClient.getReports(params)
      if (response.success) {
        setReportData(response.data as SalesReportData)
      }
    } catch (error) {
      console.error('Error fetching sales reports:', error)
      toast.error('Failed to load sales reports')
      // Set mock data for development
      setReportData({
        metrics: {
          totalSales: 450000,
          totalOrders: 89,
          averageOrderValue: 5056.18,
          salesGrowth: 18.5,
          ordersGrowth: 12.3,
          monthlyTarget: 500000,
          targetProgress: 90,
          rank: 3,
          totalSalespeople: 12
        },
        salesHistory: [
          {
            date: "2024-09-01",
            amount: 15000,
            orders: 3,
            customerName: "ABC Construction",
            products: ["Dangote 3X Cement", "Lafarge Elephant"]
          },
          {
            date: "2024-09-02",
            amount: 22000,
            orders: 2,
            customerName: "XYZ Builders",
            products: ["BUA Cement"]
          }
        ],
        topProducts: [
          {
            productName: "Dangote 3X Cement",
            variant: "50kg",
            quantitySold: 300,
            revenue: 180000,
            percentage: 40
          },
          {
            productName: "Lafarge Elephant",
            variant: "50kg",
            quantitySold: 250,
            revenue: 150000,
            percentage: 33.3
          }
        ],
        monthlyPerformance: [
          { month: "Jul", sales: 380000, orders: 76, target: 450000 },
          { month: "Aug", sales: 420000, orders: 84, target: 450000 },
          { month: "Sep", sales: 450000, orders: 89, target: 500000 }
        ],
        customerInsights: {
          totalCustomers: 45,
          newCustomers: 8,
          returningCustomers: 37,
          topCustomer: {
            name: "ABC Construction",
            totalPurchases: 85000
          },
          customerList: [
            {
              id: "1",
              name: "ABC Construction",
              email: "contact@abcconstruction.com",
              phone: "+234 801 234 5678",
              location: "Lagos",
              totalPurchases: 85000,
              lastOrderDate: "2024-09-01",
              totalOrders: 12,
              status: "active" as const
            },
            {
              id: "2",
              name: "XYZ Builders Ltd",
              email: "info@xyzbuilders.com",
              phone: "+234 802 345 6789",
              location: "Abuja",
              totalPurchases: 65000,
              lastOrderDate: "2024-08-28",
              totalOrders: 8,
              status: "active" as const
            },
            {
              id: "3",
              name: "Delta Properties",
              email: "sales@deltaproperties.com",
              phone: "+234 803 456 7890",
              location: "Port Harcourt",
              totalPurchases: 45000,
              lastOrderDate: "2024-09-02",
              totalOrders: 6,
              status: "new" as const
            }
          ]
        }
      })

      // Set mock sales goals data
      // setSalesGoals([
      //   {
      //     id: "1",
      //     title: "Q4 Sales Target",
      //     target: 1500000,
      //     current: 1200000,
      //     deadline: "2024-12-31",
      //     category: "quarterly",
      //     status: "on_track"
      //   },
      //   {
      //     id: "2",
      //     title: "November Monthly Goal",
      //     target: 500000,
      //     current: 450000,
      //     deadline: "2024-11-30",
      //     category: "monthly",
      //     status: "on_track"
      //   },
      //   {
      //     id: "3",
      //     title: "New Customer Acquisition",
      //     target: 300000,
      //     current: 180000,
      //     deadline: "2024-12-15",
      //     category: "quarterly",
      //     status: "behind"
      //   },
      //   {
      //     id: "4",
      //     title: "Premium Products Sales",
      //     target: 200000,
      //     current: 210000,
      //     deadline: "2024-11-20",
      //     category: "monthly",
      //     status: "completed"
      //   }
      // ])
    } finally {
      setIsLoading(false)
    }
  }, [timeframe, dateRange, user?.id])

  useEffect(() => {
    fetchSalesReports()
  }, [fetchSalesReports])

  const handleRefresh = () => {
    fetchSalesReports()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const exportData = () => {
    toast.success('Sales report exported successfully')
  }

  if (isLoading && !reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your sales reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Sales Reports</h1>
          <p className="text-muted-foreground">
            Track your sales performance and customer insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter size={20} />
            Report Filters
          </CardTitle>
          <CardDescription>
            Customize your report view by selecting timeframe and date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <BarChart3 size={16} />
                Timeframe
              </label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {timeframe === "custom" && (
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar size={16} />
                  Date Range
                </label>
                <CalendarDateRangePicker
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-50 text-green-700">
                {user?.username || 'Sales Person'}
              </Badge>
              <Badge variant="outline">
                {timeframe === "custom"
                  ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                  : timeframe.charAt(0).toUpperCase() + timeframe.slice(1)
                }
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Content */}
      {reportData && (
        <div className="space-y-6">
          {/* Key Metrics */}
          {reportData.metrics && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(reportData.metrics.totalSales)}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {reportData.metrics.salesGrowth >= 0 ? (
                      <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                    )}
                    <span className={reportData.metrics.salesGrowth >= 0 ? "text-green-500" : "text-red-500"}>
                      {Math.abs(reportData.metrics.salesGrowth)}%
                    </span>
                    <span className="ml-1">from last period</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.metrics.totalOrders}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {reportData.metrics.ordersGrowth >= 0 ? (
                      <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                    )}
                    <span className={reportData.metrics.ordersGrowth >= 0 ? "text-green-500" : "text-red-500"}>
                      {Math.abs(reportData.metrics.ordersGrowth)}%
                    </span>
                    <span className="ml-1">from last period</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(reportData.metrics.averageOrderValue)}</div>
                  <p className="text-xs text-muted-foreground">
                    Per transaction
                  </p>
                </CardContent>
              </Card>

              {/* <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Team Ranking</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">#{reportData.metrics.rank}</div>
                  <p className="text-xs text-muted-foreground">
                    out of {reportData.metrics.totalSalespeople} sales people
                  </p>
                </CardContent>
              </Card> */}
            </div>
          )}

          {/* Target Progress */}
          {/* {reportData.metrics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target size={20} />
                  Monthly Target Progress
                </CardTitle>
                <CardDescription>
                  Track your progress towards monthly sales targets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Target: {formatCurrency(reportData.metrics.monthlyTarget)}
                    </span>
                    <span className="text-sm font-medium">
                      Current: {formatCurrency(reportData.metrics.totalSales)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(reportData.metrics.targetProgress, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>0%</span>
                    <span className="font-medium">{reportData.metrics.targetProgress}% Complete</span>
                    <span>100%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )} */}

          {/* Performance Chart */}
          {reportData.monthlyPerformance && (
            <SalesPerformanceChart data={reportData.monthlyPerformance} />
          )}

          {/* Recent Sales History */}
          {reportData.salesHistory && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart size={20} />
                  Recent Sales History
                </CardTitle>
                <CardDescription>
                  Your latest sales transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.salesHistory.slice(0, 5).map((sale, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{sale.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {sale.products.join(", ")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(sale.date).toLocaleDateString()} • {sale.orders} order(s)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(sale.amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sales Goals & Targets */}
          {/* <SalesGoals goals={salesGoals} /> */}

          {/* Two Column Layout */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Products */}
            {reportData.topProducts && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award size={20} />
                    Top Selling Products
                  </CardTitle>
                  <CardDescription>
                    Your best performing products
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.topProducts.map((product, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {product.productName} ({product.variant})
                          </span>
                          <span className="text-sm font-bold">
                            {formatCurrency(product.revenue)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${product.percentage}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{product.quantitySold} units sold</span>
                          <span>{product.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Customer Insights */}
            {reportData.customerInsights && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users size={20} />
                    Customer Insights
                  </CardTitle>
                  <CardDescription>
                    Your customer base overview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {reportData.customerInsights.totalCustomers}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Customers</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {reportData.customerInsights.newCustomers}
                        </div>
                        <div className="text-sm text-muted-foreground">New This Period</div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Top Customer</h4>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium">{reportData.customerInsights.topCustomer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Total Purchases: {formatCurrency(reportData.customerInsights.topCustomer.totalPurchases)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Customer Activity - Full Width */}
          {reportData.customerInsights && reportData.customerInsights.customerList && (
            <CustomerActivity customers={reportData.customerInsights.customerList} />
          )}
        </div>
      )}
    </div>
  )
}
