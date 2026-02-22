import { getCurrentUserWithDetails } from "@/lib/auth";
import InventoryClient from "./InventoryClient";
import prisma from "@/lib/prisma";

export default async function InventoryPage() {
  const rawInventories = await prisma.inventory.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      category: true,
    },
  });
  const users = await prisma.user.findMany({
    select: { id: true, fullName: true },
  });

  const inventories = rawInventories.map((item) => ({
    ...item,
    quantity: item.quantity.toNumber(),
    minimumStock: item.minimumStock ? Number(item.minimumStock) : null,
    unitPrice: item.unitPrice.toNumber(),
    createdBy: users.find((u) => u.id === item.createdBy)?.fullName ?? "—",
    updatedBy: users.find((u) => u.id === item.updatedBy)?.fullName ?? "—",
  }));

  const categories = await prisma.category.findMany({
    orderBy: { id: "asc" },
  });
  const permissionData = await getCurrentUserWithDetails();
  const permissions = permissionData?.role?.permissions || [];

  return (
    <InventoryClient
      inventories={inventories}
      categories={categories}
      permissions={permissions}
    />
  );
}
