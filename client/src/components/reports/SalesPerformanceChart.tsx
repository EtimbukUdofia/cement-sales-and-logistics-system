import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp } from "lucide-react"

interface MonthlyPerformanceData {
  month: string
  sales: number
  orders: number
  target: number
}

interface SalesPerformanceChartProps {
  data: MonthlyPerformanceData[]
}

export function SalesPerformanceChart({ data }: SalesPerformanceChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp size={20} />
          Monthly Sales Performance
        </CardTitle>
        <CardDescription>
          Track your sales vs targets over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                className="text-sm"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                className="text-sm"
                tick={{ fontSize: 12 }}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                labelClassName="font-medium"
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'sales' ? 'Actual Sales' :
                    name === 'target' ? 'Target' : 'Orders'
                ]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#2563eb"
                strokeWidth={3}
                name="Actual Sales"
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2 }}
              />
              {/* <Line
                type="monotone"
                dataKey="target"
                stroke="#dc2626"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Target"
                dot={{ fill: '#dc2626', strokeWidth: 2, r: 3 }}
              /> */}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Summary */}
        {/* <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t">
          {data.length > 0 && (
            <>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Current Month</div>
                <div className="text-lg font-bold text-blue-600">
                  {formatCurrency(data[data.length - 1]?.sales || 0)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Monthly Target</div>
                <div className="text-lg font-bold text-red-600">
                  {formatCurrency(data[data.length - 1]?.target || 0)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Achievement</div>
                <div className={`text-lg font-bold ${((data[data.length - 1]?.sales || 0) / (data[data.length - 1]?.target || 1)) >= 1
                    ? 'text-green-600'
                    : 'text-orange-600'
                  }`}>
                  {(((data[data.length - 1]?.sales || 0) / (data[data.length - 1]?.target || 1)) * 100).toFixed(1)}%
                </div>
              </div>
            </>
          )}
        </div> */}
      </CardContent>
    </Card>
  )
}
