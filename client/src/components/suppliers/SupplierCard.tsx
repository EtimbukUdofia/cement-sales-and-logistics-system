import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Truck } from "lucide-react";
import type { Supplier } from "@/data/suppliers";

interface SupplierCardProps {
  supplier: Supplier;
}

export function SupplierCard({ supplier }: SupplierCardProps) {
  return (
    <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Header with truck icon and status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-lg">
            <Truck className="w-6 h-6 text-blue-600" />
          </div>
          <Badge
            variant="secondary"
            className="bg-green-50 text-green-700 border-green-200 font-medium"
          >
            {supplier.status}
          </Badge>
        </div>

        {/* Supplier name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {supplier.name}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{supplier.location}</span>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-2 mb-4">
          <Phone className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{supplier.phone}</span>
        </div>

        {/* Inventory and Products */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Total Inventory:</span>
            <span className="text-sm font-medium text-gray-900">
              {supplier.totalInventory} {supplier.inventoryUnit}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Products:</span>
            <span className="text-sm font-medium text-gray-900">
              {supplier.products}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
