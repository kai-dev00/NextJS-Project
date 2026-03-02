"use client";

import { Permission } from "@/lib/types";
import NoPermission from "../no-permission";
import { usePermission } from "@/lib/permissions/usePermission";
import {
  Category,
  InventoryUnit,
  Prisma,
  Supplier,
} from "@/app/generated/prisma/browser";
import { Button } from "@/components/ui/button";
// import InventoryTable from "./components/inventoryTable";
import { useState } from "react";
import { CustomModal } from "@/components/CustomModal";
// import InventoryForm from "./components/inventoryForm";
import z from "zod";
import { AlertTriangle, Package, XCircle } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { inventorySchema } from "../inventory/InventoryClient";
import SupplierTable from "./components/SupplierTable";
import SupplierForm from "./components/SupplierForm";

export const supplierSchema = z.object({
  name: z.string().min(1, "Required").max(100),
  email: z.string().min(1, "Required").email("Invalid email address"),
  phone: z
    .string()
    .min(1, "Required")
    .regex(/^\+?[\d\s\-\(\)]{7,20}$/, "Invalid phone number"),
  address: z.string().min(1, "Required").max(255),
  notes: z.string().optional(),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;

type Props = {
  suppliers: Supplier[];
  permissions: Permission[];
  defaultSearch?: string;
};

export default function SupplierClient({
  suppliers,
  permissions,
  defaultSearch,
}: Props) {
  const { can } = usePermission(permissions);
  if (!can("supplier:read")) return <NoPermission />;

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (supplier: Supplier) => {
    setEditing(supplier);
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

  //   const filteredInventoriesByStatus = statusFilter
  //     ? inventories.filter((item) => item.status === statusFilter)
  //     : inventories;

  return (
    <div className=" rounded-lg border p-6 space-y-4">
      {/* <div className="grid grid-cols-3 gap-x-6">
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
      </div> */}
      <SupplierTable
        suppliers={suppliers}
        defaultSearch={defaultSearch}
        // categories={categories}
        onEdit={openEdit}
        permissions={permissions}
        headerActions={
          can("supplier:create") && (
            <Button onClick={openCreate}>Add Supplier</Button>
          )
        }
      />
      <CustomModal
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit Inventory" : "Add Inventory"}
      >
        <SupplierForm
          key={editing?.id ?? "new"}
          supplier={editing}
          onSuccess={closeModal}
        />
      </CustomModal>
    </div>
  );
}
