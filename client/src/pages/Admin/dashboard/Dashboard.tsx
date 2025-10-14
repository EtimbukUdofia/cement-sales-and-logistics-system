import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"
import LoadingSpinner from "@/components/LoadingSpinner"
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  RefreshCw,
  ArrowUpIcon,
  ArrowDownIcon,
  Eye,
  BarChart3,
  PieChart,
  Calendar,
  Store
} from "lucide-react"

interface AdminDashboardMetrics {
  today: {
    sales: number;
    revenue: number;
    salesChange: number;
    revenueChange: number;
  };
  thisMonth: {
    sales: number;
    revenue: number;
    salesChange: number;
    revenueChange: number;
  };
  inventory: {
    totalProducts: number;
    totalQuantity: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
  };
  topSalesPeople: Array<{
    _id: string;
    salesPersonName: string;
    salesPersonEmail: string;
    totalSales: number;
    totalRevenue: number;
    avgOrderValue: number;
  }>;
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
    salesPerson: {
      username: string;
      email: string;
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
  orderStatuses: Array<{
    _id: string;
    count: number;
    totalValue: number;
  }>;
}

interface Shop {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  isActive: boolean;
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

const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
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

const getChangeIndicator = (change: number) => {
  if (change === 0) return { icon: null, color: 'text-muted-foreground', text: '0%' };
  if (change > 0) {
    return {
      icon: <ArrowUpIcon className="h-4 w-4" />,
      color: 'text-green-500',
      text: `+${Math.abs(change).toFixed(1)}%`
    };
  }
  return {
    icon: <ArrowDownIcon className="h-4 w-4" />,
    color: 'text-red-500',
    text: `-${Math.abs(change).toFixed(1)}%`
  };
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>('all');
  const [shopsLoading, setShopsLoading] = useState(true);

  const fetchShops = async () => {
    try {
      setShopsLoading(true);
      const response = await apiClient.getShops();
      if (response.success) {
        setShops(response.shops);
      } else {
        toast.error('Failed to load shops');
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
      toast.error('Failed to load shops');
    } finally {
      setShopsLoading(false);
    }
  };

  const fetchDashboardMetrics = useCallback(async () => {
    try {
      setRefreshing(true);
      const shopIdToSend = selectedShopId === 'all' ? undefined : selectedShopId;
      const response = await apiClient.getAdminDashboardMetrics(shopIdToSend);
      if (response.success) {
        setMetrics(response.data as AdminDashboardMetrics);
      } else {
        toast.error('Failed to load dashboard metrics');
      }
    } catch (error) {
      console.error('Error fetching admin dashboard metrics:', error);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedShopId]);

  const handleShopChange = (shopId: string) => {
    setSelectedShopId(shopId);
  };

  useEffect(() => {
    fetchShops();
    fetchDashboardMetrics();
  }, [fetchDashboardMetrics]);

  useEffect(() => {
    fetchDashboardMetrics();
  }, [fetchDashboardMetrics]);

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

  const todayChangeIndicator = getChangeIndicator(metrics.today.revenueChange);
  const monthlyChangeIndicator = getChangeIndicator(metrics.thisMonth.revenueChange);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-6 lg:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Dashboard</h2>
                <p className="text-muted-foreground">
                  Monitor your business performance and key metrics
                </p>
              </div>

              {/* Shop Filter */}
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedShopId} onValueChange={handleShopChange} disabled={shopsLoading}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder={shopsLoading ? "Loading shops..." : "Select shop..."} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Shops</SelectItem>
                    {shops.map((shop) => (
                      <SelectItem key={shop._id} value={shop._id}>
                        {shop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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

          {/* Context Indicator */}
          {selectedShopId !== 'all' && (
            <div className="px-4 sm:px-6 lg:px-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Viewing metrics for: {shops.find(shop => shop._id === selectedShopId)?.name || 'Selected Shop'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Key Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4 sm:px-6 lg:px-6">
            <StatCard
              description="Today's Sales"
              content={metrics.today.sales.toString()}
              icon={<ShoppingCart className="h-4 w-4" />}
              iconBgClassName="bg-blue-100 text-blue-600"
            />
            <Card className="relative">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Today's Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(metrics.today.revenue)}</p>
                  </div>
                  <div className={`flex items-center space-x-1 ${todayChangeIndicator.color}`}>
                    {todayChangeIndicator.icon}
                    <span className="text-sm font-medium">
                      {todayChangeIndicator.text}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">vs yesterday</p>
              </CardContent>
            </Card>
            <StatCard
              description="This Month's Sales"
              content={metrics.thisMonth.sales.toString()}
              icon={<Calendar className="h-4 w-4" />}
              iconBgClassName="bg-green-100 text-green-600"
            />
            <Card className="relative">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(metrics.thisMonth.revenue)}</p>
                  </div>
                  <div className={`flex items-center space-x-1 ${monthlyChangeIndicator.color}`}>
                    {monthlyChangeIndicator.icon}
                    <span className="text-sm font-medium">
                      {monthlyChangeIndicator.text}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">vs last month</p>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4 sm:px-6 lg:px-6">
            <StatCard
              description="Total Products"
              content={metrics.inventory.totalProducts.toString()}
              icon={<Package className="h-4 w-4" />}
              iconBgClassName="bg-purple-100 text-purple-600"
            />
            <StatCard
              description="Total Stock Value"
              content={formatCurrency(metrics.inventory.totalValue)}
              icon={<DollarSign className="h-4 w-4" />}
              iconBgClassName="bg-indigo-100 text-indigo-600"
            />
            <StatCard
              description="Low Stock Items"
              content={metrics.inventory.lowStockItems.toString()}
              icon={<AlertTriangle className="h-4 w-4" />}
              iconBgClassName={metrics.inventory.lowStockItems > 0 ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"}
            />
            <StatCard
              description="Out of Stock"
              content={metrics.inventory.outOfStockItems.toString()}
              icon={<AlertTriangle className="h-4 w-4" />}
              iconBgClassName={metrics.inventory.outOfStockItems > 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}
            />
          </div>

          {/* Main Content Tabs */}
          <div className="px-4 sm:px-6 lg:px-6">
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Top Sales People */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Top Sales People (This Month)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {metrics.topSalesPeople.length > 0 ? (
                        <div className="space-y-4">
                          {metrics.topSalesPeople.map((person, index) => (
                            <div key={person._id} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{person.salesPersonName}</p>
                                  <p className="text-xs text-muted-foreground">{person.salesPersonEmail}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-sm">{person.totalSales} sales</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatCurrency(person.totalRevenue)}
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
                        <p className="text-muted-foreground text-center py-4">No product data available</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                {/* Sales Trend Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Sales Trend (Last 30 Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      {/* Simple table view instead of complex chart */}
                      <div className="w-full">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead className="text-right">Sales</TableHead>
                              <TableHead className="text-right">Revenue</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {metrics.salesTrend.slice(-7).map((day) => (
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="inventory" className="space-y-4">
                {/* Inventory Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Store className="h-5 w-5 mr-2" />
                      Inventory Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Stock Health</p>
                          <p className="text-xs text-muted-foreground">
                            {metrics.inventory.totalProducts - metrics.inventory.lowStockItems - metrics.inventory.outOfStockItems} of {metrics.inventory.totalProducts} products in good stock
                          </p>
                        </div>
                        <div className="text-right">
                          <Progress
                            value={((metrics.inventory.totalProducts - metrics.inventory.lowStockItems - metrics.inventory.outOfStockItems) / metrics.inventory.totalProducts) * 100}
                            className="w-32"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">
                            {metrics.inventory.totalProducts - metrics.inventory.lowStockItems - metrics.inventory.outOfStockItems}
                          </p>
                          <p className="text-sm text-green-600">Good Stock</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <p className="text-2xl font-bold text-orange-600">{metrics.inventory.lowStockItems}</p>
                          <p className="text-sm text-orange-600">Low Stock</p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <p className="text-2xl font-bold text-red-600">{metrics.inventory.outOfStockItems}</p>
                          <p className="text-sm text-red-600">Out of Stock</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders" className="space-y-4">
                {/* Order Status Distribution */}
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <PieChart className="h-5 w-5 mr-2" />
                        Order Status Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {metrics.orderStatuses.length > 0 ? (
                        <div className="space-y-3">
                          {metrics.orderStatuses.map((status) => (
                            <div key={status._id} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Badge variant={getStatusBadgeVariant(status._id)}>
                                  {status._id}
                                </Badge>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-sm">{status.count} orders</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatCurrency(status.totalValue)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-4">No order data available</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Orders */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Recent Orders
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {metrics.recentOrders.length > 0 ? (
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {metrics.recentOrders.slice(0, 5).map((order) => (
                            <div key={order._id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                              <div className="space-y-1">
                                <p className="font-medium text-sm">#{order.orderNumber}</p>
                                <p className="text-xs text-muted-foreground">
                                  {order.customer.name} - {order.salesPerson.username}
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
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
