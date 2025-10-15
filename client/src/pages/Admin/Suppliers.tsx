import { useState } from "react";
import { SuppliersHeader, SupplierCard, PurchaseOrdersTable, AddSupplierDialog, AddPurchaseOrderDialog } from "@/components/suppliers";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useSuppliers } from "@/hooks/useSuppliers";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { Plus } from "lucide-react";

const SuppliersPage = () => {
  const [showAddSupplierDialog, setShowAddSupplierDialog] = useState(false);
  const [showAddPurchaseOrderDialog, setShowAddPurchaseOrderDialog] = useState(false);

  const { suppliers, loading: suppliersLoading, error: suppliersError, refetch: refetchSuppliers } = useSuppliers();
  const { orders, loading: ordersLoading, error: ordersError, refetch: refetchOrders } = usePurchaseOrders({
    limit: 10, // Show recent 10 orders
  });

  // Provide default values to prevent undefined errors
  const safeSuppliers = suppliers || [];
  const safeOrders = orders || [];

  const handleNewPurchaseOrder = () => {
    setShowAddPurchaseOrderDialog(true);
  };

  const handleSupplierAdded = () => {
    refetchSuppliers();
  };

  const handleOrderAdded = () => {
    refetchOrders();
  };

  if (suppliersError || ordersError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">
            {suppliersError || ordersError}
          </p>
          <Button onClick={() => {
            refetchSuppliers();
            refetchOrders();
          }}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-4 sm:gap-6">
        <div className="flex flex-col gap-4 sm:gap-6 py-4 sm:py-6">

          {/* Header */}
          <SuppliersHeader
            title="Supplier Management"
            subtitle="Manage cement supplies and track inventory"
            onNewPurchaseOrder={handleNewPurchaseOrder}
          />

          {/* Add Supplier Button */}
          <div className="px-4 sm:px-6 lg:px-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Suppliers ({safeSuppliers.length})</h2>
              <AddSupplierDialog
                trigger={
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Supplier
                  </Button>
                }
                onSuccess={handleSupplierAdded}
              />
            </div>
          </div>

          {/* Suppliers Grid */}
          <div className="px-4 sm:px-6 lg:px-6">
            {suppliersLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : safeSuppliers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No suppliers found</p>
                <AddSupplierDialog
                  trigger={<Button>Add Your First Supplier</Button>}
                  onSuccess={handleSupplierAdded}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
                {safeSuppliers.map((supplier) => (
                  <SupplierCard
                    key={supplier._id}
                    supplier={supplier}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Recent Purchase Orders */}
          <div className="px-4 sm:px-6 lg:px-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Purchase Orders</h2>
              <AddPurchaseOrderDialog
                trigger={
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    New Order
                  </Button>
                }
                onSuccess={handleOrderAdded}
              />
            </div>

            {ordersLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : safeOrders.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-600 mb-4">No purchase orders found</p>
                <AddPurchaseOrderDialog
                  trigger={<Button>Create Your First Purchase Order</Button>}
                  onSuccess={handleOrderAdded}
                />
              </div>
            ) : (
              <PurchaseOrdersTable orders={safeOrders} />
            )}
          </div>

        </div>
      </div>

      {/* Dialogs */}
      {showAddSupplierDialog && (
        <AddSupplierDialog
          onSuccess={() => {
            handleSupplierAdded();
            setShowAddSupplierDialog(false);
          }}
        />
      )}

      {showAddPurchaseOrderDialog && (
        <AddPurchaseOrderDialog
          onSuccess={() => {
            handleOrderAdded();
            setShowAddPurchaseOrderDialog(false);
          }}
        />
      )}
    </div>
  );
};

export default SuppliersPage;
