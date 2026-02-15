import { getCurrentUserWithDetails } from "@/lib/auth";
import InventoryClient from "./InventoryClient";

export default async function InventoryPage() {
  const permissionData = await getCurrentUserWithDetails();
  const permissions = permissionData?.role?.permissions || [];

  return <InventoryClient permissions={permissions} />;
}
