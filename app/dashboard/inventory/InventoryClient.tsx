"use client";

import { Permission } from "@/lib/types";
import NoPermission from "../no-permission";
import { usePermission } from "@/lib/permissions/usePermission";

type Props = {
  permissions: Permission[];
};

export default function InventoryClient({ permissions }: Props) {
  const { can } = usePermission(permissions);
  if (!can("inventory:read")) return <NoPermission />;
  return <div>Inventory</div>;
}
