import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface UserManagementHeaderProps {
  title: string;
  subtitle: string;
  onAddNewUser?: () => void;
}

export function UserManagementHeader({
  title,
  subtitle,
  onAddNewUser
}: UserManagementHeaderProps) {
  return (
    <div className="px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
            {title}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {subtitle}
          </p>
        </div>
        <Button
          onClick={onAddNewUser}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add new user
        </Button>
      </div>
    </div>
  )
}
