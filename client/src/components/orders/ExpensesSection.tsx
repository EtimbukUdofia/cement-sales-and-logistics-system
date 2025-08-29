import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ExpensesSection() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-medium text-gray-900">
          Expenses
        </CardTitle>
        <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">
          Edit
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-700 leading-relaxed flex flex-col gap-4">
          <span className="font-semibold flex justify-between">Fuel Cost: <span>$ 1000.05</span></span>
          <span className="font-semibold flex justify-between">Onloading Cost: <span>$ 1000.05</span></span>
          <span className="font-semibold flex justify-between">Offloading Cost: <span>$ 1000.05</span></span>
        </div>

        {/* footer */}
      </CardContent>
      <div className="px-6 mt-auto">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500 font-semibold">Initial Price:</span>
          <span className="text-sm ml-2 font-semibold ">$ 60, 200.05</span>
        </div>
        <p className="text-sm text-gray-400">After Transport & Work Expense</p>
      </div>
    </Card>
  )
}
