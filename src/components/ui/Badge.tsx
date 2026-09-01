import React from "react";
import { getStatusBadge, cn } from "@/lib/utils";

export interface BadgeProps {
  variant?: "default" | "status" | "success" | "warning" | "danger" | "primary" | "outline";
  status?: string;
  children?: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
}

export function Badge({
  variant = "default",
  status,
  children,
  className,
  size = "md",
}: BadgeProps) {
  let badgeStyle = "bg-[#F8F9FA] text-[#495057] border-[#DEE2E6]";
  let content = children;

  if (status) {
    const badgeInfo = getStatusBadge(status);
    badgeStyle = badgeInfo.bg;
    if (!children) content = badgeInfo.label;
  } else if (variant === "success") {
    badgeStyle = "bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]";
  } else if (variant === "warning") {
    badgeStyle = "bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]";
  } else if (variant === "danger") {
    badgeStyle = "bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]";
  } else if (variant === "primary") {
    badgeStyle = "bg-[#F1ECEF] text-[#714B67] border-[#D9CAD5]";
  } else if (variant === "outline") {
    badgeStyle = "bg-white text-[#212529] border-[#DEE2E6]";
  }

  const sizeStyles = {
    sm: "text-[11px] px-1.5 py-0.5 font-medium leading-none",
    md: "text-xs px-2 py-0.5 font-medium leading-tight",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-[3px] border capitalize tracking-normal select-none",
        sizeStyles[size],
        badgeStyle,
        className
      )}
    >
      {content}
    </span>
  );
}
