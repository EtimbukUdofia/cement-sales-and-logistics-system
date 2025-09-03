import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import type { Product } from "@/store/productStore"

interface ProductCardProps extends Product {
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

export function ProductCard({
  _id,
  name,
  variant,
  brand,
  imageUrl,
  size,
  price,
  isActive,
  onEdit,
  onDelete
}: ProductCardProps) {
  const handleEdit = () => {
    if (onEdit) {
      onEdit({
        _id,
        name,
        variant,
        brand,
        imageUrl,
        size,
        price,
        isActive,
        description: '',
        createdAt: '',
        updatedAt: ''
      });
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(_id);
    }
  };

  // Fallback image if no imageUrl is provided
  const displayImage = imageUrl || '/assets/products/cement-placeholder.jpg';
  const displayVariant = variant || '';
  const displaySize = `${size}kg`;

  return (
    <Card className={`relative overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl ${!isActive ? 'opacity-60' : ''}`}>
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative h-35 w-full mb-4 overflow-hidden rounded-t-2xl">
          <img
            src={displayImage}
            alt={`${brand} ${name} ${variant || ''}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/assets/products/cement-placeholder.jpg';
            }}
          />
          {!isActive && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold">Inactive</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="px-4 pb-4 space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-black text-xl mb-1">
                {brand} {name}
              </h3>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              {displaySize}
            </p>
            {displayVariant && (
              <p className="text-purple-600 font-medium text-lg mt-1 text-right">
                {displayVariant}
              </p>
            )}
          </div>

          {/* Price Section */}
          <div className="flex items-center gap-3 pt-2">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <span className="text-gray-600 text-sm font-medium">Price</span>
            </div>
            <div className="bg-gray-100 px-4 py-2 rounded-lg flex-1">
              <span className="font-bold text-lg text-black">
                ₦{price.toLocaleString()}.00
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
