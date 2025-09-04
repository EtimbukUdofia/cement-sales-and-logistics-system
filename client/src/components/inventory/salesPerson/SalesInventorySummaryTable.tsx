import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, AlertTriangle, XCircle } from 'lucide-react';
import type { InventoryData } from '@/lib/api';

interface SalesInventorySummaryTableProps {
  inventory: InventoryData[];
  isLoading?: boolean;
}

export function SalesInventorySummaryTable({ inventory, isLoading }: SalesInventorySummaryTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStockStatus = (quantity: number, minStockLevel: number) => {
    if (quantity === 0) {
      return { status: 'Out of Stock', variant: 'destructive' as const, icon: XCircle };
    } else if (quantity <= minStockLevel) {
      return { status: 'Low Stock', variant: 'secondary' as const, icon: AlertTriangle };
    }
    return { status: 'Good Stock', variant: 'default' as const, icon: Package };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-muted animate-pulse rounded" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-6 w-20 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (inventory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No inventory items found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total Value</TableHead>
              <TableHead>Last Restocked</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => {
              const stockStatus = getStockStatus(item.quantity, item.minStockLevel);
              const StatusIcon = stockStatus.icon;
              const totalValue = item.quantity * item.product.price;

              return (
                <TableRow key={item._id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-medium">{item.product.name}</div>
                      {item.product.variant && (
                        <div className="text-sm text-muted-foreground">
                          {item.product.variant}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{item.product.brand}</TableCell>
                  <TableCell>{item.product.size}kg</TableCell>
                  <TableCell>
                    <div className="text-center">
                      <div className="font-medium">{item.quantity}</div>
                      <div className="text-xs text-muted-foreground">
                        Min: {item.minStockLevel}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={stockStatus.variant}
                      className="flex items-center gap-1 w-fit"
                    >
                      <StatusIcon size={12} />
                      {stockStatus.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(item.product.price)}</TableCell>
                  <TableCell>{formatCurrency(totalValue)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.lastRestocked
                      ? formatDate(item.lastRestocked)
                      : 'Never'
                    }
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
