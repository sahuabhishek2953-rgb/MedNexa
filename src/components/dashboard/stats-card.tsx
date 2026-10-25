import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: "blue" | "green" | "yellow" | "purple";
  change?: string;
}

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    icon: "text-blue-600",
    border: "border-blue-100",
  },
  green: {
    bg: "bg-green-50",
    icon: "text-green-600",
    border: "border-green-100",
  },
  yellow: {
    bg: "bg-yellow-50",
    icon: "text-yellow-600",
    border: "border-yellow-100",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "text-purple-600",
    border: "border-purple-100",
  },
};

export function StatsCard({ title, value, icon: Icon, color, change }: StatsCardProps) {
  const c = colorMap[color];
  return (
    <div className={cn("bg-white rounded-xl border p-5 shadow-sm", c.border)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", c.bg)}>
          <Icon className={cn("h-5 w-5", c.icon)} />
        </div>
      </div>
      <div className="mt-3">
        <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
        {change && (
          <p className="text-xs text-gray-400 mt-1">{change}</p>
        )}
      </div>
    </div>
  );
}
