import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"

interface AddShopCardProps {
  onClick: () => void
}

export function AddShopCard({ onClick }: AddShopCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow border-dashed border-2 hover:border-primary/50"
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center justify-center h-48 p-6">
        <div className="rounded-full bg-primary/10 p-3 mb-3">
          <Plus className="h-6 w-6 text-primary" />
        </div>
        <h3 className="font-medium text-sm text-center">Add New Shop</h3>
        <p className="text-xs text-muted-foreground text-center mt-1">
          Create a new shop location
        </p>
      </CardContent>
    </Card>
  )
}