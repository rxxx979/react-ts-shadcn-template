import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

const chartTooltipContent = <ChartTooltipContent />;

const chartData = [
  { month: "1月", desktop: 168, mobile: 120 },
  { month: "2月", desktop: 240, mobile: 160 },
  { month: "3月", desktop: 196, mobile: 140 },
  { month: "4月", desktop: 320, mobile: 210 },
  { month: "5月", desktop: 286, mobile: 190 },
];

const chartConfig = {
  desktop: { label: "桌面", color: "var(--chart-1)" },
  mobile: { label: "移动", color: "var(--chart-2)" },
} satisfies ChartConfig;

/**
 * 独立的图表 demo：让 Recharts 只在滚动到数据展示区时加载
 */
const ChartDemo = () => (
  <ChartContainer config={chartConfig} className="h-56 w-full">
    <BarChart data={chartData}>
      <CartesianGrid vertical={false} />
      <XAxis dataKey="month" tickLine={false} axisLine={false} />
      <ChartTooltip content={chartTooltipContent} />
      <Bar dataKey="desktop" fill="var(--color-desktop)" radius={6} />
      <Bar dataKey="mobile" fill="var(--color-mobile)" radius={6} />
    </BarChart>
  </ChartContainer>
);

export { ChartDemo };
