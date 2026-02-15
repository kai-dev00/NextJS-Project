"use server";

import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function deleteAccessAction(
  id: string,
  source: "USER" | "INVITE",
) {
  const currentUser = await getCurrentUser();
  const currentUserId = currentUser?.userId;

  if (!currentUser) {
    throw new Error("Unauthorized.");
  }

  if (id === currentUserId) {
    throw new Error("You cannot delete your own account.");
  }

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
