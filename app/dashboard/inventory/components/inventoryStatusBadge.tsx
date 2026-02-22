import { Badge } from "@/components/ui/badge";
import { inventoryStatusConfig } from "@/app/dashboard/utils";
import { InventoryStatus } from "@/app/generated/prisma/enums";

type Props = {
  status: InventoryStatus;
};

export function InventoryStatusBadge({ status }: Props) {
  const config = inventoryStatusConfig[status];

  return <Badge className={config.className}>{config.label}</Badge>;
}
