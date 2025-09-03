import { useShop } from "@/hooks/useShop.ts"
import { Building2, MapPin } from "lucide-react"

export function ShopInfo() {
  const { currentShop, loading } = useShop();

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg animate-pulse">
        <Building2 size={16} className="text-muted-foreground" />
        <div className="flex flex-col">
          <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (!currentShop) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
        <Building2 size={16} className="text-muted-foreground" />
        <div className="flex flex-col">
          <span className="text-sm font-medium">No Shop</span>
          <span className="text-xs text-muted-foreground">Not assigned</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
      <Building2 size={16} className="text-muted-foreground" />
      <div className="flex flex-col">
        <span className="text-sm font-medium">{currentShop.name}</span>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin size={12} />
          {currentShop.address}
        </span>
      </div>
    </div>
  );
}
