import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const startIdx = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="flex items-center justify-between px-3 py-2 border-t border-[#DEE2E6] bg-[#F8F9FA] text-xs text-[#6C757D]">
      <div className="text-[12px]">
        <span className="font-semibold text-[#212529]">{startIdx}-{endIdx}</span> /{" "}
        <span className="font-semibold text-[#212529]">{totalRecords}</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-7 w-7 flex items-center justify-center rounded-[3px] bg-white border border-[#DEE2E6] hover:bg-[#F8F9FA] text-[#212529] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <span className="px-2 py-0.5 text-xs text-[#495057]">
          {currentPage} / {Math.max(1, totalPages)}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || totalPages === 0}
          className="h-7 w-7 flex items-center justify-center rounded-[3px] bg-white border border-[#DEE2E6] hover:bg-[#F8F9FA] text-[#212529] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Next page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
