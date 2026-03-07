import z from "zod";

export const purchaseItemSchema = z.object({
  inventoryId: z.string().min(1, "Required"),
  quantity: z.number({ message: "Required" }).min(1, "Min 1"),
  unitCost: z.number({ message: "Required" }).min(0, "Required"),
});

export const purchaseSchema = z.object({
  supplierId: z.string().min(1, "Required"),
  notes: z.string().optional(),
  items: z.array(purchaseItemSchema).min(1, "At least one item is required"),
});

export type PurchaseItemFormValues = z.infer<typeof purchaseItemSchema>;
export type PurchaseFormValues = z.infer<typeof purchaseSchema>;
