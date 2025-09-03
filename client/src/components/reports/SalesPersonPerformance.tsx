import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, TrendingUp, TrendingDown, Award } from "lucide-react"

interface SalesPersonPerformanceProps {
  data: Array<{
    id: string
    name: string
    email: string
    shopName: string
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    revenueGrowth: number
    ordersGrowth: number
    performanceScore: number
    rank: number
  }>
}

export function SalesPersonPerformance({ data }: SalesPersonPerformanceProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getPerformanceBadge = (score: number) => {
    if (score >= 90) return { label: 'Excellent', variant: 'default' as const, color: 'bg-green-500' }
    if (score >= 80) return { label: 'Good', variant: 'secondary' as const, color: 'bg-blue-500' }
    if (score >= 70) return { label: 'Average', variant: 'outline' as const, color: 'bg-yellow-500' }
    return { label: 'Needs Improvement', variant: 'destructive' as const, color: 'bg-red-500' }
  }

  const topPerformers = data.slice(0, 3)
  const allPerformers = data.slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users size={20} />
          Sales Person Performance
        </CardTitle>
        <CardDescription>
          Individual sales performance and rankings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top Performers Podium */}
        {topPerformers.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
              <Award size={16} className="text-yellow-500" />
              Top Performers
            </h4>
            <div className="grid gap-4 md:grid-cols-3">
              {topPerformers.map((performer, index) => {
                const badge = getPerformanceBadge(performer.performanceScore)
                const medals = ['🥇', '🥈', '🥉']

                return (
                  <div key={performer.id} className="p-4 border rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarFallback className={badge.color}>
                            {getInitials(performer.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -right-1 text-lg">
                          {medals[index]}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{performer.name}</div>
                        <div className="text-xs text-muted-foreground">{performer.shopName}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Revenue:</span>
                        <span className="font-medium">{formatCurrency(performer.totalRevenue)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Orders:</span>
                        <span className="font-medium">{performer.totalOrders}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Score:</span>
                        <Badge variant={badge.variant} className="text-xs">
                          {performer.performanceScore}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* All Performers List */}
        <div>
          <h4 className="text-sm font-medium mb-3">All Sales Personnel</h4>
          <div className="space-y-3">
            {allPerformers.map((performer) => {
              const badge = getPerformanceBadge(performer.performanceScore)

              return (
                <div key={performer.id} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar>
                        <AvatarFallback>{getInitials(performer.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{performer.name}</div>
                        <div className="text-sm text-muted-foreground">{performer.email}</div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {performer.shopName}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium">Rank #{performer.rank}</div>
                      <Badge variant={badge.variant} className="text-xs">
                        {badge.label}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Revenue</div>
                      <div className="font-medium">{formatCurrency(performer.totalRevenue)}</div>
                      <div className="flex items-center gap-1 mt-1">
                        {performer.revenueGrowth >= 0 ? (
                          <TrendingUp size={12} className="text-green-600" />
                        ) : (
                          <TrendingDown size={12} className="text-red-600" />
                        )}
                        <span className={`text-xs ${performer.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {Math.abs(performer.revenueGrowth).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground">Orders</div>
                      <div className="font-medium">{performer.totalOrders}</div>
                      <div className="flex items-center gap-1 mt-1">
                        {performer.ordersGrowth >= 0 ? (
                          <TrendingUp size={12} className="text-green-600" />
                        ) : (
                          <TrendingDown size={12} className="text-red-600" />
                        )}
                        <span className={`text-xs ${performer.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {Math.abs(performer.ordersGrowth).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground">Avg Order Value</div>
                      <div className="font-medium">{formatCurrency(performer.averageOrderValue)}</div>
                      <div className="mt-1">
                        <Progress value={performer.performanceScore} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
