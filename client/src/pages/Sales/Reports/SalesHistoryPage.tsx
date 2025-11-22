import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { CalendarDateRangePicker } from "@/components/reports"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"
import {
  Calendar,
  RefreshCw,
  Download,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Clock,
  AlertCircle,
  Flag,
  MoreVertical
} from "lucide-react"

interface SalesOrder {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
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
  items: Array<{
    product: {
      name: string;
      variant: string;
      brand: string;
      size: number;
    };
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  isDelivery?: boolean;
  onloadingCost?: number;
  deliveryCost?: number;
  offloadingCost?: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'pos' | 'transfer';
  status: 'Collected' | 'Not Collected' | 'Pending Correction';
  orderDate: string;
  deliveryDate?: string;
  deliveryAddress?: string;
  notes?: string;
  needsCorrection?: boolean;
  correctionNotes?: string;
}

interface SalesHistoryData {
  salesHistory: SalesOrder[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    period: string;
    startDate: string;
    endDate: string;
    status?: string;
    paymentMethod?: string;
    sortBy: string;
    sortOrder: string;
  };
}

interface DateRange {
  from: Date;
  to: Date;
}

export default function SalesHistoryPage() {
  const [period, setPeriod] = useState<string>("today")
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: new Date()
  })
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [sortBy, setSortBy] = useState<string>("orderDate")
  const [sortOrder, setSortOrder] = useState<string>("desc")
  const [isLoading, setIsLoading] = useState(false)
  const [salesData, setSalesData] = useState<SalesHistoryData | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null)
  const [flagDialogOpen, setFlagDialogOpen] = useState(false)
  const [orderToFlag, setOrderToFlag] = useState<SalesOrder | null>(null)
  const [correctionNotes, setCorrectionNotes] = useState('')

  const fetchSalesHistory = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        period,
        page: currentPage.toString(),
        limit: '20',
        sortBy,
        sortOrder
      })

      if (period === 'custom') {
        params.append('from', dateRange.from.toISOString())
        params.append('to', dateRange.to.toISOString())
      }

      if (statusFilter && statusFilter !== "all") {
        params.append('status', statusFilter)
      }

      if (paymentFilter && paymentFilter !== "all") {
        params.append('paymentMethod', paymentFilter)
      }

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim())
      }

      const response = await apiClient.getSalesHistory(params)
      if (response.success) {
        setSalesData(response.data as SalesHistoryData)
        if (searchTerm.trim()) {
          toast.success(`Found ${(response.data as SalesHistoryData).pagination.totalRecords} results for "${searchTerm.trim()}"`)
        }
      } else {
        toast.error('Failed to load sales history')
      }
    } catch {
      toast.error('Failed to load sales history')
    } finally {
      setIsLoading(false)
    }
  }, [period, dateRange, statusFilter, paymentFilter, searchTerm, currentPage, sortBy, sortOrder])

  useEffect(() => {
    fetchSalesHistory()
  }, [fetchSalesHistory])

  const handleRefresh = () => {
    fetchSalesHistory()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Collected':
        return 'bg-green-100 text-green-800'
      case 'Not Collected':
        return 'bg-orange-100 text-orange-800'
      case 'Pending Correction':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return '💵'
      case 'pos':
        return '💳'
      case 'transfer':
        return '🏦'
      default:
        return '💰'
    }
  }

  const handleFlagForCorrection = async () => {
    if (!orderToFlag || !correctionNotes.trim()) {
      toast.error('Please provide correction notes')
      return
    }

    try {
      const response = await apiClient.put(`/sales-orders/${orderToFlag._id}/flag-correction`, {
        correctionNotes: correctionNotes.trim()
      })

      if (response.success) {
        toast.success('Order flagged for correction successfully')
        setFlagDialogOpen(false)
        setOrderToFlag(null)
        setCorrectionNotes('')
        fetchSalesHistory()
      } else {
        toast.error('Failed to flag order for correction')
      }
    } catch {
      toast.error('Failed to flag order for correction')
    }
  }

  const exportData = () => {
    if (!salesData) return

    const csvData = salesData.salesHistory.map(order => ({
      'Order Number': order.orderNumber,
      'Date': formatDateTime(order.orderDate),
      'Customer': order.customer.name,
      'Company': order.customer.company,
      'Items': order.items.map(item => `${item.product.name} (${item.quantity})`).join('; '),
      'Total Amount': order.totalAmount,
      'Payment Method': order.paymentMethod,
      'Status': order.status,
      'Sales Person': order.salesPerson.username
    }))

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales-history-${period}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast.success('Sales history exported successfully')
  }

  if (isLoading && !salesData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading sales history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Sales History</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            View and search sales transaction history
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading} className="w-full sm:w-auto">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportData} disabled={!salesData} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter size={20} />
            Filters & Search
          </CardTitle>
          <CardDescription>
            Filter and search sales transaction records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Calendar size={16} />
                Period
              </Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="last_week">Last Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {period === "custom" && (
              <div className="sm:col-span-2 lg:col-span-1">
                <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar size={16} />
                  Date Range
                </Label>
                <CalendarDateRangePicker
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                />
              </div>
            )}

            <div>
              <Label className="text-sm font-medium mb-2">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Collected">Collected</SelectItem>
                  <SelectItem value="Not Collected">Not Collected</SelectItem>
                  <SelectItem value="Pending Correction">Pending Correction</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2">Payment Method</Label>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="pos">POS</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <Label className="text-sm font-medium mb-2 flex items-center gap-2">
              <Search size={16} />
              Search Orders
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Search by order number, customer name, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setCurrentPage(1)
                    fetchSalesHistory()
                  }
                }}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentPage(1)
                  fetchSalesHistory()
                }}
                disabled={isLoading}
                className="shrink-0"
              >
                <Search size={16} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales History Table */}
      {salesData && (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText size={20} />
                  Sales Transactions
                </CardTitle>
                <CardDescription>
                  {salesData.pagination.totalRecords} total records found
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="orderDate">Order Date</SelectItem>
                    <SelectItem value="totalAmount">Amount</SelectItem>
                    <SelectItem value="customer.name">Customer</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="w-full sm:w-auto"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">Order #</TableHead>
                      <TableHead className="min-w-[160px]">Date & Time</TableHead>
                      <TableHead className="min-w-[140px]">Customer</TableHead>
                      <TableHead className="min-w-[100px]">Items</TableHead>
                      <TableHead className="min-w-[100px]">Payment</TableHead>
                      <TableHead className="min-w-[120px]">Amount</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesData.salesHistory.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-muted-foreground" />
                            <span className="text-sm">
                              {formatDateTime(order.orderDate)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium truncate max-w-[120px]">{order.customer.name}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-[120px]">{order.customer.company}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {order.items.length} item{order.items.length > 1 ? 's' : ''}
                            <p className="text-xs text-muted-foreground">
                              {order.items.reduce((sum, item) => sum + item.quantity, 0)} units
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{getPaymentMethodIcon(order.paymentMethod)}</span>
                            <span className="text-sm capitalize">{order.paymentMethod}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold">
                          {formatCurrency(order.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                                <Eye size={16} className="mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {!order.needsCorrection && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setOrderToFlag(order)
                                    setFlagDialogOpen(true)
                                  }}
                                >
                                  <Flag size={16} className="mr-2" />
                                  Flag for Correction
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-4">
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                Showing {((salesData.pagination.currentPage - 1) * salesData.pagination.limit) + 1} to{' '}
                {Math.min(salesData.pagination.currentPage * salesData.pagination.limit, salesData.pagination.totalRecords)}{' '}
                of {salesData.pagination.totalRecords} results
              </div>
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!salesData.pagination.hasPrev}
                  className="flex-1 sm:flex-none"
                >
                  <ChevronLeft size={16} />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
                <span className="text-sm px-2">
                  Page {salesData.pagination.currentPage} of {salesData.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!salesData.pagination.hasNext}
                  className="flex-1 sm:flex-none"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg sm:text-xl">Order Details - {selectedOrder.orderNumber}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedOrder.needsCorrection && selectedOrder.correctionNotes && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-red-900">Correction Needed</p>
                      <p className="text-sm text-red-800 mt-1">{selectedOrder.correctionNotes}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Customer</Label>
                  <p className="text-sm">{selectedOrder.customer.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedOrder.customer.company}</p>
                  <p className="text-xs text-muted-foreground">{selectedOrder.customer.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Shop</Label>
                  <p className="text-sm">{selectedOrder.shop.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedOrder.shop.location}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Items Ordered</Label>
                <div className="mt-2 space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.product.name} - {item.product.variant}</p>
                        <p className="text-xs text-muted-foreground">{item.product.brand} • {item.product.size}kg</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-medium">{item.quantity} × {formatCurrency(item.unitPrice)}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(item.totalPrice)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Payment Method</Label>
                  <div className="flex items-center gap-2">
                    <span>{getPaymentMethodIcon(selectedOrder.paymentMethod)}</span>
                    <span className="text-sm capitalize">{selectedOrder.paymentMethod}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusBadgeColor(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                </div>
              )}

              {selectedOrder.isDelivery && (
                <div className="border rounded-lg p-4 bg-blue-50">
                  <Label className="text-sm font-medium text-blue-900">Delivery Charges</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-800">Onloading:</span>
                      <span className="font-medium text-blue-900">{formatCurrency(selectedOrder.onloadingCost || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-800">Delivery:</span>
                      <span className="font-medium text-blue-900">{formatCurrency(selectedOrder.deliveryCost || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-800">Offloading:</span>
                      <span className="font-medium text-blue-900">{formatCurrency(selectedOrder.offloadingCost || 0)}</span>
                    </div>
                    <div className="pt-2 border-t border-blue-200 flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-900">Total Delivery Charges:</span>
                      <span className="font-semibold text-blue-900">
                        {formatCurrency((selectedOrder.onloadingCost || 0) + (selectedOrder.deliveryCost || 0) + (selectedOrder.offloadingCost || 0))}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                {selectedOrder.isDelivery && (
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal (Products):</span>
                      <span>{formatCurrency(selectedOrder.totalAmount - ((selectedOrder.onloadingCost || 0) + (selectedOrder.deliveryCost || 0) + (selectedOrder.offloadingCost || 0)))}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Delivery Charges:</span>
                      <span>{formatCurrency((selectedOrder.onloadingCost || 0) + (selectedOrder.deliveryCost || 0) + (selectedOrder.offloadingCost || 0))}</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Flag for Correction Dialog */}
      {flagDialogOpen && orderToFlag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Flag size={20} className="text-orange-600" />
                  Flag Order for Correction
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFlagDialogOpen(false)
                    setOrderToFlag(null)
                    setCorrectionNotes('')
                  }}
                >
                  ✕
                </Button>
              </div>
              <CardDescription>
                Order: {orderToFlag.orderNumber}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Customer</Label>
                <p className="text-sm">{orderToFlag.customer.name}</p>
                <p className="text-xs text-muted-foreground">{orderToFlag.customer.company}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Order Details</Label>
                <div className="text-sm space-y-1">
                  <p>Total: <span className="font-bold">{formatCurrency(orderToFlag.totalAmount)}</span></p>
                  <p>Status: <Badge className={getStatusBadgeColor(orderToFlag.status)}>{orderToFlag.status}</Badge></p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Correction Notes *</Label>
                <Textarea
                  placeholder="Describe what needs to be corrected..."
                  value={correctionNotes}
                  onChange={(e) => setCorrectionNotes(e.target.value)}
                  rows={4}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Please provide detailed information about what needs to be corrected
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFlagDialogOpen(false)
                    setOrderToFlag(null)
                    setCorrectionNotes('')
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFlagForCorrection}
                  disabled={!correctionNotes.trim()}
                  className="flex-1"
                >
                  <Flag size={16} className="mr-2" />
                  Flag Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
