import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCartStore, type CartItem } from "@/store/cartStore"
import { toast } from "sonner"

export function CartDetailsSection() {
  const items = useCartStore(state => state.items);
  const removeItem = useCartStore(state => state.removeItem);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const getTotalItems = useCartStore(state => state.getTotalItems);
  const getTotalPrice = useCartStore(state => state.getTotalPrice);

  const handleIncreaseQuantity = (item: CartItem) => {
    if (item.quantity < item.availableStock) {
      updateQuantity(item.id, item.quantity + 1);
    } else {
      toast.error("Cannot add more items. Stock limit reached.");
    }
  };

  const handleDecreaseQuantity = (item: CartItem) => {
    updateQuantity(item.id, item.quantity - 1);
  };

  const handleRemoveItem = (item: CartItem) => {
    removeItem(item.id);
    toast.success(`${item.name} removed from cart`);
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // TODO: Implement checkout functionality
    toast.success("Proceeding to checkout...");
    console.log("Checkout items:", items);
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

            <div className="flex items-center justify-center gap-3 bg-muted rounded-lg p-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleDecreaseQuantity(item)}
                disabled={item.quantity <= 1}
              >
                <Minus size={14} />
              </Button>
              <span className="font-medium min-w-[20px] text-center">{item.quantity}</span>
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
          >
            Checkout
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
