import { getCurrentUserWithDetails } from "@/lib/auth";
import prisma from "@/lib/prisma";
import SupplierClient from "./SupplierClient";

export default async function SupplierPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  //   const { search } = await searchParams;
  const suppliers = await prisma.supplier.findMany({
    orderBy: { updatedAt: "desc" },
    //   include: {
    //     category: true,
    //   },
  });
  const users = await prisma.user.findMany({
    select: { id: true, fullName: true },
  });

  // const inventories = rawInventories.map((item) => ({
  //   ...item,
  //   quantity: item.quantity.toNumber(),
  //   minimumStock: item.minimumStock ? Number(item.minimumStock) : null,
  //   unitPrice: item.unitPrice.toNumber(),
  // }));

  // const categories = await prisma.category.findMany({
  //   orderBy: { id: "asc" },
  // });

  const permissionData = await getCurrentUserWithDetails();
  const permissions = permissionData?.role?.permissions || [];

  return (
    <SupplierClient
      suppliers={suppliers}
      //   categories={categories}
      permissions={permissions}
      //   defaultSearch={search ?? ""}
    />
  );
}
