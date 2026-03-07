"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CustomModal } from "@/components/CustomModal";
import { Permission } from "@/lib/types";
import { usePermission } from "@/lib/permissions/usePermission";
import {
  Supplier,
  Purchase,
  PurchaseItem,
  Inventory,
} from "@/app/generated/prisma/browser";
import { Plus } from "lucide-react";
import NoPermission from "../../no-permission";
import PurchaseTable from "./PurchaseTable";
import PurchaseForm from "./PurchaseForm";

export type PurchaseWithDetails = Omit<Purchase, "total"> & {
  total: number;
  supplier: Supplier;
  items: (Omit<PurchaseItem, "quantity" | "unitCost"> & {
    quantity: number;
    unitCost: number;
    inventory: Pick<Inventory, "id" | "name" | "unit">;
  })[];
};

export type InventoryOption = {
  id: string;
  name: string;
  unit: string;
  unitPrice: number;
};

type Props = {
  purchases: PurchaseWithDetails[];
  suppliers: Supplier[];
  inventories: InventoryOption[];
  permissions: Permission[];
};

export default function PurchaseClient({
  purchases,
  suppliers,
  inventories,
  permissions,
}: Props) {
  const { can } = usePermission(permissions);
  if (!can("purchase:read")) return <NoPermission />;

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PurchaseWithDetails | null>(null);

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (purchase: PurchaseWithDetails) => {
    setEditing(purchase);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setTimeout(() => setEditing(null), 200);
  };

  return (
    <div className=" rounded-lg border p-6 space-y-4">
      <PurchaseTable
        purchases={purchases}
        onEdit={openEdit}
        permissions={permissions}
        headerActions={
          can("purchase:create") && (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-1" /> New Order
            </Button>
          )
        }
      />

      <CustomModal
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit Purchase Order" : "New Purchase Order"}
        size="xl"
      >
        <PurchaseForm
          key={editing?.id ?? "new"}
          purchase={editing}
          suppliers={suppliers}
          inventories={inventories}
          onSuccess={closeModal}
        />
      </CustomModal>
    </div>
  );
}
