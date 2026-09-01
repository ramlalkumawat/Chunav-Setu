"use client";

import React from "react";
import { useAuth } from "@/lib/context/auth-context";
import { useLanguage } from "@/lib/i18n";
import { ShieldCheck, UserCheck, Smartphone, Users } from "lucide-react";

export function DemoSwitcher() {
  const { user, quickLoginDemo } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-full bg-[#212529] text-white px-3 sm:px-6 py-2 border-b border-[#343A40] overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        {/* Role status info */}
        <div className="flex items-center justify-between md:justify-start gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#CED4DA] uppercase tracking-wider text-[11px]">
              Demo Access:
            </span>
            <span className="text-[#DEE2E6] text-xs font-medium truncate">
              Role: <strong className="text-white">{user?.full_name || "Guest"}</strong>
            </span>
          </div>
        </div>

        {/* Scrollable / wrapped tabs inside container */}
        <div className="w-full md:w-auto min-w-0 overflow-x-auto pb-0.5 md:pb-0 no-scrollbar">
          <div className="flex items-center gap-1.5 flex-nowrap md:flex-wrap">
            <button
              onClick={() => quickLoginDemo("super_admin")}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-[#343A40] hover:bg-[#495057] text-white transition-colors text-xs font-medium whitespace-nowrap flex-shrink-0"
              title="Switch to Super Admin"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#FFA000] flex-shrink-0" />
              <span>Super Admin</span>
            </button>

            <button
              onClick={() => quickLoginDemo("client_1")}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-[#343A40] hover:bg-[#495057] text-white transition-colors text-xs font-medium whitespace-nowrap flex-shrink-0"
              title="Switch to Candidate 1 (Rajesh Sharma)"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#81C784] flex-shrink-0" />
              <span>Candidate 1 (Sharma)</span>
            </button>

            <button
              onClick={() => quickLoginDemo("client_2")}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-[#343A40] hover:bg-[#495057] text-white transition-colors text-xs font-medium whitespace-nowrap flex-shrink-0"
              title="Switch to Candidate 2 (Priya Verma)"
            >
              <Users className="w-3.5 h-3.5 text-[#64B5F6] flex-shrink-0" />
              <span>Candidate 2 (Verma)</span>
            </button>

            <button
              onClick={() => quickLoginDemo("volunteer_1")}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-[#343A40] hover:bg-[#495057] text-white transition-colors text-xs font-medium whitespace-nowrap flex-shrink-0"
              title="Switch to Volunteer (Amit Kumar)"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#FFB74D] flex-shrink-0" />
              <span>Volunteer (Amit)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
