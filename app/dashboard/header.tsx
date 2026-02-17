"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiMenuFold3Fill, RiMenuFill } from "react-icons/ri";

type SidebarUser = {
  fullName: string | null;
  email: string;
  role: string;
};

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/inventory": "Inventory",
  "/dashboard/category": "Category",
  "/dashboard/accessManagement": "Access Management",
  "/dashboard/accessManagement/users": "Access Management",
  "/dashboard/accessManagement/roles": "Access Management",
  "/dashboard/profile": "Profile",
};

export default function DashboardHeader({
  user,
  isCollapsed,
  setIsCollapsed,
}: {
  user: SidebarUser | null;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}) {
  const pathname = usePathname();
  const title = routeTitles[pathname] || "Dashboard";

  return (
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-700 cursor-pointer"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <RiMenuFold3Fill className="size-5" />
          ) : (
            <RiMenuFill className="size-5" />
          )}
        </button>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

      <Link href="/dashboard/profile">
        {user && (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {user.fullName ?? "User"}
            </p>
            <p className="truncate text-xs text-gray-400">{user.role}</p>
          </div>
        )}
      </Link>
    </header>
  );
}
