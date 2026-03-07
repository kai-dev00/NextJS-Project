"use client";

import { CustomModal } from "@/components/CustomModal";
import { Supplier } from "@/app/generated/prisma/browser";
import { formatDate } from "../../utils";
import { FileText, Mail, MapPin, Phone } from "lucide-react";

type Props = {
  supplier: Supplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SupplierViewModal({ supplier, open, onOpenChange }: Props) {
  if (!supplier) return null;

  return (
    <CustomModal open={open} onOpenChange={onOpenChange} title={supplier.name}>
      <div className="space-y-4 text-sm">
        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="border rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" /> Email
            </div>
            <p className="font-medium truncate">{supplier.email || "—"}</p>
          </div>
          <div className="border rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" /> Phone
            </div>
            <p className="font-medium">{supplier.phone || "—"}</p>
          </div>
          <div className="border rounded-lg p-3 space-y-1 col-span-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> Address
            </div>
            <p className="font-medium">{supplier.address || "—"}</p>
          </div>
        </div>

        {/* Notes */}
        {supplier.notes && (
          <div className="border rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" /> Notes
            </div>
            <p className="text-muted-foreground">{supplier.notes}</p>
          </div>
        )}

        <hr />

        {/* Audit Info */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Created by</span>
            <span className="text-foreground">
              {supplier.createdBy || "N/A"} · {formatDate(supplier.createdAt)}
            </span>
          </div>
          {supplier.updatedBy && supplier.updatedAt && (
            <div className="flex justify-between">
              <span>Last updated by</span>
              <span className="text-foreground">
                {supplier.updatedBy} · {formatDate(supplier.updatedAt)}
              </span>
            </div>
          )}
        </div>
      </div>
    </CustomModal>
  );
}
