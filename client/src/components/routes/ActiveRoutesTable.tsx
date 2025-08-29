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

const activeRoutesData = [
  {
    routeId: "#TXN1001",
    from: "Dangote Railway Terminal",
    to: "Shop A - Lagos Main",
    product: "Dangote Cement",
    quantity: "25 Bags",
    driver: "Ahmed M",
    status: "Delivered",
    date: "2025-8-12"
  },
  {
    routeId: "#TXN1001",
    from: "Dangote Railway Terminal",
    to: "Shop A - Lagos Main",
    product: "Dangote Cement",
    quantity: "25 Bags",
    driver: "Ahmed M",
    status: "Delivered",
    date: "2025-8-12"
  }
]

export function ActiveRoutesTable() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "In Transit":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "Pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "Failed":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Active Routes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Route ID</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeRoutesData.map((route, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium text-blue-600">{route.routeId}</TableCell>
                <TableCell>{route.from}</TableCell>
                <TableCell>{route.to}</TableCell>
                <TableCell>{route.product}</TableCell>
                <TableCell>{route.quantity}</TableCell>
                <TableCell>{route.driver}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(route.status)}>
                    {route.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-500">{route.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
