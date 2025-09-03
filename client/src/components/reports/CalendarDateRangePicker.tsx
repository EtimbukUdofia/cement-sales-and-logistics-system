import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

interface DateRange {
  from: Date
  to: Date
}

interface CalendarDateRangePickerProps {
  dateRange: DateRange
  onDateRangeChange: (dateRange: DateRange) => void
  className?: string
}

export function CalendarDateRangePicker({
  dateRange,
  onDateRangeChange,
  className
}: CalendarDateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value)
    if (!isNaN(newDate.getTime())) {
      onDateRangeChange({
        from: newDate,
        to: dateRange.to
      })
    }
  }

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value)
    if (!isNaN(newDate.getTime())) {
      onDateRangeChange({
        from: dateRange.from,
        to: newDate
      })
    }
  }

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  return (
    <div className={className}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-start text-left font-normal"
      >
        <Calendar className="mr-2 h-4 w-4" />
        {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
      </Button>

      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 bg-white border rounded-md shadow-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">From Date</label>
              <input
                type="date"
                value={formatDateForInput(dateRange.from)}
                onChange={handleFromDateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">To Date</label>
              <input
                type="date"
                value={formatDateForInput(dateRange.to)}
                onChange={handleToDateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button onClick={() => setIsOpen(false)} className="w-full">
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
