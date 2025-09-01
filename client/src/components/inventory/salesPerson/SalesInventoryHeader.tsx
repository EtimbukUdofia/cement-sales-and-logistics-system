// import { Button } from "@/components/ui/button"
// import { Plus } from "lucide-react"

export function SalesInventoryHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground">Track cement inventory across all shops</p>
      </div>
      {/* <Button className="bg-blue-600 hover:bg-blue-700 text-white">
        <Plus size={16} className="mr-2" />
        New Purchase Order
      </Button> */}
    </div>
  )
}
