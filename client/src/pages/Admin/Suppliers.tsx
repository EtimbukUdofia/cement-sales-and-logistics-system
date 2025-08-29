import { SuppliersHeader, SupplierCard, PurchaseOrdersTable } from "@/components/suppliers";
import { suppliers, recentPurchaseOrders } from "@/data/suppliers";

const SuppliersPage = () => {
  const handleNewPurchaseOrder = () => {
    // TODO: Navigate to purchase order creation page or open modal
    console.log("Create new purchase order");
  };

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

          {/* Suppliers Grid */}
          <div className="px-4 sm:px-6 lg:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
              {suppliers.map((supplier) => (
                <SupplierCard
                  key={supplier.id}
                  supplier={supplier}
                />
              ))}
            </div>
          </div>

          {/* Recent Purchase Orders */}
          <div className="px-4 sm:px-6 lg:px-6">
            <PurchaseOrdersTable orders={recentPurchaseOrders} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default SuppliersPage;
