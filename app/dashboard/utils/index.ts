import { InventoryStatus } from "@/app/generated/prisma/enums";
import { Decimal } from "@prisma/client/runtime/client";

export function computeInventoryStatus(
  quantity: number,
  minimumStock: number,
): InventoryStatus {
  if (quantity === 0) return "out_of_stock";

  if (minimumStock <= 0) return "in_stock";

  const ratio = quantity / minimumStock;

  if (ratio <= 1) return "warning"; // at or below minimum
  if (ratio <= 1.5) return "low_stock"; // within buffer zone

  return "in_stock";
}

export function formatPeso(amount: Decimal | number) {
  const value = amount instanceof Decimal ? amount.toNumber() : amount;
  return `₱${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

export function formatStatus(status: string | null) {
  if (!status) return "—";
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const formatUnit = (value: number, unit: string) => {
  const lower = unit?.toLowerCase();
  const displayUnit = value === 1 && lower === "pcs" ? "pc" : lower;
  return `${value.toLocaleString()} ${displayUnit}`;
};

export const inventoryStatusConfig = {
  in_stock: {
    label: "In Stock",
    className: "bg-green-500 text-white",
  },
  low_stock: {
    label: "Low Stock",
    className: "bg-yellow-500 text-black",
  },
  warning: {
    label: "Warning",
    className: "bg-orange-500 text-white",
  },
  out_of_stock: {
    label: "Out of Stock",
    className: "bg-red-600 text-white",
  },
  discontinued: {
    label: "Discontinued",
    className: "bg-gray-400 text-white",
  },
};

//date helper
export function formatDate(date?: Date | null) {
  if (!date) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
