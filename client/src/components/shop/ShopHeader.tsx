import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface ShopHeaderProps {
  onAddShop: () => void
}

export function ShopHeader({ onAddShop }: ShopHeaderProps) {
  return (
    <div className="px-4 sm:px-6 lg:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Shops</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage shop locations and their managers
          </p>
        </div>
        <Button onClick={onAddShop} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Add Shop
        </Button>
      </div>
    </div>
  )
}