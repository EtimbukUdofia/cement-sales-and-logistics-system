import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useInventory } from "@/hooks/useInventory"
import { Package } from "lucide-react"

export function InventorySummaryTable() {
  const { inventory, isLoading } = useInventory()

  const getStatus = (quantity: number, minStockLevel: number) => {
    if (quantity === 0) return "Out of Stock"
    if (quantity <= minStockLevel) return "Low Stock"
    return "In Stock"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "Out of Stock":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Inventory Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Inventory Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {inventory.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No inventory data</h3>
            <p className="mt-1 text-sm text-gray-500">
              No products have been added to inventory yet.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shop</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.sort((a,b) => a.shop.name.localeCompare(b.shop.name)).map((item) => {
                const status = getStatus(item.quantity, item.minStockLevel)
                return (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{item.shop.name}</TableCell>
                    <TableCell>
                      {item.product.name}
                      {item.product.variant && ` (${item.product.variant})`}
                    </TableCell>
                    <TableCell>{item.product.brand}</TableCell>
                    <TableCell>{item.quantity} bags</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(status)}>
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
