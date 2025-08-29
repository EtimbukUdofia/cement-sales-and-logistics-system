import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProductCardProps {
  id: string
  name: string
  image: string
  size: string
  price: number
  percentage?: number
  variant?: string
  backgroundColor?: string
}

export function ProductCard({
  name,
  image,
  size,
  price,
  percentage = 10,
  variant
}: ProductCardProps) {
  return (
    <Card className="relative overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative h-35 w-full mb-4 overflow-hidden rounded-t-2xl">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="px-4 pb-4 space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-black text-xl mb-1">
                {name}
              </h3>

              {/* Percentage Badge */}
              <div>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md"
                >
                  ↗ {percentage}%
                </Badge>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              {size}
            </p>
            {variant ? (
              <p className="text-purple-600 font-medium text-lg mt-1 text-right">
                {variant}
              </p>
            ) : (
              <span className="invisible block text-lg mt-1 text-right">
                placeholder
              </span>
            )}
          </div>

          {/* Price Section */}
          <div className="flex items-center gap-3 pt-2">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <span className="text-gray-600 text-sm font-medium">Price</span>
            </div>
            <div className="bg-gray-100 px-4 py-2 rounded-lg flex-1">
              <span className="font-bold text-lg text-black">
                {price.toLocaleString()}.00
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
