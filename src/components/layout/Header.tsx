"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/auth-context";
import { getInitials } from "@/lib/utils";
import { LogOut, User, Menu, Bell, Settings, Shield, Building2, ChevronDown } from "lucide-react";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, client, role, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-12 bg-white border-b border-[#DEE2E6] px-3 sm:px-5 flex items-center justify-between sticky top-0 z-30 shadow-none">
      <div className="flex items-center gap-2.5">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1.5 rounded-[3px] text-[#6C757D] hover:text-[#212529] hover:bg-[#F8F9FA]"
            aria-label="Toggle navigation"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[3px] bg-[#714B67] flex items-center justify-center text-white font-bold text-xs">
            CS
          </div>
          <span className="font-bold text-sm text-[#212529] tracking-tight">
            CHUNAV SETU
          </span>
        </Link>
      </div>

      {/* Center: Active Context / Campaign Info */}
      <div className="hidden md:flex items-center gap-2">
        {client && role !== "super_admin" && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[3px] text-xs">
            <Building2 className="w-3.5 h-3.5 text-[#714B67]" />
            <span className="text-[#6C757D]">Campaign:</span>
            <span className="font-semibold text-[#212529] truncate max-w-[200px]">
              {client.candidate_name} — {client.campaign_name}
            </span>
          </div>
        )}

        {role === "super_admin" && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FFF3E0] border border-[#FFE0B2] rounded-[3px] text-xs font-semibold text-[#E65100]">
            <Shield className="w-3.5 h-3.5" />
            <span>Super Admin Environment</span>
          </div>
        )}
      </div>

      {/* Right Side: Notifications & User Profile */}
      <div className="flex items-center gap-2">
        <button
          className="p-1.5 rounded-[3px] text-[#6C757D] hover:text-[#212529] hover:bg-[#F8F9FA] relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#714B67] absolute top-1.5 right-1.5" />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-[3px] hover:bg-[#F8F9FA] border border-transparent hover:border-[#DEE2E6] transition-colors text-xs"
          >
            <div className="w-6 h-6 rounded-[3px] bg-[#714B67] text-white text-[10px] font-bold flex items-center justify-center">
              {getInitials(user?.full_name || "User")}
            </div>
            <span className="font-medium text-[#212529] hidden sm:inline">
              {user?.full_name || "Account"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#6C757D]" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-1 w-52 bg-white border border-[#DEE2E6] rounded-[4px] shadow-dropdown py-1 z-50 text-xs">
                <div className="px-3 py-2 border-b border-[#DEE2E6]">
                  <p className="font-semibold text-[#212529]">{user?.full_name}</p>
                  <p className="text-[#6C757D] truncate text-[11px]">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-[2px] font-medium bg-[#F1ECEF] text-[#714B67] border border-[#D9CAD5]">
                    {role?.replace("_", " ")}
                  </span>
                </div>

                <div className="p-1">
                  <Link
                    href={role === "super_admin" ? "/admin/settings" : "/client/settings"}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 text-[#212529] hover:bg-[#F8F9FA] rounded-[3px] transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#6C757D]" />
                    <span>Settings</span>
                  </Link>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[#C62828] hover:bg-[#FFEBEE] rounded-[3px] transition-colors text-left font-medium mt-0.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
