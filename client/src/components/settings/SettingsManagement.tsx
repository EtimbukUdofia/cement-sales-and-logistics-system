import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"
import { DollarSign, Loader2, Save, Truck } from "lucide-react"

interface SettingsFormData {
  onloadingCost: number
  deliveryCost: number
  offloadingCost: number
}

export function SettingsManagement() {
  const [formData, setFormData] = useState<SettingsFormData>({
    onloadingCost: 0,
    deliveryCost: 0,
    offloadingCost: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getSettings()
      if (response.success && response.settings) {
        const settings = response.settings as { onloadingCost: number; deliveryCost: number; offloadingCost: number }
        setFormData({
          onloadingCost: settings.onloadingCost,
          deliveryCost: settings.deliveryCost,
          offloadingCost: settings.offloadingCost
        })
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate that all values are non-negative numbers
    if (formData.onloadingCost < 0 || formData.deliveryCost < 0 || formData.offloadingCost < 0) {
      toast.error('All costs must be non-negative numbers')
      return
    }

    try {
      setIsSaving(true)
      const response = await apiClient.updateSettings(formData)

      if (response.success) {
        toast.success('Settings updated successfully')
      } else {
        throw new Error(response.message || 'Failed to update settings')
      }
    } catch (error) {
      console.error('Failed to update settings:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof SettingsFormData, value: string) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0) {
      setFormData(prev => ({ ...prev, [field]: numValue }))
    } else if (value === '') {
      setFormData(prev => ({ ...prev, [field]: 0 }))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings Management</h2>
        <p className="text-muted-foreground">
          Configure pricing for additional delivery services
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Delivery Service Pricing (Per Bag)
          </CardTitle>
          <CardDescription>
            Set the costs per bag of cement for onloading, delivery, and offloading services. These costs will be multiplied by the number of bags and added to orders when the cashier enables delivery during checkout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="onloadingCost" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Onloading Cost per Bag (₦)
                </Label>
                <Input
                  id="onloadingCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.onloadingCost}
                  onChange={(e) => handleInputChange('onloadingCost', e.target.value)}
                  placeholder="Enter cost per bag"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Cost per bag for loading cement onto vehicle
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryCost" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Delivery Cost per Bag (₦)
                </Label>
                <Input
                  id="deliveryCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.deliveryCost}
                  onChange={(e) => handleInputChange('deliveryCost', e.target.value)}
                  placeholder="Enter cost per bag"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Transportation cost per bag to customer location
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="offloadingCost" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Offloading Cost per Bag (₦)
                </Label>
                <Input
                  id="offloadingCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.offloadingCost}
                  onChange={(e) => handleInputChange('offloadingCost', e.target.value)}
                  placeholder="Enter cost per bag"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Cost per bag for unloading at destination
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-1">
                <p className="text-sm font-medium">Total Cost Per Bag</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₦{(formData.onloadingCost + formData.deliveryCost + formData.offloadingCost).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  This cost will be multiplied by the number of bags in each order
                </p>
              </div>

              <Button type="submit" disabled={isSaving} className="gap-2">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <p>• Cashiers can enable delivery services during checkout by toggling the delivery option</p>
          <p>• When delivery is enabled, each cost is multiplied by the total number of bags ordered</p>
          <p>• Example: If onloading is ₦50/bag and customer orders 20 bags, onloading cost = ₦1,000</p>
          <p>• The customer sees a breakdown showing per-bag rates and total costs for their order quantity</p>
          <p>• You can adjust these prices anytime, and changes take effect immediately for new orders</p>
        </CardContent>
      </Card>
    </div>
  )
}
