"use server";

import prisma from "@/lib/prisma";

export async function getRecentActivity() {
  const activities = await prisma.actionLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      user: { select: { fullName: true } },
    },
  });

  return activities.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(), // serialize date
  }));
}
