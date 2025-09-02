import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function CustomerDetailsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Customer Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customerName" className="text-sm font-medium">
              Customer Name
            </Label>
            <Input
              id="customerName"
              placeholder="Customer Name"
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-sm font-medium">
              Phone Number
            </Label>
            <Input
              id="phoneNumber"
              placeholder="Phone Number"
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emailAddress" className="text-sm font-medium">
              Email Address
            </Label>
            <Input
              id="emailAddress"
              type="email"
              placeholder="Email Address"
              className="h-10"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
