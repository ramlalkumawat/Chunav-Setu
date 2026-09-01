"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, Plus } from "lucide-react";
import { Button } from "./Button";

export interface OdooControlPanelProps {
  breadcrumb?: string;
  title: string;
  subtitle?: string;
  primaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: React.ReactNode;
  };
  secondaryActions?: Array<{
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: React.ReactNode;
  }>;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  filterComponent?: React.ReactNode;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    pageSize: number;
    onPageChange: (page: number) => void;
  };
}

export function OdooControlPanel({
  breadcrumb = "Chunav Setu",
  title,
  subtitle,
  primaryAction,
  secondaryActions,
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  filterComponent,
  pagination,
}: OdooControlPanelProps) {
  const startIdx = pagination
    ? pagination.totalRecords === 0
      ? 0
      : (pagination.currentPage - 1) * pagination.pageSize + 1
    : 0;
  const endIdx = pagination
    ? Math.min(pagination.currentPage * pagination.pageSize, pagination.totalRecords)
    : 0;

  return (
    <div className="bg-white border border-[#DEE2E6] rounded-[4px] px-3.5 sm:px-6 py-3.5 sm:py-4 mb-4 shadow-none w-full max-w-full overflow-hidden">
      {/* Top Row: Breadcrumb & Title on Left, Search & Pager on Right */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 sm:gap-4 pb-3.5 border-b border-[#E9ECEF] w-full min-w-0">
        {/* Left Side: Breadcrumb & Title */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-[14px] text-[#6C757D] font-medium truncate">
            <span>{breadcrumb}</span>
            <span>/</span>
            <span className="font-semibold text-[#212529] truncate">{title}</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#212529] tracking-tight mt-1 break-words">
            {title}
          </h1>
          {subtitle && <p className="text-xs sm:text-[14px] md:text-[15px] text-[#6C757D] mt-0.5 break-words">{subtitle}</p>}
        </div>

        {/* Right Side: Search Box & Record Pager */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap w-full lg:w-auto min-w-0">
          {onSearchChange && (
            <div className="relative w-full sm:w-72 min-w-0 flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue || ""}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full h-10 bg-white border border-[#DEE2E6] rounded-[4px] text-sm sm:text-[15px] px-3 pl-9 text-[#212529] placeholder:text-[#ADB5BD] focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67]"
              />
              <Search className="w-4 h-4 text-[#6C757D] absolute left-3 top-3 pointer-events-none" />
            </div>
          )}

          {pagination && (
            <div className="flex items-center gap-2 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px] px-2.5 sm:px-3 py-1.5 text-xs sm:text-[14px] text-[#495057] whitespace-nowrap flex-shrink-0">
              <span>
                <strong className="text-[#212529]">{startIdx}-{endIdx}</strong> / {pagination.totalRecords}
              </span>
              <div className="flex items-center ml-1.5 sm:ml-2 border-l border-[#DEE2E6] pl-1.5 sm:pl-2 gap-1">
                <button
                  onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                  className="p-1 rounded hover:bg-white text-[#212529] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages || pagination.totalPages === 0}
                  className="p-1 rounded hover:bg-white text-[#212529] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Actions Bar & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 w-full min-w-0">
        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {primaryAction && (
            primaryAction.href ? (
              <Link href={primaryAction.href}>
                <Button size="sm" variant="primary" leftIcon={primaryAction.icon || <Plus className="w-4 h-4" />}>
                  {primaryAction.label}
                </Button>
              </Link>
            ) : (
              <Button size="sm" variant="primary" leftIcon={primaryAction.icon || <Plus className="w-4 h-4" />} onClick={primaryAction.onClick}>
                {primaryAction.label}
              </Button>
            )
          )}

          {secondaryActions?.map((act, idx) => (
            act.href ? (
              <Link key={idx} href={act.href}>
                <Button key={idx} size="sm" variant="secondary" leftIcon={act.icon}>
                  {act.label}
                </Button>
              </Link>
            ) : (
              <Button key={idx} size="sm" variant="secondary" leftIcon={act.icon} onClick={act.onClick}>
                {act.label}
              </Button>
            )
          ))}
        </div>

        {/* Filters and Groupings */}
        {filterComponent && (
          <div className="w-full sm:w-auto flex-1 flex items-center justify-start sm:justify-end min-w-0">
            {filterComponent}
          </div>
        )}
      </div>
    </div>
  );
}
