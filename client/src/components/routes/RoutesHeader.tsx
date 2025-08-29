import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function RoutesHeader() {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Route Management</h1>
        <p className="text-sm text-gray-600">Track cement distribution from suppliers to destination</p>
      </div>
      <Button style={{
        background: "linear-gradient(104.76deg, #00078F 24.83%, #020BCB 50.87%, #00078F 75.94%)",
      }}>
        <Plus size={16} className="mr-2" />
        Create Route
      </Button>
    </div>
  )
}
