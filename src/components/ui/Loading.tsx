import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingSpinner({ className, text }: { className?: string; text?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 gap-3", className)}>
      <Loader2 className="w-8 h-8 animate-spin text-[#1F3A5F]" />
      {text && <p className="text-xs font-medium text-[#64748B]">{text}</p>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse bg-[#E5E2DC]/60 rounded-md",
        className
      )}
    />
  );
}
