"use client";

import React from "react";
import Link from "next/link";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";
import { DemoSwitcher } from "@/components/layout/DemoSwitcher";
import { useAuth } from "@/lib/context/auth-context";
import { useLanguage } from "@/lib/i18n";
import { LoadingSpinner } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import { LogOut, Smartphone } from "lucide-react";

export default function VolunteerLayout({ children }: { children: React.ReactNode }) {
  const { user, role, volunteer, client, isLoading, logout, quickLoginDemo } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const isHindi = language === "hi";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7] w-full">
        <LoadingSpinner text="Connecting volunteer field app..." />
      </div>
    );
  }

  // Guard: allow volunteer (and super_admin for preview)
  if (!user || (role !== "volunteer" && role !== "super_admin")) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#F7F7F7] text-center w-full max-w-full">
        <div className="w-14 h-14 rounded-[4px] bg-[#F1ECEF] border border-[#D9CAD5] text-[#714B67] flex items-center justify-center mb-3.5">
          <Smartphone className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-[#212529]">{t("volunteerPortal")}</h2>
        <p className="text-sm text-[#6C757D] max-w-md mt-1 mb-5">
          This mobile app is configured for ground workers. Click below to enter as Volunteer (Amit Kumar).
        </p>
        <Button size="md" variant="primary" onClick={() => quickLoginDemo("volunteer_1")}>
          Switch to Volunteer (Amit Kumar)
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col pb-20 sm:pb-0 w-full max-w-full overflow-x-hidden">
      <DemoSwitcher />

      {/* Mobile Top Header */}
      <header className="min-h-14 bg-white border-b border-[#DEE2E6] px-3 sm:px-6 py-2 flex items-center justify-between sticky top-0 z-30 shadow-none gap-2 w-full max-w-full">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-[4px] bg-[#714B67] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            CS
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-sm text-[#212529] leading-none truncate">
              {volunteer?.name || user?.full_name || "Volunteer"}
            </p>
            <p className="text-[11px] sm:text-[12px] text-[#6C757D] mt-1 truncate font-medium">
              {client?.candidate_name} • {volunteer?.assigned_booth_name || "Booth 101"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Language Switcher */}
          <div className="flex items-center bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px] p-0.5">
            <button
              onClick={() => setLanguage("en")}
              className={`px-2 py-0.5 rounded-[2px] text-[11px] font-semibold transition-colors ${
                language === "en"
                  ? "bg-[#714B67] text-white"
                  : "text-[#6C757D]"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("hi")}
              className={`px-2 py-0.5 rounded-[2px] text-[11px] font-semibold transition-colors ${
                language === "hi"
                  ? "bg-[#714B67] text-white"
                  : "text-[#6C757D]"
              }`}
            >
              हिन्दी
            </button>
          </div>

          <Link href="/volunteer/communication" className="flex-shrink-0">
            <span className="text-xs sm:text-[13px] font-semibold text-[#714B67] px-2 sm:px-2.5 py-1 bg-[#F1ECEF] border border-[#D9CAD5] rounded-[3px] whitespace-nowrap">
              {isHindi ? "संचार" : "Comm"}
            </span>
          </Link>
          <Link href="/volunteer/activity" className="flex-shrink-0">
            <span className="text-xs sm:text-[13px] font-semibold text-[#495057] px-2 sm:px-2.5 py-1 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[3px] whitespace-nowrap">
              {t("navActivity")}
            </span>
          </Link>
          <button
            onClick={logout}
            className="p-1.5 rounded-[3px] text-[#6C757D] hover:text-[#C62828] hover:bg-[#FFEBEE] flex-shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-3.5 sm:p-6 max-w-2xl w-full mx-auto min-w-0">
        {children}
      </main>

      {/* Footer on volunteer screens */}
      <Footer />

      {/* Sticky Mobile Bottom Bar */}
      <MobileNav />
    </div>
  );
}
