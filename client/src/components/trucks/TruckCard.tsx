import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import truckImage from "@/assets/TRUCK.png"

type Truck = {
  id: number
  brand: string
  plateNumber: string
  orderCompleted: number
  location: string
  capacity: number
  driverAssigned: string
  status: string
}

type TruckCardProps = {
  truck: Truck
}

export function TruckCard({ truck }: TruckCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "in-use":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "maintenance":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  return (
    <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Truck Illustration */}
          <div className="flex justify-center">
            <div className="bg-gray-100 rounded-lg p-4 w-full">
              <img src={truckImage} alt="Truck Illustration" className="w-full h-32 object-contain" />
            </div>
          </div>

          {/* Truck Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{truck.brand}</h3>
              <Badge className={getStatusColor(truck.status)}>
                {truck.status}
              </Badge>
            </div>

            <div className="text-sm text-gray-600">
              <p>Plate Number: <span className="font-medium text-gray-900">{truck.plateNumber}</span></p>
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex justify-between">
                <p className="text-gray-500">Order Completed</p>
                <p className="font-semibold text-gray-900">{truck.orderCompleted}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-500">Location</p>
                <p className="font-medium text-gray-900">{truck.location}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-500">Capacity</p>
                <p className="font-medium text-gray-900">{truck.capacity}</p>
              </div>
              <div className="flex justify-between"> 
                <p className="text-gray-500">Driver Assigned</p>
                <p className="font-medium text-gray-900">{truck.driverAssigned}</p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
