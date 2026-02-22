"use client";

import { Category } from "@/app/generated/prisma/browser";
import { DataTable, Column } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { deleteCategory } from "../actions";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";
import { CustomModal } from "@/components/CustomModal";
import { useState } from "react";
import { Permission } from "@/lib/types";
import NoPermission from "../../no-permission";
import { usePermission } from "@/lib/permissions/usePermission";
import { formatPeso } from "../../utils";
import { CategoryViewModal } from "./categoryViewModal";

type Props = {
  categories: Category[];
  onEdit: (category: Category) => void;
  permissions: Permission[];
  headerActions?: React.ReactNode;
};

export default function CategoryTable({
  categories,
  onEdit,
  permissions,
  headerActions,
}: Props) {
  const { can } = usePermission(permissions);
  if (!can("category:read")) return <NoPermission />;
  const [viewCategory, setViewCategory] = useState<Category | null>(null);
  const [deleteUser, setDeleteUser] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const handleDelete = async () => {
    if (!deleteUser) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteUser.id);
      showToast.success("Category deleted", "The category has been removed");
      router.refresh();
      setDeleteUser(null);
    } catch (err) {
      showToast.error("Delete failed", "Unable to delete category");
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<Category>[] = [
    {
      key: "name",
      header: "Name",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span>{row.name}</span>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      cell: (row) => row.description ?? "—",
    },

    {
      key: "totalPrice",
      header: "Total Price",
      cell: (row) => formatPeso(row.totalPrice),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-center">
          {can("category:read") && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setViewCategory(row)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}

          {can("category:update") && (
            <Button size="sm" variant="ghost" onClick={() => onEdit(row)}>
              <Pencil className="h-4 w-4" />
            </Button>
          )}

          {can("category:delete") && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDeleteUser(row)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={categories}
        columns={columns}
        keyField="id"
        headerActions={headerActions}
      />
      <CustomModal
        open={!!deleteUser}
        onOpenChange={(v) => !v && setDeleteUser(null)}
        title="Delete Category"
        description="This action cannot be undone. This will permanently delete the category and its inventory."
      >
        <div className="space-y-4">
          <p className="text-sm">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{deleteUser?.name}</span>?
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
              Delete Category
            </Button>
          </div>
        </div>
      </CustomModal>
      <CategoryViewModal
        open={!!viewCategory}
        onOpenChange={(v) => !v && setViewCategory(null)}
        category={viewCategory}
      />
    </>
  );
}
