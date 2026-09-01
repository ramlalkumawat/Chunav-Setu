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
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="text-xs font-medium text-[#212529]">
            {label} {props.required && <span className="text-[#C62828]">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full h-9 appearance-none bg-white border border-[#DEE2E6] rounded-[4px] text-[#212529] text-xs px-3 py-1.5 pr-8 transition-colors focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] disabled:bg-[#F8F9FA] disabled:text-[#6C757D] disabled:cursor-not-allowed",
              error && "border-[#C62828] focus:border-[#C62828] focus:ring-[#C62828]",
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
          <ChevronDown className="w-3.5 h-3.5 text-[#6C757D] absolute right-2.5 pointer-events-none" />
        </div>
        {error && <p className="text-[11px] text-[#C62828] font-medium">{error}</p>}
        {!error && helperText && <p className="text-[11px] text-[#6C757D]">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
