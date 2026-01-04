// app/dashboard/sidebar.tsx (CLIENT component)
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Users", href: "/dashboard/users" },
  { label: "Settings", href: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 bg-black text-white p-6">
      <h2 className="mb-6 font-semibold text-lg">My App</h2>
      <nav className="space-y-2">
        {navItems.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className={`block rounded px-3 py-2 text-sm ${
              pathname === href
                ? "bg-white text-black"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
