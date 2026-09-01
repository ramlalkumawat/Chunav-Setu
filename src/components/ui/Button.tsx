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
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-[8px]";

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2 gap-2",
      lg: "text-base px-5 py-2.5 gap-2.5",
    };

    const variantStyles = {
      primary:
        "bg-[#1F3A5F] hover:bg-[#172E4C] text-white focus:ring-[#1F3A5F] shadow-sm active:bg-[#12233A]",
      secondary:
        "bg-[#EAEFF5] hover:bg-[#DCE6F1] text-[#1F3A5F] focus:ring-[#1F3A5F]",
      outline:
        "border border-[#E5E2DC] bg-white hover:bg-[#F7F6F2] text-[#172033] focus:ring-[#1F3A5F]",
      danger:
        "bg-[#B94A48] hover:bg-[#9B3937] text-white focus:ring-[#B94A48] shadow-sm",
      success:
        "bg-[#2F6B4F] hover:bg-[#25563F] text-white focus:ring-[#2F6B4F] shadow-sm",
      ghost:
        "text-[#64748B] hover:text-[#172033] hover:bg-[#F0EDE8] focus:ring-slate-400",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
