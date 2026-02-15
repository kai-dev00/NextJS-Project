"use client";

import { useMemo } from "react";
import { Permission } from "../types";

export function usePermission(permissions: Permission[] = []) {
  const can = useMemo(
    () => (permission: string) =>
      permissions.some(
        (p) =>
          [p.module, p.action, p.submodule].filter(Boolean).join(":") ===
          permission,
      ),
    [permissions],
  );

  return { can };
}
