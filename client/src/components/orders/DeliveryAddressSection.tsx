import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DeliveryAddressSection() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-medium text-gray-900">
          DELIVERY ADDRESS
        </CardTitle>
        <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">
          Edit
        </Button>
      </CardHeader>
      <CardContent className="space-y-20">
        <div className="text-sm text-gray-700 leading-relaxed">
          Shop A - Main Victoria Island Lagos Plot 2
          <br />
          {/* <br /> */}
          Opposite Ikare Elegushi Filling Station
        </div>

        {/* footer */}
        <div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500 font-semibold">Initial Price:</span>
            <span className="text-sm ml-2 font-semibold ">$ 60, 200.05</span>
          </div>
          <p className="text-sm text-gray-400">After Transport & Work Expense</p>
        </div>
      </CardContent>
    </Card>
  )
}
