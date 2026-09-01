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
  Globe,
} from "lucide-react";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, client, role, logout } = useAuth();
  const { language, setLanguage, toggleLanguage, t } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-[#DEE2E6] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-none transition-colors">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-[4px] text-[#6C757D] hover:text-[#212529] hover:bg-[#F8F9FA]"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[4px] bg-[#714B67] flex items-center justify-center text-white font-bold text-sm shadow-none">
            CS
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base text-[#212529] tracking-tight leading-none">
              {t("appName")}
            </span>
            <span className="text-[12px] text-[#6C757D] font-medium hidden sm:inline leading-none mt-1">
              ERP
            </span>
          </div>
        </Link>
      </div>

      {/* Center: Active Context / Campaign Info */}
      <div className="hidden md:flex items-center gap-2.5">
        {client && role !== "super_admin" && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px] text-sm">
            <Building className="w-4 h-4 text-[#714B67]" />
            <span className="text-[#6C757D] font-medium">{t("candidate")}:</span>
            <span className="font-semibold text-[#212529] truncate max-w-[280px]">
              {client.candidate_name} ({client.campaign_name})
            </span>
          </div>
        )}

        {role === "super_admin" && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FFF3E0] border border-[#FFE0B2] rounded-[4px] text-sm font-semibold text-[#E65100]">
            <Shield className="w-4 h-4" />
            <span>{t("superAdminPortal")}</span>
          </div>
        )}
      </div>

      {/* Right Side: Language Switcher, Notifications & User Profile */}
      <div className="flex items-center gap-2.5">
        {/* Language Switcher Pill */}
        <div className="flex items-center bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px] p-0.5">
          <button
            onClick={() => setLanguage("en")}
            className={`px-2.5 py-1 rounded-[3px] text-xs font-semibold transition-colors ${
              language === "en"
                ? "bg-[#714B67] text-white"
                : "text-[#6C757D] hover:text-[#212529]"
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage("hi")}
            className={`px-2.5 py-1 rounded-[3px] text-xs font-semibold transition-colors ${
              language === "hi"
                ? "bg-[#714B67] text-white"
                : "text-[#6C757D] hover:text-[#212529]"
            }`}
          >
            हिन्दी
          </button>
        </div>

        <button
          className="p-2 rounded-[4px] text-[#6C757D] hover:text-[#212529] hover:bg-[#F8F9FA] relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#714B67] absolute top-1.5 right-1.5" />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] hover:bg-[#F8F9FA] border border-transparent hover:border-[#DEE2E6] transition-colors text-sm"
          >
            <div className="w-7 h-7 rounded-[4px] bg-[#714B67] text-white text-xs font-bold flex items-center justify-center">
              {getInitials(user?.full_name || "User")}
            </div>
            <span className="font-semibold text-[#212529] hidden sm:inline">
              {user?.full_name || "Account"}
            </span>
            <ChevronDown className="w-4 h-4 text-[#6C757D]" />
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
