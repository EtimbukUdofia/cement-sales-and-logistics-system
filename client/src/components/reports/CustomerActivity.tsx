import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, TrendingUp, Phone, MapPin } from "lucide-react"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  location: string
  totalPurchases: number
  lastOrderDate: string
  totalOrders: number
  status: 'active' | 'inactive' | 'new'
}

interface CustomerActivityProps {
  customers: Customer[]
}

export function CustomerActivity({ customers }: CustomerActivityProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'new':
        return 'bg-blue-100 text-blue-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Sort customers by total purchases (descending)
  const sortedCustomers = [...customers].sort((a, b) => b.totalPurchases - a.totalPurchases)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users size={20} />
          Top Customers
        </CardTitle>
        <CardDescription>
          Your most valuable customers this period
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedCustomers.slice(0, 8).map((customer, index) => (
            <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                      {getInitials(customer.name)}
                    </AvatarFallback>
                  </Avatar>
                  {index < 3 && (
                    <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{customer.name}</h4>
                    <Badge variant="outline" className={getStatusColor(customer.status)}>
                      {customer.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Phone size={12} />
                      <span>{customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={12} />
                      <span>{customer.location}</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Last order: {new Date(customer.lastOrderDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="font-bold text-green-600">
                  {formatCurrency(customer.totalPurchases)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {customer.totalOrders} order{customer.totalOrders !== 1 ? 's' : ''}
                </div>
                <div className="text-xs flex items-center gap-1 text-muted-foreground">
                  <TrendingUp size={10} />
                  <span>
                    {formatCurrency(customer.totalPurchases / customer.totalOrders)} avg
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {customers.length === 0 && (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No customers yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start making sales to see your customer activity here.
            </p>
          </div>
        )}

        {customers.length > 8 && (
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing top 8 of {customers.length} customers
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
