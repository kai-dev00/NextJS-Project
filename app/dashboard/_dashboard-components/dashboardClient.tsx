"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRealtime } from "@upstash/realtime/client";
import { StatsCard } from "@/components/StatsCard";
import { Users, Package, Activity } from "lucide-react";
import type { RealtimeEvents } from "@/lib/upstash/realtime";

type ActivityItem = {
  id: string;
  action: string;
  module: string;
  submodule: string | null;
  recordId: string | null;
  createdAt: string;
  user: { fullName: string | null } | null;
};

type Props = {
  totalUsers: number;
  totalInventory: number;
  recentActivity: ActivityItem[];
  defaultSearch?: string;
};
const actionColors = {
  create: "bg-green-500",
  update: "bg-blue-500",
  delete: "bg-red-500",
};

const moduleRoutes: Record<string, string> = {
  inventory: "/dashboard/inventory",
  category: "/dashboard/category",
  "access-management:users": "/dashboard/accessManagement/users",
  "access-management:roles": "/dashboard/accessManagement/roles",
};

export default function DashboardClient({
  totalUsers,
  totalInventory,
  recentActivity,
}: Props) {
  const router = useRouter(); // 👈
  const [liveActivities, setLiveActivities] =
    useState<ActivityItem[]>(recentActivity);

  useRealtime<RealtimeEvents, "activity.created">({
    events: ["activity.created"],
    onData({ data }) {
      setLiveActivities((prev) => [
        {
          id: crypto.randomUUID(),
          action: data.action,
          module: data.module,
          submodule: data.submodule,
          recordId: data.recordId,
          createdAt: data.createdAt,
          user: { fullName: data.user },
        },
        ...prev.slice(0, 9),
      ]);
    },
  });

  const handleActivityClick = (activity: ActivityItem) => {
    if (activity.action === "delete") return; //  don't navigate for deleted items

    const routeKey = activity.submodule
      ? `${activity.module}:${activity.submodule}`
      : activity.module;

    console.log("routeKey:", routeKey);
    console.log("route:", moduleRoutes[routeKey]);
    const route = moduleRoutes[routeKey] ?? moduleRoutes[activity.module];

    // const route = moduleRoutes[activity.module];
    if (!route) return;
    if (activity.recordId) {
      router.push(`${route}?search=${activity.recordId}`);
    } else {
      router.push(route);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Welcome to your dashboard</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard title="Total Users" value={totalUsers} icon={Users} />
        <StatsCard
          title="Total Inventory"
          value={totalInventory}
          icon={Package}
        />
      </div>

      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Recent Activity</h3>
          <span className="ml-auto flex items-center gap-1 text-xs text-green-500">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </span>
        </div>

        <div className="space-y-2">
          {liveActivities.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              No recent activity
            </p>
          )}
          {liveActivities.map((activity) => (
            <div
              key={activity.id}
              onClick={() => handleActivityClick(activity)} // 👈
              className={`flex items-start gap-3 text-sm p-2 rounded-md transition-colors ${
                (moduleRoutes[`${activity.module}:${activity.submodule}`] ??
                  moduleRoutes[activity.module]) &&
                activity.action !== "delete"
                  ? "cursor-pointer hover:bg-muted"
                  : ""
              }`}
            >
              <span
                className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${actionColors[activity.action as keyof typeof actionColors] ?? "bg-gray-400"}`}
              />
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">
                    {activity.user?.fullName ?? "System"}
                  </span>{" "}
                  {activity.action}d in{" "}
                  <span className="font-medium capitalize">
                    {activity.module}
                  </span>
                  {activity.submodule && (
                    <>
                      {" › "}
                      <span className="font-medium capitalize">
                        {activity.submodule}
                      </span>
                    </>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(activity.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
