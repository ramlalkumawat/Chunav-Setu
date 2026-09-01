import React from "react";
import { FolderSearch } from "lucide-react";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-[#E5E2DC] rounded-[10px] bg-white">
      <div className="w-12 h-12 rounded-full bg-[#EAEFF5] text-[#1F3A5F] flex items-center justify-center mb-3">
        {icon || <FolderSearch className="w-6 h-6" />}
      </div>
      <h4 className="text-base font-semibold text-[#172033]">{title}</h4>
      {description && (
        <p className="text-xs text-[#64748B] max-w-sm mt-1 mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
