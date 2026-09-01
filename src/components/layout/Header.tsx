"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/auth-context";
import { useLanguage } from "@/lib/i18n";
import { getInitials } from "@/lib/utils";
import {
  LogOut,
  Menu,
  Bell,
  Settings,
  Shield,
  Building,
  ChevronDown,
} from "lucide-react";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, client, role, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-[#DEE2E6] px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-none transition-colors w-full max-w-full">
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1.5 sm:p-2 rounded-[4px] text-[#6C757D] hover:text-[#212529] hover:bg-[#F8F9FA]"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[4px] bg-[#714B67] flex items-center justify-center text-white font-bold text-sm shadow-none flex-shrink-0">
            CS
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm sm:text-base text-[#212529] tracking-tight leading-none">
              {t("appName")}
            </span>
            <span className="text-[11px] text-[#6C757D] font-medium hidden sm:inline leading-none mt-1">
              ERP
            </span>
          </div>
        </Link>
      </div>

      {/* Center: Active Context / Campaign Info */}
      <div className="hidden md:flex items-center gap-2.5 min-w-0">
        {client && role !== "super_admin" && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px] text-sm truncate">
            <Building className="w-4 h-4 text-[#714B67] flex-shrink-0" />
            <span className="text-[#6C757D] font-medium flex-shrink-0">{t("candidate")}:</span>
            <span className="font-semibold text-[#212529] truncate max-w-[240px]">
              {client.candidate_name} ({client.campaign_name})
            </span>
          </div>
        )}

        {role === "super_admin" && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FFF3E0] border border-[#FFE0B2] rounded-[4px] text-sm font-semibold text-[#E65100] truncate">
            <Shield className="w-4 h-4 flex-shrink-0" />
            <span>{t("superAdminPortal")}</span>
          </div>
        )}
      </div>

      {/* Right Side: Language Switcher, Notifications & User Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
        {/* Language Switcher Pill */}
        <div className="flex items-center bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px] p-0.5">
          <button
            onClick={() => setLanguage("en")}
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-[3px] text-xs font-semibold transition-colors ${
              language === "en"
                ? "bg-[#714B67] text-white"
                : "text-[#6C757D] hover:text-[#212529]"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage("hi")}
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-[3px] text-xs font-semibold transition-colors ${
              language === "hi"
                ? "bg-[#714B67] text-white"
                : "text-[#6C757D] hover:text-[#212529]"
            }`}
          >
            हिन्दी
          </button>
        </div>

        <button
          className="p-1.5 sm:p-2 rounded-[4px] text-[#6C757D] hover:text-[#212529] hover:bg-[#F8F9FA] relative flex-shrink-0"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#714B67] absolute top-1.5 right-1.5" />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2.5 py-1.5 rounded-[4px] hover:bg-[#F8F9FA] border border-transparent hover:border-[#DEE2E6] transition-colors text-sm"
          >
            <div className="w-7 h-7 rounded-[4px] bg-[#714B67] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
              {getInitials(user?.full_name || "User")}
            </div>
            <span className="font-semibold text-[#212529] hidden sm:inline max-w-[120px] truncate">
              {user?.full_name || "Account"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6C757D]" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-60 bg-white border border-[#DEE2E6] rounded-[4px] shadow-lg py-1.5 z-50 text-sm">
                <div className="px-3.5 py-2.5 border-b border-[#DEE2E6]">
                  <p className="font-bold text-[#212529]">{user?.full_name}</p>
                  <p className="text-[#6C757D] truncate text-xs">{user?.email}</p>
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-[3px] font-semibold bg-[#F1ECEF] text-[#714B67] border border-[#D9CAD5]">
                    {role?.replace("_", " ")}
                  </span>
                </div>

                <div className="p-1">
                  <Link
                    href={role === "super_admin" ? "/admin/settings" : "/client/settings"}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-[#212529] hover:bg-[#F8F9FA] rounded-[3px] transition-colors"
                  >
                    <Settings className="w-4 h-4 text-[#6C757D]" />
                    <span>{t("navSettings")}</span>
                  </Link>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[#C62828] hover:bg-[#FFEBEE] rounded-[3px] transition-colors text-left font-semibold mt-0.5"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t("signOut")}</span>
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
