"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/auth-context";
import { getInitials } from "@/lib/utils";
import { LogOut, User, Menu, X, Shield, Building2, UserCheck } from "lucide-react";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, client, role, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-[#E5E2DC] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-[#F7F6F2]"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1F3A5F] flex items-center justify-center text-white font-black text-sm tracking-wider shadow-sm">
            CS
          </div>
          <div>
            <span className="font-bold text-base sm:text-lg text-[#172033] tracking-tight">
              CHUNAV SETU
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-[#EAEFF5] text-[#1F3A5F] border border-[#DCE6F1]">
              SaaS v1.0
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {/* Tenant Information Badge */}
        {client && role !== "super_admin" && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#F7F6F2] border border-[#E5E2DC] rounded-lg text-xs">
            <Building2 className="w-3.5 h-3.5 text-[#1F3A5F]" />
            <span className="text-[#64748B]">Campaign:</span>
            <span className="font-semibold text-[#172033] truncate max-w-[180px]">
              {client.candidate_name} ({client.campaign_name})
            </span>
          </div>
        )}

        {role === "super_admin" && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-[#FEF7EC] border border-[#FBE3B8] rounded-lg text-xs font-semibold text-[#B7791F]">
            <Shield className="w-3.5 h-3.5" />
            <span>Super Admin Mode (All Tenants)</span>
          </div>
        )}

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#F7F6F2] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#1F3A5F] text-white text-xs font-bold flex items-center justify-center">
              {getInitials(user?.full_name || "User")}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-[#172033] leading-tight">
                {user?.full_name || "Account"}
              </p>
              <p className="text-[11px] text-[#64748B] capitalize">
                {role?.replace("_", " ")}
              </p>
            </div>
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E5E2DC] rounded-lg shadow-modal py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2.5 border-b border-[#E5E2DC]">
                  <p className="font-semibold text-[#172033]">{user?.full_name}</p>
                  <p className="text-[#64748B] truncate">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider bg-[#EAEFF5] text-[#1F3A5F]">
                    {role?.replace("_", " ")}
                  </span>
                </div>

                <div className="p-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[#B94A48] hover:bg-[#FDF2F2] rounded-md transition-colors font-medium text-left"
                  >
                    <LogOut className="w-4 h-4" />
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
