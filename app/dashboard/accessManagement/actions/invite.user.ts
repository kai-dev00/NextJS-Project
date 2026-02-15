"use server";

import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";
import { UserFormValues } from "../schema";
import { sendInviteEmail } from "@/lib/email";
import { requirePermission } from "@/lib/auth-guard";

export async function inviteUserAction(input: UserFormValues) {
  await requirePermission("access-management:create:users");

  if (!input.firstName?.trim()) {
    throw new Error("First name is required");
  }
  if (!input.lastName?.trim()) {
    throw new Error("Last name is required");
  }
  if (!input.email) {
    throw new Error("Email is required");
  }
  if (!input.roleId) {
    throw new Error("Role is required");
  }
  // Check if user already exists
  const exists = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (exists) throw new Error("User already exists");

  const existingInvitedUser = await prisma.userInvite.findUnique({
    where: { email: input.email },
  });

  if (existingInvitedUser) {
    throw new Error("An invitation has already been sent to this email");
  }

  const token = randomBytes(32).toString("hex");

  // Set expiry, e.g., 7 days from now
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.userInvite.create({
    data: {
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      roleId: input.roleId,
      token,
      expiresAt,
    },
  });

  await sendInviteEmail(input.email, token);
  return { success: true, token };
}
