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
    <div className="flex flex-col items-center justify-center text-center p-6 sm:p-10 border border-[#DEE2E6] rounded-[4px] bg-white">
      <div className="w-10 h-10 rounded-[4px] bg-[#F1ECEF] text-[#714B67] flex items-center justify-center mb-2.5">
        {icon || <FolderSearch className="w-5 h-5" />}
      </div>
      <h4 className="text-sm font-semibold text-[#212529]">{title}</h4>
      {description && (
        <p className="text-xs text-[#64748B] max-w-sm mt-1 mb-3.5 leading-relaxed">
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
