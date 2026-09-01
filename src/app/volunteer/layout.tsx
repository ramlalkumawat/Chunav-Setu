"use client";

import React from "react";
import Link from "next/link";
import { MobileNav } from "@/components/layout/MobileNav";
import { useAuth } from "@/lib/context/auth-context";
import { LoadingSpinner } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import { getInitials } from "@/lib/utils";
import { LogOut, Smartphone, ShieldCheck } from "lucide-react";

export default function VolunteerLayout({ children }: { children: React.ReactNode }) {
  const { user, role, volunteer, client, isLoading, logout, quickLoginDemo } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F6F2]">
        <LoadingSpinner text="Connecting volunteer field app..." />
      </div>
    );
  }

  // Guard: allow volunteer (and super_admin for preview)
  if (!user || (role !== "volunteer" && role !== "super_admin")) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F7F6F2] text-center">
        <div className="w-16 h-16 rounded-full bg-[#EAEFF5] text-[#1F3A5F] flex items-center justify-center mb-4">
          <Smartphone className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#172033]">Volunteer Field Portal</h2>
        <p className="text-xs text-[#64748B] max-w-sm mt-1 mb-6">
          This mobile app is configured for field canvassers. Click below to enter as Volunteer (Amit Kumar).
        </p>
        <Button onClick={() => quickLoginDemo("volunteer_1")}>
          Switch to Volunteer (Amit Kumar)
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col pb-20 sm:pb-8">
      {/* Mobile Top Header */}
      <header className="h-14 bg-white border-b border-[#E5E2DC] px-4 flex items-center justify-between sticky top-0 z-30 shadow-subtle">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#1F3A5F] flex items-center justify-center text-white font-bold text-xs">
            CS
          </div>
          <div>
            <p className="font-bold text-xs text-[#172033] leading-none">
              {volunteer?.name || user?.full_name || "Volunteer"}
            </p>
            <p className="text-[10px] text-[#64748B] mt-0.5 truncate max-w-[170px]">
              {client?.candidate_name} • {volunteer?.assigned_booth_name || "Booth 101"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/volunteer/activity">
            <span className="text-[11px] font-semibold text-[#1F3A5F] px-2 py-1 bg-[#EAEFF5] rounded-md">
              My Logs
            </span>
          </Link>
          <button
            onClick={logout}
            className="p-1.5 rounded-md text-[#64748B] hover:text-[#B94A48] hover:bg-[#FDF2F2]"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-3.5 sm:p-6 max-w-2xl w-full mx-auto">
        {children}
      </main>

      {/* Sticky Mobile Bottom Bar */}
      <MobileNav />
    </div>
  );
}
