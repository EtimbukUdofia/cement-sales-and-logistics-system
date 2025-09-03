import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface AddProductCardProps {
  onClick: () => void;
}

export function AddProductCard({ onClick }: AddProductCardProps) {
  return (
    <Card className="relative overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl h-full">
      <CardContent className="p-0 h-full">
        <div className="flex items-center justify-center h-full min-h-[320px]">
          <Button
            variant="outline"
            size="icon"
            onClick={onClick}
            className="h-16 w-16 rounded-full border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors bg-transparent"
          >
            <Plus className="h-8 w-8 text-gray-400" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
