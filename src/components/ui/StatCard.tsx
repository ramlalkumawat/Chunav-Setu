import React from "react";
import { formatNumber, cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: number | string;
  subValue?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  onClick?: () => void;
  className?: string;
}

export function StatCard({
  title,
  value,
  subValue,
  icon: Icon,
  iconColor = "text-[#1F3A5F]",
  iconBg = "bg-[#EAEFF5]",
  trend,
  onClick,
  className,
}: StatCardProps) {
  const formattedValue = typeof value === "number" ? formatNumber(value) : value;

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white border border-[#E5E2DC] rounded-[10px] p-4 sm:p-5 shadow-card transition-all duration-150 flex flex-col justify-between",
        onClick && "cursor-pointer hover:border-[#1F3A5F]/40 hover:shadow-subtle",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider truncate">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-[#172033] tracking-tight">
              {formattedValue}
            </span>
            {subValue && (
              <span className="text-xs text-[#64748B] font-normal">{subValue}</span>
            )}
          </div>
        </div>

        {Icon && (
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
              iconBg
            )}
          >
            <Icon className={cn("w-5 h-5", iconColor)} />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-[#E5E2DC]/60 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "font-semibold px-1.5 py-0.5 rounded",
              trend.isPositive
                ? "bg-[#EAF3EE] text-[#2F6B4F]"
                : "bg-[#FEF7EC] text-[#B7791F]"
            )}
          >
            {trend.value}
          </span>
          {trend.label && <span className="text-[#64748B]">{trend.label}</span>}
        </div>
      )}
    </div>
  );
}
