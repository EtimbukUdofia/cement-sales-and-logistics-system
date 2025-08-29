import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Search } from "lucide-react"

const usersData = [
  {
    id: 1,
    username: "Blouwatife James",
    email: "blouwatifejames@gmail.com",
    role: "Salesperson",
    assignedShop: "Shop - Main 1 Lagos",
    status: "Online",
    date: "2025 - 8 - 12"
  },
  {
    id: 2,
    username: "Victory Shaibu",
    email: "victoryshaibu@gmail.com",
    role: "Salesperson",
    assignedShop: "Shop - Main 2 Port Harcourt",
    status: "Online",
    date: "2025 - 8 - 12"
  },
  {
    id: 3,
    username: "Melissa Daniella",
    email: "melissadaniella@gmail.com",
    role: "Salesperson",
    assignedShop: "Shop - Main 3 Kano",
    status: "Online",
    date: "2025 - 8 - 12"
  }
]

export function UsersTable() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredUsers = usersData.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    return (
      <Badge
        variant="secondary"
        className="bg-green-50 text-green-700 border-green-200 font-medium"
      >
        {status}
      </Badge>
    );
  };

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
              {filteredUsers.length}
            </Badge>
          </div>

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search users"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-gray-200">
              <TableHead className="text-sm font-medium text-gray-700 px-6 py-3">
                <input type="checkbox" className="rounded border-gray-300" />
              </TableHead>
              <TableHead className="text-sm font-medium text-gray-700 px-6 py-3">
                Username
              </TableHead>
              <TableHead className="text-sm font-medium text-gray-700 px-6 py-3">
                Email
              </TableHead>
              <TableHead className="text-sm font-medium text-gray-700 px-6 py-3">
                Role
              </TableHead>
              <TableHead className="text-sm font-medium text-gray-700 px-6 py-3">
                Assigned Shop
              </TableHead>
              <TableHead className="text-sm font-medium text-gray-700 px-6 py-3">
                Status
              </TableHead>
              <TableHead className="text-sm font-medium text-gray-700 px-6 py-3">
                Date
              </TableHead>
              <TableHead className="text-sm font-medium text-gray-700 px-6 py-3 w-12">
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                <TableCell className="text-sm text-gray-900 px-6 py-4">
                  <input type="checkbox" className="rounded border-gray-300" />
                </TableCell>
                <TableCell className="text-sm text-gray-900 px-6 py-4 font-medium">
                  {user.username}
                </TableCell>
                <TableCell className="text-sm text-gray-900 px-6 py-4">
                  {user.email}
                </TableCell>
                <TableCell className="text-sm text-gray-900 px-6 py-4">
                  {user.role}
                </TableCell>
                <TableCell className="text-sm text-gray-900 px-6 py-4">
                  {user.assignedShop}
                </TableCell>
                <TableCell className="text-sm text-gray-900 px-6 py-4">
                  {getStatusBadge(user.status)}
                </TableCell>
                <TableCell className="text-sm text-gray-900 px-6 py-4">
                  {user.date}
                </TableCell>
                <TableCell className="text-sm text-gray-900 px-6 py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit user</DropdownMenuItem>
                      <DropdownMenuItem>View details</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Delete user
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
