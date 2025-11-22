import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"
import {
  RefreshCw,
  AlertTriangle,
  Eye,
  CheckCircle,
  Clock,
  User
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
  correctionRequestedBy?: {
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
  needsCorrection: boolean
  correctionNotes?: string
  correctionRequestedAt?: string
}

interface CorrectionsData {
  orders: SalesOrder[]
  totalCount: number
}

interface EditOrderData {
  customerName: string
  customerPhone: string
  customerEmail: string
  paymentMethod: 'cash' | 'pos' | 'transfer'
  notes: string
  status: string
  items: Array<{
    product: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
}

interface Product {
  _id: string
  name: string
  variant: string
  brand: string
  size: number
  price: number
}

export default function OrderCorrectionsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<CorrectionsData | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [editData, setEditData] = useState<EditOrderData>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    paymentMethod: 'cash',
    notes: '',
    status: 'Not Collected',
    items: []
  })

  const fetchCorrectionOrders = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get('/sales-orders/corrections')
      if (response.success) {
        setData({
          orders: response.orders as SalesOrder[],
          totalCount: response.totalCount as number
        })
      } else {
        toast.error('Failed to load correction requests')
      }
    } catch {
      toast.error('Failed to load correction requests')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCorrectionOrders()
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await apiClient.getProducts()
      if (response.success && response.products) {
        setProducts(response.products as Product[])
      }
    } catch {
      // Silent fail - products optional for viewing
    }
  }

  const handleViewOrder = (order: SalesOrder) => {
    setSelectedOrder(order)
    setEditMode(false)
    setEditData({
      customerName: order.customer.name,
      customerPhone: order.customer.phone,
      customerEmail: order.customer.email || '',
      paymentMethod: order.paymentMethod,
      notes: order.notes || '',
      status: 'Not Collected',
      items: order.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      }))
    })
  }

  const handleItemChange = (index: number, field: 'product' | 'quantity', value: string | number) => {
    const newItems = [...editData.items]

    if (field === 'product') {
      const selectedProduct = products.find(p => p._id === value)
      if (selectedProduct) {
        newItems[index].product = value as string
        newItems[index].unitPrice = selectedProduct.price
        newItems[index].totalPrice = selectedProduct.price * newItems[index].quantity
      }
    } else if (field === 'quantity') {
      newItems[index].quantity = Number(value)
      newItems[index].totalPrice = newItems[index].unitPrice * Number(value)
    }

    setEditData({ ...editData, items: newItems })
  }

  const handleAddItem = () => {
    setEditData({
      ...editData,
      items: [...editData.items, { product: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]
    })
  }

  const handleRemoveItem = (index: number) => {
    const newItems = editData.items.filter((_, i) => i !== index)
    setEditData({ ...editData, items: newItems })
  }

  const calculateTotal = () => {
    const itemsTotal = editData.items.reduce((sum, item) => sum + item.totalPrice, 0)
    const deliveryCosts = selectedOrder?.isDelivery
      ? (selectedOrder.onloadingCost || 0) + (selectedOrder.deliveryCost || 0) + (selectedOrder.offloadingCost || 0)
      : 0
    return itemsTotal + deliveryCosts
  }

  const handleResolveCorrection = async () => {
    if (!selectedOrder) return

    try {
      // Calculate the new total amount
      const totalAmount = calculateTotal()

      const response = await apiClient.put(`/sales-orders/${selectedOrder._id}/resolve-correction`, {
        ...editData,
        totalAmount
      })

      if (response.success) {
        toast.success('Order correction resolved successfully')
        fetchCorrectionOrders()
        setSelectedOrder(null)
        setEditMode(false)
      } else {
        toast.error('Failed to resolve correction')
      }
    } catch {
      toast.error('Failed to resolve correction')
    }
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
          <p>Loading correction requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Order Corrections</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Review and correct orders flagged by sales personnel
          </p>
        </div>
        <Button variant="outline" onClick={fetchCorrectionOrders} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Orders Table */}
      {data && data.orders.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-orange-600" />
              Pending Corrections
            </CardTitle>
            <CardDescription>
              {data.totalCount} orders requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">Order #</TableHead>
                      <TableHead className="min-w-[140px]">Customer</TableHead>
                      <TableHead className="min-w-[140px]">Sales Person</TableHead>
                      <TableHead className="min-w-[200px]">Correction Notes</TableHead>
                      <TableHead className="min-w-[160px]">Requested</TableHead>
                      <TableHead className="min-w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.orders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium truncate max-w-[120px]">{order.customer.name}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-[120px]">{order.customer.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-muted-foreground" />
                            <span className="text-sm">{order.salesPerson.username}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm line-clamp-2">{order.correctionNotes}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-muted-foreground" />
                            <span className="text-sm">
                              {order.correctionRequestedAt && formatDateTime(order.correctionRequestedAt)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye size={16} />
                          </Button>
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
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <p className="text-lg font-medium">No pending corrections</p>
            <p className="text-sm text-muted-foreground">All orders are correct</p>
          </CardContent>
        </Card>
      )}

      {/* Order Detail & Edit Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  Correct Order - {selectedOrder.orderNumber}
                  <Badge className="bg-orange-100 text-orange-800">Needs Correction</Badge>
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Correction Request Info */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-orange-900">Correction Request</p>
                    <p className="text-sm text-orange-800 mt-1">{selectedOrder.correctionNotes}</p>
                    <p className="text-xs text-orange-700 mt-2">
                      Requested by {selectedOrder.correctionRequestedBy?.username} on{' '}
                      {selectedOrder.correctionRequestedAt && formatDateTime(selectedOrder.correctionRequestedAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Edit Mode Toggle */}
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Edit Order Details</Label>
                <Button
                  variant={editMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? "Cancel Edit" : "Enable Edit"}
                </Button>
              </div>

              {/* Customer Details */}
              <div className="space-y-4">
                <h3 className="font-medium">Customer Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Customer Name</Label>
                    {editMode ? (
                      <Input
                        value={editData.customerName}
                        onChange={(e) => setEditData({ ...editData, customerName: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm mt-1">{selectedOrder.customer.name}</p>
                    )}
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    {editMode ? (
                      <Input
                        value={editData.customerPhone}
                        onChange={(e) => setEditData({ ...editData, customerPhone: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm mt-1">{selectedOrder.customer.phone}</p>
                    )}
                  </div>
                  <div>
                    <Label>Email (Optional)</Label>
                    {editMode ? (
                      <Input
                        value={editData.customerEmail}
                        onChange={(e) => setEditData({ ...editData, customerEmail: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm mt-1">{selectedOrder.customer.email || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <Label>Payment Method</Label>
                    {editMode ? (
                      <Select
                        value={editData.paymentMethod}
                        onValueChange={(value) => setEditData({ ...editData, paymentMethod: value as 'cash' | 'pos' | 'transfer' })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">💵 Cash</SelectItem>
                          <SelectItem value="pos">💳 POS</SelectItem>
                          <SelectItem value="transfer">🏦 Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <span>{getPaymentMethodIcon(selectedOrder.paymentMethod)}</span>
                        <span className="text-sm capitalize">{selectedOrder.paymentMethod}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base font-medium">Order Items</Label>
                  {editMode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddItem}
                    >
                      + Add Item
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  {editMode ? (
                    editData.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 p-3 border rounded">
                        <div className="col-span-6">
                          <Label className="text-xs">Product</Label>
                          <Select
                            value={item.product}
                            onValueChange={(value) => handleItemChange(index, 'product', value)}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product._id} value={product._id}>
                                  {product.name} - {product.variant} ({product.brand})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="h-9"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">Unit Price</Label>
                          <p className="text-sm font-medium mt-2">{formatCurrency(item.unitPrice)}</p>
                        </div>
                        <div className="col-span-2 flex items-end">
                          <div className="flex-1">
                            <Label className="text-xs">Total</Label>
                            <p className="text-sm font-bold mt-2">{formatCurrency(item.totalPrice)}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 hover:text-red-700 h-9"
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="text-sm font-medium">{item.product.name} - {item.product.variant}</p>
                          <p className="text-xs text-muted-foreground">{item.product.brand} • {item.product.size}kg</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{item.quantity} bags</p>
                          <p className="text-xs text-muted-foreground">{formatCurrency(item.totalPrice)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label>Order Notes</Label>
                {editMode ? (
                  <Textarea
                    value={editData.notes}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">{selectedOrder.notes || 'No notes'}</p>
                )}
              </div>

              {/* Status Selection */}
              {editMode && (
                <div>
                  <Label>New Status After Correction</Label>
                  <Select
                    value={editData.status}
                    onValueChange={(value) => setEditData({ ...editData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Collected">⏳ Not Collected</SelectItem>
                      <SelectItem value="Collected">✅ Collected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Total */}
              <div className="pt-4 border-t">
                {editMode && (
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal (Products):</span>
                      <span>{formatCurrency(editData.items.reduce((sum, item) => sum + item.totalPrice, 0))}</span>
                    </div>
                    {selectedOrder.isDelivery && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Delivery Charges:</span>
                        <span>{formatCurrency((selectedOrder.onloadingCost || 0) + (selectedOrder.deliveryCost || 0) + (selectedOrder.offloadingCost || 0))}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span>{editMode ? formatCurrency(calculateTotal()) : formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              {/* Actions */}
              {editMode && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleResolveCorrection}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Save & Resolve
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
