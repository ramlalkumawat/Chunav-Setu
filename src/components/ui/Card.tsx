import React, { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({ className, padding = "md", children, ...props }: CardProps) {
  const paddingStyles = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-5 sm:p-6",
  };

  return (
    <div
      className={cn(
        "bg-white border border-[#DEE2E6] rounded-[4px] shadow-none transition-colors",
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  title,
  subtitle,
  action,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DEE2E6] mb-3.5",
        className
      )}
      {...props}
    >
      <div>
        {title && <h3 className="text-sm font-semibold text-[#212529] tracking-tight">{title}</h3>}
        {subtitle && <p className="text-xs text-[#6C757D] mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-1.5">{action}</div>}
      {children}
    </div>
  );
}
