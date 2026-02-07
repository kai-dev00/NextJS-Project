"use server";

import { requirePermission } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function deleteAccessAction(
  id: string,
  source: "USER" | "INVITE",
) {
  await requirePermission("access-management:delete:users");
  if (source === "USER") {
    await prisma.user.delete({
      where: { id },
    });
    return;
  }

  if (source === "INVITE") {
    await prisma.userInvite.delete({
      where: { id },
    });
    return;
  }
}
