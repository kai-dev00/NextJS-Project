"use client";

import { useState } from "react";
import DashboardSidebar from "./sidebar";
import DashboardHeader from "./header";
import { NavigationProgress } from "./utils/ProgressBar";
import { RealtimeProvider } from "@upstash/realtime/client";

export default function DashboardLayoutWrapper({
  children,
  sidebarUser,
}: {
  children: React.ReactNode;
  sidebarUser: any;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <RealtimeProvider api={{ url: "/api/realtime" }}>
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
          <div className="h-1 w-full">
            <NavigationProgress />
          </div>

          <main className="flex-1 overflow-y-auto p-4">{children}</main>
        </div>
      </div>
    </RealtimeProvider>
  );
}
