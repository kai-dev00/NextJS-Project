// app/dashboard/reports/ReportsClient.tsx
"use client";

import { Permission } from "@/lib/types";
import { usePermission } from "@/lib/permissions/usePermission";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Users,
} from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { Badge } from "@/components/ui/badge";
import NoPermission from "../../no-permission";
import { formatPeso } from "../../utils";
import { InventoryStatusBadge } from "../../inventory/components/inventoryStatusBadge";

type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  minimumStock: number;
  unit: string;
  status: string | null;
  category: { name: string; color?: string | null };
};

type PurchaseItem = {
  id: string;
  total: number;
  createdAt: string;
  supplier: { name: string };
  items: {
    quantity: number;
    unitCost: number;
    inventory: { name: string; unit: string };
  }[];
};

type SupplierTotal = {
  supplierId: string;
  supplierName: string;
  total: number;
  orderCount: number;
};

type Props = {
  inventories: InventoryItem[];
  purchases: PurchaseItem[];
  supplierTotals: SupplierTotal[];
  permissions: Permission[];
};

export default function ReportsClient({
  inventories,
  purchases,
  supplierTotals,
  permissions,
}: Props) {
  const { can } = usePermission(permissions);
  if (!can("reports:read")) return <NoPermission />;

  // --- Computed values ---
  const totalInventoryValue = inventories.reduce(
    (sum, inv) => sum + inv.quantity * inv.unitPrice,
    0,
  );

  const totalPurchaseSpend = purchases.reduce((sum, p) => sum + p.total, 0);

  const lowStockItems = inventories.filter(
    (inv) => inv.status === "low_stock" || inv.status === "out_of_stock",
  );

  const topSupplier = [...supplierTotals].sort((a, b) => b.total - a.total)[0];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCard
          title="Total Inventory Items"
          value={inventories.length}
          icon={Package}
          color="default"
          description="Across all categories"
        />
        <StatsCard
          title="Total Inventory Value"
          value={formatPeso(totalInventoryValue)}
          icon={TrendingUp}
          color="success"
          description="Based on unit prices"
        />
        <StatsCard
          title="Total Purchase Spend"
          value={formatPeso(totalPurchaseSpend)}
          icon={ShoppingCart}
          color="default"
          description="Received purchases only"
        />
        <StatsCard
          title="Low Stock Items"
          value={lowStockItems.length}
          icon={AlertTriangle}
          color={lowStockItems.length > 0 ? "warning" : "default"}
          description="Needs restocking"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Inventory Value Breakdown */}
        <div className="border rounded-lg p-5 space-y-3">
          <h3 className="font-semibold text-sm">Inventory Value Breakdown</h3>
          <div className="space-y-2">
            {inventories.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No data
              </p>
            ) : (
              [...inventories]
                .sort(
                  (a, b) => b.quantity * b.unitPrice - a.quantity * a.unitPrice,
                )
                .map((inv) => {
                  const value = inv.quantity * inv.unitPrice;
                  const pct =
                    totalInventoryValue > 0
                      ? (value / totalInventoryValue) * 100
                      : 0;
                  return (
                    <div key={inv.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">{inv.name}</span>
                        <span className="text-muted-foreground">
                          {formatPeso(value)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
            )}
          </div>
          <div className="flex justify-between pt-2 border-t text-sm font-semibold">
            <span>Total</span>
            <span>{formatPeso(totalInventoryValue)}</span>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="border rounded-lg p-5 space-y-3">
          <h3 className="font-semibold text-sm">Low Stock Alert</h3>
          {lowStockItems.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              All items are sufficiently stocked
            </p>
          ) : (
            <div className="space-y-2 max-h-70 overflow-y-auto">
              {lowStockItems.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between border rounded-lg px-3 py-2 text-xs"
                >
                  <div>
                    <p className="font-medium">{inv.name}</p>
                    <p className="text-muted-foreground">
                      {inv.quantity} {inv.unit.toLowerCase()} remaining · Min:{" "}
                      {inv.minimumStock} {inv.unit.toLowerCase()}
                    </p>
                  </div>
                  {inv.status && (
                    <InventoryStatusBadge status={inv.status as any} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Purchase Summary */}
        <div className="border rounded-lg p-5 space-y-3">
          <h3 className="font-semibold text-sm">Recent Purchases</h3>
          {purchases.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No purchases yet
            </p>
          ) : (
            <div className="space-y-2 max-h-70 overflow-y-auto">
              {purchases.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between border rounded-lg px-3 py-2 text-xs"
                >
                  <div>
                    <p className="font-medium">{p.supplier.name}</p>
                    <p className="text-muted-foreground">
                      {p.items.length} item{p.items.length !== 1 ? "s" : ""} ·{" "}
                      {new Date(p.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="font-semibold">{formatPeso(p.total)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between pt-2 border-t text-sm font-semibold">
            <span>Total Spent</span>
            <span>{formatPeso(totalPurchaseSpend)}</span>
          </div>
        </div>

        {/* Top Suppliers */}
        <div className="border rounded-lg p-5 space-y-3">
          <h3 className="font-semibold text-sm">Suppliers by Spend</h3>
          {supplierTotals.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No supplier data
            </p>
          ) : (
            <div className="space-y-2">
              {[...supplierTotals]
                .sort((a, b) => b.total - a.total)
                .map((s, i) => {
                  const pct =
                    totalPurchaseSpend > 0
                      ? (s.total / totalPurchaseSpend) * 100
                      : 0;
                  return (
                    <div key={s.supplierId} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            #{i + 1}
                          </span>
                          <span className="font-medium">{s.supplierName}</span>
                          <span className="text-muted-foreground">
                            {s.orderCount} order{s.orderCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <span className="text-muted-foreground">
                          {formatPeso(s.total)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
          <div className="flex justify-between pt-2 border-t text-sm font-semibold">
            <span>Total Spent</span>
            <span>{formatPeso(totalPurchaseSpend)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
