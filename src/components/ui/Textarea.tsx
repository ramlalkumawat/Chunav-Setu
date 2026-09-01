import React, { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, rows = 3, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-[15px] font-semibold text-[#212529]">
            {label} {props.required && <span className="text-[#C62828]">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={cn(
            "w-full bg-white border border-[#DEE2E6] rounded-[4px] text-[#212529] placeholder:text-[#ADB5BD] text-[15px] p-3.5 transition-colors focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] disabled:bg-[#F8F9FA] disabled:cursor-not-allowed shadow-none",
            error && "border-[#C62828] focus:border-[#C62828] focus:ring-[#C62828]",
            className
          )}
          {...props}
        />
        {error && <p className="text-[13px] text-[#C62828] font-medium mt-0.5">{error}</p>}
        {!error && helperText && <p className="text-[13px] text-[#6C757D] mt-0.5">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
