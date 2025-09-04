import { useState } from "react"
import { UserManagementHeader } from "@/components/userManagement/UserManagementHeader"
import { UsersTable } from "@/components/userManagement/UsersTable"
import { UserDialog } from "@/components/userManagement/UserDialog"
import { DeleteUserDialog } from "@/components/userManagement/DeleteUserDialog"
import { useUserManagement } from "@/hooks/useUserManagement"
import { type UserData, type CreateUserData, type UpdateUserData } from "@/lib/api"

export default function UserManagement() {
  const {
    users,
    shops,
    isLoading,
    isSubmitting,
    createUser,
    updateUser,
    deleteUser,
  } = useUserManagement();

  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  const handleAddNewUser = () => {
    setSelectedUser(null);
    setIsUserDialogOpen(true);
  };

  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    setIsUserDialogOpen(true);
  };

  const handleDeleteUser = (user: UserData) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleUserSubmit = async (userData: CreateUserData | UpdateUserData) => {
    if (selectedUser) {
      // Editing existing user
      return await updateUser(selectedUser._id, userData as UpdateUserData);
    } else {
      // Creating new user
      return await createUser(userData as CreateUserData);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedUser) {
      await deleteUser(selectedUser._id);
      setSelectedUser(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-4 sm:gap-6">
        <div className="flex flex-col gap-4 sm:gap-6 py-4 sm:py-6">

          {/* Header */}
          <UserManagementHeader
            title="User Management"
            subtitle="Manage your sales persons and their account settings here"
            onAddNewUser={handleAddNewUser}
          />

          {/* Users Table */}
          <div className="px-4 sm:px-6 lg:px-6">
            <UsersTable
              users={users}
              isLoading={isLoading}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
            />
          </div>

          {/* User Dialog for Add/Edit */}
          <UserDialog
            open={isUserDialogOpen}
            onOpenChange={setIsUserDialogOpen}
            user={selectedUser}
            shops={shops}
            onSubmit={handleUserSubmit}
            isSubmitting={isSubmitting}
          />

          {/* Delete Confirmation Dialog */}
          <DeleteUserDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            user={selectedUser}
            onConfirm={handleDeleteConfirm}
            isDeleting={isSubmitting}
          />

        </div>
      </div>
    </div>
  )
}
