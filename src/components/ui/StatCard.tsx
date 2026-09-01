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
  iconColor = "text-[#714B67]",
  iconBg = "bg-[#F1ECEF]",
  trend,
  onClick,
  className,
}: StatCardProps) {
  const formattedValue = typeof value === "number" ? formatNumber(value) : value;

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white border border-[#DEE2E6] rounded-[4px] p-3.5 flex flex-col justify-between transition-colors",
        onClick && "cursor-pointer hover:border-[#714B67] hover:bg-[#FAF9FA]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-[#6C757D] uppercase tracking-wider truncate">
            {title}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-[#212529] tracking-tight">
              {formattedValue}
            </span>
            {subValue && (
              <span className="text-xs text-[#6C757D] font-normal">{subValue}</span>
            )}
          </div>
        </div>

        {Icon && (
          <div
            className={cn(
              "w-8 h-8 rounded-[4px] flex items-center justify-center flex-shrink-0 border border-transparent",
              iconBg
            )}
          >
            <Icon className={cn("w-4 h-4", iconColor)} />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-2.5 pt-2 border-t border-[#DEE2E6] flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "font-semibold px-1.5 py-0.5 rounded-[2px] text-[11px]",
              trend.isPositive
                ? "bg-[#E8F5E9] text-[#2E7D32]"
                : "bg-[#FFF3E0] text-[#E65100]"
            )}
          >
            {trend.value}
          </span>
          {trend.label && <span className="text-[#6C757D] text-[11px]">{trend.label}</span>}
        </div>
      )}
    </div>
  );
}
