import {
  InventoryHeader,
  InventoryStatsCards,
  ShopInventoryCards,
  InventorySummaryTable
} from "@/components/inventory"
import { useInventory } from "@/hooks/useInventory"
import { AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function InventoryPage() {
  const { error } = useInventory()

  if (error) {
    return (
      <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
        <InventoryHeader />

        <Card>
          <CardContent className="flex items-center gap-4 p-8">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Error Loading Inventory</h3>
              <p className="text-sm text-gray-600 mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

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
