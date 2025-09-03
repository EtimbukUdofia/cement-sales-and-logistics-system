import { Plus } from "lucide-react"
import { Button } from "../ui/button"

interface ProductHeaderProps {
  title: string
  subtitle: string
  productCount?: number
  onAddProduct?: () => void
}

export function ProductHeader({ title, subtitle, productCount, onAddProduct }: ProductHeaderProps) {
  return (
    <div className="px-4 lg:px-6 flex flex-row justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {title} {productCount !== undefined && `(${productCount})`}
        </h1>
        <p className="text-gray-600 text-sm mt-1">{subtitle}</p>
      </div>

      {onAddProduct && (
        <Button
          onClick={onAddProduct}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      )}
    </div>
  )
}
