"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatsCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    label?: string;
  };
  className?: string;
  onClick?: () => void;
  active?: boolean;
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  onClick,
  active = false,
}: StatsCardProps) {
  const isPositive = trend && trend.value >= 0;

  return (
    <Card
      className={cn(
        "transition-all",
        onClick && "cursor-pointer hover:border-primary",
        active && "border-primary bg-primary/5",
        className,
      )}
      onClick={onClick}
    >
      <CardContent className=" px-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="p-2 bg-muted rounded-md">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="mt-3">
          <p className="text-2xl font-bold">{value}</p>

          {trend && (
            <p
              className={cn(
                "text-xs mt-1",
                isPositive ? "text-green-600" : "text-red-500",
              )}
            >
              {isPositive ? "▲" : "▼"} {Math.abs(trend.value)}%{" "}
              <span className="text-muted-foreground">
                {trend.label ?? "from last month"}
              </span>
            </p>
          )}

          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
