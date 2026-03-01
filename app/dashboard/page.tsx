import prisma from "@/lib/prisma";
import DashboardClient from "./_dashboard-components/dashboardClient";

export default async function DashboardPage() {
  const [totalUsers, totalInventory, recentActivity] = await Promise.all([
    prisma.user.count(),
    prisma.inventory.count(),
    prisma.actionLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { fullName: true } } },
    }),
  ]);

  const serializedActivity = recentActivity.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <DashboardClient
      totalUsers={totalUsers}
      totalInventory={totalInventory}
      recentActivity={serializedActivity}
    />
  );
}
