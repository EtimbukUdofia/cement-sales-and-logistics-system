// import { Card, CardContent } from "@/components/ui/card"
import { Package, Truck, ShoppingBag, AlertTriangle } from "lucide-react"
import { StatCard } from "@/components/stat-card"

// interface StatsCardProps {
//   title: string
//   value: string
//   icon: React.ComponentType<{ size?: number; className?: string }>
//   bgColor: string
//   iconColor: string
// }

// function StatsCard({ title, value, icon: Icon, bgColor, iconColor }: StatsCardProps) {
//   return (
//     <Card className={`${bgColor} border-0 text-white`}>
//       <CardContent className="p-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-sm font-medium text-white/80">{title}</p>
//             <p className="text-2xl font-bold">{value}</p>
//           </div>
//           <Icon size={24} className={iconColor} />
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

export function SalesInventoryStatsCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        description="Total Inventory"
        content="1488 Bags"
        icon={<Package className="text-white/90" size={24} />}
        iconBgClassName="bg-blue-500"
      />
      <StatCard
        description="Most Sold Stock"
        content="Dangote"
        icon={<Truck className="text-white/90" size={24} />}
        iconBgClassName="bg-green-500"
      />
      <StatCard
        description="Products"
        content="5"
        icon={<ShoppingBag className="text-white/90" size={24} />}
        iconBgClassName="bg-purple-500"
      />
      <StatCard
        description="Low Stock Items"
        content="0"
        icon={<AlertTriangle className="text-white/90" size={24} />}
        iconBgClassName="bg-red-500"
      />
    </div>
  )
}
