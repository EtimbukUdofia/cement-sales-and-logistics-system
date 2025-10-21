import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import {
  ShopCard,
  ShopHeader,
  AddShopCard,
  ShopFormDialog,
  DeleteConfirmationDialog
} from "@/components/shop"
import { useShopStore, type Shop } from "../../../store/shopStore"
import LoadingSpinner from "@/components/LoadingSpinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { toast } from "sonner"

const ShopsPage = () => {
  const navigate = useNavigate();
  const { shops, isLoading, error, fetchShops, deleteShop, clearError } = useShopStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [deletingShop, setDeletingShop] = useState<Shop | null>(null);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  // Show toast for fetch errors
  useEffect(() => {
    if (error && !isLoading) {
      toast.error(`Failed to load shops: ${error}`);
    }
  }, [error, isLoading]);

  const handleAddShop = () => {
    setEditingShop(null);
    setIsFormOpen(true);
  };

  const handleEditShop = (shop: Shop) => {
    setEditingShop(shop);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (shopId: string) => {
    const shop = shops.find(s => s._id === shopId);
    if (shop) {
      setDeletingShop(shop);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingShop) {
      const success = await deleteShop(deletingShop._id);
      if (success) {
        toast.success("Shop deleted successfully");
        setDeletingShop(null);
      } else {
        toast.error("Failed to delete shop");
      }
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingShop(null);
    fetchShops(); // Refresh the list
  };

  const handleManageInventory = (shopId: string) => {
    navigate(`/admin/shops/${shopId}/inventory`);
  };

  const clearDeleteError = () => {
    clearError();
    setDeletingShop(null);
  };

  if (isLoading && shops.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

          {/* Header */}
          <ShopHeader onAddShop={handleAddShop} />

          {/* Error Alert */}
          {error && !isLoading && (
            <div className="px-4 sm:px-6 lg:px-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Shops Grid */}
          <div className="px-4 sm:px-6 lg:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Add New Shop Card */}
              <AddShopCard onClick={handleAddShop} />

              {/* Shop Cards */}
              {shops.map((shop) => (
                <ShopCard
                  key={shop._id}
                  shop={shop}
                  onEdit={handleEditShop}
                  onDelete={handleDeleteClick}
                  onManageInventory={handleManageInventory}
                />
              ))}
            </div>

            {/* Empty State */}
            {shops.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No shops found. Create your first shop to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shop Form Dialog */}
      <ShopFormDialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        shop={editingShop}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={!!deletingShop}
        onClose={clearDeleteError}
        onConfirm={handleConfirmDelete}
        itemType="shop"
        itemName={deletingShop?.name || ""}
        isLoading={isLoading}
      />
    </div>
  )
}

export default ShopsPage