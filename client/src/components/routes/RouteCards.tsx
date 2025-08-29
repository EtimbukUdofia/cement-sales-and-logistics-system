import { Building2, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import truck from "@/assets/TRUCK.png"

const routeData = [
  {
    from: "Dangote Railway Terminal",
    to: "Shop A - Lagos Main",
    quantity: "25 Bags",
    status: "Active",
    statusColor: "bg-green-100 text-green-800",
    driver: "Akinde M",
    products: "2",
    truckNumber: "104-236",
    containerColor: "bg-red-500"
  },
  {
    from: "Dangote Railway Terminal",
    to: "Shop A - Lagos Main",
    quantity: "15 Bags",
    status: "Fault",
    statusColor: "bg-red-100 text-red-800",
    driver: "Shaibu A.",
    products: "2",
    truckNumber: "104-236",
    containerColor: "bg-orange-500"
  }
]

export function RouteCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {routeData.map((route, index) => (
        <Card key={index} className="border border-gray-200">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* From Section */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <span className="text-sm font-medium text-gray-600 border border-gray-300 rounded-sm p-1">From</span>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-sm p-1">
                    <Building2 size={16} className="text-gray-500" />
                    <span className="text-sm font-medium">{route.from}</span>
                  </div>
                </div>
                <Badge variant="outline" className={`${route.status === 'Active' ? 'border-green-200 text-green-700' : 'border-red-200 text-red-700'}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${route.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  {route.status}
                </Badge>
              </div>

              {/* To Section */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <span className="text-sm font-medium text-gray-600 border border-gray-300 rounded-sm p-1">To</span>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-sm p-1">
                    <MapPin size={16} className="text-gray-500" />
                    <span className="text-sm font-medium">{route.to}</span>
                  </div>
                </div>
                <span className="text-xl font-bold text-gray-900">{route.quantity}</span>
              </div>

                <div className="flex flex-col sm:flex-row">
                <div className="space-y-4 sm:mr-6">
                  {/* Driver Section */}
                  <div>
                  <span className="text-sm font-medium text-gray-600">Driver</span>
                  <p className="text-sm font-medium mt-1">{route.driver}</p>
                  </div>

                  {/* Products Section */}
                  <div>
                  <span className="text-sm font-medium text-gray-600">Products</span>
                  <p className="text-sm font-medium mt-1">{route.products}</p>
                  </div>

                  {/* Truck Number Section */}
                  <div>
                  <span className="text-sm font-medium text-gray-600">Truck Number</span>
                  <p className="text-sm font-medium mt-1">{route.truckNumber}</p>
                  </div>
                </div>

                <div className="hidden sm:flex flex-1 items-stretch min-h-0 overflow-hidden">
                  <img src={truck} alt="Truck" className="w-full h-full object-cover" />
                </div>
                </div>


            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
