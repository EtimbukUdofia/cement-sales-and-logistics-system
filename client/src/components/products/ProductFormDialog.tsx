import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useProductStore, type Product, type CreateProductData } from "@/store/productStore"
import { toast } from "sonner"
import { z } from "zod"

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

// Schema for creating new products (all required fields must be provided)
const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  variant: z.string().optional(),
  brand: z.string().min(1, "Brand is required"),
  size: z.number().min(0.1, "Size must be greater than 0"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  imageUrl: z.string().optional().refine((val) => !val || z.string().safeParse(val).success, {
    message: "Please enter a valid URL or leave empty"
  }),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Schema for updating products (only validate fields that are actually provided/changed)
const updateProductSchema = z.object({
  name: z.string().min(1, "Product name is required").optional(),
  variant: z.string().optional(),
  brand: z.string().min(1, "Brand is required").optional(),
  size: z.number().min(0.1, "Size must be greater than 0").optional(),
  price: z.number().min(0.01, "Price must be greater than 0").optional(),
  imageUrl: z.string().optional().refine((val) => !val || z.string().safeParse(val).success, {
    message: "Please enter a valid URL or leave empty"
  }),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
}).refine((data) => {
  // For updates, at least one field should be provided
  return Object.values(data).some(value => value !== undefined && value !== "");
}, {
  message: "At least one field must be updated",
});

export function ProductFormDialog({ open, onOpenChange, product }: ProductFormDialogProps) {
  const { createProduct, updateProduct, isLoading, error: storeError } = useProductStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getInitialFormData = useCallback(() => ({
    name: product?.name || "",
    variant: product?.variant || "",
    brand: product?.brand || "",
    size: product?.size || 50,
    price: product?.price || 0,
    imageUrl: product?.imageUrl || "",
    description: product?.description || "",
    isActive: product?.isActive ?? true,
    _id: product?._id
  }), [product]);

  const [formData, setFormData] = useState<CreateProductData & { _id?: string }>(getInitialFormData());

  // Update form data when product prop changes (when switching from add to edit mode)
  useEffect(() => {
    setFormData(getInitialFormData());
    setErrors({}); // Clear any existing errors
  }, [getInitialFormData, open]);

  // Helper function to check if a field has been changed
  const isFieldChanged = (field: keyof CreateProductData, currentValue: string | number | boolean | undefined) => {
    if (!product) return false; // New product, no comparison needed

    const originalValue = product[field];
    return currentValue !== originalValue;
  };

  const handleInputChange = (field: keyof CreateProductData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      let validatedData;

      if (product) {
        // For updates, only validate and send changed fields
        const changedFields: Partial<CreateProductData> = {};

        // Compare with original product data and only include changed fields
        if (formData.name !== product.name) changedFields.name = formData.name;
        if (formData.variant !== product.variant) changedFields.variant = formData.variant;
        if (formData.brand !== product.brand) changedFields.brand = formData.brand;
        if (formData.size !== product.size) changedFields.size = formData.size;
        if (formData.price !== product.price) changedFields.price = formData.price;
        if (formData.imageUrl !== product.imageUrl) changedFields.imageUrl = formData.imageUrl;
        if (formData.description !== product.description) changedFields.description = formData.description;
        if (formData.isActive !== product.isActive) changedFields.isActive = formData.isActive;

        // If no fields changed, show a message
        if (Object.keys(changedFields).length === 0) {
          setErrors({ form: "No changes detected. Please modify at least one field." });
          return;
        }

        validatedData = updateProductSchema.parse(changedFields);
      } else {
        // For new products, validate all required fields
        if(!formData.imageUrl){
          // assign fallback image url if none provided
          formData.imageUrl = "https://www.shutterstock.com/image-photo/cement-powder-trowel-put-bag-600nw-2067658913.jpg";
        }
        validatedData = createProductSchema.parse(formData);
      }

      let success = false;
      if (product) {
        // Update existing product
        success = await updateProduct({ ...validatedData, _id: product._id });
        if (success) {
          toast.success(`Product "${product.name}" updated successfully!`);
        } else {
          // If success is false but no exception was thrown, check store error
          const errorMsg = storeError || 'Failed to update product';
          toast.error(`Failed to update product: ${errorMsg}`);
          return;
        }
      } else {
        // Create new product
        console.log("validated data: ", validatedData)
        success = await createProduct(validatedData as CreateProductData);
        if (success) {
          toast.success(`Product "${formData.brand, formData.name}" created successfully!`);
        } else {
          // If success is false but no exception was thrown, check store error
          const errorMsg = storeError || 'Failed to create product';
          toast.error(`Failed to create product: ${errorMsg}`);
          return;
        }
      }

      if (success) {
        onOpenChange(false);
        // Reset form only for new products
        if (!product) {
          setFormData({
            name: "",
            variant: "",
            brand: "",
            size: 50,
            price: 0,
            imageUrl: "",
            description: "",
            isActive: true,
          });
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path && err.path.length > 0) {
            fieldErrors[err.path[0] as string] = err.message;
          } else {
            fieldErrors.form = err.message;
          }
        });
        setErrors(fieldErrors);
        toast.error("Please fix the form errors before submitting.");
      } else {
        // Handle other errors (e.g., network errors, server errors)
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        toast.error(`Failed to ${product ? 'update' : 'create'} product: ${errorMessage}`);
        setErrors({ form: errorMessage });
      }
    }
  };

  const resetForm = () => {
    setFormData(getInitialFormData());
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent aria-describedby="" aria-description="Product form" className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General form error */}
          {errors.form && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {errors.form}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                Product Name
                {product && isFieldChanged("name", formData.name) && (
                  <span className="text-xs text-blue-600 font-medium">• Modified</span>
                )}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Cement"
                className={product && isFieldChanged("name", formData.name) ? "border-blue-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="variant" className="flex items-center gap-2">
                Variant (Optional)
                {product && isFieldChanged("variant", formData.variant || "") && (
                  <span className="text-xs text-blue-600 font-medium">• Modified</span>
                )}
              </Label>
              <Input
                id="variant"
                value={formData.variant}
                onChange={(e) => handleInputChange("variant", e.target.value)}
                placeholder="e.g., 3X, Falcon"
                className={product && isFieldChanged("variant", formData.variant || "") ? "border-blue-500" : ""}
              />
              {errors.variant && <p className="text-sm text-red-600">{errors.variant}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand" className="flex items-center gap-2">
              Brand
              {product && isFieldChanged("brand", formData.brand) && (
                <span className="text-xs text-blue-600 font-medium">• Modified</span>
              )}
            </Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => handleInputChange("brand", e.target.value)}
              placeholder="e.g., Dangote, BUA, Lafarge"
              className={product && isFieldChanged("brand", formData.brand) ? "border-blue-500" : ""}
            />
            {errors.brand && <p className="text-sm text-red-600">{errors.brand}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="size" className="flex items-center gap-2">
                Size (kg)
                {product && isFieldChanged("size", formData.size) && (
                  <span className="text-xs text-blue-600 font-medium">• Modified</span>
                )}
              </Label>
              <Input
                id="size"
                type="number"
                value={formData.size}
                onChange={(e) => handleInputChange("size", parseFloat(e.target.value) || 0)}
                placeholder="50"
                min="0.1"
                step="0.1"
                className={product && isFieldChanged("size", formData.size) ? "border-blue-500" : ""}
              />
              {errors.size && <p className="text-sm text-red-600">{errors.size}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center gap-2">
                Price (₦)
                {product && isFieldChanged("price", formData.price) && (
                  <span className="text-xs text-blue-600 font-medium">• Modified</span>
                )}
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                placeholder="5000"
                min="0.01"
                step="0.01"
                className={product && isFieldChanged("price", formData.price) ? "border-blue-500" : ""}
              />
              {errors.price && <p className="text-sm text-red-600">{errors.price}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="flex items-center gap-2">
              Image URL (Optional)
              {product && isFieldChanged("imageUrl", formData.imageUrl || "") && (
                <span className="text-xs text-blue-600 font-medium">• Modified</span>
              )}
            </Label>
            <Input
              id="imageUrl"
              // type="url"
              value={formData.imageUrl}
              onChange={(e) => handleInputChange("imageUrl", e.target.value)}
              placeholder="https://example.com/image.jpg"
              className={product && isFieldChanged("imageUrl", formData.imageUrl || "") ? "border-blue-500" : ""}
            />
            {errors.imageUrl && <p className="text-sm text-red-600">{errors.imageUrl}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              Description (Optional)
              {product && isFieldChanged("description", formData.description || "") && (
                <span className="text-xs text-blue-600 font-medium">• Modified</span>
              )}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Product description..."
              rows={3}
              className={product && isFieldChanged("description", formData.description || "") ? "border-blue-500" : ""}
            />
            {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange("isActive", checked)}
            />
            <Label htmlFor="isActive" className="flex items-center gap-2">
              Active Product
              {product && isFieldChanged("isActive", formData.isActive) && (
                <span className="text-xs text-blue-600 font-medium">• Modified</span>
              )}
            </Label>
          </div>

          {/* Edit Summary */}
          {product && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800 font-medium">
                {(() => {
                  const changedFields = [];
                  if (formData.name !== product.name) changedFields.push('name');
                  if (formData.variant !== product.variant) changedFields.push('variant');
                  if (formData.brand !== product.brand) changedFields.push('brand');
                  if (formData.size !== product.size) changedFields.push('size');
                  if (formData.price !== product.price) changedFields.push('price');
                  if (formData.imageUrl !== product.imageUrl) changedFields.push('image URL');
                  if (formData.description !== product.description) changedFields.push('description');
                  if (formData.isActive !== product.isActive) changedFields.push('status');

                  if (changedFields.length === 0) {
                    return "No changes detected";
                  } else if (changedFields.length === 1) {
                    return `1 field will be updated: ${changedFields[0]}`;
                  } else {
                    return `${changedFields.length} fields will be updated: ${changedFields.join(', ')}`;
                  }
                })()}
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : product ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
