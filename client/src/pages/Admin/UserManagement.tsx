import { UserManagementHeader } from "@/components/userManagement/UserManagementHeader"
import { UsersTable } from "@/components/userManagement/UsersTable"

export default function UserManagement() {
  const handleAddNewUser = () => {
    // TODO: Navigate to user creation page or open modal
    console.log("Add new user");
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-6 py-6">

          {/* Header */}
          <UserManagementHeader
            title="User Management"
            subtitle="Manage your sales persons and their account settings here"
            onAddNewUser={handleAddNewUser}
          />

          {/* Users Table */}
          <div className="px-4 lg:px-6">
            <UsersTable />
          </div>

        </div>
      </div>
    </div>
  )
}
