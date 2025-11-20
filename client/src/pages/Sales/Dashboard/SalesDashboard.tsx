import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"
import LoadingSpinner from "@/components/LoadingSpinner"
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Calendar,
  Package,
  Users,
  RefreshCw,
  Eye
} from "lucide-react"

interface DashboardMetrics {
  today: {
    sales: number;
    revenue: number;
    cash: number;
    salesChange: number;
    revenueChange: number;
  };
  thisWeek: {
    sales: number;
    revenue: number;
  };
  thisMonth: {
    sales: number;
    revenue: number;
  };
  topProducts: Array<{
    _id: string;
    productName: string;
    brand: string;
    variant: string;
    size: number;
    totalQuantity: number;
    totalRevenue: number;
    orderCount: number;
  }>;
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    customer: {
      name: string;
      company: string;
    };
    shop: {
      name: string;
      location: string;
    };
    totalAmount: number;
    status: string;
    orderDate: string;
  }>;
  salesTrend: Array<{
    date: string;
    sales: number;
    revenue: number;
  }>;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'processing':
      return 'outline';
    case 'cancelled':
      return 'destructive';
    default:
      return 'secondary';
  }
};

export default function SalesDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardMetrics = async () => {
    try {
      setRefreshing(true);
      const response = await apiClient.getDashboardMetrics();
      if (response.success) {
        setMetrics(response.data as DashboardMetrics);
      } else {
        toast.error('Failed to load dashboard metrics');
      }
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!metrics) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load dashboard data</p>
          <Button onClick={fetchDashboardMetrics} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Dashboard</h1>
          <p className="text-muted-foreground">
            Track your sales performance and key metrics
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchDashboardMetrics}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Today's Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          description="Today's Sales"
          content={metrics.today.sales.toString()}
          icon={<ShoppingCart size={28} />}
          iconBgClassName="bg-blue-100 text-blue-600"
        />
        {/* <Card className="relative">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.today.revenue)}</p>
              </div>
              <div className="flex items-center space-x-1">
                {metrics.today.revenueChange >= 0 ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${metrics.today.revenueChange >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                  {Math.abs(metrics.today.revenueChange)}%
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              vs yesterday
            </p>
          </CardContent>
        </Card> */}
        <StatCard 
          description="Today's Revenue"
          content={formatCurrency(metrics.today.revenue)}
          icon={<DollarSign size={28} />}
          iconBgClassName="bg-yellow-100 text-yellow-600"
        />
        <StatCard 
          description="Today's Cash Sales"
          content={formatCurrency(metrics.today.cash)}
          icon={<DollarSign size={28} />}
          iconBgClassName="bg-yellow-100 text-yellow-600"
        />
        <StatCard
          description="This Week's Sales"
          content={metrics.thisWeek.sales.toString()}
          icon={<Calendar size={28} />}
          iconBgClassName="bg-green-100 text-green-600"
        />
        <StatCard
          description="This Month's Revenue"
          content={formatCurrency(metrics.thisMonth.revenue)}
          icon={<DollarSign size={28} />}
          iconBgClassName="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Top Products (This Month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.topProducts.length > 0 ? (
              <div className="space-y-4">
                {metrics.topProducts.map((product, index) => (
                  <div key={product._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.brand} - {product.variant} ({product.size}kg)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{product.totalQuantity} bags</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(product.totalRevenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No sales data available</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {metrics.recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">#{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.customer.name} - {order.customer.company}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusBadgeVariant(order.status)} className="text-xs">
                          {order.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(order.orderDate)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatCurrency(order.totalAmount)}</p>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No recent orders</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sales Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Sales Trend (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.salesTrend.map((day) => (
                <TableRow key={day.date}>
                  <TableCell>
                    {new Date(day.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </TableCell>
                  <TableCell className="text-right font-medium">{day.sales}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(day.revenue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}