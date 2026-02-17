"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { LuCoffee } from "react-icons/lu";
import {
  MdDashboard,
  MdInventory,
  MdCategory,
  MdManageAccounts,
} from "react-icons/md";
import { IconType } from "react-icons";
import LogoutButton from "@/components/LogoutButton";

type SidebarUser = {
  fullName: string | null;
  email: string;
  role: string;
};

type NavSubItem = {
  label: string;
  href: string;
};

type NavItem = {
  label: string;
  href?: string;
  icon: IconType;
  exact?: boolean;
  permission?: string;
  subItems?: NavSubItem[];
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: MdDashboard,
    exact: true,
    permission: "dashboard:read",
  },
  {
    label: "Inventory",
    href: "/dashboard/inventory",
    icon: MdInventory,
    exact: true,
    permission: "inventory:read",
  },
  {
    label: "Category",
    href: "/dashboard/category",
    icon: MdCategory,
    exact: true,
    permission: "category:read",
  },
  {
    label: "Access Management",
    icon: MdManageAccounts,
    permission: "access-management:read",
    subItems: [
      {
        label: "User Management",
        href: "/dashboard/accessManagement/users",
      },
      {
        label: "Role Management",
        href: "/dashboard/accessManagement/roles",
      },
    ],
  },
];

export default function DashboardSidebar({
  user,
  isCollapsed,
  setIsCollapsed,
}: {
  user: SidebarUser | null;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    "Access Management": true,
  });

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const isParentActive = (item: NavItem) => {
    if (item.href) {
      return item.exact
        ? pathname === item.href
        : pathname.startsWith(item.href);
    }
    if (item.subItems) {
      return item.subItems.some((sub) => pathname.startsWith(sub.href));
    }
    return false;
  };

  const isExpanded = !isCollapsed || isHovered;

  return (
    <aside
      onMouseEnter={() => isCollapsed && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={` flex h-screen flex-col bg-black text-white px-4 transition-[width] ease-in-out
 duration-300 ${isExpanded ? "w-64" : "w-20"}`}
    >
      {/* Header */}
      <div className="h-16 py-4 border-b border-gray-800 mb-2 flex items-center pl-3">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <LuCoffee className="size-5 shrink-0" />
          <span
            className={`transition-opacity duration-300 whitespace-nowrap ${
              !isExpanded ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
            }`}
          >
            Bean Counter
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isParentActive(item);
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isOpen = openMenus[item.label];

          return (
            <div key={item.label}>
              {hasSubItems ? (
                <>
                  <button
                    onClick={() => isExpanded && toggleMenu(item.label)}
                    className={`flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors w-full ${
                      isActive
                        ? "bg-white text-black"
                        : "text-gray-300 hover:bg-gray-800"
                    }`}
                    title={!isExpanded ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span
                      className={`transition-opacity duration-300 whitespace-nowrap flex-1 text-left ${
                        !isExpanded
                          ? "opacity-0 w-0 overflow-hidden"
                          : "opacity-100"
                      }`}
                    >
                      {item.label}
                    </span>
                    <ChevronRight
                      className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                        !isExpanded
                          ? "opacity-0 w-0 overflow-hidden"
                          : isOpen
                            ? "rotate-90"
                            : ""
                      }`}
                    />
                  </button>

                  {/* Submenu */}
                  <div
                    className={`ml-8 mt-1 space-y-1 transform-gpu origin-top transition-all duration-300 ease-in-out ${
                      isExpanded && isOpen
                        ? "scale-y-100 opacity-100"
                        : "scale-y-0 opacity-0 pointer-events-none"
                    }`}
                  >
                    {item.subItems!.map((subItem) => {
                      const isSubActive = pathname === subItem.href;

                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`block rounded px-3 py-1.5 text-sm ${
                            isSubActive
                              ? "font-medium text-white"
                              : "text-gray-400 hover:bg-gray-800 hover:text-white"
                          }`}
                        >
                          <span className="whitespace-nowrap">
                            {subItem.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </>
              ) : (
                <Link
                  href={item.href!}
                  className={`flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-white text-black"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                  title={!isExpanded ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span
                    className={`transition-opacity duration-300 whitespace-nowrap ${
                      !isExpanded
                        ? "opacity-0 w-0 overflow-hidden"
                        : "opacity-100"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* User Profile */}
      {user && (
        <div className="border-t border-gray-800 h-20  flex items-center gap-3 w-full  transition-opacity">
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 w-full hover:opacity-80 transition-opacity"
          >
            <div className="size-9 flex items-center justify-center rounded-full bg-gray-700 shrink-0">
              {user.fullName?.[0] ?? "U"}
            </div>

            <div
              className={`transition-all duration-300 overflow-hidden ${
                !isExpanded ? "opacity-0 w-0" : "opacity-100 w-full"
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {user.fullName ?? "User"}
                </p>
                <p className="truncate text-xs text-gray-400">{user.role}</p>
              </div>
            </div>
          </Link>
          <div
            className={`transition-all duration-300 overflow-hidden ${
              !isExpanded ? "opacity-0 w-0" : "opacity-100 w-16 ml-auto "
            }`}
          >
            <LogoutButton />
          </div>
        </div>
      )}
    </aside>
  );
}
