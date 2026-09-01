import React, { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-[#212529]">
            {label} {props.required && <span className="text-[#C62828]">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-2.5 text-[#6C757D] pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-9 bg-white border border-[#DEE2E6] rounded-[4px] text-[#212529] placeholder:text-[#ADB5BD] text-xs px-3 py-1.5 transition-colors focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] disabled:bg-[#F8F9FA] disabled:text-[#6C757D] disabled:cursor-not-allowed",
              leftIcon && "pl-8",
              rightIcon && "pr-8",
              error && "border-[#C62828] focus:border-[#C62828] focus:ring-[#C62828]",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-2.5 text-[#6C757D] pointer-events-none flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-[11px] text-[#C62828] font-medium">{error}</p>}
        {!error && helperText && <p className="text-[11px] text-[#6C757D]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
