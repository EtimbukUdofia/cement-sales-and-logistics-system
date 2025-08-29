import { Plus } from "lucide-react"
import { Button } from "../ui/button"

interface ProductHeaderProps {
  title: string
  subtitle: string
}

export function ProductHeader({ title, subtitle }: ProductHeaderProps) {
  return (
    <div className="px-4 lg:px-6 flex flex-row justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 text-sm mt-1">{subtitle}</p>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors bg-green-500 px-6"
      >
        <Plus className="h-10 w-10 text-white" />
      </Button>
    </div>
  )
}
