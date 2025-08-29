import {
  InventoryHeader,
  InventoryStatsCards,
  ShopInventoryCards,
  InventorySummaryTable
} from "@/components/inventory"

export default function InventoryPage() {
  return (
    <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <InventoryHeader />

      {/* Stats Cards */}
      <InventoryStatsCards />

      {/* Shop Inventory Cards */}
      <ShopInventoryCards />

      {/* Inventory Summary Table */}
      <InventorySummaryTable />
    </div>
  )
}
