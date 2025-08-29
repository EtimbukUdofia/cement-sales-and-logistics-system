import {
  OrderInfo,
  CustomerOrderSection,
  DeliveryAddressSection,
  ExpensesSection,
  ProductsOrderedTable
} from "@/components/orders"

export default function Orders() {
  // const handleNewOrder = () => {
  //   // TODO: Navigate to order creation page or open modal
  //   console.log("Create new order");
  // };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-6 py-6">

          {/* Header */}
          {/* <OrderHeader
            title="Orders"
            subtitle="Manage customer orders and track deliveries"
            onNewOrder={handleNewOrder}
          /> */}

          {/* Today's Order Section */}
          <div className="px-4 lg:px-6">
            <OrderInfo />
          </div>

          {/* Order Details Grid */}
          <div className="px-4 lg:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <CustomerOrderSection />
              <DeliveryAddressSection />
              <ExpensesSection />
            </div>
          </div>

          {/* Products Ordered Table */}
          <div className="px-4 lg:px-6">
            <ProductsOrderedTable />
          </div>

        </div>
      </div>
    </div>
  )
}
