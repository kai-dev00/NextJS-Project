"use client";

import { PolarRadiusAxis, RadialBar, RadialBarChart, Label } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type Props = {
  inventories: {
    status: string | null;
  }[];
  showLegend?: boolean;
};

const chartConfig = {
  in_stock: { label: "In Stock", color: "#22c55e" },
  low_stock: { label: "Low Stock", color: "#f59e0b" },
  out_of_stock: { label: "Out of Stock", color: "#ef4444" },
  warning: { label: "Warning", color: "#f97316" },
  discontinued: { label: "Discontinued", color: "#6b7280" },
} satisfies ChartConfig;

export function InventoryStatusChart({
  inventories,
  showLegend = true,
}: Props) {
  const counts = {
    in_stock: inventories.filter((i) => i.status === "in_stock").length,
    low_stock: inventories.filter((i) => i.status === "low_stock").length,
    out_of_stock: inventories.filter((i) => i.status === "out_of_stock").length,
    warning: inventories.filter((i) => i.status === "warning").length,
    discontinued: inventories.filter((i) => i.status === "discontinued").length,
  };

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const chartData = [counts];

  return (
    <div className="border rounded-lg p-5 space-y-3">
      <p className="font-semibold text-sm">Inventory Status Count</p>
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square w-full max-w-62.5"
      >
        <RadialBarChart
          data={chartData}
          endAngle={180}
          innerRadius={70}
          outerRadius={130}
        >
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) - 16}
                        className="fill-foreground text-2xl font-bold"
                      >
                        {total}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 4}
                        className="fill-muted-foreground text-xs"
                      >
                        Total Items
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </PolarRadiusAxis>
          <RadialBar
            dataKey="in_stock"
            stackId="a"
            cornerRadius={3}
            fill="var(--color-in_stock)"
            className="stroke-transparent stroke-2"
          />
          <RadialBar
            dataKey="low_stock"
            stackId="a"
            cornerRadius={3}
            fill="var(--color-low_stock)"
            className="stroke-transparent stroke-2"
          />
          <RadialBar
            dataKey="out_of_stock"
            stackId="a"
            cornerRadius={3}
            fill="var(--color-out_of_stock)"
            className="stroke-transparent stroke-2"
          />
          <RadialBar
            dataKey="warning"
            stackId="a"
            cornerRadius={3}
            fill="var(--color-warning)"
            className="stroke-transparent stroke-2"
          />
          <RadialBar
            dataKey="discontinued"
            stackId="a"
            cornerRadius={3}
            fill="var(--color-discontinued)"
            className="stroke-transparent stroke-2"
          />
        </RadialBarChart>
      </ChartContainer>

      {/* Legend */}
      {showLegend && (
        <div className="grid grid-cols-2 gap-1">
          {Object.entries(chartConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-muted-foreground">{config.label}</span>
              <span className="font-medium ml-auto">
                {counts[key as keyof typeof counts]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
