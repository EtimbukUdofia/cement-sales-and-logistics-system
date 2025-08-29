import { Button } from "@/components/ui/button"
import { Plus, Bell } from "lucide-react"

interface OrderHeaderProps {
  title: string;
  subtitle: string;
  onNewOrder?: () => void;
}

export function OrderHeader({
  title,
  subtitle,
  onNewOrder
}: OrderHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          {title}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={onNewOrder}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Order
        </Button>

        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
        </Button>

        <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
          <img
            src="/api/placeholder/32/32"
            alt="User avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  )
}
