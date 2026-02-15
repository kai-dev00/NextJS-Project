"use server";

import prisma from "@/lib/prisma";
import { UserFormValues } from "../schema";

export async function editUserAction(input: UserFormValues) {
  if (!input.id) {
    throw new Error("User ID is required for editing");
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: input.id },
  });

  const invite = await prisma.userInvite.findUnique({
    where: { id: input.id },
  });

  if (!user && !invite) {
    throw new Error("User or invite not found");
  }

  if (user) {
    // Update user
    await prisma.user.update({
      where: { id: input.id },
      data: {
        email: input.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        roleId: input.roleId,
        isActive: input.isActive,
      },
    });
  }

  if (invite) {
    // Update invite
    await prisma.userInvite.update({
      where: { id: input.id },
      data: {
        email: input.email,
        firstName: invite.firstName,
        lastName: invite.lastName,
        roleId: input.roleId,
      },
    });
  }

  return { success: true };
}
