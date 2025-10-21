import { RefreshCw, Plus, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useInventory } from "@/hooks/useInventory"
import { useNavigate } from "react-router"
import { useState } from "react"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"

export function InventoryHeader() {
  const { refetch, isLoading } = useInventory()
  const navigate = useNavigate()
  const [isSyncing, setIsSyncing] = useState(false)

  const handleRefresh = () => {
    refetch()
  }

  const handleManageShops = () => {
    navigate('/admin/shops')
  }

  const handleSyncInventory = async () => {
    setIsSyncing(true)
    try {
      const response = await apiClient.syncInventory() as {
        success: boolean;
        message: string;
        data: { created: number; removed: number; checked: number; message: string }
      }

      if (response.success) {
        toast.success(`Inventory synced: ${response.data.message}`)
        // Refresh the inventory data
        refetch()
      } else {
        toast.error('Failed to sync inventory')
      }
    } catch (error) {
      toast.error(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
        <p className="text-sm text-gray-600">Track cement inventory across all shops</p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleSyncInventory}
          disabled={isSyncing || isLoading}
        >
          <RefreshCcw size={16} className={`mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          Sync System
        </Button>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button
          onClick={handleManageShops}
          style={{
            background: "linear-gradient(104.76deg, #00078F 24.83%, #020BCB 50.87%, #00078F 75.94%)",
          }}
        >
          <Plus size={16} className="mr-2" />
          Manage Shops
        </Button>
      </div>
    </div>
  )
}
