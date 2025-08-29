import { Package, Store, ShoppingCart, AlertTriangle } from "lucide-react"
import { StatCard } from "../stat-card"

export function InventoryStatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        description="Total Inventory"
        content="1488 Bags"
        icon={<Package size={28} />}
        iconBgClassName="bg-blue-500 text-white"
      />

      <StatCard
        description="Active Shops"
        content="3"
        icon={<Store size={28} />}
        iconBgClassName="bg-green-500 text-white"
      />

      <StatCard
        description="Products"
        content="5"
        icon={<ShoppingCart size={28} />}
        iconBgClassName="bg-purple-500 text-white"
      />

      <StatCard
        description="Low Stock Items"
        content="0"
        icon={<AlertTriangle size={28} />}
        iconBgClassName="bg-red-500 text-white"
      />
    </div>
  )
}
