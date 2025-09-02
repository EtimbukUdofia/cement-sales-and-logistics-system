import { useShop } from "@/hooks/useShop"
import { Building2 } from "lucide-react"

export function SalesOrderHeader() {
  const { currentShop } = useShop();

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold tracking-tight">Sales Information</h1>
      <div className="flex items-center gap-4">
        <p className="text-muted-foreground">Products available in stock</p>
        {currentShop && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Building2 size={14} />
            <span>{currentShop.name}</span>
          </div>
        )}
      </div>
    </div>
  )
}
