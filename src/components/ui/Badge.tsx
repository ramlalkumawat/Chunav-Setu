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
  let badgeStyle = "bg-[#F1F3F5] text-[#64748B] border-[#E2E8F0]";
  let content = children;

  if (status) {
    const badgeInfo = getStatusBadge(status);
    badgeStyle = badgeInfo.bg;
    if (!children) content = badgeInfo.label;
  } else if (variant === "success") {
    badgeStyle = "bg-[#EAF3EE] text-[#2F6B4F] border-[#C3DEC9]";
  } else if (variant === "warning") {
    badgeStyle = "bg-[#FEF7EC] text-[#B7791F] border-[#FBE3B8]";
  } else if (variant === "danger") {
    badgeStyle = "bg-[#FDF2F2] text-[#B94A48] border-[#F7C6C6]";
  } else if (variant === "primary") {
    badgeStyle = "bg-[#EAEFF5] text-[#1F3A5F] border-[#DCE6F1]";
  } else if (variant === "outline") {
    badgeStyle = "bg-transparent text-[#172033] border-[#E5E2DC]";
  }

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 font-medium",
    md: "text-xs px-2.5 py-1 font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border capitalize tracking-tight select-none",
        sizeStyles[size],
        badgeStyle,
        className
      )}
    >
      {content}
    </span>
  );
}
