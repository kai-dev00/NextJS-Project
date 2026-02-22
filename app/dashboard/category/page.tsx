import prisma from "@/lib/prisma";
import CategoryClient from "./CategoryClient";
import { getCurrentUserWithDetails } from "@/lib/auth";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      inventories: {
        select: {
          quantity: true,
          unitPrice: true,
        },
      },
    },
  });
  const users = await prisma.user.findMany({
    select: { id: true, fullName: true },
  });

  const categoriesWithTotal = categories.map((cat) => ({
    ...cat,
    createdBy: users.find((u) => u.id === cat.createdBy)?.fullName ?? "—",
    updatedBy: users.find((u) => u.id === cat.updatedBy)?.fullName ?? "—",
    totalPrice: cat.inventories.reduce(
      (sum, inv) => sum + inv.unitPrice.toNumber(),
      0,
    ),
    inventories: cat.inventories.map((inv) => ({
      ...inv,
      quantity: inv.quantity.toNumber(),
      unitPrice: inv.unitPrice.toNumber(),
    })),
  }));
  const permissionData = await getCurrentUserWithDetails();
  const permissions = permissionData?.role?.permissions || [];

  return (
    <CategoryClient
      categories={categoriesWithTotal}
      permissions={permissions}
    />
  );
}
