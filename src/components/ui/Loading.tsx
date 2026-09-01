import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingSpinner({ className, text }: { className?: string; text?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 gap-2.5", className)}>
      <Loader2 className="w-6 h-6 animate-spin text-[#714B67]" />
      {text && <p className="text-xs text-[#6C757D]">{text}</p>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse bg-[#E9ECEF] rounded-[3px]",
        className
      )}
    />
  );
}
