import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function OrderInfo() {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-col">
          <h2 className="text-xl font-semibold text-gray-900">Today's Order</h2>
            <Badge
            variant="secondary"
            className="bg-[#EDEEFF] text-gray-600 hover:bg-[#EDEEFF]"
            >
            Ready to be moved
            </Badge>
        </div>

        <Button
          className="text-white hover:opacity-90"
          style={{
            background: "linear-gradient(104.76deg, #00078F 24.83%, #020BCB 50.87%, #00078F 75.94%)",
          }}
        >
          Print Order
        </Button>
      </div>

      <div className="flex gap-8 text-sm text-gray-600">
        <div className="bg-gray-100 px-3 py-1 rounded">
          <span className="font-medium">Paid on:</span> 2024 - 02 - 13, 12:56 PM
        </div>
        <div className="bg-gray-100 px-3 py-1 rounded">
          <span className="font-medium">Placed on:</span> 2024 - 02 - 13, 12:56 PM
        </div>
      </div>
    </div>
  )
}
