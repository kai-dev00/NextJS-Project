"use server";

import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";
import { AddFormValues, userFormSchema } from "../schema";
import { sendInviteEmail } from "@/lib/email";

export async function inviteUserAction(input: AddFormValues) {
  const data = userFormSchema.parse(input);

  // Check if user already exists
  const exists = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (exists) throw new Error("User already exists");

  const existingInvitedUser = await prisma.userInvite.findUnique({
    where: { email: data.email },
  });

  if (existingInvitedUser) {
    throw new Error("An invitation has already been sent to this email");
  }

  const token = randomBytes(32).toString("hex");

  // Set expiry, e.g., 7 days from now
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.userInvite.create({
    data: {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      roleId: data.roleId,
      token,
      expiresAt,
    },
  });

  await sendInviteEmail(data.email, token);
  return { success: true, token };
}
