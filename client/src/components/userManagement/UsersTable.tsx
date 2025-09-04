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
import { MoreHorizontal, Search, Edit, Trash2 } from "lucide-react"
import { type UserData } from "@/lib/api"

interface UsersTableProps {
  users: UserData[];
  isLoading: boolean;
  onEditUser: (user: UserData) => void;
  onDeleteUser: (user: UserData) => void;
}

export function UsersTable({ users, isLoading, onEditUser, onDeleteUser }: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.shop?.name && user.shop.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getRoleBadge = (role: string) => {
    const isAdmin = role === 'admin';
    return (
      <Badge
        variant="secondary"
        className={isAdmin
          ? "bg-purple-50 text-purple-700 border-purple-200 font-medium"
          : "bg-blue-50 text-blue-700 border-blue-200 font-medium"
        }
      >
        {role === 'salesPerson' ? 'Sales Person' : 'Admin'}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Card className="bg-white border border-gray-200">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
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
                  Created Date
                </TableHead>
                <TableHead className="text-sm font-medium text-gray-700 px-6 py-3 w-12">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <TableCell className="text-sm text-gray-900 px-6 py-4 font-medium">
                    {user.username}
                  </TableCell>
                  <TableCell className="text-sm text-gray-900 px-6 py-4">
                    {user.email}
                  </TableCell>
                  <TableCell className="text-sm text-gray-900 px-6 py-4">
                    {getRoleBadge(user.role)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-900 px-6 py-4">
                    {user.shop ? `${user.shop.name} - ${user.shop.address}` : 'No shop assigned'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-900 px-6 py-4">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-900 px-6 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditUser(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit user
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => onDeleteUser(user)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete user
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
