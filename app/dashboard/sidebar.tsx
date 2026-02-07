"use client";

import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePermission } from "../(auth)/AuthProvider";

type SidebarUser = {
  fullName: string | null;
  email: string;
  role: string;
};

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    exact: true,
    permission: "dashboard:read",
  },
  {
    label: "Inventory",
    href: "/dashboard/inventory",
    exact: true,
    permission: "inventory:read",
  },
  {
    label: "Category",
    href: "/dashboard/category",
    exact: true,
    permission: "category:read",
  },
  {
    label: "Access Management",
    href: "/dashboard/accessManagement",
    exact: false,
    default: "/dashboard/accessManagement/users",
    anyOf: ["access-management:read:users", "access-management:read:roles"],
  },
];

export default function Sidebar({ user }: { user: SidebarUser | null }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col bg-black text-white px-4">
      <h2 className="mb-2 py-4 pl-2 font-semibold text-lg border-b border-gray-800">
        Bean Counter
      </h2>

      <nav className="space-y-2">
        {navItems.map(({ label, href, exact, default: defaultHref }) => {
          const isActive = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={defaultHref ?? href}
              className={`block rounded px-3 py-2 text-sm ${
                isActive
                  ? "bg-white text-black"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      {user && (
        <div className="border-t border-gray-800 p-4 flex justify-between items-center">
          <Link href="/dashboard/profile" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-700 text-sm font-semibold">
              {user.fullName?.[0] ?? "U"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {user.fullName ?? "User"}
              </p>
              <p className="truncate text-xs text-gray-400">{user.role}</p>
            </div>
          </Link>
          <LogoutButton />
        </div>
      )}
    </aside>
  );
}
