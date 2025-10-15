import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useSuppliers } from "@/hooks/useSuppliers";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { apiClient } from "@/lib/api";
import type { CreatePurchaseOrderData } from "@/lib/api";

const purchaseOrderSchema = z.object({
  orderNumber: z.string().min(1, "Order number is required"),
  supplier: z.string().min(1, "Supplier is required"),
  product: z.string().min(1, "Product is required"),
  quantity: z.preprocess((val) => Number(val), z.number().positive("Quantity must be positive")),
  unitPrice: z.preprocess((val) => Number(val), z.number().positive("Unit price must be positive")),
  expectedDeliveryDate: z.string().optional(),
  notes: z.string().optional(),
});

// type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

interface Product {
  _id: string;
  name: string;
  brand: string;
  variant?: string;
  price: number;
}

interface AddPurchaseOrderDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddPurchaseOrderDialog({ trigger, onSuccess }: AddPurchaseOrderDialogProps) {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const { suppliers } = useSuppliers();
  const { createOrder } = usePurchaseOrders({ autoFetch: false });

  const form = useForm({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      orderNumber: "",
      supplier: "",
      product: "",
      quantity: 1,
      unitPrice: 0,
      expectedDeliveryDate: "",
      notes: "",
    },
  });

  // Generate order number when dialog opens
  useEffect(() => {
    if (open) {
      const orderNumber = `PO-${Date.now()}`;
      form.setValue("orderNumber", orderNumber);
    }
  }, [open, form]);

  // Fetch products when dialog opens
  useEffect(() => {
    const fetchProducts = async () => {
      if (!open) return;

      setLoadingProducts(true);
      try {
        const response = await apiClient.getProducts();
        if (response.success && response.data) {
          setProducts(response.data as Product[]);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [open]);

  // Auto-fill unit price when product is selected
  const selectedProduct = products.find(p => p._id === form.watch("product"));
  useEffect(() => {
    if (selectedProduct) {
      form.setValue("unitPrice", selectedProduct.price);
    }
  }, [selectedProduct, form]);

  const onSubmit = async (data: z.infer<typeof purchaseOrderSchema>) => {
    try {
      const orderData: CreatePurchaseOrderData = {
        orderNumber: data.orderNumber,
        supplier: data.supplier,
        product: data.product,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        expectedDeliveryDate: data.expectedDeliveryDate || undefined,
        notes: data.notes || undefined,
      };

      const result = await createOrder(orderData);

      if (result.success) {
        form.reset();
        setOpen(false);
        onSuccess?.();
      }
    } catch (error) {
      console.error("Failed to create purchase order:", error);
    }
  };

  const totalPrice = (form.watch("quantity") as number) * (form.watch("unitPrice") as number);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Add Purchase Order</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
          <DialogDescription>
            Create a new purchase order for cement supplies.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="orderNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="Auto-generated" {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a supplier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier._id} value={supplier._id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="product"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingProducts}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingProducts ? "Loading products..." : "Select a product"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product._id} value={product._id}>
                          {product.brand} {product.name} {product.variant ? `- ${product.variant}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="1"
                        {...field}
                        value={field.value as number}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Price (₦) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        value={field.value as number}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {totalPrice > 0 && (
              <div className="bg-muted p-3 rounded-lg">
                <div className="text-sm font-medium">
                  Total Price: ₦{totalPrice.toLocaleString()}
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="expectedDeliveryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Delivery Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes or requirements..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                ) : null}
                Create Order
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}