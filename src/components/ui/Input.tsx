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
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-[#172033]">
            {label} {props.required && <span className="text-[#B94A48]">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-[#64748B] pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full bg-white border border-[#E5E2DC] rounded-[8px] text-[#172033] placeholder:text-[#94A3B8] text-sm px-3.5 py-2 transition-all duration-150 focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F] disabled:bg-[#F7F6F2] disabled:cursor-not-allowed",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              error && "border-[#B94A48] focus:border-[#B94A48] focus:ring-[#B94A48]",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-[#64748B] pointer-events-none flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-[#B94A48] font-medium mt-0.5">{error}</p>}
        {!error && helperText && <p className="text-xs text-[#64748B] mt-0.5">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
