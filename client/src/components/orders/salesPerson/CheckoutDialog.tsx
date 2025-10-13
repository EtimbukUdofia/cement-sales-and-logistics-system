import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCartStore } from "@/store/cartStore"
import { useCheckout } from "@/hooks/useCheckout"
import { toast } from "sonner"
import { ShoppingCart, User, CreditCard, MapPin, FileText } from "lucide-react"

interface CheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCheckoutSuccess?: () => void
}

interface CheckoutFormData {
  customerName: string
  customerPhone: string
  customerEmail: string
  deliveryAddress: string
  paymentMethod: 'cash' | 'pos' | 'transfer'
  notes: string
}

export function CheckoutDialog({ open, onOpenChange, onCheckoutSuccess }: CheckoutDialogProps) {
  const items = useCartStore(state => state.items)
  const getTotalItems = useCartStore(state => state.getTotalItems)
  const getTotalPrice = useCartStore(state => state.getTotalPrice)
  const { processCheckout, isProcessing, canCheckout } = useCheckout()

  const [formData, setFormData] = useState<CheckoutFormData>({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    deliveryAddress: "",
    paymentMethod: "cash",
    notes: ""
  })

  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutFormData> = {}

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Customer name is required"
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = "Customer phone is required"
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.customerPhone)) {
      newErrors.customerPhone = "Please enter a valid phone number"
    }

    if (formData.customerEmail && !/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = "Please enter a valid email address"
    }

    // if (!formData.deliveryAddress.trim()) {
    //   newErrors.deliveryAddress = "Delivery address is required"
    // }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly")
      return
    }

    if (!canCheckout) {
      toast.error("Cannot checkout. Please check your cart and shop selection.")
      return
    }

    try {
      const result = await processCheckout({
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail || undefined,
        deliveryAddress: formData.deliveryAddress,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || undefined
      })

      if (result.success) {
        toast.success(`Order ${result.orderNumber} created successfully!`)
        onOpenChange(false)
        // Reset form
        setFormData({
          customerName: "",
          customerPhone: "",
          customerEmail: "",
          deliveryAddress: "",
          paymentMethod: "cash",
          notes: ""
        })
        setErrors({})
        // Trigger product refresh
        onCheckoutSuccess?.()
      }
    } catch {
      toast.error("Failed to process checkout. Please try again.")
    }
  }

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart size={20} />
            Checkout
          </DialogTitle>
          <DialogDescription>
            Complete the order by entering customer details and confirming the purchase.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Details Form */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User size={18} />
              <h3 className="text-lg font-medium">Customer Details</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                placeholder="Enter customer name"
                value={formData.customerName}
                onChange={(e) => handleInputChange("customerName", e.target.value)}
                className={errors.customerName ? "border-red-500" : ""}
              />
              {errors.customerName && (
                <p className="text-sm text-red-500">{errors.customerName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone Number *</Label>
              <Input
                id="customerPhone"
                placeholder="+234-XXX-XXX-XXXX"
                value={formData.customerPhone}
                onChange={(e) => handleInputChange("customerPhone", e.target.value)}
                className={errors.customerPhone ? "border-red-500" : ""}
              />
              {errors.customerPhone && (
                <p className="text-sm text-red-500">{errors.customerPhone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email Address (Optional)</Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="customer@example.com"
                value={formData.customerEmail}
                onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                className={errors.customerEmail ? "border-red-500" : ""}
              />
              {errors.customerEmail && (
                <p className="text-sm text-red-500">{errors.customerEmail}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryAddress" className="flex items-center gap-2">
                <MapPin size={16} />
                Delivery Address
              </Label>
              <Textarea
                id="deliveryAddress"
                placeholder="Enter delivery address"
                value={formData.deliveryAddress}
                onChange={(e) => handleInputChange("deliveryAddress", e.target.value)}
                className={errors.deliveryAddress ? "border-red-500" : ""}
                rows={3}
              />
              {errors.deliveryAddress && (
                <p className="text-sm text-red-500">{errors.deliveryAddress}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CreditCard size={16} />
                Payment Method *
              </Label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { value: 'cash', label: 'Cash Payment', icon: '💵' },
                  { value: 'pos', label: 'POS/Card Payment', icon: '💳' },
                  { value: 'transfer', label: 'Bank Transfer', icon: '🏦' }
                ].map((method) => (
                  <div
                    key={method.value}
                    onClick={() => handleInputChange("paymentMethod", method.value as 'cash' | 'pos' | 'transfer')}
                    className={`
                      p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md
                      ${formData.paymentMethod === method.value
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{method.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{method.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {method.value === 'cash' && 'Pay with cash on delivery'}
                          {method.value === 'pos' && 'Pay with card via POS terminal'}
                          {method.value === 'transfer' && 'Pay via bank transfer'}
                        </p>
                      </div>
                      <div className={`
                        w-5 h-5 rounded-full border-2 flex items-center justify-center
                        ${formData.paymentMethod === method.value
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                        }
                      `}>
                        {formData.paymentMethod === method.value && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <FileText size={16} />
                Additional Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Any special instructions or notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart size={18} />
              <h3 className="text-lg font-medium">Order Summary</h3>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {totalItems} items
              </Badge>
            </div>

            <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-background rounded-md">
                    {/* <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-muted">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-10 h-10 object-contain rounded" 
                      />
                    </div> */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">{item.variant}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-medium">₦{item.price.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">× {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({totalItems} items):</span>
                <span>₦{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery Fee:</span>
                <span>₦0</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>₦{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">Payment Method</p>
              <p className="text-sm text-blue-600">
                {formData.paymentMethod === 'cash' && '💵 Cash Payment'}
                {formData.paymentMethod === 'pos' && '💳 POS/Card Payment'}
                {formData.paymentMethod === 'transfer' && '🏦 Bank Transfer'}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isProcessing || !canCheckout}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing ? "Processing..." : `Complete Order - ₦${totalPrice.toLocaleString()}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
