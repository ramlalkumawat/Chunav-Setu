import React, { forwardRef, ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    // Odoo ERP standard buttons: compact 34-38px height, 4px radius, clear crisp borders
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-[4px] text-sm";

    const sizeStyles = {
      sm: "h-8 px-2.5 text-xs gap-1.5",
      md: "h-9 px-3.5 text-sm gap-2",
      lg: "h-10 px-4 text-sm gap-2",
    };

    const variantStyles = {
      primary:
        "bg-[#714B67] hover:bg-[#5E3E55] active:bg-[#4D3145] text-white border border-[#714B67] focus:ring-[#714B67] shadow-none",
      secondary:
        "bg-white hover:bg-[#F8F9FA] active:bg-[#E9ECEF] text-[#212529] border border-[#DEE2E6] focus:ring-[#714B67] shadow-none",
      outline:
        "bg-white hover:bg-[#F8F9FA] active:bg-[#E9ECEF] text-[#212529] border border-[#DEE2E6] focus:ring-[#714B67] shadow-none",
      danger:
        "bg-[#C62828] hover:bg-[#B71C1C] text-white border border-[#C62828] focus:ring-[#C62828] shadow-none",
      success:
        "bg-[#2E7D32] hover:bg-[#1B5E20] text-white border border-[#2E7D32] focus:ring-[#2E7D32] shadow-none",
      ghost:
        "bg-transparent hover:bg-[#F8F9FA] text-[#6C757D] hover:text-[#212529] border border-transparent focus:ring-slate-300",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
