"use client";

import React from "react";
import { useAuth } from "@/lib/context/auth-context";
import { useLanguage } from "@/lib/i18n";
import { ShieldCheck, UserCheck, Smartphone, Users } from "lucide-react";

export function DemoSwitcher() {
  const { user, quickLoginDemo } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="bg-[#212529] text-white px-4 py-1.5 text-xs sm:text-sm flex flex-wrap items-center justify-between gap-2 border-b border-[#343A40]">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-[#CED4DA] uppercase tracking-wider text-[11px]">
          Demo Access:
        </span>
        <span className="text-[#DEE2E6] hidden sm:inline text-xs font-medium">
          Role: <strong className="text-white">{user?.full_name || "Guest"}</strong>
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
        <button
          onClick={() => quickLoginDemo("super_admin")}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-[#343A40] hover:bg-[#495057] text-white transition-colors text-xs font-medium"
          title="Switch to Super Admin"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#FFA000]" />
          <span>Super Admin</span>
        </button>

        <button
          onClick={() => quickLoginDemo("client_1")}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-[#343A40] hover:bg-[#495057] text-white transition-colors text-xs font-medium"
          title="Switch to Candidate 1 (Rajesh Sharma)"
        >
          <UserCheck className="w-3.5 h-3.5 text-[#81C784]" />
          <span>Candidate 1 (Sharma)</span>
        </button>

        <button
          onClick={() => quickLoginDemo("client_2")}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-[#343A40] hover:bg-[#495057] text-white transition-colors text-xs font-medium"
          title="Switch to Candidate 2 (Priya Verma)"
        >
          <Users className="w-3.5 h-3.5 text-[#64B5F6]" />
          <span>Candidate 2 (Verma)</span>
        </button>

        <button
          onClick={() => quickLoginDemo("volunteer_1")}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-[#343A40] hover:bg-[#495057] text-white transition-colors text-xs font-medium"
          title="Switch to Volunteer (Amit Kumar)"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#FFB74D]" />
          <span>Volunteer (Amit)</span>
        </button>
      </div>
    </div>
  );
}
