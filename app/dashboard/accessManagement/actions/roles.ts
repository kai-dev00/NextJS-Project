"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import {
  createWithLog,
  deleteWithLog,
  updateWithLog,
} from "@/lib/types/prismaLogger";

const roleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().default(""),
  permissionIds: z.array(z.string()).default([]),
});

export type RoleFormValues = z.infer<typeof roleSchema>;

export async function createRoleAction(data: RoleFormValues) {
  const validated = roleSchema.parse(data);

  const existing = await prisma.role.findUnique({
    where: { name: validated.name },
  });

  if (existing) {
    throw new Error("Role with this name already exists");
  }

  const currentUser = await getCurrentUser();
  const userId = currentUser?.userId ?? null;

  const newRole = await createWithLog(
    "role",
    {
      name: validated.name,
      description: validated.description,
      permissions: {
        connect: validated.permissionIds.map((id) => ({ id })),
      },
    },
    {
      userId,
      submodule: "roles",
    },
    {
      include: { permissions: true },
    },
  );

  // await prisma.role.create({
  //   data: {
  //     name: validated.name,
  //     description: validated.description,
  //     permissions: {
  //       connect: validated.permissionIds.map((id) => ({ id })),
  //     },
  //   },
  // });

  revalidatePath("/roles");
  return newRole;
}

export async function updateRoleAction(id: string, data: RoleFormValues) {
  const validated = roleSchema.parse(data);

  const existing = await prisma.role.findFirst({
    where: {
      name: validated.name,
      NOT: { id },
    },
  });

  if (existing) {
    throw new Error("Role with this name already exists");
  }

  // await prisma.role.update({
  //   where: { id },
  //   data: {
  //     name: validated.name,
  //     description: validated.description,
  //     permissions: {
  //       set: validated.permissionIds.map((id) => ({ id })),
  //     },
  //   },
  // });

  const currentUser = await getCurrentUser();
  const userId = currentUser?.userId ?? null;

  const updatedRole = await updateWithLog(
    "role",
    { id },
    {
      name: validated.name,
      description: validated.description,
      permissions: {
        set: validated.permissionIds.map((id) => ({ id })),
      },
    },
    {
      userId,
      submodule: "roles",
    },
    {
      include: { permissions: true },
    },
  );
  revalidatePath("/roles");
  revalidatePath(`/roles/${id}/edit`);

  return updatedRole;
}

export async function deleteRoleAction(id: string) {
  const currentUser = await getCurrentUser();
  const currentUserRoleId = currentUser?.roleId;
  const userId = currentUser?.userId ?? null;

  const roleToDelete = await prisma.role.findUnique({
    where: { id },
    include: { permissions: true },
  });

  if (!roleToDelete) throw new Error("Role not found");

  if (id === currentUserRoleId) {
    throw new Error("You cannot delete role that has been assigned to you.");
  }

  const usersCount = await prisma.user.count({ where: { roleId: id } });
  if (usersCount > 0)
    throw new Error(`Cannot delete role. ${usersCount} user(s) are assigned.`);

  const invitesCount = await prisma.userInvite.count({ where: { roleId: id } });
  if (invitesCount > 0)
    throw new Error(
      `Cannot delete role. ${invitesCount} invite(s) are assigned.`,
    );

  await prisma.role.update({
    where: { id },
    data: { permissions: { set: [] } },
  });

  const deletedRole = await deleteWithLog(
    "role",
    { id },
    { userId, submodule: "roles" },
    { before: roleToDelete },
  );

  revalidatePath("/roles");
  return deletedRole;
}

export async function getRoles() {
  return await prisma.role.findMany({
    include: {
      permissions: true,
      _count: {
        select: { users: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRoleById(id: string) {
  return await prisma.role.findUnique({
    where: { id },
    include: {
      permissions: true,
    },
  });
}

export async function getAllPermissions() {
  return await prisma.permission.findMany({
    orderBy: [{ module: "asc" }, { action: "asc" }],
  });
}
