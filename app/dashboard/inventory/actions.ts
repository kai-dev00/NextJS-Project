"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  createWithLog,
  deleteWithLog,
  updateWithLog,
} from "@/lib/types/prismaLogger";
import { InventoryFormValues } from "./InventoryClient";
import { computeInventoryStatus } from "../utils";
import { Decimal } from "@prisma/client/runtime/client";

//only use decimal in the action serve and numbers in the client

export async function createInventory(values: InventoryFormValues) {
  const status = computeInventoryStatus(values.quantity, values.minimumStock);

  const currentUser = await getCurrentUser();
  const userId = currentUser?.userId ?? null;
  const inventory = await createWithLog(
    "inventory",
    {
      ...values,
      quantity: new Decimal(values.quantity),
      minimumStock: new Decimal(values.minimumStock),
      unitPrice: new Decimal(values.unitPrice),
      status,
      createdBy: userId,
    },
    {
      userId,
      submodule: "", //manually add submodule for now
    },
  );
  return { success: true }; //or if u want to return the new added name
}

export async function updateInventory(id: string, values: InventoryFormValues) {
  const currentUser = await getCurrentUser();
  const userId = currentUser?.userId ?? null;

  if (!id) throw new Error("Inventory ID is required for editing");

  const existing = await prisma.inventory.findUnique({ where: { id } });
  if (!existing) throw new Error("Inventory not found");

  const status = computeInventoryStatus(values.quantity, values.minimumStock);

  const updatedInventory = await updateWithLog(
    "inventory",
    { id },
    {
      name: values.name,
      description: values.description,
      quantity: new Decimal(values.quantity),
      minimumStock: new Decimal(values.minimumStock),
      unitPrice: new Decimal(values.unitPrice),
      status,
      categoryId: values.categoryId,
      updatedBy: userId,
    },
    {
      userId,
      submodule: "",
    },
  );

  return { success: true };
}

export async function deleteInventory(id: string) {
  const currentUser = await getCurrentUser();
  const userId = currentUser?.userId ?? null;

  if (!id) throw new Error("Inventory ID is required");

  const existing = await prisma.inventory.findUnique({ where: { id } });
  if (!existing) throw new Error("Inventory not found");

  const deletedInventory = await deleteWithLog(
    "inventory",
    { id },
    { userId, submodule: "" },
  );

  return { success: true, deletedInventory };
}
