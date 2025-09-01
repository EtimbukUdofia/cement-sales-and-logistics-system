import {
  SalesInventoryHeader,
  SalesInventoryStatsCards,
  SalesInventorySummaryTable
} from "@/components/inventory/salesPerson"

export default function SalesInventoryPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <SalesInventoryHeader />

      {/* Stats Cards */}
      <SalesInventoryStatsCards />

      {/* Inventory Summary Table */}
      <SalesInventorySummaryTable />
    </div>
  )
}
