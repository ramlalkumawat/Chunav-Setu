"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, Filter, Layers, Star, Download, Upload, Plus } from "lucide-react";
import { Button } from "./Button";
import { Input } from "./Input";

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
    <div className="bg-white border border-[#DEE2E6] rounded-[4px] px-3.5 py-2.5 mb-4 shadow-none">
      {/* Top Row: Breadcrumb & Title on Left, Search & Pager on Right */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2.5 border-b border-[#E9ECEF]">
        {/* Left Side: Breadcrumb & Title */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#6C757D]">
            <span>{breadcrumb}</span>
            <span>/</span>
            <span className="font-semibold text-[#212529]">{title}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-[#212529] tracking-tight mt-0.5">
            {title}
          </h1>
          {subtitle && <p className="text-xs text-[#6C757D]">{subtitle}</p>}
        </div>

        {/* Right Side: Search Box & Record Pager */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {onSearchChange && (
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue || ""}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full h-8 bg-white border border-[#DEE2E6] rounded-[3px] text-xs px-2.5 pl-7 text-[#212529] placeholder:text-[#ADB5BD] focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67]"
              />
              <Search className="w-3.5 h-3.5 text-[#6C757D] absolute left-2 top-2.5 pointer-events-none" />
            </div>
          )}

          {pagination && (
            <div className="flex items-center gap-1 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[3px] px-2 py-1 text-xs text-[#495057] whitespace-nowrap">
              <span>
                <strong className="text-[#212529]">{startIdx}-{endIdx}</strong> / {pagination.totalRecords}
              </span>
              <div className="flex items-center ml-1.5 border-l border-[#DEE2E6] pl-1 gap-0.5">
                <button
                  onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                  className="p-0.5 rounded hover:bg-white text-[#212529] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages || pagination.totalPages === 0}
                  className="p-0.5 rounded hover:bg-white text-[#212529] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Actions Bar & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {primaryAction && (
            primaryAction.href ? (
              <Link href={primaryAction.href}>
                <Button size="sm" variant="primary" leftIcon={primaryAction.icon || <Plus className="w-3.5 h-3.5" />}>
                  {primaryAction.label}
                </Button>
              </Link>
            ) : (
              <Button size="sm" variant="primary" leftIcon={primaryAction.icon || <Plus className="w-3.5 h-3.5" />} onClick={primaryAction.onClick}>
                {primaryAction.label}
              </Button>
            )
          )}

          {secondaryActions?.map((act, idx) => (
            act.href ? (
              <Link key={idx} href={act.href}>
                <Button size="sm" variant="secondary" leftIcon={act.icon}>
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

        {/* Filters and Groupings (If provided) */}
        {filterComponent && (
          <div className="flex-1 min-w-[240px]">
            {filterComponent}
          </div>
        )}
      </div>
    </div>
  );
}
