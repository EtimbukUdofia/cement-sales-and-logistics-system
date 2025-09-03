import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, Trophy, TrendingUp, Calendar } from "lucide-react"

interface SalesGoal {
  id: string
  title: string
  target: number
  current: number
  deadline: string
  category: 'monthly' | 'quarterly' | 'yearly'
  status: 'on_track' | 'behind' | 'completed' | 'overdue'
}

interface SalesGoalsProps {
  goals: SalesGoal[]
}

export function SalesGoals({ goals }: SalesGoalsProps) {
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
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'on_track':
        return 'bg-blue-100 text-blue-800'
      case 'behind':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Trophy className="h-4 w-4" />
      case 'on_track':
        return <TrendingUp className="h-4 w-4" />
      case 'behind':
      case 'overdue':
        return <Target className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline)
    const today = new Date()
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target size={20} />
          Sales Goals & Targets
        </CardTitle>
        <CardDescription>
          Track your progress towards sales objectives
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {goals.map((goal) => {
            const progress = calculateProgress(goal.current, goal.target)
            const daysLeft = getDaysUntilDeadline(goal.deadline)

            return (
              <div key={goal.id} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(goal.status)}
                      <h4 className="font-medium">{goal.title}</h4>
                    </div>
                    <Badge variant="outline" className={getStatusColor(goal.status)}>
                      {goal.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {progress.toFixed(1)}% complete
                    </div>
                  </div>
                </div>

                <Progress value={progress} className="h-2" />

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {daysLeft > 0
                        ? `${daysLeft} days left`
                        : daysLeft === 0
                          ? 'Due today'
                          : `${Math.abs(daysLeft)} days overdue`
                      }
                    </span>
                  </div>
                  <div className="capitalize">
                    {goal.category} goal
                  </div>
                </div>

                {goal.status === 'completed' && (
                  <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                    <Trophy className="h-4 w-4" />
                    <span>Goal achieved! 🎉</span>
                  </div>
                )}

                {goal.status === 'behind' && daysLeft <= 7 && daysLeft > 0 && (
                  <div className="flex items-center gap-2 text-yellow-600 text-sm font-medium">
                    <Target className="h-4 w-4" />
                    <span>Action needed - {formatCurrency(goal.target - goal.current)} remaining</span>
                  </div>
                )}

                {goal.status === 'overdue' && (
                  <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                    <Target className="h-4 w-4" />
                    <span>Overdue - Review and adjust target</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {goals.length === 0 && (
          <div className="text-center py-8">
            <Target className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No goals set</h3>
            <p className="mt-1 text-sm text-gray-500">
              Set sales goals to track your progress and achievements.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
