"use server";

import prisma from "@/lib/prisma";
import { CategoryFormValues } from "./CategoryClient";
export async function createCategory(values: CategoryFormValues) {
  await prisma.category.create({
    data: {
      name: values.name,
      description: values.description,
      icon: values.icon,
      color: values.color,
    },
  });
  return { success: true };
}

export async function updateCategory(id: string, values: CategoryFormValues) {
  if (!id) {
    throw new Error("Category ID is required for editing");
  }

  const existing = await prisma.category.findUnique({
    where: { id: id },
  });

  if (!existing) {
    throw new Error("Category not found");
  }

  await prisma.category.update({
    where: { id },
    data: {
      name: values.name,
      icon: values.icon,
      color: values.color,
      description: values.description,
    },
  });

  return { success: true };
}

export async function deleteCategory(id: string) {
  if (!id) {
    throw new Error("Category ID is required for editing");
  }

  const existing = await prisma.category.findUnique({
    where: { id: id },
  });

  if (!existing) {
    throw new Error("Category not found");
  }

  await prisma.category.delete({
    where: { id },
  });
  return { success: true };
}
