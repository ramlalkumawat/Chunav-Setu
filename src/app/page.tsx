"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/auth-context";
import { Button } from "@/components/ui/Button";
import { DemoSwitcher } from "@/components/layout/DemoSwitcher";
import {
  ShieldCheck,
  Users,
  Building,
  CheckSquare,
  ArrowRight,
  Smartphone,
  BarChart3,
  CheckCircle2,
  Database,
  ArrowUpRight,
  UserCheck,
} from "lucide-react";

export default function LandingPage() {
  const { quickLoginDemo } = useAuth();

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col text-[#212529]">
      <DemoSwitcher />

      {/* Top Application Header */}
      <header className="h-12 bg-white border-b border-[#DEE2E6] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-none">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[3px] bg-[#714B67] flex items-center justify-center text-white font-bold text-xs">
            CS
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-sm tracking-tight text-[#212529]">
              Chunav Setu
            </span>
            <span className="text-[11px] text-[#6C757D] hidden sm:inline">
              Election Resource Planning (ERP)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="secondary" size="sm">
              Sign In
            </Button>
          </Link>
          <Button
            size="sm"
            variant="primary"
            onClick={() => quickLoginDemo("client_1")}
          >
            Launch System
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Hero Banner Sheet */}
        <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-6 sm:p-8 shadow-none">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#F1ECEF] border border-[#D9CAD5] text-[11px] font-semibold text-[#714B67]">
              <Database className="w-3 h-3" />
              <span>Multi-Tenant PostgreSQL Architecture • RLS Isolated</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#212529]">
              Election Management & Field Operations System
            </h1>
            <p className="text-xs sm:text-sm text-[#6C757D] leading-relaxed">
              Chunav Setu is an enterprise-grade ERP system built for candidate campaigns, party war rooms, and field volunteer cadres to organize voter registers, booth committee hierarchies, door-to-door telemetry, and polling day turnout.
            </p>
          </div>

          {/* Quick Access Workspace Tiles */}
          <div className="mt-6 pt-6 border-t border-[#DEE2E6] grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => quickLoginDemo("client_1")}
              className="p-3.5 bg-[#F8F9FA] hover:bg-[#F1ECEF] border border-[#DEE2E6] rounded-[3px] text-left transition-colors flex items-start justify-between group"
            >
              <div>
                <p className="text-xs font-semibold text-[#714B67] flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  Candidate HQ Portal
                </p>
                <p className="text-xs font-medium text-[#212529] mt-1">Rajesh Sharma (Assembly)</p>
                <p className="text-[11px] text-[#6C757D] mt-0.5">Voter registry, booths & task delegation</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#6C757D] group-hover:text-[#714B67]" />
            </button>

            <button
              onClick={() => quickLoginDemo("volunteer_1")}
              className="p-3.5 bg-[#F8F9FA] hover:bg-[#F1ECEF] border border-[#DEE2E6] rounded-[3px] text-left transition-colors flex items-start justify-between group"
            >
              <div>
                <p className="text-xs font-semibold text-[#2E7D32] flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  Volunteer Field App
                </p>
                <p className="text-xs font-medium text-[#212529] mt-1">Amit Kumar (Booth 101)</p>
                <p className="text-[11px] text-[#6C757D] mt-0.5">Door-to-door surveys & follow-ups</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#6C757D] group-hover:text-[#2E7D32]" />
            </button>

            <button
              onClick={() => quickLoginDemo("super_admin")}
              className="p-3.5 bg-[#F8F9FA] hover:bg-[#F1ECEF] border border-[#DEE2E6] rounded-[3px] text-left transition-colors flex items-start justify-between group"
            >
              <div>
                <p className="text-xs font-semibold text-[#E65100] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Super Admin Console
                </p>
                <p className="text-xs font-medium text-[#212529] mt-1">System Administration</p>
                <p className="text-[11px] text-[#6C757D] mt-0.5">Tenant provisioning & audit logs</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#6C757D] group-hover:text-[#E65100]" />
            </button>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="space-y-3">
          <div className="border-b border-[#DEE2E6] pb-2">
            <h2 className="text-sm font-semibold text-[#212529] uppercase tracking-wider">
              System Modules
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-4 shadow-none space-y-2">
              <div className="w-7 h-7 rounded-[3px] bg-[#F1ECEF] text-[#714B67] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-[#212529]">Elector Registry & CSV Importer</h3>
              <p className="text-[11px] text-[#6C757D] leading-relaxed">
                Filter by booth, ward, age, gender, and contact sentiments. Batch import thousands of voter records with automatic duplicate detection.
              </p>
            </div>

            <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-4 shadow-none space-y-2">
              <div className="w-7 h-7 rounded-[3px] bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
                <Building className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-[#212529]">Booth Committee Management</h3>
              <p className="text-[11px] text-[#6C757D] leading-relaxed">
                Organize polling station committees, assign volunteer in-charges, and track coverage percentages per polling room.
              </p>
            </div>

            <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-4 shadow-none space-y-2">
              <div className="w-7 h-7 rounded-[3px] bg-[#FFF3E0] text-[#E65100] flex items-center justify-center">
                <CheckSquare className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-[#212529]">Task Dispatch & Follow-ups</h3>
              <p className="text-[11px] text-[#6C757D] leading-relaxed">
                Assign door-to-door priorities with due dates. Track scheduled callback requests and unresolved voter grievances.
              </p>
            </div>

            <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-4 shadow-none space-y-2">
              <div className="w-7 h-7 rounded-[3px] bg-[#F1ECEF] text-[#714B67] flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-[#212529]">Mobile Volunteer Canvassing</h3>
              <p className="text-[11px] text-[#6C757D] leading-relaxed">
                Fast responsive field interface for ground workers. One-tap voter sentiment logging with zero lag on low connectivity.
              </p>
            </div>

            <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-4 shadow-none space-y-2">
              <div className="w-7 h-7 rounded-[3px] bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-[#212529]">Statistical Analytics & CSV Export</h3>
              <p className="text-[11px] text-[#6C757D] leading-relaxed">
                Precise operational charts and summary data tables. Export filtered elector datasets and volunteer performance sheets.
              </p>
            </div>

            <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-4 shadow-none space-y-2">
              <div className="w-7 h-7 rounded-[3px] bg-[#FFF3E0] text-[#E65100] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-[#212529]">PostgreSQL Row-Level Security</h3>
              <p className="text-[11px] text-[#6C757D] leading-relaxed">
                Complete tenant database partitioning. Candidate records are completely isolated and inaccessible by other campaigns.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-[#DEE2E6] py-4 px-4 sm:px-6 text-xs text-[#6C757D]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#212529]">Chunav Setu ERP</span>
            <span>•</span>
            <span>Election Resource Planning</span>
          </div>
          <p>© 2026 Chunav Setu. Multi-Tenant Protected.</p>
        </div>
      </footer>
    </div>
  );
}
