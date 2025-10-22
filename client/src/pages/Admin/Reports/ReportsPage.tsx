import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  CalendarDateRangePicker,
  RevenueMetrics,
  SalesOverviewChart,
  ProductPerformanceChart,
  InventoryReports,
  SalesPersonPerformance,
  ShopComparison,
  ExportReports
} from "@/components/reports"
import { apiClient, type ShopData } from "@/lib/api"
import { toast } from "sonner"
import {
  BarChart3,
  Filter,
  Calendar,
  RefreshCw
} from "lucide-react"

interface Shop {
  _id: string
  name: string
  location: string
  manager: string
}

interface ReportData {
  revenue?: {
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
  salesOverview?: Array<{
    date: string
    revenue: number
    orders: number
  }>
  productPerformance?: Array<{
    productName: string
    variant: string
    revenue: number
    quantity: number
    orders: number
  }>
  inventory?: {
    totalProducts: number
    lowStockItems: Array<{
      productName: string
      variant: string
      currentStock: number
      minimumStock: number
      shopName: string
    }>
    outOfStockItems: Array<{
      productName: string
      variant: string
      shopName: string
    }>
    topStockItems: Array<{
      productName: string
      variant: string
      currentStock: number
      shopName: string
    }>
    stockTurnover: Array<{
      productName: string
      variant: string
      turnoverRate: number
      shopName: string
    }>
  }
  salesPersonPerformance?: Array<{
    id: string
    name: string
    email: string
    shopName: string
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    revenueGrowth: number
    ordersGrowth: number
    performanceScore: number
    rank: number
  }>
  shopComparison?: Array<{
    shopId: string
    shopName: string
    location: string
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    revenueGrowth: number
    ordersGrowth: number
    topProduct: string
    salesPersonCount: number
    inventoryValue: number
    performanceScore: number
  }>
}

interface DateRange {
  from: Date
  to: Date
}

export default function ReportsPage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [selectedShop, setSelectedShop] = useState<string>("all")
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  })
  const [isLoading, setIsLoading] = useState(false)
  const [reportData, setReportData] = useState<ReportData | null>(null)

  const fetchReports = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        shop: selectedShop,
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString()
      })

      const response = await apiClient.getReports(params)

      if (response.success) {
        setReportData(response.data as ReportData)
        toast.success('Reports loaded successfully')
      } else {
        toast.error(response.message || 'Failed to load reports')
      }
    } catch (error) {
      console.error('Reports fetch error:', error)
      toast.error('Failed to load reports')
    } finally {
      setIsLoading(false)
    }
  }, [selectedShop, dateRange])

  const fetchShops = async () => {
    try {
      const response = await apiClient.getShops()
      if (response.success) {
        // Normalize API shop shape to local Shop type (ensure manager is a string)
        const normalizedShops = (response?.shops || []).map((s: ShopData) => ({
          _id: s._id,
          name: s.name,
          location: s.address, // Use address as location
          // manager can be a string or an object from the API; prefer username, then email, then fallback to empty string
          manager:
            typeof s.manager === "string"
              ? s.manager
              : s.manager?.username ?? s.manager?.email ?? ""
        }))
        setShops(normalizedShops)
      }
    } catch {
      toast.error('Failed to load shops')
      // Set mock shops for development
      setShops([
        { _id: "1", name: "Main Shop", location: "Lagos", manager: "John Doe" },
        { _id: "2", name: "Branch 1", location: "Abuja", manager: "Jane Smith" },
        { _id: "3", name: "Branch 2", location: "Port Harcourt", manager: "Mike Johnson" }
      ])
    }
  }

  useEffect(() => {
    fetchShops()
  }, [])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const handleRefresh = () => {
    fetchReports()
  }

  const getSelectedShopName = () => {
    if (selectedShop === "all") return "All Shops"
    const shop = shops.find(s => s._id === selectedShop)
    return shop?.name || "Unknown Shop"
  }

  if (isLoading && !reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive business insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <ExportReports
            reportData={reportData}
            shopName={getSelectedShopName()}
            dateRange={dateRange}
          />
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
            Customize your report view by selecting shop and date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <BarChart3 size={16} />
                Shop
              </label>
              <Select value={selectedShop} onValueChange={setSelectedShop}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a shop" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shops</SelectItem>
                  {shops.map((shop) => (
                    <SelectItem key={shop._id} value={shop._id}>
                      {shop.name} - {shop.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                {getSelectedShopName()}
              </Badge>
              <Badge variant="outline">
                {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Content */}
      {reportData && (
        <div className="space-y-6">
          {/* Revenue Metrics */}
          <RevenueMetrics data={reportData.revenue!} />

          {/* Charts Section */}
          <div className="grid gap-6 md:grid-cols-2">
            <SalesOverviewChart data={reportData.salesOverview || []} />
            <ProductPerformanceChart data={reportData.productPerformance || []} />
          </div>

          {/* Additional Reports */}
          <div className="grid gap-6 md:grid-cols-2">
            <InventoryReports data={reportData.inventory!} />
            <SalesPersonPerformance data={reportData.salesPersonPerformance || []} />
          </div>

          {/* Shop Comparison (only show for "All Shops") */}
          {selectedShop === "all" && (
            <div>
              <Separator className="my-6" />
              <ShopComparison data={reportData.shopComparison!} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
