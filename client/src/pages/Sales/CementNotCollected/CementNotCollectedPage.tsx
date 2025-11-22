import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"
import { useShop } from "@/hooks/useShop"
import {
  RefreshCw,
  Package,
  Clock,
  Eye,
  CheckCircle,
  // AlertCircle,
  DollarSign,
  PackageCheck
} from "lucide-react"

interface SalesOrder {
  _id: string
  orderNumber: string
  customer: {
    name: string
    email: string
    phone: string
    company: string
  }
  shop: {
    name: string
    location: string
  }
  salesPerson: {
    username: string
    email: string
  }
  items: Array<{
    product: {
      _id: string
      name: string
      variant: string
      brand: string
      size: number
    }
    quantity: number
    unitPrice: number
    totalPrice: number
    collectedQuantity?: number
  }>
  isDelivery?: boolean
  onloadingCost?: number
  deliveryCost?: number
  offloadingCost?: number
  totalAmount: number
  paymentMethod: 'cash' | 'pos' | 'transfer'
  status: string
  orderDate: string
  notes?: string
}

interface NotCollectedData {
  orders: SalesOrder[]
  totalCount: number
  totalBags: number
  totalValue: number
}

export default function CementNotCollectedPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<NotCollectedData | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null)
  const [partialCollectionMode, setPartialCollectionMode] = useState(false)
  const [collectingQuantities, setCollectingQuantities] = useState<Record<string, number>>({})
  const { currentShop } = useShop()

  const fetchNotCollectedOrders = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (currentShop?._id) {
        params.append('shopId', currentShop._id)
      }

      const response = await apiClient.get(`/sales-orders/not-collected?${params.toString()}`)
      if (response.success) {
        setData({
          orders: response.orders as SalesOrder[],
          totalCount: response.totalCount as number,
          totalBags: response.totalBags as number,
          totalValue: response.totalValue as number
        })
      } else {
        toast.error('Failed to load not collected orders')
      }
    } catch {
      toast.error('Failed to load not collected orders')
    } finally {
      setIsLoading(false)
    }
  }, [currentShop])

  useEffect(() => {
    fetchNotCollectedOrders()
  }, [fetchNotCollectedOrders])

  const handleMarkAsCollected = async (orderId: string) => {
    try {
      const response = await apiClient.put(`/sales-orders/${orderId}/status`, {
        status: 'Collected'
      })

      if (response.success) {
        toast.success('Order marked as collected')
        fetchNotCollectedOrders()
        setSelectedOrder(null)
      } else {
        toast.error('Failed to update order status')
      }
    } catch {
      toast.error('Failed to update order status')
    }
  }

  // const handleFlagForCorrection = async (orderId: string) => {
  //   const correctionNotes = prompt('Please describe what needs to be corrected:')

  //   if (!correctionNotes || correctionNotes.trim() === '') {
  //     toast.error('Correction notes are required')
  //     return
  //   }

  //   try {
  //     const response = await apiClient.put(`/sales-orders/${orderId}/flag-correction`, {
  //       correctionNotes: correctionNotes.trim()
  //     })

  //     if (response.success) {
  //       toast.success('Order flagged for correction')
  //       fetchNotCollectedOrders()
  //       setSelectedOrder(null)
  //     } else {
  //       toast.error('Failed to flag order')
  //     }
  //   } catch {
  //     toast.error('Failed to flag order')
  //   }
  // }

  const handlePartialCollection = async () => {
    if (!selectedOrder) return

    const collections = Object.entries(collectingQuantities)
      .filter(([, qty]) => qty > 0)
      .map(([productId, quantityCollected]) => ({
        productId,
        quantityCollected
      }))

    if (collections.length === 0) {
      toast.error('Please enter quantities to collect')
      return
    }

    try {
      const response = await apiClient.put(`/sales-orders/${selectedOrder._id}/partial-collection`, {
        collections
      })

      if (response.success) {
        toast.success(response.message || 'Collection recorded successfully')
        fetchNotCollectedOrders()
        setSelectedOrder(null)
        setPartialCollectionMode(false)
        setCollectingQuantities({})
      } else {
        toast.error('Failed to record collection')
      }
    } catch {
      toast.error('Failed to record collection')
    }
  }

  const initializeCollectionQuantities = (order: SalesOrder) => {
    const quantities: Record<string, number> = {}
    order.items.forEach(item => {
      const remaining = item.quantity - (item.collectedQuantity || 0)
      quantities[item.product._id] = remaining
    })
    setCollectingQuantities(quantities)
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

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading cement not collected...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Cement Not Collected</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Track orders pending cement collection
          </p>
        </div>
        <Button variant="outline" onClick={fetchNotCollectedOrders} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      {data && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalCount}</div>
              <p className="text-xs text-muted-foreground">Pending collection</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bags</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalBags}</div>
              <p className="text-xs text-muted-foreground">Bags not collected</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data.totalValue)}</div>
              <p className="text-xs text-muted-foreground">Pending collection</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Orders Table */}
      {data && data.orders.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} />
              Not Collected Orders
            </CardTitle>
            <CardDescription>
              {data.totalCount} orders awaiting cement collection
            </CardDescription>
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
                      <TableHead className="min-w-[100px]">Bags</TableHead>
                      <TableHead className="min-w-[120px]">Amount</TableHead>
                      <TableHead className="min-w-[100px]">Payment</TableHead>
                      <TableHead className="min-w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.orders.map((order) => (
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
                            <p className="text-sm text-muted-foreground truncate max-w-[120px]">{order.customer.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {order.items.reduce((sum, item) => sum + item.quantity, 0)} bags
                          </div>
                        </TableCell>
                        <TableCell className="font-bold">
                          {formatCurrency(order.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{getPaymentMethodIcon(order.paymentMethod)}</span>
                            <span className="text-sm capitalize">{order.paymentMethod}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye size={16} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsCollected(order._id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No pending collections</p>
            <p className="text-sm text-muted-foreground">All cement orders have been collected</p>
          </CardContent>
        </Card>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  Order Details - {selectedOrder.orderNumber}
                  <Badge className="bg-orange-100 text-orange-800">Not Collected</Badge>
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Customer</p>
                  <p className="text-sm">{selectedOrder.customer.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedOrder.customer.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Order Date</p>
                  <p className="text-sm">{formatDateTime(selectedOrder.orderDate)}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Items Ordered</p>
                  {!partialCollectionMode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPartialCollectionMode(true)
                        initializeCollectionQuantities(selectedOrder)
                      }}
                    >
                      <PackageCheck className="mr-2 h-4 w-4" />
                      Partial Collection
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => {
                    const collected = item.collectedQuantity || 0
                    const remaining = item.quantity - collected

                    return (
                      <div key={index} className="p-3 border rounded">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.product.name} - {item.product.variant}</p>
                            <p className="text-xs text-muted-foreground">{item.product.brand} • {item.product.size}kg</p>
                            <div className="mt-2 flex items-center gap-4 text-xs">
                              <span>Ordered: <strong>{item.quantity}</strong></span>
                              <span className="text-green-600">Collected: <strong>{collected}</strong></span>
                              <span className="text-orange-600">Remaining: <strong>{remaining}</strong></span>
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-xs text-muted-foreground">{formatCurrency(item.totalPrice)}</p>
                          </div>
                        </div>

                        {partialCollectionMode && remaining > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <Label className="text-xs font-medium">Collect Now (max: {remaining} bags)</Label>
                            <Input
                              type="number"
                              min="0"
                              max={remaining}
                              value={collectingQuantities[item.product._id] || 0}
                              onChange={(e) => {
                                const value = Math.min(Math.max(0, parseInt(e.target.value) || 0), remaining)
                                setCollectingQuantities({
                                  ...collectingQuantities,
                                  [item.product._id]: value
                                })
                              }}
                              className="mt-1"
                              placeholder="Enter quantity to collect"
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-sm font-medium">Notes</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              {partialCollectionMode ? (
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPartialCollectionMode(false)
                      setCollectingQuantities({})
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePartialCollection}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <PackageCheck className="mr-2 h-4 w-4" />
                    Record Collection
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button
                    onClick={() => handleMarkAsCollected(selectedOrder._id)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark All as Collected
                  </Button>
                  {/* <Button
                    variant="outline"
                    onClick={() => handleFlagForCorrection(selectedOrder._id)}
                    className="flex-1"
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Flag for Correction
                  </Button> */}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
