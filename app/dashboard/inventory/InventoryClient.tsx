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
};

export default function InventoryClient({
  inventories,
  categories,
  permissions,
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

  return (
    <div className=" rounded-lg border p-6 space-y-4">
      <InventoryTable
        inventories={inventories}
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
