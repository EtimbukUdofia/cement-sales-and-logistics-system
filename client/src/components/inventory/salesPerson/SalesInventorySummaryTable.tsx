import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface InventoryItem {
  id: string
  shop: string
  product: string
  quantity: string
  status: 'Good Stock' | 'Low Stock' | 'Out of Stock'
  lastUpdated: string
}

// Mock data - this would come from your API
const inventoryData: InventoryItem[] = [
  {
    id: '1',
    shop: 'Shop A - Lagos Main',
    product: 'Dangote 3X Cement',
    quantity: '6 bags',
    status: 'Good Stock',
    lastUpdated: '2025 - 8 - 12'
  },
  {
    id: '2',
    shop: 'Shop A - Lagos Main',
    product: 'Dangote 3X Cement',
    quantity: '6 bags',
    status: 'Good Stock',
    lastUpdated: '2025 - 8 - 12'
  }
]

function getStatusBadge(status: string) {
  switch (status) {
    case 'Good Stock':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{status}</Badge>
    case 'Low Stock':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{status}</Badge>
    case 'Out of Stock':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{status}</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export function SalesInventorySummaryTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Shop</TableHead>
              <TableHead className="text-muted-foreground font-medium">Product</TableHead>
              <TableHead className="text-muted-foreground font-medium">Quantity</TableHead>
              <TableHead className="text-muted-foreground font-medium">Status</TableHead>
              <TableHead className="text-muted-foreground font-medium">Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventoryData.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{item.shop}</TableCell>
                <TableCell>{item.product}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell className="text-muted-foreground">{item.lastUpdated}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
