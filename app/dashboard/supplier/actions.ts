"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser, getCurrentUserWithName } from "@/lib/auth";
import {
  createWithLog,
  deleteWithLog,
  updateWithLog,
} from "@/lib/types/prismaLogger";
import { realtime } from "@/lib/upstash/realtime";
import { SupplierFormValues } from "./SupplierClient";

export async function createSupplier(values: SupplierFormValues) {
  // const currentUser = await getCurrentUser();
  const currentUser = await getCurrentUserWithName();
  const userId = currentUser?.userId ?? null;
  const supplier = (await createWithLog(
    "supplier",
    {
      name: values.name,
      email: values.email,
      phone: values.phone,
      address: values.address,
      notes: values.notes,
      // createdBy: userId, // use id or name?
      createdBy: currentUser?.fullName ?? "System", // use id or name?
    },
    {
      userId,
      submodule: "", //manually add submodule for now
    },
  )) as { id: string };
  await realtime.emit("activity.created", {
    action: "create",
    module: "supplier",
    submodule: "",
    recordId: supplier.id,
    user: currentUser?.fullName ?? null,
    createdAt: new Date().toISOString(),
  });
  return { success: true, supplier };
}

//update

export async function updateSupplier(id: string, values: SupplierFormValues) {
  // const currentUser = await getCurrentUser();
  const currentUser = await getCurrentUserWithName();
  const userId = currentUser?.userId ?? null;
  if (!id) {
    throw new Error("Supplier ID is required for editing");
  }
  const existing = await prisma.supplier.findUnique({
    where: { id: id },
  });
  if (!existing) {
    throw new Error("Supplier not found");
  }

  const updatedSupplier = (await updateWithLog(
    "supplier",
    { id },
    {
      name: values.name,
      email: values.email,
      phone: values.phone,
      address: values.address,
      notes: values.notes,
      updatedBy: currentUser?.fullName ?? "System", // use id or name?
    },
    {
      userId,
      submodule: "",
    },
  )) as { id: string };
  await realtime.emit("activity.created", {
    action: "update",
    module: "supplier",
    submodule: "",
    recordId: updatedSupplier.id,
    user: currentUser?.fullName ?? null,
    createdAt: new Date().toISOString(),
  });
  return { success: true, updatedSupplier };
}

//delete

export async function deleteSupplier(id: string) {
  // const currentUser = await getCurrentUser();
  const currentUser = await getCurrentUserWithName();
  const userId = currentUser?.userId ?? null;
  if (!id) {
    throw new Error("Supplier ID is required for editing");
  }
  const existing = await prisma.supplier.findUnique({
    where: { id: id },
  });
  if (!existing) {
    throw new Error("Supplier not found");
  }

  const deletedSupplier = (await deleteWithLog(
    "supplier",
    { id },
    { userId, submodule: "" },
  )) as { id: string };
  await realtime.emit("activity.created", {
    action: "delete",
    module: "supplier",
    submodule: "",
    recordId: deletedSupplier.id,
    user: currentUser?.fullName ?? null,
    createdAt: new Date().toISOString(),
  });
  return { success: true, deletedSupplier };
}
