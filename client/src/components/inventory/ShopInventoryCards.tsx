import { Warehouse } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

const shopInventoryData = [
  {
    shopName: "Shop A - Lagos Main",
    location: "Victoria Island Lagos",
    products: [
      { name: "Dangote 3x Cement", quantity: "150 Bags", lastUpdated: "2024-1-13" },
      { name: "BUA Cement", quantity: "150 Bags", lastUpdated: "2024-1-13" },
      { name: "Dangote 3x Cement", quantity: "150 Bags", lastUpdated: "2024-1-13" }
    ],
    totalInventory: "1500 Bags"
  },
  {
    shopName: "Shop A - Lagos Main",
    location: "Victoria Island Lagos",
    products: [
      { name: "Dangote 3x Cement", quantity: "150 Bags", lastUpdated: "2024-1-13" },
      { name: "Dangote 3x Cement", quantity: "150 Bags", lastUpdated: "2024-1-13" },
      { name: "Dangote 3x Cement", quantity: "150 Bags", lastUpdated: "2024-1-13" }
    ],
    totalInventory: "1500 Bags"
  },
  {
    shopName: "Shop A - Lagos Main",
    location: "Victoria Island Lagos",
    products: [
      { name: "Dangote 3x Cement", quantity: "150 Bags", lastUpdated: "2024-1-13" },
      { name: "Dangote 3x Cement", quantity: "150 Bags", lastUpdated: "2024-1-13" },
      { name: "Dangote 3x Cement", quantity: "150 Bags", lastUpdated: "2024-1-13" }
    ],
    totalInventory: "1500 Bags"
  }
]

export function ShopInventoryCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {shopInventoryData.map((shop, index) => (
        <Card key={index} className="border border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <h3 className="font-semibold text-gray-900">{shop.shopName}</h3>
                  <p className="text-sm text-gray-500">{shop.location}</p>
                </div>
              </div>
              {/* <Button variant="ghost" size="sm">
                <MoreHorizontal size={16} />
              </Button> */}
              <Warehouse size={25} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {shop.products.map((product, productIndex) => (
              <div key={productIndex} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-500">Last updated {product.lastUpdated}</p>
                </div>
                <span className="text-sm font-semibold text-gray-700">{product.quantity}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="font-semibold text-gray-900">Total Inventory</span>
              <span className="font-bold text-gray-900">{shop.totalInventory}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
