"use client";

import { useState } from "react";
import { Category } from "@/app/generated/prisma/browser";
import { Button } from "@/components/ui/button";
import { CustomModal } from "@/components/CustomModal";
import NoPermission from "../no-permission";
import CategoryTable from "./components/categoryTable";
import CategoryForm from "./components/categoryForm";
import { z } from "zod";
import { Permission } from "@/lib/types";
import { usePermission } from "@/lib/permissions/usePermission";

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50),
  description: z.string().optional(),
  icon: z.string().max(5).optional(),
  color: z.string().optional(),
});
export type CategoryFormValues = z.infer<typeof categorySchema>;

type Props = {
  categories: Category[];
  permissions: Permission[];
  defaultSearch?: string;
};

export default function CategoryClient({
  categories,
  permissions,
  defaultSearch,
}: Props) {
  const { can } = usePermission(permissions);
  if (!can("category:read")) return <NoPermission />;

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setTimeout(() => setEditing(null), 200);
  };

  return (
    <div className=" rounded-lg border p-6 space-y-4">
      <CategoryTable
        categories={categories}
        defaultSearch={defaultSearch}
        onEdit={openEdit}
        permissions={permissions}
        headerActions={
          can("category:create") && (
            <Button onClick={openCreate}>Add Category</Button>
          )
        }
      />

      <CustomModal
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit Category" : "Add Category"}
      >
        <CategoryForm
          key={editing?.id ?? "new"}
          category={editing}
          onSuccess={closeModal}
        />
      </CustomModal>
    </div>
  );
}
