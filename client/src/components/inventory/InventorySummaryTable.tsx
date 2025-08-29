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

const inventorySummaryData = [
  {
    shop: "Shop A - Lagos Main",
    product: "Dangote 3X Cement",
    quantity: "6 bags",
    status: "Low Stock",
    lastUpdated: "2025-8-12"
  },
  {
    shop: "Shop B - Ikeja",
    product: "BUA Cement",
    quantity: "25 bags",
    status: "In Stock",
    lastUpdated: "2025-8-11"
  },
  {
    shop: "Shop C - Surulere",
    product: "Lafarge Elephant Cement",
    quantity: "0 bags",
    status: "Out of Stock",
    lastUpdated: "2025-8-10"
  }
]

export function InventorySummaryTable() {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Inventory Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shop</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventorySummaryData.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.shop}</TableCell>
                <TableCell>{item.product}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-500">{item.lastUpdated}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
