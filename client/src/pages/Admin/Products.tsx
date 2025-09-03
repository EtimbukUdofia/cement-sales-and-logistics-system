
import { useEffect, useState } from "react"
import { ProductCard } from "@/components/products/ProductCard"
import { ProductHeader } from "@/components/products/ProductHeader"
import { AddProductCard } from "@/components/products/AddProductCard"
import { ProductFormDialog } from "@/components/products/ProductFormDialog"
import { DeleteConfirmationDialog } from "@/components/products/DeleteConfirmationDialog"
import { useProductStore, type Product } from "@/store/productStore"
import LoadingSpinner from "@/components/LoadingSpinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { toast } from "sonner"

const ProductsPage = () => {
  const { products, isLoading, error, fetchProducts, deleteProduct, clearError } = useProductStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Show toast for fetch errors
  useEffect(() => {
    if (error && !isLoading) {
      toast.error(`Failed to load products: ${error}`);
    }
  }, [error, isLoading]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (productId: string) => {
    const product = products.find(p => p._id === productId);
    if (product) {
      setDeletingProduct(product);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingProduct) {
      const success = await deleteProduct(deletingProduct._id);
      if (success) {
        toast.success(`Product "${deletingProduct.brand} ${deletingProduct.name}" deleted successfully!`);
        setDeletingProduct(null);
      } else {
        toast.error(`Failed to delete product "${deletingProduct.brand} ${deletingProduct.name}"`);
      }
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteDialogClose = () => {
    setDeletingProduct(null);
  };

  if (isLoading && products.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-4 sm:gap-6">
        <div className="flex flex-col gap-4 sm:gap-6 py-4 sm:py-6">

          {/* Error Alert */}
          {error && (
            <div className="px-4 sm:px-6 lg:px-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                  <button
                    onClick={clearError}
                    className="ml-2 text-sm underline"
                  >
                    Dismiss
                  </button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Header */}
          <ProductHeader
            title="Total Products"
            subtitle="Products available in stock"
            productCount={products.length}
            onAddProduct={handleAddProduct}
          />

          {/* Products Grid */}
          <div className="px-4 sm:px-6 lg:px-6">
            {products.length === 0 && !isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found</p>
                <p className="text-gray-400 text-sm mt-2">Start by adding your first product</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    {...product}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteClick}
                  />
                ))}

                {/* Add Product Card */}
                <AddProductCard onClick={handleAddProduct} />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Product Form Dialog */}
      <ProductFormDialog
        open={isFormOpen}
        onOpenChange={handleFormClose}
        product={editingProduct}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={!!deletingProduct}
        onOpenChange={handleDeleteDialogClose}
        onConfirm={handleConfirmDelete}
        productName={deletingProduct ? `${deletingProduct.brand} ${deletingProduct.name}` : ""}
        isLoading={isLoading}
      />
    </div>
  )
}

export default ProductsPage