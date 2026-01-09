import { LucideIcon } from "lucide-react";
import { Card } from "./card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

export function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  iconColor,
  iconBg,
}: StatCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-200 border-border/50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-foreground mb-2">{value}</h3>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-xs font-semibold px-2 py-1 rounded-full",
                trend === "up"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              )}
            >
              {change}
            </span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        </div>
        <div className={cn("p-3 rounded-xl", iconBg)}>
          <Icon className={cn("w-6 h-6", iconColor)} />
        </div>
      </div>
    </Card>
  );
}
