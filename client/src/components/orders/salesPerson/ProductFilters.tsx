import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

interface ProductFiltersProps {
  onSearchChange?: (search: string) => void;
  onBrandChange?: (brand: string) => void;
}

export function ProductFilters({ onSearchChange, onBrandChange }: ProductFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products"
          className="pl-10"
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
      </div>
      <Select defaultValue="all" onValueChange={onBrandChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Items" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Items</SelectItem>
          <SelectItem value="dangote">Dangote</SelectItem>
          <SelectItem value="bua">BUA</SelectItem>
          <SelectItem value="lafarge">Lafarge</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
