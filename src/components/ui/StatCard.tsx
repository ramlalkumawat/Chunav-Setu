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
        "bg-white border border-[#DEE2E6] rounded-[4px] p-4 sm:p-5 flex flex-col justify-between transition-colors shadow-none",
        onClick && "cursor-pointer hover:border-[#714B67] hover:bg-[#FAF9FA]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm sm:text-[15px] font-semibold text-[#6C757D] uppercase tracking-wider truncate">
            {title}
          </p>
          <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl sm:text-3xl font-bold text-[#212529] tracking-tight">
              {formattedValue}
            </span>
            {subValue && (
              <span className="text-[13px] sm:text-[14px] text-[#6C757D] font-normal">{subValue}</span>
            )}
          </div>
        </div>

        {Icon && (
          <div
            className={cn(
              "w-10 h-10 rounded-[4px] flex items-center justify-center flex-shrink-0 border border-transparent",
              iconBg
            )}
          >
            <Icon className={cn("w-5 h-5", iconColor)} />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-2.5 border-t border-[#DEE2E6] flex items-center gap-2 text-xs sm:text-[13px]">
          <span
            className={cn(
              "font-semibold px-2 py-0.5 rounded-[3px] text-xs",
              trend.isPositive
                ? "bg-[#E8F5E9] text-[#2E7D32]"
                : "bg-[#FFF3E0] text-[#E65100]"
            )}
          >
            {trend.value}
          </span>
          {trend.label && <span className="text-[#6C757D] text-xs">{trend.label}</span>}
        </div>
      )}
    </div>
  );
}
