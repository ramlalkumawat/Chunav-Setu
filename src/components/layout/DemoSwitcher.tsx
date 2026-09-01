"use client";

import React from "react";
import { useAuth } from "@/lib/context/auth-context";
import { ShieldCheck, UserCheck, Smartphone, Users } from "lucide-react";

export function DemoSwitcher() {
  const { user, quickLoginDemo } = useAuth();

  return (
    <div className="bg-[#172033] text-white px-3 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-[#2A3B53]">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-[#64748B] uppercase tracking-wider text-[10px]">
          Demo Switcher:
        </span>
        <span className="text-[#94A3B8] hidden sm:inline">
          Active: <strong className="text-white">{user?.full_name || "Guest"}</strong> ({user?.role?.replace("_", " ")})
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => quickLoginDemo("super_admin")}
          className="flex items-center gap-1 px-2 py-1 rounded bg-[#24334A] hover:bg-[#324563] text-slate-200 hover:text-white transition-colors text-[11px]"
          title="Switch to Super Admin"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Super Admin</span>
        </button>

        <button
          onClick={() => quickLoginDemo("client_1")}
          className="flex items-center gap-1 px-2 py-1 rounded bg-[#24334A] hover:bg-[#324563] text-slate-200 hover:text-white transition-colors text-[11px]"
          title="Switch to Candidate 1 (Rajesh Sharma - Central Assembly)"
        >
          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Candidate 1 (Sharma)</span>
        </button>

        <button
          onClick={() => quickLoginDemo("client_2")}
          className="flex items-center gap-1 px-2 py-1 rounded bg-[#24334A] hover:bg-[#324563] text-slate-200 hover:text-white transition-colors text-[11px]"
          title="Switch to Candidate 2 (Priya Verma - North Ward)"
        >
          <Users className="w-3.5 h-3.5 text-sky-400" />
          <span>Candidate 2 (Verma)</span>
        </button>

        <button
          onClick={() => quickLoginDemo("volunteer_1")}
          className="flex items-center gap-1 px-2 py-1 rounded bg-[#24334A] hover:bg-[#324563] text-slate-200 hover:text-white transition-colors text-[11px]"
          title="Switch to Mobile Volunteer (Amit Kumar)"
        >
          <Smartphone className="w-3.5 h-3.5 text-orange-400" />
          <span>Volunteer (Amit)</span>
        </button>
      </div>
    </div>
  );
}
