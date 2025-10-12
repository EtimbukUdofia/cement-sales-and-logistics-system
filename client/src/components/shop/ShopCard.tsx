import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Store, MapPin, Phone, Mail, User } from "lucide-react"
import { type Shop } from "@/store/shopStore"

interface ShopCardProps {
  shop: Shop
  onEdit: (shop: Shop) => void
  onDelete: (shopId: string) => void
}

export function ShopCard({ shop, onEdit, onDelete }: ShopCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <Store className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{shop.name}</h3>
              <Badge variant={shop.isActive ? "default" : "secondary"} className="text-xs mt-1">
                {shop.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(shop)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(shop._id)}
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">{shop.address}</p>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground">{shop.phone}</p>
          </div>

          {shop.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
              <p className="text-xs text-muted-foreground truncate">{shop.email}</p>
            </div>
          )}

          {shop.manager && (
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 text-muted-foreground shrink-0" />
              <p className="text-xs text-muted-foreground truncate">{shop.manager.username}</p>
            </div>
          )}

          {!shop.manager && (
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 text-muted-foreground shrink-0" />
              <p className="text-xs text-muted-foreground italic">No manager assigned</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}