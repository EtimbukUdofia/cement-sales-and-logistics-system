import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface SuppliersHeaderProps {
  title: string;
  subtitle: string;
  onNewPurchaseOrder?: () => void;
}

export function SuppliersHeader({
  title,
  subtitle,
  onNewPurchaseOrder
}: SuppliersHeaderProps) {
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
      <Button
        onClick={onNewPurchaseOrder}
        className="text-white font-medium px-4 py-2"
        style={{
          background: "linear-gradient(104.76deg, #00078F 24.83%, #020BCB 50.87%, #00078F 75.94%)",
        }}
      >
        <Plus className="w-4 h-4 mr-2" />
        New Purchase Order
      </Button>
    </div>
  );
}
