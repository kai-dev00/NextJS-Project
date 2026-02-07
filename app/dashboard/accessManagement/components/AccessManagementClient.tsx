"use client";

import { useState } from "react";
import { DataTable, Column } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { CustomModal } from "@/components/CustomModal";
import AccessManagementForm from "./AccessManagementForm";
import { deleteAccessAction } from "../actions/delete.user";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";
import { RoleOption, UserRow } from "../users/page";
import { Pencil, Trash2 } from "lucide-react";
import { usePermission } from "@/app/(auth)/AuthProvider";
import NoPermission from "../../no-permission";

type EditUserData = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roleId?: string;
  isActive?: boolean;
  emailVerified?: boolean;
};
export default function AccessManagementClient({
  users,
  roles,
}: {
  users: UserRow[];
  roles: RoleOption[];
}) {
  const { can, permissions } = usePermission();
  if (!can("access-management:read:users")) {
    return <NoPermission />;
  }

  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState<EditUserData | undefined>(undefined);
  const [deleteUser, setDeleteUser] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleEdit = (user: UserRow) => {
    if (!can("access-management:update:users")) return;
    const role = roles.find((r) => r.name === user.role);
    setEditUser({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: role?.id,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
    });
    setOpen(true);
  };

  const handleAddNew = () => {
    if (!can("access-management:create:users")) return;

    setEditUser(undefined);
    setOpen(true);
  };

  const handleDelete = async () => {
    if (!can("access-management:delete:users")) return;

    if (!deleteUser) return;
    setDeleting(true);
    try {
      await deleteAccessAction(deleteUser.id, deleteUser.source);
      showToast.warning("User deleted", "The user has been removed");
      router.refresh();
      setDeleteUser(null);
    } catch (err) {
      showToast.error("Delete failed", "Unable to delete user");
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    // Clear edit user after modal closes
    setTimeout(() => setEditUser(undefined), 200);
  };
  const columns: Column<UserRow>[] = [
    { key: "email", header: "Email" },
    {
      key: "fullName",
      header: "Name",
      cell: (row) => row.fullName ?? "—",
    },
    { key: "role", header: "Role" },
    {
      key: "isActive",
      header: "Status",
      cell: (row) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            row.isActive
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "emailVerified",
      header: "Verified",
      cell: (row) => (
        <span
          className={`text-xs ${
            row.emailVerified ? "text-green-600" : "text-red-600"
          }`}
        >
          {row.emailVerified ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-center gap-2">
          {can("access-management:update:users") && (
            <Button size="sm" variant="ghost" onClick={() => handleEdit(row)}>
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {can("access-management:delete:users") && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDeleteUser(row)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className=" rounded-lg border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Search</h1>

        {can("access-management:create:users") && (
          <Button onClick={handleAddNew}>Add User</Button>
        )}
      </div>

      <DataTable data={users} columns={columns} keyField="id" />

      <CustomModal
        open={open}
        onOpenChange={setOpen}
        title={editUser ? "Edit User" : "Add User"}
        description={
          editUser
            ? "Update user information and role"
            : "Invite a user and assign a role"
        }
      >
        <AccessManagementForm
          key={editUser?.id || "new"}
          roles={roles}
          onSuccess={handleClose}
          editUser={editUser}
        />
      </CustomModal>

      <CustomModal
        open={!!deleteUser}
        onOpenChange={(v) => !v && setDeleteUser(null)}
        title="Delete User"
        description="This action cannot be undone. This will permanently delete the user."
      >
        <div className="space-y-4">
          <p className="text-sm">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{deleteUser?.email}</span>?
          </p>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteUser(null)}>
              Cancel
            </Button>

            <Button
              variant="destructive"
              disabled={deleting}
              loading={deleting}
              onClick={handleDelete}
            >
              {deleteUser?.source === "INVITE"
                ? "Delete Invite"
                : "Delete User"}
            </Button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
}
