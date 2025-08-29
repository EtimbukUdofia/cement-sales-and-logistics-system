import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CustomerOrderSection() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-medium text-gray-900">
          CUSTOMER & ORDER
        </CardTitle>
        <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">
          Edit
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Name:</span>
          <span className="text-sm font-medium">Ahmed Musa</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Email:</span>
          <span className="text-sm font-medium text-blue-600 underline">
            ahmedmus@gmail.com
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Phone:</span>
          <span className="text-sm font-medium">+234 - 44420201736</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Delivery Method:</span>
          <span className="text-sm font-medium">Company Truck 1</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Driver Name:</span>
          <span className="text-sm font-medium">Danda Seyi</span>
        </div>
      </CardContent>
    </Card>
  )
}
