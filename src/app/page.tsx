"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/auth-context";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  ShieldCheck,
  Users,
  Building2,
  CheckSquare,
  Compass,
  ArrowRight,
  Database,
  Lock,
  Smartphone,
  BarChart3,
  CheckCircle2,
  Sparkles,
  Layers,
} from "lucide-react";

export default function LandingPage() {
  const { quickLoginDemo } = useAuth();

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
      {/* Top Navigation */}
      <header className="h-16 bg-white/90 backdrop-blur-sm border-b border-[#E5E2DC] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1F3A5F] flex items-center justify-center text-white font-black text-sm">
            CS
          </div>
          <span className="font-bold text-base sm:text-lg text-[#172033] tracking-tight">
            CHUNAV SETU
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs font-medium text-[#64748B]">
          <a href="#features" className="hover:text-[#172033] transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-[#172033] transition-colors">How It Works</a>
          <a href="#candidates" className="hover:text-[#172033] transition-colors">For Candidates</a>
          <a href="#volunteers" className="hover:text-[#172033] transition-colors">For Volunteers</a>
          <a href="#security" className="hover:text-[#172033] transition-colors">Security</a>
          <a href="#pricing" className="hover:text-[#172033] transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="outline" size="sm">
              Log In
            </Button>
          </Link>
          <button
            onClick={() => quickLoginDemo("client_1")}
            className="hidden sm:inline-flex items-center justify-center font-medium text-xs px-3.5 py-1.5 rounded-[8px] bg-[#1F3A5F] hover:bg-[#172E4C] text-white transition-all shadow-sm"
          >
            Launch Demo App
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EAEFF5] border border-[#DCE6F1] text-xs font-semibold text-[#1F3A5F] mb-6">
          <ShieldCheck className="w-4 h-4 text-[#1F3A5F]" />
          <span>Strict Multi-Tenant Campaign Architecture</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#172033] tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Election Campaign Management,{" "}
          <span className="text-[#1F3A5F] underline decoration-[#1F3A5F]/20 underline-offset-8">
            Simplified.
          </span>
        </h1>

        <p className="mt-6 text-sm sm:text-base lg:text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed">
          Chunav Setu is a high-performance SaaS platform enabling candidates to systematically manage voters, booths, volunteer task forces, door-to-door field surveys, and live electoral analytics from one secure dashboard.
        </p>

        {/* Quick Launch Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => quickLoginDemo("client_1")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] bg-[#1F3A5F] hover:bg-[#172E4C] text-white font-medium text-sm shadow-sm transition-all"
          >
            <span>Open Candidate Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => quickLoginDemo("volunteer_1")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] bg-white border border-[#E5E2DC] hover:bg-[#F7F6F2] text-[#172033] font-medium text-sm transition-all"
          >
            <Smartphone className="w-4 h-4 text-[#1F3A5F]" />
            <span>Open Volunteer Field App</span>
          </button>

          <button
            onClick={() => quickLoginDemo("super_admin")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] bg-[#FEF7EC] border border-[#FBE3B8] hover:bg-[#FDF2D9] text-[#B7791F] font-medium text-sm transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Super Admin Portal</span>
          </button>
        </div>

        {/* Hero Preview Card */}
        <div className="mt-14 max-w-5xl mx-auto bg-white border border-[#E5E2DC] rounded-xl shadow-modal overflow-hidden text-left">
          <div className="bg-[#172033] text-white px-4 py-3 flex items-center justify-between border-b border-[#2A3B53]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#B94A48]" />
              <div className="w-3 h-3 rounded-full bg-[#B7791F]" />
              <div className="w-3 h-3 rounded-full bg-[#2F6B4F]" />
              <span className="text-xs text-slate-300 ml-2 font-mono">
                chunavsetu.app/client • Rajesh Sharma (Central Assembly)
              </span>
            </div>
            <Badge variant="success" size="sm">Active Campaign</Badge>
          </div>

          <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#FAFAF8] border-b border-[#E5E2DC]">
            <div className="p-3 bg-white border border-[#E5E2DC] rounded-lg">
              <p className="text-[11px] text-[#64748B] font-medium">TOTAL VOTERS</p>
              <p className="text-xl font-bold text-[#172033] mt-1">125,000</p>
            </div>
            <div className="p-3 bg-white border border-[#E5E2DC] rounded-lg">
              <p className="text-[11px] text-[#64748B] font-medium">BOOTHS COVERED</p>
              <p className="text-xl font-bold text-[#2F6B4F] mt-1">112 / 120</p>
            </div>
            <div className="p-3 bg-white border border-[#E5E2DC] rounded-lg">
              <p className="text-[11px] text-[#64748B] font-medium">ACTIVE VOLUNTEERS</p>
              <p className="text-xl font-bold text-[#1F3A5F] mt-1">84 Ground Staff</p>
            </div>
            <div className="p-3 bg-white border border-[#E5E2DC] rounded-lg">
              <p className="text-[11px] text-[#64748B] font-medium">CONTACTED RATE</p>
              <p className="text-xl font-bold text-[#172033] mt-1">68.4% Done</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 bg-white border-y border-[#E5E2DC] px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-semibold text-[#1F3A5F] uppercase tracking-wider">Features</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#172033] mt-2">
              Engineered for Modern Campaign Operations
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-2">
              Everything campaign managers and field teams need without unnecessary bloated menus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card padding="md" className="hover:border-[#1F3A5F]/50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#EAEFF5] text-[#1F3A5F] flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#172033]">Voter Database & CSV Engine</h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                Filter by booth, ward, age, gender, and contact sentiments. Batch import thousands of voter records with automatic duplicate and header validation.
              </p>
            </Card>

            <Card padding="md" className="hover:border-[#1F3A5F]/50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#EAF3EE] text-[#2F6B4F] flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#172033]">Booth & Area Mobilization</h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                Micro-manage polling stations. Assign volunteers to specific rooms and wards, tracking turnout projections and door coverage percentages in real time.
              </p>
            </Card>

            <Card padding="md" className="hover:border-[#1F3A5F]/50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#FEF7EC] text-[#B7791F] flex items-center justify-center mb-4">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#172033]">Touch-First Volunteer App</h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                Lightning fast mobile interface for on-the-ground canvassing. Volunteers log contact statuses, issue follow-up schedules, and resolve tasks with zero lag.
              </p>
            </Card>

            <Card padding="md" className="hover:border-[#1F3A5F]/50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#EAEFF5] text-[#1F3A5F] flex items-center justify-center mb-4">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#172033]">Task & Follow-up Workflow</h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                Assign tasks with priority flags and deadlines. Never lose track of an undecided voter with scheduled callback reminders and action notes.
              </p>
            </Card>

            <Card padding="md" className="hover:border-[#1F3A5F]/50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#FDF2F2] text-[#B94A48] flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#172033]">Real-Time Visual Reports</h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                Lightweight charts showing booth performance, volunteer activity leaderboards, sentiment breakdown, and instant CSV report exports.
              </p>
            </Card>

            <Card padding="md" className="hover:border-[#1F3A5F]/50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#EAEFF5] text-[#1F3A5F] flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#172033]">Strict Multi-Tenant Isolation</h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                PostgreSQL Row Level Security ensures Candidate A can never see or query Candidate B's data under any condition. Total privacy guaranteed.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-semibold text-[#1F3A5F] uppercase tracking-wider">Hierarchy & Flow</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#172033] mt-2">
            Structured Election Operations
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-[#E5E2DC] rounded-lg">
            <span className="w-7 h-7 rounded-full bg-[#1F3A5F] text-white text-xs font-bold flex items-center justify-center mb-3">
              1
            </span>
            <h4 className="text-sm font-bold text-[#172033]">1. Provision Client</h4>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              Super Admin creates Candidate campaign profile, sets quota limits, and assigns constituency details.
            </p>
          </div>

          <div className="p-5 bg-white border border-[#E5E2DC] rounded-lg">
            <span className="w-7 h-7 rounded-full bg-[#1F3A5F] text-white text-xs font-bold flex items-center justify-center mb-3">
              2
            </span>
            <h4 className="text-sm font-bold text-[#172033]">2. Upload & Map Booths</h4>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              Import voter lists from CSV, structure polling booths, and organize wards/areas.
            </p>
          </div>

          <div className="p-5 bg-white border border-[#E5E2DC] rounded-lg">
            <span className="w-7 h-7 rounded-full bg-[#1F3A5F] text-white text-xs font-bold flex items-center justify-center mb-3">
              3
            </span>
            <h4 className="text-sm font-bold text-[#172033]">3. Mobilize Field Team</h4>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              Add volunteers, assign them to booths, and dispatch door-to-door surveying tasks.
            </p>
          </div>

          <div className="p-5 bg-white border border-[#E5E2DC] rounded-lg">
            <span className="w-7 h-7 rounded-full bg-[#1F3A5F] text-white text-xs font-bold flex items-center justify-center mb-3">
              4
            </span>
            <h4 className="text-sm font-bold text-[#172033]">4. Track & Turnout</h4>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              Monitor live survey logs, close pending follow-ups, and ensure maximum voter turnout on polling day.
            </p>
          </div>
        </div>
      </section>

      {/* Security & RLS Section */}
      <section id="security" className="py-16 bg-[#172033] text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-12 h-12 rounded-full bg-white/10 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <Database className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Security & Tenant Isolation First
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-3 max-w-xl mx-auto leading-relaxed">
            In elections, confidentiality is paramount. Chunav Setu implements PostgreSQL Row Level Security (RLS) policies at the database kernel level, strictly separating every tenant's data.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-2" />
              <p className="text-xs font-bold text-white">Database Row Isolation</p>
              <p className="text-[11px] text-slate-300 mt-1">
                Every query is evaluated against authenticated <code className="text-amber-300">client_id</code>.
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-2" />
              <p className="text-xs font-bold text-white">Volunteer Boundary</p>
              <p className="text-[11px] text-slate-300 mt-1">
                Volunteers can only access assigned voters, protecting overall list privacy.
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-2" />
              <p className="text-xs font-bold text-white">Tamper-Proof Audit Trail</p>
              <p className="text-[11px] text-slate-300 mt-1">
                All critical operations, imports, and assignments are logged for compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Placeholder */}
      <section id="pricing" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-semibold text-[#1F3A5F] uppercase tracking-wider">Pricing Plans</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#172033] mt-2">
            Transparent Tiers for Every Election Level
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card padding="lg" className="flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase">Ward / Municipal</p>
              <p className="text-2xl font-black text-[#172033] mt-2">₹14,999</p>
              <p className="text-xs text-[#64748B] mt-1">Per campaign season</p>
              <ul className="mt-6 space-y-2.5 text-xs text-[#172033]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2F6B4F]" />
                  <span>Up to 25,000 Voters</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2F6B4F]" />
                  <span>Up to 20 Volunteers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2F6B4F]" />
                  <span>Door-to-door Mobile App</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2F6B4F]" />
                  <span>CSV Import & Export</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => quickLoginDemo("client_2")}
              className="mt-8 w-full py-2 bg-white border border-[#E5E2DC] hover:bg-[#F7F6F2] text-xs font-semibold text-[#172033] rounded-[8px]"
            >
              Test Municipal Demo
            </button>
          </Card>

          <Card padding="lg" className="border-2 border-[#1F3A5F] shadow-lg flex flex-col justify-between relative">
            <div className="absolute -top-3 right-6 bg-[#1F3A5F] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              Most Popular
            </div>
            <div>
              <p className="text-xs font-bold text-[#1F3A5F] uppercase">Vidhan Sabha (Assembly)</p>
              <p className="text-2xl font-black text-[#172033] mt-2">₹49,999</p>
              <p className="text-xs text-[#64748B] mt-1">Per campaign season</p>
              <ul className="mt-6 space-y-2.5 text-xs text-[#172033]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2F6B4F]" />
                  <span>Up to 150,000 Voters</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2F6B4F]" />
                  <span>Up to 100 Volunteers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2F6B4F]" />
                  <span>Booth Committee Management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2F6B4F]" />
                  <span>Live Analytics & Recharts</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => quickLoginDemo("client_1")}
              className="mt-8 w-full py-2 bg-[#1F3A5F] hover:bg-[#172E4C] text-xs font-semibold text-white rounded-[8px]"
            >
              Test Assembly Demo
            </button>
          </Card>

          <Card padding="lg" className="flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase">Lok Sabha (Parliament)</p>
              <p className="text-2xl font-black text-[#172033] mt-2">₹1,49,999</p>
              <p className="text-xs text-[#64748B] mt-1">Full constituency license</p>
              <ul className="mt-6 space-y-2.5 text-xs text-[#172033]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2F6B4F]" />
                  <span>Up to 500,000 Voters</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2F6B4F]" />
                  <span>Up to 500 Volunteers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2F6B4F]" />
                  <span>Multi-Assembly Segments</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2F6B4F]" />
                  <span>Dedicated Account Manager</span>
                </li>
              </ul>
            </div>
            <Link href="/login" className="mt-8">
              <Button variant="outline" size="sm" className="w-full">
                Contact Enterprise
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-[#E5E2DC] py-8 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#1F3A5F] flex items-center justify-center text-white font-bold text-[10px]">
              CS
            </div>
            <span className="font-semibold text-[#172033]">CHUNAV SETU</span>
            <span>— Production-grade Election SaaS</span>
          </div>

          <p>© 2026 Chunav Setu. Built for democratic campaigns with strict multi-tenant privacy.</p>
        </div>
      </footer>
    </div>
  );
}
