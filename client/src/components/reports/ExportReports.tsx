import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Download, FileText, FileSpreadsheet, Printer } from "lucide-react"
import { toast } from "sonner"

interface ProductPerformance {
  productName: string
  variant: string
  revenue: number
  quantity: number
  orders: number
}

interface ReportData {
  revenue?: {
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
  }
  productPerformance?: ProductPerformance[]
  // Add other report data types as needed
}

interface ExportReportsProps {
  reportData: ReportData | null
  shopName: string
  dateRange: {
    from: Date
    to: Date
  }
}

export function ExportReports({ reportData, shopName, dateRange }: ExportReportsProps) {
  const [isExporting, setIsExporting] = useState(false)

  const generateFileName = (format: string) => {
    const dateStr = `${dateRange.from.toISOString().split('T')[0]}_to_${dateRange.to.toISOString().split('T')[0]}`
    const shopStr = shopName.replace(/\s+/g, '_').toLowerCase()
    return `${shopStr}_report_${dateStr}.${format}`
  }

  const exportToPDF = async () => {
    setIsExporting(true)
    try {
      // In a real application, you would use a library like jsPDF or call a backend endpoint
      // For now, we'll simulate the export
      await new Promise(resolve => setTimeout(resolve, 2000))

      const fileName = generateFileName('pdf')
      toast.success(`PDF report exported: ${fileName}`)

      // Simulate download
      const link = document.createElement('a')
      link.href = '#'
      link.download = fileName
      link.click()
    } catch {
      toast.error('Failed to export PDF report')
    } finally {
      setIsExporting(false)
    }
  }

  const exportToExcel = async () => {
    setIsExporting(true)
    try {
      // In a real application, you would use a library like xlsx or call a backend endpoint
      await new Promise(resolve => setTimeout(resolve, 1500))

      const fileName = generateFileName('xlsx')
      toast.success(`Excel report exported: ${fileName}`)

      // Simulate download
      const link = document.createElement('a')
      link.href = '#'
      link.download = fileName
      link.click()
    } catch {
      toast.error('Failed to export Excel report')
    } finally {
      setIsExporting(false)
    }
  }

  const exportToCSV = async () => {
    setIsExporting(true)
    try {
      if (!reportData) {
        throw new Error('No data available for export')
      }

      // Generate CSV content
      const csvData = []

      // Add header
      csvData.push('Report Summary')
      csvData.push(`Shop: ${shopName}`)
      csvData.push(`Date Range: ${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`)
      csvData.push('')

      // Add revenue metrics
      if (reportData.revenue) {
        csvData.push('Revenue Metrics')
        csvData.push(`Total Revenue,${reportData.revenue.totalRevenue}`)
        csvData.push(`Total Orders,${reportData.revenue.totalOrders}`)
        csvData.push(`Average Order Value,${reportData.revenue.averageOrderValue}`)
        csvData.push('')
      }

      // Add product performance
      if (reportData.productPerformance) {
        csvData.push('Product Performance')
        csvData.push('Product,Variant,Revenue,Quantity,Orders')
        reportData.productPerformance.forEach((product: ProductPerformance) => {
          csvData.push(`${product.productName},${product.variant},${product.revenue},${product.quantity},${product.orders}`)
        })
        csvData.push('')
      }

      const csvContent = csvData.join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', generateFileName('csv'))
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('CSV report exported successfully')
    } catch {
      toast.error('Failed to export CSV report')
    } finally {
      setIsExporting(false)
    }
  }

  const printReport = () => {
    window.print()
    toast.success('Print dialog opened')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting || !reportData}>
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export Report'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToPDF} disabled={isExporting}>
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel} disabled={isExporting}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV} disabled={isExporting}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={printReport}>
          <Printer className="mr-2 h-4 w-4" />
          Print Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
