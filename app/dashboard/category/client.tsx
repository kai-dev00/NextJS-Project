"use client";

import { usePermission } from "@/app/(auth)/AuthProvider";
import CategoryForm from "./components/form";
import CategoriesTable from "./components/categoryTable";
import NoPermission from "../no-permission";
import { Category } from "@/app/generated/prisma/browser";

export default function CategoryClient({
  categories,
}: {
  categories: Category[];
}) {
  const { can } = usePermission();

  if (!can("category:read")) {
    return <NoPermission />;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Categories</h1>

      {can("category:create") && <CategoryForm />}

      <CategoriesTable categories={categories} />
    </div>
  );
}
