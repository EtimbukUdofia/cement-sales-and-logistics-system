import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCartStore, type CartItem } from "@/store/cartStore"
import { CheckoutDialog } from "./CheckoutDialog"
import { toast } from "sonner"
import { useState, useEffect } from "react"

export function CartDetailsSection({ onCheckoutSuccess }: { onCheckoutSuccess?: () => void }) {
  const items = useCartStore(state => state.items);
  const removeItem = useCartStore(state => state.removeItem);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const getTotalItems = useCartStore(state => state.getTotalItems);
  const getTotalPrice = useCartStore(state => state.getTotalPrice);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  // Clear input values when cart is empty (after successful checkout)
  useEffect(() => {
    if (items.length === 0) {
      setInputValues({});
    }
  }, [items.length]);

  const handleIncreaseQuantity = (item: CartItem) => {
    if (item.quantity < item.availableStock) {
      const newQuantity = item.quantity + 1;
      updateQuantity(item.id, newQuantity);
      setInputValues(prev => ({ ...prev, [item.id]: newQuantity.toString() }));
    } else {
      toast.error("Cannot add more items. Stock limit reached.");
    }
  };

  const handleDecreaseQuantity = (item: CartItem) => {
    const newQuantity = item.quantity - 1;
    updateQuantity(item.id, newQuantity);
    setInputValues(prev => ({ ...prev, [item.id]: newQuantity.toString() }));
  };

  const handleQuantityInputChange = (item: CartItem, value: string) => {
    // Allow empty string or valid numbers (including numbers with leading zeros)
    if (value === '' || /^\d*$/.test(value)) {
      setInputValues(prev => ({ ...prev, [item.id]: value }));

      // If it's a valid number, update the cart
      if (value !== '' && /^\d+$/.test(value)) {
        const numValue = parseInt(value, 10);
        if (numValue > 0) {
          if (numValue <= item.availableStock) {
            updateQuantity(item.id, numValue);
          } else {
            // If exceeds stock, set to max available stock
            updateQuantity(item.id, item.availableStock);
            setInputValues(prev => ({ ...prev, [item.id]: item.availableStock.toString() }));
            toast.error(`Only ${item.availableStock} items available in stock. Quantity adjusted to maximum available.`);
          }
        }
      }
    }
  };

  const handleQuantityInputBlur = (item: CartItem) => {
    const inputValue = inputValues[item.id];
    if (!inputValue || inputValue === '' || parseInt(inputValue, 10) < 1) {
      // Reset to current quantity if input is invalid
      setInputValues(prev => ({ ...prev, [item.id]: item.quantity.toString() }));
    } else {
      // Ensure the final value matches the cart quantity (handles any edge cases)
      const numValue = parseInt(inputValue, 10);
      const finalQuantity = Math.min(Math.max(numValue, 1), item.availableStock);
      if (finalQuantity !== numValue) {
        setInputValues(prev => ({ ...prev, [item.id]: finalQuantity.toString() }));
        updateQuantity(item.id, finalQuantity);
      }
    }
  };

  const getInputValue = (item: CartItem): string => {
    // Only return cached input value if it exists AND the item is actually in the input values
    // Otherwise, return the current cart quantity to avoid stale values
    const cachedValue = inputValues[item.id];
    if (cachedValue !== undefined) {
      return cachedValue;
    }
    return item.quantity.toString();
  };

  const handleRemoveItem = (item: CartItem) => {
    removeItem(item.id);
    // Clean up input values for removed item
    setInputValues(prev => {
      const newValues = { ...prev };
      delete newValues[item.id];
      return newValues;
    });
    toast.success(`${item.name} removed from cart`);
  };

  const handleCheckoutSuccess = () => {
    // Clear input values when checkout is successful
    setInputValues({});
    // Call the parent's onCheckoutSuccess if provided
    onCheckoutSuccess?.();
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setShowCheckoutDialog(true);
  };

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  if (items.length === 0) {
    return (
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            Cart Details
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              0
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">Add some products to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          Cart Details
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {totalItems}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                  <img src={item.imageUrl} alt={item.name} className="w-8 h-8 object-contain rounded" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">{item.name}</h4>
                  <p className="text-xs text-muted-foreground">{item.variant}</p>
                  <p className="text-sm font-medium">₦{item.price.toLocaleString()}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                onClick={() => handleRemoveItem(item)}
              >
                <Trash2 size={14} />
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 bg-muted rounded-lg p-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleDecreaseQuantity(item)}
                disabled={item.quantity <= 1}
              >
                <Minus size={14} />
              </Button>
              <Input
                type="text"
                value={getInputValue(item)}
                onChange={(e) => handleQuantityInputChange(item, e.target.value)}
                onBlur={() => handleQuantityInputBlur(item)}
                onKeyDown={(e) => {
                  // Handle Enter key to blur the input
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                  // Prevent + and - keys if someone tries to use them
                  if (e.key === '+' || e.key === '-' || e.key === 'e' || e.key === 'E') {
                    e.preventDefault();
                  }
                }}
                className="w-16 h-8 text-center border-0 bg-transparent font-medium p-1 focus-visible:ring-1 focus-visible:ring-primary"
                min="1"
                max={item.availableStock.toString()}
                placeholder="Qty"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleIncreaseQuantity(item)}
                disabled={item.quantity >= item.availableStock}
              >
                <Plus size={14} />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground text-center">
              Max: {item.availableStock} bags
            </div>
          </div>
        ))}

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium">Total:</span>
            <span className="font-bold text-lg">₦{totalPrice.toLocaleString()}</span>
          </div>

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleCheckout}
            disabled={items.length === 0}
          >
            Checkout
          </Button>
        </div>
      </CardContent>

      <CheckoutDialog
        open={showCheckoutDialog}
        onOpenChange={setShowCheckoutDialog}
        onCheckoutSuccess={handleCheckoutSuccess}
      />
    </Card>
  )
}
