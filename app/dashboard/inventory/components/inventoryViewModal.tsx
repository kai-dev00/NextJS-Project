"use client";

import { CustomModal } from "@/components/CustomModal";
import { InventoryWithCategory } from "../InventoryClient";
import { formatDate, formatPeso } from "../../utils";
import { InventoryStatusBadge } from "./inventoryStatusBadge";

type Props = {
  inventory: InventoryWithCategory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InventoryViewModal({ inventory, open, onOpenChange }: Props) {
  if (!inventory) return null;

  return (
    <CustomModal open={open} onOpenChange={onOpenChange} title={inventory.name}>
      <div className="space-y-4 text-sm">
        {/* Status + Category row */}
        <div className="flex items-center gap-2">
          {inventory.status && (
            <InventoryStatusBadge status={inventory.status} />
          )}
          <span className="text-muted-foreground text-xs border rounded-full px-2 py-0.5">
            {inventory.category?.name ?? "No category"}
          </span>
        </div>

        {/* Description */}
        {inventory.description && (
          <p className="text-muted-foreground">{inventory.description}</p>
        )}

        <hr />

        {/* Stock Info */}
        <div className="grid grid-cols-3 gap-3">
          <div className="border rounded-lg p-3 space-y-1">
            <p className="text-xs text-muted-foreground">Quantity</p>
            <p className="font-semibold text-base">
              {inventory.quantity}{" "}
              <span className="text-xs text-muted-foreground">
                {inventory.unit}
              </span>
            </p>
          </div>
          <div className="border rounded-lg p-3 space-y-1">
            <p className="text-xs text-muted-foreground">Min. Stock</p>
            <p className="font-semibold text-base">
              {inventory.minimumStock}{" "}
              <span className="text-xs text-muted-foreground">
                {inventory.unit}
              </span>
            </p>
          </div>
          <div className="border rounded-lg p-3 space-y-1">
            <p className="text-xs text-muted-foreground">Unit Price</p>
            <p className="font-semibold text-base">
              {formatPeso(inventory.unitPrice)}
            </p>
          </div>
        </div>

        <hr />

        {/* Audit Info */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Created by</span>
            <span className="text-foreground">
              {inventory.createdBy ?? "—"} · {formatDate(inventory.createdAt)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Last updated by</span>
            <span className="text-foreground">
              {inventory.updatedBy ?? "—"} · {formatDate(inventory.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </CustomModal>
  );
}
