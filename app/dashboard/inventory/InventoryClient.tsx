"use client";

import { Permission } from "@/lib/types";
import NoPermission from "../no-permission";
import { usePermission } from "@/lib/permissions/usePermission";
import {
  Category,
  InventoryUnit,
  Prisma,
} from "@/app/generated/prisma/browser";
import { Button } from "@/components/ui/button";
import InventoryTable from "./components/inventoryTable";
import { useState } from "react";
import { CustomModal } from "@/components/CustomModal";
import InventoryForm from "./components/inventoryForm";
import z from "zod";
import { AlertTriangle, Package, XCircle } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";

export const inventorySchema = z.object({
  name: z.string().min(1, "Required").max(50),
  description: z.string().optional(),
  quantity: z.number({ message: "Required" }).min(0, "Required"),
  minimumStock: z.number({ message: "Required" }).min(0, "Required"),
  unitPrice: z.number({ message: "Required" }).min(0, "Required"),
  unit: z.nativeEnum(InventoryUnit),
  categoryId: z.string().min(1, "Required"),
});
export type InventoryFormValues = z.infer<typeof inventorySchema>;

export type InventoryCreatePayload = Omit<
  InventoryFormValues,
  "quantity" | "minimumStock" | "unitPrice"
> & {
  quantity: number;
  minimumStock: number | null;
  unitPrice: number;
};

export type InventoryWithCategory = Omit<
  Prisma.InventoryGetPayload<{ include: { category: true } }>,
  "quantity" | "minimumStock" | "unitPrice"
> & {
  quantity: number;
  minimumStock: number | null;
  unitPrice: number;
};

type Props = {
  inventories: InventoryWithCategory[];
  categories: Category[];
  permissions: Permission[];
  defaultSearch?: string;
};

export default function InventoryClient({
  inventories,
  categories,
  permissions,
  defaultSearch,
}: Props) {
  const { can } = usePermission(permissions);
  if (!can("inventory:read")) return <NoPermission />;

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryWithCategory | null>(null);

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (inventory: InventoryWithCategory) => {
    setEditing(inventory);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setTimeout(() => setEditing(null), 200);
  };

  //status card filters
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const toggleFilter = (status: string) => {
    setStatusFilter((prev) => (prev === status ? null : status));
  };

  const filteredInventoriesByStatus = statusFilter
    ? inventories.filter((item) => item.status === statusFilter)
    : inventories;

  return (
    <div className=" rounded-lg border p-6 space-y-4">
      <div className="grid grid-cols-3 gap-x-6">
        <StatsCard
          title="Total Inventory"
          value={inventories.length.toString()}
          icon={Package}
          description="Across all categories"
          onClick={() => setStatusFilter(null)}
          active={statusFilter === null}
        />

        <StatsCard
          title="Low Stock Items"
          value={inventories
            .filter((item) => item.status === "low_stock")
            .length.toString()}
          icon={AlertTriangle}
          trend={{ value: -5, label: "from last week" }}
          onClick={() => toggleFilter("low_stock")}
          active={statusFilter === "low_stock"}
        />

        <StatsCard
          title="Out of Stock"
          value={inventories
            .filter((inv) => inv.quantity === 0)
            .length.toString()}
          icon={XCircle}
          trend={{ value: 2 }}
          onClick={() => toggleFilter("out_of_stock")}
          active={statusFilter === "out_of_stock"}
        />
      </div>
      <InventoryTable
        inventories={filteredInventoriesByStatus}
        defaultSearch={defaultSearch}
        categories={categories}
        onEdit={openEdit}
        permissions={permissions}
        headerActions={
          can("inventory:create") && (
            <Button onClick={openCreate}>Add Inventory</Button>
          )
        }
      />

      <CustomModal
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit Inventory" : "Add Inventory"}
      >
        <InventoryForm
          key={editing?.id ?? "new"}
          inventory={editing}
          onSuccess={closeModal}
          categories={categories}
        />
      </CustomModal>
    </div>
  );
}
