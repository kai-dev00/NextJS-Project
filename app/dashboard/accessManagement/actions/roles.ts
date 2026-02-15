"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";

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

  await prisma.role.create({
    data: {
      name: validated.name,
      description: validated.description,
      permissions: {
        connect: validated.permissionIds.map((id) => ({ id })),
      },
    },
  });

  revalidatePath("/roles");
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

  await prisma.role.update({
    where: { id },
    data: {
      name: validated.name,
      description: validated.description,
      permissions: {
        set: validated.permissionIds.map((id) => ({ id })),
      },
    },
  });

  revalidatePath("/roles");
  revalidatePath(`/roles/${id}/edit`);
}

export async function deleteRoleAction(id: string) {
  const currentUser = await getCurrentUser();
  const currentUserRoleId = currentUser?.roleId;

  if (id === currentUserRoleId) {
    throw new Error("You cannot delete role that has been assigned to you.");
  }

  //You cant delete role that any users already assigned
  const usersCount = await prisma.user.count({
    where: { roleId: id },
  });

  if (usersCount > 0) {
    throw new Error(
      `Cannot delete role. ${usersCount} user(s) are assigned to this role.`,
    );
  }

  await prisma.role.delete({
    where: { id },
  });

  revalidatePath("/roles");
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
