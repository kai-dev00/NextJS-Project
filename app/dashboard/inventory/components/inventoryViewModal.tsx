"use client";

import { CustomModal } from "@/components/CustomModal";
import { InventoryWithCategory, PurchaseHistoryItem } from "../InventoryClient";
import { formatDate, formatPeso } from "../../utils";
import { InventoryStatusBadge } from "./inventoryStatusBadge";

type Props = {
  inventory: InventoryWithCategory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseHistory: PurchaseHistoryItem[];
};

export function InventoryViewModal({
  inventory,
  open,
  onOpenChange,
  purchaseHistory,
}: Props) {
  if (!inventory) return null;

  return (
    <CustomModal
      open={open}
      onOpenChange={onOpenChange}
      title={inventory.name}
      size="xl"
    >
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
        {/* Purchase History */}
        <div className="space-y-2">
          <p className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
            Purchase History
          </p>
          {purchaseHistory.filter((item) => item.inventoryId === inventory.id)
            .length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No purchase history
            </p>
          ) : (
            <div className="max-h-45 overflow-y-auto space-y-1">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 text-xs text-muted-foreground px-1">
                <span>Supplier</span>
                <span>Qty</span>
                <span>Unit Cost</span>
                <span className="text-right">Date</span>
              </div>
              {purchaseHistory
                .filter((item) => item.inventoryId === inventory.id)
                .map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 border rounded-lg px-3 py-2 text-xs"
                  >
                    <span className="font-medium">
                      {item.purchase.supplier.name}
                    </span>
                    <span>
                      {item.quantity} {inventory.unit.toLowerCase()}
                    </span>
                    <span>{formatPeso(item.unitCost)}</span>
                    <span className="text-muted-foreground text-right">
                      {formatDate(new Date(item.purchase.createdAt))}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>

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
              {inventory.createdBy} · {formatDate(inventory.createdAt)}
            </span>
          </div>
          {inventory.updatedBy && inventory.updatedAt && (
            <div className="flex justify-between">
              <span>Last updated by</span>
              <span className="text-foreground">
                {inventory.updatedBy} · {formatDate(inventory.updatedAt)}
              </span>
            </div>
          )}
        </div>
      </div>
    </CustomModal>
  );
}
