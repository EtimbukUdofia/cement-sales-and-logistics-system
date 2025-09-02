import { useState } from "react"
import {
  SalesOrderHeader,
  // CustomerDetailsSection,
  ProductFilters,
  ProductGrid,
  CartDetailsSection
} from "@/components/orders/salesPerson"

export default function SalesOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('all')

  return (
    <div className="flex-1 p-6">
      {/* Header */}
      <div className="mb-6">
        <SalesOrderHeader />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Customer Details */}
          {/* <CustomerDetailsSection /> */}

          {/* Product Filters */}
          <ProductFilters
            onSearchChange={setSearchTerm}
            onBrandChange={setSelectedBrand}
          />

          {/* Products Grid */}
          <ProductGrid
            searchTerm={searchTerm}
            selectedBrand={selectedBrand}
          />
        </div>

        {/* Cart Details Sidebar */}
        <div className="lg:col-span-1">
          <CartDetailsSection />
        </div>
      </div>
    </div>
  )
}
