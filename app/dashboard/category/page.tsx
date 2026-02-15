import prisma from "@/lib/prisma";
import CategoryClient from "./CategoryClient";
import { getCurrentUserWithDetails } from "@/lib/auth";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { id: "asc" },
  });
  const permissionData = await getCurrentUserWithDetails();
  const permissions = permissionData?.role?.permissions || [];

  return <CategoryClient categories={categories} permissions={permissions} />;
}
