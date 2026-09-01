"use client";

import React from "react";
import Link from "next/link";
import { MobileNav } from "@/components/layout/MobileNav";
import { DemoSwitcher } from "@/components/layout/DemoSwitcher";
import { useAuth } from "@/lib/context/auth-context";
import { LoadingSpinner } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import { LogOut, Smartphone } from "lucide-react";

export default function VolunteerLayout({ children }: { children: React.ReactNode }) {
  const { user, role, volunteer, client, isLoading, logout, quickLoginDemo } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7]">
        <LoadingSpinner text="Connecting volunteer field app..." />
      </div>
    );
  }

  // Guard: allow volunteer (and super_admin for preview)
  if (!user || (role !== "volunteer" && role !== "super_admin")) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F7F7F7] text-center">
        <div className="w-12 h-12 rounded-[4px] bg-[#F1ECEF] border border-[#D9CAD5] text-[#714B67] flex items-center justify-center mb-3">
          <Smartphone className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-[#212529]">Volunteer Field App</h2>
        <p className="text-xs text-[#6C757D] max-w-sm mt-1 mb-4">
          This mobile app is configured for ground workers. Click below to enter as Volunteer (Amit Kumar).
        </p>
        <Button size="sm" variant="primary" onClick={() => quickLoginDemo("volunteer_1")}>
          Switch to Volunteer (Amit Kumar)
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col pb-20 sm:pb-8">
      <DemoSwitcher />
      {/* Mobile Top Header */}
      <header className="h-12 bg-white border-b border-[#DEE2E6] px-3.5 flex items-center justify-between sticky top-0 z-30 shadow-none">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[3px] bg-[#714B67] flex items-center justify-center text-white font-bold text-xs">
            CS
          </div>
          <div>
            <p className="font-bold text-xs text-[#212529] leading-none">
              {volunteer?.name || user?.full_name || "Volunteer"}
            </p>
            <p className="text-[10px] text-[#6C757D] mt-0.5 truncate max-w-[170px]">
              {client?.candidate_name} • {volunteer?.assigned_booth_name || "Booth 101"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Link href="/volunteer/activity">
            <span className="text-[11px] font-medium text-[#714B67] px-2 py-0.5 bg-[#F1ECEF] border border-[#D9CAD5] rounded-[3px]">
              My Logs
            </span>
          </Link>
          <button
            onClick={logout}
            className="p-1 rounded-[3px] text-[#6C757D] hover:text-[#C62828] hover:bg-[#FFEBEE]"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-5 max-w-2xl w-full mx-auto">
        {children}
      </main>

      {/* Sticky Mobile Bottom Bar */}
      <MobileNav />
    </div>
  );
}
