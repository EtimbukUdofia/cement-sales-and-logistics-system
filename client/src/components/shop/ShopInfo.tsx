import { useShop } from "@/hooks/useShop"
import { useAuthStore } from "@/store/authStore"
import {
  // Building2,
  MapPin
} from "lucide-react"

export function ShopInfo() {
  const { currentShop, loading } = useShop();
  const { user } = useAuthStore();

  // Don't render anything for admin users
  if (user?.role === 'admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3  bg-muted rounded-lg animate-pulse">
        {/* <Building2 size={16} className="text-muted-foreground" /> */}
        <div className="flex flex-col">
          <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (!currentShop) {
    return (
      <div className="flex items-center gap-2 px-3 bg-red-100 rounded-lg">
        {/* <Building2 size={16} className="text-muted-foreground" /> */}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-red-700">No Shop Assigned</span>
          <span className="text-xs text-red-600">Contact admin</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3  bg-muted rounded-lg">
      {/* <Building2 size={16} className="text-muted-foreground" /> */}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-center">{currentShop.name}</span>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin size={12} />
          {currentShop.address}
        </span>
      </div>
    </div>
  );
}
