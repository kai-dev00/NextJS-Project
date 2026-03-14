// import prisma from "@/lib/prisma";
// import DashboardClient from "./_dashboard-components/dashboardClient";

// export default async function DashboardPage() {
//   const [totalUsers, totalInventory, recentActivity] = await Promise.all([
//     prisma.user.count(),
//     prisma.inventory.count(),
//     prisma.actionLog.findMany({
//       orderBy: { createdAt: "desc" },
//       take: 10,
//       include: { user: { select: { fullName: true } } },
//     }),
//   ]);

//   const serializedActivity = recentActivity.map((a) => ({
//     ...a,
//     createdAt: a.createdAt.toISOString(),
//   }));

//   return (
//     <DashboardClient
//       totalUsers={totalUsers}
//       totalInventory={totalInventory}
//       recentActivity={serializedActivity}
//     />
//   );
// }

import prisma from "@/lib/prisma";
import DashboardClient from "./_dashboard-components/dashboardClient";

export default async function DashboardPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [rawInventories, recentActivity, purchasesThisMonth, totalSuppliers] =
    await Promise.all([
      prisma.inventory.findMany({
        select: { quantity: true, unitPrice: true, status: true },
      }),
      prisma.actionLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { fullName: true } } },
      }),
      prisma.purchase.count({
        where: {
          status: "RECEIVED",
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.supplier.count(),
    ]);

  const inventories = rawInventories.map((inv) => ({
    quantity: inv.quantity.toNumber(),
    unitPrice: inv.unitPrice.toNumber(),
    status: inv.status,
  }));

  const totalInventoryValue = inventories.reduce(
    (sum, inv) => sum + inv.quantity * inv.unitPrice,
    0,
  );

  const lowStockCount = inventories.filter(
    (inv) => inv.status === "low_stock" || inv.status === "out_of_stock",
  ).length;

  const serializedActivity = recentActivity.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <DashboardClient
      totalInventoryValue={totalInventoryValue}
      lowStockCount={lowStockCount}
      purchasesThisMonth={purchasesThisMonth}
      // totalSuppliers={totalSuppliers}
      recentActivity={serializedActivity}
      inventories={inventories}
    />
  );
}
