"use client";

import { useState } from "react";
import DashboardSidebar from "./sidebar";
import DashboardHeader from "./header";

export default function DashboardLayoutWrapper({
  children,
  sidebarUser,
}: {
  children: React.ReactNode;
  sidebarUser: any;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="shrink-0">
        <DashboardSidebar
          user={sidebarUser}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader
          user={sidebarUser}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
}
