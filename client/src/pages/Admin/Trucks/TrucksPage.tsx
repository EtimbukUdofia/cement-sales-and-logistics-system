import { TrucksHeader } from "@/components/trucks/TrucksHeader"
import { TrucksFilters } from "@/components/trucks/TrucksFilters"
import { TrucksGrid } from "@/components/trucks/TrucksGrid"

export default function TrucksPage() {
  return (
    <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <TrucksHeader />

      {/* Filters */}
      <TrucksFilters />

      {/* Trucks Grid */}
      <TrucksGrid />
    </div>
  )
}
