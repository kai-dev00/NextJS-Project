import { requirePermission } from "@/lib/auth";
import InventoryClient from "./client";

export default async function InventoryPage() {
  return <InventoryClient />;
}
