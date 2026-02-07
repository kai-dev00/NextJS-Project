"use client";

import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { usePermission } from "@/app/(auth)/AuthProvider";

export function NavigationMenuDemo() {
  const pathname = usePathname();
  const { can, permissions } = usePermission();

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {/* {can("access-management:read:users") && ( */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="/dashboard/accessManagement/users"
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium",
                pathname.includes("/users")
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              User Management
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        {/* )} */}

        {/* {can("access-management:read:roles") && ( */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="/dashboard/accessManagement/roles"
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium",
                pathname.includes("/roles")
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Role Management
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        {/* )} */}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
