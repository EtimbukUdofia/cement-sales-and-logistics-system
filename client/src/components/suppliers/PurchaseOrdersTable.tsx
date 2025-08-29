import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PurchaseOrder } from "@/data/suppliers";

interface PurchaseOrdersTableProps {
  orders: PurchaseOrder[];
}

export function PurchaseOrdersTable({ orders }: PurchaseOrdersTableProps) {
  const getStatusBadge = (status: PurchaseOrder['status']) => {
    const variants = {
      Completed: "bg-green-50 text-green-700 border-green-200",
      Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      Cancelled: "bg-red-50 text-red-700 border-red-200"
    };

    return (
      <Badge
        variant="secondary"
        className={`${variants[status]} font-medium`}
      >
        {status}
      </Badge>
    );
  };

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Recent Purchase Orders
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-gray-200">
              <TableHead className="text-sm font-medium text-gray-700 px-6 py-3">
                Transaction ID
              </TableHead>
              <TableHead className="text-sm font-medium text-gray-700 px-6 py-3">
                Supplier
              </TableHead>
              <TableHead className="text-sm font-medium text-gray-700 px-6 py-3">
                Product
              </TableHead>
              <TableHead className="text-sm font-medium text-gray-700 px-6 py-3">
                Quantity
              </TableHead>
              <TableHead className="text-sm font-medium text-gray-700 px-6 py-3">
                Price per bag
              </TableHead>
              <TableHead className="text-sm font-medium text-gray-700 px-6 py-3">
                Total
              </TableHead>
              <TableHead className="text-sm font-medium text-gray-700 px-6 py-3">
                Status
              </TableHead>
              <TableHead className="text-sm font-medium text-gray-700 px-6 py-3">
                Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order, index) => (
              <TableRow key={`${order.transactionId}-${index}`} className="border-b border-gray-100">
                <TableCell className="text-sm text-gray-900 px-6 py-4 font-medium">
                  {order.transactionId}
                </TableCell>
                <TableCell className="text-sm text-gray-900 px-6 py-4">
                  {order.supplier}
                </TableCell>
                <TableCell className="text-sm text-gray-900 px-6 py-4">
                  {order.product}
                </TableCell>
                <TableCell className="text-sm text-gray-900 px-6 py-4">
                  {order.quantity}
                </TableCell>
                <TableCell className="text-sm text-gray-900 px-6 py-4">
                  {order.pricePerBag}
                </TableCell>
                <TableCell className="text-sm text-gray-900 px-6 py-4 font-medium">
                  {order.total}
                </TableCell>
                <TableCell className="text-sm text-gray-900 px-6 py-4">
                  {getStatusBadge(order.status)}
                </TableCell>
                <TableCell className="text-sm text-gray-900 px-6 py-4">
                  {order.date}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
