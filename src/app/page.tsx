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
  ArrowUpRight,
} from "lucide-react";

export default function LandingPage() {
  const { quickLoginDemo } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col text-[#212529]">
      <DemoSwitcher />

      {/* Top Application Header */}
      <header className="h-14 bg-white border-b border-[#DEE2E6] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-none">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[4px] bg-[#714B67] flex items-center justify-center text-white font-bold text-sm">
            CS
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-lg tracking-tight text-[#212529]">
              {t("appTitle")}
            </span>
            <span className="text-xs text-[#6C757D] hidden sm:inline font-medium">
              Election Resource Planning (ERP)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="flex items-center bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px] p-0.5">
            <button
              onClick={() => setLanguage("en")}
              className={`px-2.5 py-1 rounded-[2px] text-xs font-bold transition-colors ${
                language === "en"
                  ? "bg-[#714B67] text-white"
                  : "text-[#6C757D] hover:text-[#212529]"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage("hi")}
              className={`px-2.5 py-1 rounded-[2px] text-xs font-bold transition-colors ${
                language === "hi"
                  ? "bg-[#714B67] text-white"
                  : "text-[#6C757D] hover:text-[#212529]"
              }`}
            >
              हिन्दी
            </button>
          </div>

          <Link href="/login">
            <Button variant="secondary" size="md">
              {t("signIn")}
            </Button>
          </Link>
          <Button
            size="md"
            variant="primary"
            onClick={() => quickLoginDemo("client_1")}
          >
            Launch System
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Hero Banner Sheet */}
        <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-8 sm:p-10 shadow-none">
          <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#212529] leading-tight">
              Election Management & Field Operations System
            </h1>
            <p className="text-base text-[#6C757D] leading-relaxed">
              Chunav Setu is an enterprise-grade ERP system built for candidate campaigns, party war rooms, and field volunteer cadres to organize voter registers, booth committee hierarchies, door-to-door telemetry, and polling day turnout.
            </p>
          </div>

          {/* Quick Access Workspace Tiles */}
          <div className="mt-8 pt-8 border-t border-[#DEE2E6] grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => quickLoginDemo("client_1")}
              className="p-5 bg-[#F8F9FA] hover:bg-[#F1ECEF] border border-[#DEE2E6] rounded-[4px] text-left transition-colors flex items-start justify-between group"
            >
              <div>
                <p className="text-sm font-bold text-[#714B67] flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Candidate HQ Portal
                </p>
                <p className="text-base font-bold text-[#212529] mt-1.5">Rajesh Sharma (Assembly)</p>
                <p className="text-[13px] text-[#6C757D] mt-1 font-medium">Voter registry, booths & task delegation</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-[#6C757D] group-hover:text-[#714B67]" />
            </button>

            <button
              onClick={() => quickLoginDemo("volunteer_1")}
              className="p-5 bg-[#F8F9FA] hover:bg-[#F1ECEF] border border-[#DEE2E6] rounded-[4px] text-left transition-colors flex items-start justify-between group"
            >
              <div>
                <p className="text-sm font-bold text-[#2E7D32] flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Volunteer Field App
                </p>
                <p className="text-base font-bold text-[#212529] mt-1.5">Amit Kumar (Booth 101)</p>
                <p className="text-[13px] text-[#6C757D] mt-1 font-medium">Door-to-door surveys & follow-ups</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-[#6C757D] group-hover:text-[#2E7D32]" />
            </button>

            <button
              onClick={() => quickLoginDemo("super_admin")}
              className="p-5 bg-[#F8F9FA] hover:bg-[#F1ECEF] border border-[#DEE2E6] rounded-[4px] text-left transition-colors flex items-start justify-between group"
            >
              <div>
                <p className="text-sm font-bold text-[#E65100] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Super Admin Console
                </p>
                <p className="text-base font-bold text-[#212529] mt-1.5">System Administration</p>
                <p className="text-[13px] text-[#6C757D] mt-1 font-medium">Tenant provisioning & audit logs</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-[#6C757D] group-hover:text-[#E65100]" />
            </button>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="space-y-4">
          <div className="border-b border-[#DEE2E6] pb-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#212529] uppercase tracking-wider">
              System Modules
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-5 shadow-none space-y-2.5">
              <div className="w-9 h-9 rounded-[4px] bg-[#F1ECEF] text-[#714B67] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#212529]">Elector Registry & CSV Importer</h3>
              <p className="text-[14px] text-[#6C757D] leading-relaxed">
                Filter by booth, ward, age, gender, and contact sentiments. Batch import thousands of voter records with automatic duplicate detection.
              </p>
            </div>

            <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-5 shadow-none space-y-2.5">
              <div className="w-9 h-9 rounded-[4px] bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#212529]">Booth Committee Management</h3>
              <p className="text-[14px] text-[#6C757D] leading-relaxed">
                Organize polling station committees, assign volunteer in-charges, and track coverage percentages per polling room.
              </p>
            </div>

            <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-5 shadow-none space-y-2.5">
              <div className="w-9 h-9 rounded-[4px] bg-[#FFF3E0] text-[#E65100] flex items-center justify-center">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#212529]">Task Dispatch & Follow-ups</h3>
              <p className="text-[14px] text-[#6C757D] leading-relaxed">
                Assign door-to-door priorities with due dates. Track scheduled callback requests and unresolved voter grievances.
              </p>
            </div>

            <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-5 shadow-none space-y-2.5">
              <div className="w-9 h-9 rounded-[4px] bg-[#F1ECEF] text-[#714B67] flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#212529]">Mobile Volunteer Canvassing</h3>
              <p className="text-[14px] text-[#6C757D] leading-relaxed">
                Fast responsive field interface for ground workers. One-tap voter sentiment logging with zero lag on low connectivity.
              </p>
            </div>

            <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-5 shadow-none space-y-2.5">
              <div className="w-9 h-9 rounded-[4px] bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#212529]">Statistical Analytics & CSV Export</h3>
              <p className="text-[14px] text-[#6C757D] leading-relaxed">
                Precise operational charts and summary data tables. Export filtered elector datasets and volunteer performance sheets.
              </p>
            </div>

            <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-5 shadow-none space-y-2.5">
              <div className="w-9 h-9 rounded-[4px] bg-[#FFF3E0] text-[#E65100] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#212529]">PostgreSQL Row-Level Security</h3>
              <p className="text-[14px] text-[#6C757D] leading-relaxed">
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
