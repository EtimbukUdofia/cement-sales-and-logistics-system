import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const productsData = [
  {
    warehouseLocation: "Shop A - Lagos Main",
    product: "Dangote 3X Cement",
    quantity: "6 bags",
    price: "₦1000.05",
    totalPrice: "₦1000.05"
  },
  {
    warehouseLocation: "Shop B - Rumokoro PH",
    product: "Dangote Supaset",
    quantity: "36 bags",
    price: "₦1000.05",
    totalPrice: "₦1000.05"
  }
]

export function ProductsOrderedTable() {
  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Products Ordered
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-gray-200">
              <TableHead className="text-sm font-medium text-gray-700 px-6 py-3">
                Warehouse Location
              </TableHead>
              <TableHead className="text-sm font-medium text-gray-700 px-6 py-3">
                Product
              </TableHead>
              <TableHead className="text-sm font-medium text-gray-700 px-6 py-3">
                Quantity
              </TableHead>
              <TableHead className="text-sm font-medium text-gray-700 px-6 py-3">
                Price
              </TableHead>
              <TableHead className="text-sm font-medium text-gray-700 px-6 py-3">
                Total Price
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productsData.map((product, index) => (
              <TableRow key={index} className="border-b border-gray-100">
                <TableCell className="text-sm text-gray-900 px-6 py-4">
                  {product.warehouseLocation}
                </TableCell>
                <TableCell className="text-sm text-gray-900 px-6 py-4">
                  {product.product}
                </TableCell>
                <TableCell className="text-sm text-gray-900 px-6 py-4">
                  {product.quantity}
                </TableCell>
                <TableCell className="text-sm text-gray-900 px-6 py-4">
                  {product.price}
                </TableCell>
                <TableCell className="text-sm text-gray-900 px-6 py-4 font-medium">
                  {product.totalPrice}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
