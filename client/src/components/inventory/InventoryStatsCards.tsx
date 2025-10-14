import { Package, Store, ShoppingCart, AlertTriangle } from "lucide-react"
import { StatCard } from "../stat-card"
import { useInventory } from "@/hooks/useInventory"

export function InventoryStatsCards() {
  const { stats, inventorySummary, isLoading } = useInventory()

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  const activeShops = inventorySummary?.length || 0
  const totalProducts = stats?.totalProducts || 0
  const lowStockItems = stats?.lowStockItems || 0
  const totalQuantity = stats?.totalQuantity || 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        description="Total Inventory"
        content={`${totalQuantity.toLocaleString()} Bags`}
        icon={<Package size={28} />}
        iconBgClassName="bg-blue-500 text-white"
      />

      <StatCard
        description="Active Shops"
        content={activeShops.toString()}
        icon={<Store size={28} />}
        iconBgClassName="bg-green-500 text-white"
      />

      <StatCard
        description="Products"
        content={totalProducts.toString()}
        icon={<ShoppingCart size={28} />}
        iconBgClassName="bg-purple-500 text-white"
      />

      <StatCard
        description="Low Stock Items"
        content={lowStockItems.toString()}
        icon={<AlertTriangle size={28} />}
        iconBgClassName={lowStockItems > 0 ? "bg-red-500 text-white" : "bg-green-500 text-white"}
      />
    </div>
  )
}
