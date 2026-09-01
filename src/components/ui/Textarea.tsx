import React, { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, rows = 3, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-xs font-semibold text-[#172033]">
            {label} {props.required && <span className="text-[#B94A48]">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn(
            "w-full bg-white border border-[#E5E2DC] rounded-[8px] text-[#172033] placeholder:text-[#94A3B8] text-sm px-3.5 py-2 transition-all duration-150 focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F] disabled:bg-[#F7F6F2] disabled:cursor-not-allowed resize-none",
            error && "border-[#B94A48] focus:border-[#B94A48] focus:ring-[#B94A48]",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#B94A48] font-medium mt-0.5">{error}</p>}
        {!error && helperText && <p className="text-xs text-[#64748B] mt-0.5">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
