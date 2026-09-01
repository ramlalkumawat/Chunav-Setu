"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/auth-context";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/layout/Footer";
import { DemoSwitcher } from "@/components/layout/DemoSwitcher";
import {
  ShieldCheck,
  Users,
  Building,
  CheckSquare,
  Smartphone,
  BarChart3,
  Database,
  ArrowUpRight,
} from "lucide-react";

export default function LandingPage() {
  const { quickLoginDemo } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col text-[#212529] w-full max-w-full overflow-x-hidden">
      <DemoSwitcher />

      {/* Top Application Header */}
      <header className="min-h-14 bg-white border-b border-[#DEE2E6] px-3 sm:px-6 md:px-8 py-2 sm:py-0 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sticky top-0 z-30 shadow-none">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="w-8 h-8 rounded-[4px] bg-[#714B67] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            CS
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="font-bold text-base sm:text-lg tracking-tight text-[#212529] whitespace-nowrap">
              {t("appTitle")}
            </span>
            <span className="text-xs text-[#6C757D] hidden md:inline font-medium whitespace-nowrap">
              Election Resource Planning (ERP)
            </span>
          </div>
        </div>

        {/* Header Actions: Language Switcher, Sign In, Launch System */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Language Switcher */}
          <div className="flex items-center bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px] p-0.5 flex-shrink-0">
            <button
              onClick={() => setLanguage("en")}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-[2px] text-xs font-bold transition-colors ${
                language === "en"
                  ? "bg-[#714B67] text-white"
                  : "text-[#6C757D] hover:text-[#212529]"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("hi")}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-[2px] text-xs font-bold transition-colors ${
                language === "hi"
                  ? "bg-[#714B67] text-white"
                  : "text-[#6C757D] hover:text-[#212529]"
              }`}
            >
              हिन्दी
            </button>
          </div>

          <Link href="/login" className="flex-shrink-0">
            <Button variant="secondary" size="sm" className="h-9 px-2.5 sm:px-3 text-xs sm:text-sm">
              {t("signIn")}
            </Button>
          </Link>

          <Button
            size="sm"
            variant="primary"
            className="h-9 px-2.5 sm:px-3.5 text-xs sm:text-sm font-semibold flex-shrink-0"
            onClick={() => quickLoginDemo("client_1")}
          >
            Launch System
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8 min-w-0">
        {/* Hero Banner Sheet */}
        <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-4 sm:p-8 md:p-10 shadow-none w-full max-w-full">
          <div className="max-w-3xl space-y-3 sm:space-y-4">
            {/* Architecture Badge */}
            <div className="inline-flex max-w-full flex-wrap items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-[#F1ECEF] border border-[#D9CAD5] text-xs font-bold text-[#714B67] break-words">
              <Database className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Multi-Tenant PostgreSQL Architecture • RLS Isolated</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#212529] leading-tight break-words">
              Election Management & Field Operations System
            </h1>
            <p className="text-sm sm:text-base text-[#6C757D] leading-relaxed break-words">
              Chunav Setu is an enterprise-grade ERP system built for candidate campaigns, party war rooms, and field volunteer cadres to organize voter registers, booth committee hierarchies, door-to-door telemetry, and polling day turnout.
            </p>
          </div>

          {/* Quick Access Workspace Tiles */}
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-[#DEE2E6] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <button
              onClick={() => quickLoginDemo("client_1")}
              className="p-4 sm:p-5 bg-[#F8F9FA] hover:bg-[#F1ECEF] border border-[#DEE2E6] rounded-[4px] text-left transition-colors flex items-start justify-between gap-2 group w-full min-w-0"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#714B67] flex items-center gap-2 truncate">
                  <Building className="w-4 h-4 flex-shrink-0" />
                  <span>Candidate HQ Portal</span>
                </p>
                <p className="text-sm sm:text-base font-bold text-[#212529] mt-1.5 truncate">
                  Rajesh Sharma (Assembly)
                </p>
                <p className="text-xs sm:text-[13px] text-[#6C757D] mt-1 font-medium leading-normal">
                  Voter registry, booths & task delegation
                </p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-[#6C757D] group-hover:text-[#714B67] flex-shrink-0 mt-0.5" />
            </button>

            <button
              onClick={() => quickLoginDemo("volunteer_1")}
              className="p-4 sm:p-5 bg-[#F8F9FA] hover:bg-[#F1ECEF] border border-[#DEE2E6] rounded-[4px] text-left transition-colors flex items-start justify-between gap-2 group w-full min-w-0"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#2E7D32] flex items-center gap-2 truncate">
                  <Smartphone className="w-4 h-4 flex-shrink-0" />
                  <span>Volunteer Field App</span>
                </p>
                <p className="text-sm sm:text-base font-bold text-[#212529] mt-1.5 truncate">
                  Amit Kumar (Booth 101)
                </p>
                <p className="text-xs sm:text-[13px] text-[#6C757D] mt-1 font-medium leading-normal">
                  Door-to-door surveys & follow-ups
                </p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-[#6C757D] group-hover:text-[#2E7D32] flex-shrink-0 mt-0.5" />
            </button>

            <button
              onClick={() => quickLoginDemo("super_admin")}
              className="p-4 sm:p-5 bg-[#F8F9FA] hover:bg-[#F1ECEF] border border-[#DEE2E6] rounded-[4px] text-left transition-colors flex items-start justify-between gap-2 group w-full min-w-0 sm:col-span-2 lg:col-span-1"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#E65100] flex items-center gap-2 truncate">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  <span>Super Admin Console</span>
                </p>
                <p className="text-sm sm:text-base font-bold text-[#212529] mt-1.5 truncate">
                  System Administration
                </p>
                <p className="text-xs sm:text-[13px] text-[#6C757D] mt-1 font-medium leading-normal">
                  Tenant provisioning & audit logs
                </p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-[#6C757D] group-hover:text-[#E65100] flex-shrink-0 mt-0.5" />
            </button>
          </div>
        </div>

        {/* System Modules Grid */}
        <div className="space-y-3 sm:space-y-4 w-full">
          <div className="border-b border-[#DEE2E6] pb-2 sm:pb-3">
            <h2 className="text-base sm:text-xl font-bold text-[#212529] uppercase tracking-wider">
              System Modules
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 w-full">
            <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-4 sm:p-5 shadow-none space-y-2 w-full min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[4px] bg-[#F1ECEF] text-[#714B67] flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#212529] break-words">
                Elector Registry & CSV Importer
              </h3>
              <p className="text-xs sm:text-sm text-[#6C757D] leading-relaxed break-words">
                Filter by booth, ward, age, gender, and contact sentiments. Batch import thousands of voter records with automatic duplicate detection.
              </p>
            </div>

            <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-4 sm:p-5 shadow-none space-y-2 w-full min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[4px] bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center flex-shrink-0">
                <Building className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#212529] break-words">
                Booth Committee Management
              </h3>
              <p className="text-xs sm:text-sm text-[#6C757D] leading-relaxed break-words">
                Organize polling station committees, assign volunteer in-charges, and track coverage percentages per polling room.
              </p>
            </div>

            <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-4 sm:p-5 shadow-none space-y-2 w-full min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[4px] bg-[#FFF3E0] text-[#E65100] flex items-center justify-center flex-shrink-0">
                <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#212529] break-words">
                Task Dispatch & Follow-ups
              </h3>
              <p className="text-xs sm:text-sm text-[#6C757D] leading-relaxed break-words">
                Assign door-to-door priorities with due dates. Track scheduled callback requests and unresolved voter grievances.
              </p>
            </div>

            <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-4 sm:p-5 shadow-none space-y-2 w-full min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[4px] bg-[#F1ECEF] text-[#714B67] flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#212529] break-words">
                Mobile Volunteer Canvassing
              </h3>
              <p className="text-xs sm:text-sm text-[#6C757D] leading-relaxed break-words">
                Fast responsive field interface for ground workers. One-tap voter sentiment logging with zero lag on low connectivity.
              </p>
            </div>

            <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-4 sm:p-5 shadow-none space-y-2 w-full min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[4px] bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#212529] break-words">
                Statistical Analytics & CSV Export
              </h3>
              <p className="text-xs sm:text-sm text-[#6C757D] leading-relaxed break-words">
                Precise operational charts and summary data tables. Export filtered elector datasets and volunteer performance sheets.
              </p>
            </div>

            <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-4 sm:p-5 shadow-none space-y-2 w-full min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[4px] bg-[#FFF3E0] text-[#E65100] flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#212529] break-words">
                PostgreSQL Row-Level Security
              </h3>
              <p className="text-xs sm:text-sm text-[#6C757D] leading-relaxed break-words">
                Complete tenant database partitioning. Candidate records are completely isolated and inaccessible by other campaigns.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Professional Contact Footer */}
      <Footer />
    </div>
  );
}
