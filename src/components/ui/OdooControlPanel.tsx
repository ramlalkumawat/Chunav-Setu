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
    <div className="bg-white border border-[#DEE2E6] rounded-[4px] px-4 sm:px-6 py-4 mb-4 shadow-none">
      {/* Top Row: Breadcrumb & Title on Left, Search & Pager on Right */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3.5 border-b border-[#E9ECEF]">
        {/* Left Side: Breadcrumb & Title */}
        <div>
          <div className="flex items-center gap-2 text-[14px] text-[#6C757D] font-medium">
            <span>{breadcrumb}</span>
            <span>/</span>
            <span className="font-semibold text-[#212529]">{title}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#212529] tracking-tight mt-1">
            {title}
          </h1>
          {subtitle && <p className="text-[14px] sm:text-[15px] text-[#6C757D] mt-0.5">{subtitle}</p>}
        </div>

        {/* Right Side: Search Box & Record Pager */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {onSearchChange && (
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue || ""}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full h-10 bg-white border border-[#DEE2E6] rounded-[4px] text-[15px] px-3 pl-9 text-[#212529] placeholder:text-[#ADB5BD] focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67]"
              />
              <Search className="w-4 h-4 text-[#6C757D] absolute left-3 top-3 pointer-events-none" />
            </div>
          )}

          {pagination && (
            <div className="flex items-center gap-2 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px] px-3 py-1.5 text-[14px] text-[#495057] whitespace-nowrap">
              <span>
                <strong className="text-[#212529]">{startIdx}-{endIdx}</strong> / {pagination.totalRecords}
              </span>
              <div className="flex items-center ml-2 border-l border-[#DEE2E6] pl-2 gap-1">
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
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
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
          <div className="flex-1 min-w-[260px] flex items-center justify-start sm:justify-end">
            {filterComponent}
          </div>
        )}
      </div>
    </div>
  );
}
