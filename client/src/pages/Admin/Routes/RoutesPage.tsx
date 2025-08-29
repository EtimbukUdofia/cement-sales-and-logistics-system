import { RoutesHeader } from "@/components/routes/RoutesHeader"
import { RouteCards } from "@/components/routes/RouteCards"
import { ActiveRoutesTable } from "@/components/routes/ActiveRoutesTable"

export default function RoutesPage() {
  return (
    <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <RoutesHeader />

      {/* Route Cards */}
      <RouteCards />

      {/* Active Routes Table */}
      <ActiveRoutesTable />
    </div>
  )
}
