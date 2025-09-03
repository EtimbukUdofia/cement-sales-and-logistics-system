import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Store, TrendingUp, TrendingDown, MapPin } from "lucide-react"

interface ShopComparisonProps {
  data: Array<{
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

export function ShopComparison({ data }: ShopComparisonProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'bg-green-500', textColor: 'text-green-700' }
    if (score >= 80) return { label: 'Good', color: 'bg-blue-500', textColor: 'text-blue-700' }
    if (score >= 70) return { label: 'Average', color: 'bg-yellow-500', textColor: 'text-yellow-700' }
    return { label: 'Needs Improvement', color: 'bg-red-500', textColor: 'text-red-700' }
  }

  // Sort shops by performance score
  const sortedShops = [...data].sort((a, b) => b.performanceScore - a.performanceScore)
  const maxRevenue = Math.max(...data.map(shop => shop.totalRevenue))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store size={20} />
          Shop Performance Comparison
        </CardTitle>
        <CardDescription>
          Comparative analysis of all shop locations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold">{data.length}</div>
            <div className="text-sm text-muted-foreground">Total Shops</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold">
              {formatCurrency(data.reduce((sum, shop) => sum + shop.totalRevenue, 0))}
            </div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold">
              {data.reduce((sum, shop) => sum + shop.totalOrders, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Orders</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold">
              {data.reduce((sum, shop) => sum + shop.salesPersonCount, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Sales Personnel</div>
          </div>
        </div>

        {/* Shop Performance Cards */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Shop Performance Rankings</h4>
          <div className="grid gap-4">
            {sortedShops.map((shop, index) => {
              const performance = getPerformanceLevel(shop.performanceScore)
              const revenuePercentage = (shop.totalRevenue / maxRevenue) * 100

              return (
                <div key={shop.shopId} className="p-6 border rounded-lg">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                        #{index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold">{shop.shopName}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin size={12} />
                          {shop.location}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className={performance.textColor}>
                      {performance.label}
                    </Badge>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid gap-4 md:grid-cols-3 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Revenue</div>
                      <div className="font-semibold text-lg">{formatCurrency(shop.totalRevenue)}</div>
                      <div className="flex items-center gap-1 mt-1">
                        {shop.revenueGrowth >= 0 ? (
                          <TrendingUp size={12} className="text-green-600" />
                        ) : (
                          <TrendingDown size={12} className="text-red-600" />
                        )}
                        <span className={`text-xs ${shop.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {Math.abs(shop.revenueGrowth).toFixed(1)}% vs last period
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground">Orders</div>
                      <div className="font-semibold text-lg">{shop.totalOrders}</div>
                      <div className="flex items-center gap-1 mt-1">
                        {shop.ordersGrowth >= 0 ? (
                          <TrendingUp size={12} className="text-green-600" />
                        ) : (
                          <TrendingDown size={12} className="text-red-600" />
                        )}
                        <span className={`text-xs ${shop.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {Math.abs(shop.ordersGrowth).toFixed(1)}% vs last period
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground">Avg Order Value</div>
                      <div className="font-semibold text-lg">{formatCurrency(shop.averageOrderValue)}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {shop.salesPersonCount} sales personnel
                      </div>
                    </div>
                  </div>

                  {/* Performance Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Performance Score</span>
                      <span className="font-medium">{shop.performanceScore}%</span>
                    </div>
                    <Progress value={shop.performanceScore} className="h-2" />
                  </div>

                  {/* Additional Info */}
                  <div className="grid gap-4 md:grid-cols-2 mt-4 pt-4 border-t">
                    <div>
                      <div className="text-sm text-muted-foreground">Top Product</div>
                      <div className="font-medium">{shop.topProduct}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Inventory Value</div>
                      <div className="font-medium">{formatCurrency(shop.inventoryValue)}</div>
                    </div>
                  </div>

                  {/* Revenue Comparison Bar */}
                  <div className="mt-4">
                    <div className="text-xs text-muted-foreground mb-1">Revenue vs Top Performer</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${revenuePercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
