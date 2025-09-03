import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Package, TrendingDown, TrendingUp } from "lucide-react"

interface InventoryReportsProps {
  data: {
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
}

export function InventoryReports({ data }: InventoryReportsProps) {

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package size={20} />
          Inventory Reports
        </CardTitle>
        <CardDescription>
          Stock levels, turnover rates, and inventory alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold">{data.totalProducts}</div>
            <div className="text-sm text-muted-foreground">Total Products</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{data.lowStockItems.length}</div>
            <div className="text-sm text-muted-foreground">Low Stock Items</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-red-600">{data.outOfStockItems.length}</div>
            <div className="text-sm text-muted-foreground">Out of Stock</div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        {data.lowStockItems.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-yellow-600" />
              Low Stock Alerts
            </h4>
            <div className="space-y-2">
              {data.lowStockItems.slice(0, 5).map((item, index) => {
                const percentage = Math.min((item.currentStock / item.minimumStock) * 100, 100)

                return (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-medium">{item.productName}</span>
                        <span className="text-sm text-muted-foreground ml-2">({item.variant})</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {item.shopName}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={percentage} className="flex-1" />
                      <span className="text-sm font-medium">
                        {item.currentStock}/{item.minimumStock}
                      </span>
                    </div>
                  </div>
                )
              })}
              {data.lowStockItems.length > 5 && (
                <div className="text-center text-sm text-muted-foreground">
                  +{data.lowStockItems.length - 5} more items
                </div>
              )}
            </div>
          </div>
        )}

        {/* Out of Stock Items */}
        {data.outOfStockItems.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-600" />
              Out of Stock Items
            </h4>
            <div className="grid gap-2">
              {data.outOfStockItems.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-md bg-red-50">
                  <div>
                    <span className="font-medium">{item.productName}</span>
                    <span className="text-sm text-muted-foreground ml-2">({item.variant})</span>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    {item.shopName}
                  </Badge>
                </div>
              ))}
              {data.outOfStockItems.length > 3 && (
                <div className="text-center text-sm text-muted-foreground">
                  +{data.outOfStockItems.length - 3} more items
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stock Turnover */}
        {data.stockTurnover.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Stock Turnover Rates</h4>
            <div className="space-y-2">
              {data.stockTurnover.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                  <div>
                    <span className="font-medium">{item.productName}</span>
                    <span className="text-sm text-muted-foreground ml-2">({item.variant})</span>
                    <Badge variant="outline" className="text-xs ml-2">
                      {item.shopName}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.turnoverRate > 5 ? (
                      <TrendingUp size={16} className="text-green-600" />
                    ) : (
                      <TrendingDown size={16} className="text-red-600" />
                    )}
                    <span className="font-medium">{item.turnoverRate.toFixed(1)}x</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
