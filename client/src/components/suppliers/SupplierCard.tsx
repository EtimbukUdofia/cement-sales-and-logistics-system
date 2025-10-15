import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Truck } from "lucide-react";
import type { SupplierData } from "@/lib/api";

interface SupplierCardProps {
  supplier: SupplierData;
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
            className={`font-medium ${supplier.isActive
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
              }`}
          >
            {supplier.isActive ? "Available" : "Inactive"}
          </Badge>
        </div>

        {/* Supplier name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {supplier.name}
        </h3>

        {/* Location */}
        {supplier.address && (
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{supplier.address}</span>
          </div>
        )}

        {/* Contact Person */}
        {supplier.contactPerson && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-gray-600">Contact: {supplier.contactPerson}</span>
          </div>
        )}

        {/* Phone */}
        <div className="flex items-center gap-2 mb-4">
          <Phone className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{supplier.phone}</span>
        </div>

        {/* Email */}
        {supplier.email && (
          <div className="mb-4">
            <span className="text-sm text-gray-600">{supplier.email}</span>
          </div>
        )}

        {/* Products */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Products:</span>
            <span className="text-sm font-medium text-gray-900">
              {supplier.products.length}
            </span>
          </div>
          {supplier.products.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {supplier.products.slice(0, 2).map((product) => (
                <Badge key={product._id} variant="outline" className="text-xs">
                  {product.brand}
                </Badge>
              ))}
              {supplier.products.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{supplier.products.length - 2} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
