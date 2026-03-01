"use client";

import { CustomModal } from "@/components/CustomModal";
import { Category } from "@/app/generated/prisma/browser";
import { formatDate, formatPeso } from "../../utils";

type Props = {
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CategoryViewModal({ category, open, onOpenChange }: Props) {
  if (!category) return null;

  return (
    <CustomModal open={open} onOpenChange={onOpenChange} title={category.name}>
      <div className="space-y-4 text-sm">
        {/* Description */}
        {category.description && (
          <p className="text-muted-foreground">{category.description}</p>
        )}

        <hr />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="border rounded-lg p-3 space-y-1">
            <p className="text-xs text-muted-foreground">Total Price</p>
            <p className="font-semibold text-base">
              {formatPeso(category.totalPrice)}
            </p>
          </div>
        </div>

        <hr />

        {/* Audit Info */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Created by</span>
            <span className="text-foreground">
              {category.createdBy} · {formatDate(category.createdAt)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Last updated by</span>
            <span className="text-foreground">
              {category.updatedBy} · {formatDate(category.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </CustomModal>
  );
}
