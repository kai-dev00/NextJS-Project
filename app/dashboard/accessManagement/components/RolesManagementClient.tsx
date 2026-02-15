"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/DataTable";
import { CustomModal } from "@/components/CustomModal";
import { deleteRoleAction } from "../actions/roles";
import { showToast } from "@/lib/toast";
import NoPermission from "../../no-permission";
import { usePermission } from "@/lib/permissions/usePermission";
import { Permission } from "@/lib/types";

type Role = {
  id: string;
  name: string;
  description: string | null;
  permissions: { id: string; action: string; module: string }[];
  _count: { users: number };
};

type Props = {
  roles: Role[];
  permissions: Permission[];
};

export function RolesManagementClient({ roles, permissions }: Props) {
  const { can } = usePermission(permissions);
  if (!can("access-management:read:roles")) return <NoPermission />;

  const router = useRouter();
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    role: Role | null;
  }>({ open: false, role: null });
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteModal.role) return;
    try {
      setIsDeleting(true);
      await deleteRoleAction(deleteModal.role.id);
      showToast.success(
        "Role deleted",
        "The role has been successfully deleted.",
      );
      setDeleteModal({ open: false, role: null });
      router.refresh();
    } catch (err: any) {
      showToast.error(
        "Something went wrong",
        err?.message ?? "Please try again",
      );
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  }

  const columns: Column<Role>[] = [
    {
      key: "name",
      header: "Role Name",
      cell: (role) => <span className="font-medium">{role.name}</span>,
    },
    {
      key: "description",
      header: "Description",
      cell: (role) => (
        <span className="text-gray-600">{role.description || "-"}</span>
      ),
    },
    {
      key: "permissions",
      header: "Permissions",
      cell: (role) => `${role.permissions.length} permissions`,
    },
    {
      key: "_count",
      header: "Users",
      cell: (role) => `${role._count.users} users`,
    },
    {
      key: "actions",
      header: "",
      className: "text-end",
      cell: (role) => (
        <div className="flex justify-center gap-2">
          {can("access-management:update:roles") && (
            <Link href={`/dashboard/accessManagement/roles/${role.id}/edit`}>
              <Button variant="ghost" size="sm">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
          )}
          {can("access-management:delete:roles") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteModal({ open: true, role })}
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
      <DataTable<Role>
        data={roles}
        columns={columns}
        keyField="id"
        headerActions={
          can("access-management:create:roles") && (
            <Link href="roles/add">
              <Button>Add Role</Button>
            </Link>
          )
        }
      />

      <CustomModal
        open={deleteModal.open}
        onOpenChange={(open) =>
          !isDeleting && setDeleteModal({ open, role: null })
        }
        title="Delete Role"
        description={`Are you sure you want to delete the role "${deleteModal.role?.name}"? This action cannot be undone.`}
        showCloseButton={!isDeleting}
        footer={
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => setDeleteModal({ open: false, role: null })}
              disabled={isDeleting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              loading={isDeleting}
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        }
      >
        {deleteModal.role && deleteModal.role._count.users > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              Warning: This role has {deleteModal.role._count.users} user(s)
              assigned. Deletion will fail unless users are reassigned first.
            </p>
          </div>
        )}
      </CustomModal>
    </div>
  );
}
