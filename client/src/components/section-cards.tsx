import { ChartCandlestick, Layers, ShoppingBasket, ShoppingCart } from "lucide-react"
import { StatCard } from "./stat-card"

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <StatCard
        description="Today's Sale"
        content="100 Sold"
        iconBgClassName="bg-purple-500 text-white"
        icon={<ShoppingBasket size={28} />}
      />
      <StatCard
        description="Gross Margin"
        content="70 %"
        iconBgClassName="bg-green-500 text-white"
        icon={<ChartCandlestick size={28} />}
      />
      <StatCard
        description="Stock on Hand"
        content="1500"
        iconBgClassName="bg-orange-500 text-white"
        icon={<Layers size={28} />}
      />
      <StatCard
        description="Top Product"
        content="Dangote"
        iconBgClassName="bg-blue-500 text-white"
        icon={<ShoppingCart size={28} />}
      />
      
    </div>
  )
}
