"use client";

import { DataTable, Column } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";
import { CustomModal } from "@/components/CustomModal";
import { useState } from "react";
import { Permission } from "@/lib/types";
import NoPermission from "../../no-permission";
import { usePermission } from "@/lib/permissions/usePermission";
import { InventoryWithCategory } from "../InventoryClient";
import { formatPeso, formatUnit, inventoryStatusConfig } from "../../utils";
import { deleteInventory } from "../actions";
import { InventoryStatusBadge } from "./inventoryStatusBadge";
import { InventoryViewModal } from "./inventoryViewModal";
import { Category, InventoryStatus } from "@/app/generated/prisma/browser";

type Props = {
  inventories: InventoryWithCategory[];
  categories: Category[];
  onEdit: (inventory: InventoryWithCategory) => void;
  permissions: Permission[];
  headerActions?: React.ReactNode;
};

export default function InventoryTable({
  inventories,
  categories,
  onEdit,
  permissions,
  headerActions,
}: Props) {
  const { can } = usePermission(permissions);
  if (!can("category:read")) return <NoPermission />;
  const [viewInventory, setViewInventory] =
    useState<InventoryWithCategory | null>(null);
  const [deleteUser, setDeleteUser] = useState<InventoryWithCategory | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const handleDelete = async () => {
    if (!deleteUser) return;
    setDeleting(true);
    try {
      await deleteInventory(deleteUser.id);
      showToast.success("Inventory deleted", "The inventory has been removed");
      router.refresh();
      setDeleteUser(null);
    } catch (err) {
      showToast.error("Delete failed", "Unable to delete inventory");
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<InventoryWithCategory>[] = [
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
      key: "category",
      header: "Category",
      cell: (row) => row.category?.name ?? "—",
    },
    {
      key: "description",
      header: "Description",
      cell: (row) => row.description ?? "—",
    },
    {
      key: "quantity",
      header: "Quantity",
      cell: (row) => {
        return (
          <div className="flex items-center gap-2">
            <span>
              <span>{formatUnit(row.quantity, row.unit)}</span>
            </span>
          </div>
        );
      },
    },
    {
      key: "minimumStock",
      header: "Minimum Stock",
      cell: (row) => {
        if (row.minimumStock == null) return <span>N/A</span>;
        return (
          <div className="flex items-center gap-2">
            <span>
              <span>{formatUnit(row.minimumStock, row.unit)}</span>
            </span>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => {
        if (!row.status) return null;
        return <InventoryStatusBadge status={row.status} />;
      },
    },
    {
      key: "price",
      header: "Price",
      cell: (row) => formatPeso(row.unitPrice),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-center">
          {can("inventory:read") && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setViewInventory(row)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {can("inventory:update") && (
            <Button size="sm" variant="ghost" onClick={() => onEdit(row)}>
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {can("inventory:delete") && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDeleteUser(row)}
            >
              <Trash2 className="h-4 w-4 " />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={inventories}
        columns={columns}
        keyField="id"
        headerActions={headerActions}
        filters={[
          {
            key: "status",
            label: "Status",
            options: Object.values(InventoryStatus).map((status) => ({
              label: inventoryStatusConfig[status].label,
              value: status,
            })),
          },
          {
            key: "categoryId",
            label: "Category",
            options: categories.map((cat) => ({
              label: cat.name,
              value: cat.id,
            })),
          },
        ]}
      />
      <CustomModal
        open={!!deleteUser}
        onOpenChange={(v) => !v && setDeleteUser(null)}
        title="Delete Inventory"
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
              Delete Inventory
            </Button>
          </div>
        </div>
      </CustomModal>

      <InventoryViewModal
        open={!!viewInventory}
        onOpenChange={(v) => !v && setViewInventory(null)}
        inventory={viewInventory}
      />
    </>
  );
}
