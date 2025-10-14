import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useShopStore, type Shop } from "../../store/shopStore"
import { useUserManagement } from "../../hooks/useUserManagement"
import { toast } from "sonner"

const shopFormSchema = z.object({
  name: z.string().min(1, "Shop name is required").max(100, "Shop name must be less than 100 characters"),
  address: z.string().min(1, "Address is required").max(255, "Address must be less than 255 characters"),
  phone: z.string().min(1, "Phone number is required").max(20, "Phone number must be less than 20 characters"),
  email: z.email("Invalid email format").optional().or(z.literal("")),
  manager: z.string().optional(),
  isActive: z.boolean(),
})

type ShopFormData = z.infer<typeof shopFormSchema>

interface ShopFormDialogProps {
  open: boolean
  onClose: () => void
  shop?: Shop | null
  onSuccess: () => void
}

export function ShopFormDialog({ open, onClose, shop, onSuccess }: ShopFormDialogProps) {
  const { createShop, updateShop, isLoading } = useShopStore()
  const { users } = useUserManagement()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ShopFormData>({
    resolver: zodResolver(shopFormSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
      manager: "",
      isActive: true,
    },
  })

  const watchedIsActive = watch("isActive")
  const watchedManager = watch("manager")

  // Reset form when dialog opens/closes or shop changes
  useEffect(() => {
    if (open) {
      if (shop) {
        reset({
          name: shop.name,
          address: shop.address,
          phone: shop.phone,
          email: shop.email || "",
          manager: shop.manager?._id || "",
          isActive: shop.isActive,
        })
      } else {
        reset({
          name: "",
          address: "",
          phone: "",
          email: "",
          manager: "",
          isActive: true,
        })
      }
    }
  }, [open, shop, reset])

  const onSubmit = async (data: ShopFormData) => {
    setIsSubmitting(true)
    try {
      const shopData = {
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email || undefined,
        manager: data.manager || undefined,
        isActive: data.isActive,
      }

      let success: boolean
      if (shop) {
        success = await updateShop(shop._id, shopData)
        if (success) {
          toast.success("Shop updated successfully")
        }
      } else {
        success = await createShop(shopData)
        if (success) {
          toast.success("Shop created successfully")
        }
      }

      if (success) {
        onSuccess()
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !isSubmitting) {
      onClose()
    }
  }

  const handleCancel = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  // Filter users to show only potential managers (you can adjust this logic)
  const availableManagers = users.filter(user => user.role === 'salesPerson' || user.role === 'admin')

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]" aria-description="Shop Form">
        <DialogHeader>
          <DialogTitle>
            {shop ? "Edit Shop" : "Add New Shop"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Shop Name</Label>
            <Input
              id="name"
              placeholder="Enter shop name"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm font-medium text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="Enter shop address"
              className="resize-none"
              rows={3}
              {...register("address")}
            />
            {errors.address && (
              <p className="text-sm font-medium text-destructive">{errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="Enter phone number"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-sm font-medium text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                placeholder="Enter email address"
                type="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm font-medium text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="manager">Manager (Optional)</Label>
            <Select value={watchedManager} onValueChange={(value) => setValue("manager", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a manager" />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectItem value="">No manager</SelectItem> */}
                {availableManagers.map((user) => (
                  <SelectItem key={user._id} value={user._id}>
                    {user.username} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.manager && (
              <p className="text-sm font-medium text-destructive">{errors.manager.message}</p>
            )}
          </div>

          <div className="flex flex-row items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label>Active Status</Label>
              <div className="text-sm text-muted-foreground">
                Whether this shop is currently active
              </div>
            </div>
            <Switch
              checked={watchedIsActive}
              onCheckedChange={(checked) => setValue("isActive", checked)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting ? "Saving..." : shop ? "Update Shop" : "Create Shop"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}