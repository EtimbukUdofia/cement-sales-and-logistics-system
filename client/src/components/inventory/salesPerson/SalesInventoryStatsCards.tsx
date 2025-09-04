import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, AlertTriangle, XCircle } from 'lucide-react';
import type { InventoryStatsData } from '@/lib/api';

interface SalesInventoryStatsCardsProps {
  stats: InventoryStatsData | null;
  isLoading?: boolean;
}

export function SalesInventoryStatsCards({ stats, isLoading }: SalesInventoryStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              </CardTitle>
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-1" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      description: 'Active products in inventory',
      icon: Package,
      color: 'text-blue-600',
    },
    {
      title: 'Total Quantity',
      value: `${stats?.totalQuantity || 0} bags`,
      description: 'Total bags in stock',
      icon: Package,
      color: 'text-green-600',
    },
    {
      title: 'Low Stock Items',
      value: stats?.lowStockItems || 0,
      description: 'Products below minimum level',
      icon: AlertTriangle,
      color: 'text-yellow-600',
    },
    {
      title: 'Out of Stock',
      value: stats?.outOfStockItems || 0,
      description: 'Products completely out of stock',
      icon: XCircle,
      color: 'text-red-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
