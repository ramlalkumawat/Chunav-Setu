import React, { forwardRef, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, children, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold text-[#172033]">
            {label} {props.required && <span className="text-[#B94A48]">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full appearance-none bg-white border border-[#E5E2DC] rounded-[8px] text-[#172033] text-sm px-3.5 py-2 pr-9 transition-all duration-150 focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F] disabled:bg-[#F7F6F2] disabled:cursor-not-allowed",
              error && "border-[#B94A48] focus:border-[#B94A48] focus:ring-[#B94A48]",
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3 pointer-events-none" />
        </div>
        {error && <p className="text-xs text-[#B94A48] font-medium mt-0.5">{error}</p>}
        {!error && helperText && <p className="text-xs text-[#64748B] mt-0.5">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
