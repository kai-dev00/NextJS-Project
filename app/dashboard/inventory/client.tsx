"use client";

import { usePermission } from "@/app/(auth)/AuthProvider";
import NoPermission from "../no-permission";

export default function InventoryClient() {
  const { can } = usePermission();

  if (!can("inventory:read")) {
    return <NoPermission />;
  }

  return <div>Inventory</div>;
}
