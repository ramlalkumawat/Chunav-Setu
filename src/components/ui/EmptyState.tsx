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
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-[#DEE2E6] rounded-[4px] bg-white shadow-none">
      <div className="w-12 h-12 rounded-[4px] bg-[#F1ECEF] text-[#714B67] flex items-center justify-center mb-3">
        {icon || <FolderSearch className="w-6 h-6" />}
      </div>
      <h4 className="text-base sm:text-lg font-bold text-[#212529]">{title}</h4>
      {description && (
        <p className="text-[14px] text-[#6C757D] max-w-md mt-1.5 mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <Button size="sm" variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
