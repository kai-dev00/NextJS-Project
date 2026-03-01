"use server";

import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";
import { UserFormValues } from "../schema";
import { sendInviteEmail } from "@/lib/email";
import { requirePermission } from "@/lib/auth-guard";
import { getCurrentUser, getCurrentUserWithName } from "@/lib/auth";
import {
  createWithLog,
  deleteWithLog,
  updateWithLog,
} from "@/lib/types/prismaLogger";
import { realtime } from "@/lib/upstash/realtime";

export async function inviteUserAction(input: UserFormValues) {
  await requirePermission("access-management:create:users");
  const currentUser = await getCurrentUserWithName();
  const userId = currentUser?.userId ?? null;
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

  const invite = (await createWithLog(
    "userInvite",
    {
      createdBy: currentUser?.fullName ?? "System",
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      roleId: input.roleId,
      token,
      expiresAt,
    },
    {
      userId,
      submodule: "users",
    },
  )) as { id: string };

  await realtime.emit("activity.created", {
    action: "create",
    module: "access-management",
    submodule: "users",
    recordId: invite.id,
    user: currentUser?.fullName ?? null,
    createdAt: new Date().toISOString(),
  });

  // await prisma.userInvite.create({
  //   data: {
  //     createdBy: currentUser?.fullName ?? "System",
  //     email: input.email,
  //     firstName: input.firstName,
  //     lastName: input.lastName,
  //     roleId: input.roleId,
  //     token,
  //     expiresAt,
  //   },
  // });

  await sendInviteEmail(input.email, token);
  return { success: true, token };
}

//edit

export async function editUserAction(input: UserFormValues) {
  const currentUser = await getCurrentUserWithName();
  const userId = currentUser?.userId ?? null;

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
    await updateWithLog(
      "user",
      { id: input.id },
      {
        email: input.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        roleId: input.roleId,
        isActive: input.isActive,
        updatedBy: currentUser?.fullName ?? "System",
      },
      { userId, submodule: "users" },
    );

    await realtime.emit("activity.created", {
      action: "update",
      module: "access-management",
      submodule: "users",
      recordId: user.id,
      user: currentUser?.fullName ?? null,
      createdAt: new Date().toISOString(),
    });

    // await prisma.user.update({
    //   where: { id: input.id },
    //   data: {
    //     email: input.email,
    //     firstName: user.firstName,
    //     lastName: user.lastName,
    //     fullName: `${user.firstName} ${user.lastName}`,
    //     roleId: input.roleId,
    //     isActive: input.isActive,
    //     updatedBy: currentUser?.fullName ?? "System", // use id or name?
    //   },
    // });
  } else if (invite) {
    // Update invite
    await updateWithLog(
      "userInvite",
      { id: input.id },
      {
        email: input.email,
        firstName: invite.firstName,
        lastName: invite.lastName,
        roleId: input.roleId,
        updatedBy: currentUser?.fullName ?? "System",
      },
      { userId, submodule: "users" },
    );

    await realtime.emit("activity.created", {
      action: "update",
      module: "access-management",
      submodule: "users",
      recordId: invite.id,
      user: currentUser?.fullName ?? null,
      createdAt: new Date().toISOString(),
    });
    // await prisma.userInvite.update({
    //   where: { id: input.id },
    //   data: {
    //     email: input.email,
    //     firstName: invite.firstName,
    //     lastName: invite.lastName,
    //     roleId: input.roleId,
    //     updatedBy: currentUser?.fullName ?? "System", // use id or name?
    //   },
    // });
  }

  return { success: true };
}

//delete
export async function deleteAccessAction(
  id: string,
  source: "USER" | "INVITE",
) {
  const currentUser = await getCurrentUserWithName();
  const userId = currentUser?.userId ?? null;

  if (!currentUser) throw new Error("Unauthorized.");
  if (id === userId) throw new Error("You cannot delete your own account.");

  if (source === "USER") {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw new Error("User not found");

    await deleteWithLog("user", { id }, { userId, submodule: "users" });

    await realtime.emit("activity.created", {
      action: "delete",
      module: "access-management",
      submodule: "users",
      recordId: id,
      user: currentUser?.fullName ?? null,
      createdAt: new Date().toISOString(),
    });
  } else if (source === "INVITE") {
    const existing = await prisma.userInvite.findUnique({ where: { id } });
    if (!existing) throw new Error("Invite not found");

    await deleteWithLog("userInvite", { id }, { userId, submodule: "users" });

    await realtime.emit("activity.created", {
      action: "delete",
      module: "access-management",
      submodule: "users",
      recordId: id,
      user: currentUser?.fullName ?? null,
      createdAt: new Date().toISOString(),
    });
  }

  return { success: true };
}
