"use server";

import prisma from "@/lib/prisma";
import { CategoryFormValues } from "./CategoryClient";
import { getCurrentUser } from "@/lib/auth";
import {
  createWithLog,
  deleteWithLog,
  updateWithLog,
} from "@/lib/types/prismaLogger";

export async function createCategory(values: CategoryFormValues) {
  const currentUser = await getCurrentUser();
  const userId = currentUser?.userId ?? null;
  const category = await createWithLog(
    "category",
    {
      name: values.name,
      description: values.description,
      icon: values.icon,
      color: values.color,
      createdBy: userId, // use id or name?
    },
    {
      userId,
      submodule: "", //manually add submodule for now
    },
  );
  return { success: true, category };
  // await prisma.category.create({
  //   data: {
  //     name: values.name,
  //     description: values.description,
  //     icon: values.icon,
  //     color: values.color,
  //   },
  // });
  // return { success: true };
}

export async function updateCategory(id: string, values: CategoryFormValues) {
  const currentUser = await getCurrentUser();
  const userId = currentUser?.userId ?? null;
  if (!id) {
    throw new Error("Category ID is required for editing");
  }

  const existing = await prisma.category.findUnique({
    where: { id: id },
  });

  if (!existing) {
    throw new Error("Category not found");
  }

  const updatedCategory = await updateWithLog(
    "category",
    { id },
    {
      name: values.name,
      icon: values.icon,
      color: values.color,
      description: values.description,
      updatedBy: userId, // use id or name?
    },
    {
      userId,
      submodule: "",
    },
  );

  return { success: true, updatedCategory };
  // await prisma.category.update({
  //   where: { id },
  //   data: {
  //     name: values.name,
  //     icon: values.icon,
  //     color: values.color,
  //     description: values.description,
  //   },
  // });

  // return { success: true };
}

export async function deleteCategory(id: string) {
  const currentUser = await getCurrentUser();
  const userId = currentUser?.userId ?? null;
  if (!id) {
    throw new Error("Category ID is required for editing");
  }

  const existing = await prisma.category.findUnique({
    where: { id: id },
  });

  if (!existing) {
    throw new Error("Category not found");
  }

  // await prisma.category.delete({
  //   where: { id },
  // });
  // return { success: true };

  const deletedCategory = await deleteWithLog(
    "category",
    { id },
    { userId, submodule: "" },
  );

  return { success: true, deletedCategory };
}
