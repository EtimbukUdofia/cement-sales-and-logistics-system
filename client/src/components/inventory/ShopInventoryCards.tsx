import { Warehouse, Package } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useInventory } from "@/hooks/useInventory"

export function ShopInventoryCards() {
  const { inventorySummary, inventory, isLoading } = useInventory()

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-64 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  // Group inventory by shop for detailed product info
  const inventoryByShop = inventory.reduce((acc, item) => {
    const shopId = item.shop._id
    if (!acc[shopId]) {
      acc[shopId] = []
    }
    acc[shopId].push(item)
    return acc
  }, {} as Record<string, typeof inventory>)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {inventorySummary.length === 0 ? (
        <div className="col-span-full text-center py-8">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No inventory data</h3>
          <p className="mt-1 text-sm text-gray-500">No shops have been set up with inventory yet.</p>
        </div>
      ) : (
        inventorySummary.map((shop) => {
          const shopInventoryItems = inventoryByShop[shop.shopId] || []

          return (
            <Card key={shop.shopId} className="border border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${shop.lowStockCount > 0 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{shop.shopName}</h3>
                      <p className="text-sm text-gray-500">{shop.shopLocation}</p>
                    </div>
                  </div>
                  <Warehouse size={25} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {shopInventoryItems.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No products in inventory</p>
                  </div>
                ) : (
                  shopInventoryItems.slice(0, 3).map((item) => (
                    <div key={item._id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.product.name} {item.product.variant && `(${item.product.variant})`}
                        </p>
                        <p className="text-xs text-gray-500">
                          Last updated {new Date(item.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-sm font-semibold ${item.quantity <= item.minStockLevel ? 'text-red-600' : 'text-gray-700'}`}>
                        {item.quantity} Bags
                      </span>
                    </div>
                  ))
                )}
                {shopInventoryItems.length > 3 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{shopInventoryItems.length - 3} more products
                  </p>
                )}
                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="font-semibold text-gray-900">Total Items</span>
                  <span className="font-bold text-gray-900">{shop.totalItems} Bags</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total Value</span>
                  <span className="font-bold text-gray-900">₦{shop.totalValue.toLocaleString()}</span>
                </div>
                {shop.lowStockCount > 0 && (
                  <div className="flex justify-between items-center text-red-600">
                    <span className="font-semibold text-sm">Low Stock Items</span>
                    <span className="font-bold text-sm">{shop.lowStockCount}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}
