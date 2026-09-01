"use client";

import React from "react";
import { useAuth } from "@/lib/context/auth-context";
import { ShieldCheck, UserCheck, Smartphone, Users } from "lucide-react";

export function DemoSwitcher() {
  const { user, quickLoginDemo } = useAuth();

  return (
    <div className="bg-[#212529] text-white px-3 py-1 text-xs flex flex-wrap items-center justify-between gap-1.5 border-b border-[#343A40]">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-[#ADB5BD] uppercase tracking-wider text-[10px]">
          Demo Environment:
        </span>
        <span className="text-[#DEE2E6] hidden sm:inline text-[11px]">
          User: <strong className="text-white">{user?.full_name || "Guest"}</strong> ({user?.role?.replace("_", " ")})
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => quickLoginDemo("super_admin")}
          className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#343A40] hover:bg-[#495057] text-[#E9ECEF] hover:text-white transition-colors text-[11px]"
          title="Switch to Super Admin"
        >
          <ShieldCheck className="w-3 h-3 text-[#FFA000]" />
          <span>Super Admin</span>
        </button>

        <button
          onClick={() => quickLoginDemo("client_1")}
          className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#343A40] hover:bg-[#495057] text-[#E9ECEF] hover:text-white transition-colors text-[11px]"
          title="Switch to Candidate 1 (Rajesh Sharma)"
        >
          <UserCheck className="w-3 h-3 text-[#81C784]" />
          <span>Candidate 1 (Sharma)</span>
        </button>

        <button
          onClick={() => quickLoginDemo("client_2")}
          className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#343A40] hover:bg-[#495057] text-[#E9ECEF] hover:text-white transition-colors text-[11px]"
          title="Switch to Candidate 2 (Priya Verma)"
        >
          <Users className="w-3 h-3 text-[#64B5F6]" />
          <span>Candidate 2 (Verma)</span>
        </button>

        <button
          onClick={() => quickLoginDemo("volunteer_1")}
          className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#343A40] hover:bg-[#495057] text-[#E9ECEF] hover:text-white transition-colors text-[11px]"
          title="Switch to Volunteer (Amit Kumar)"
        >
          <Smartphone className="w-3 h-3 text-[#FFB74D]" />
          <span>Volunteer (Amit)</span>
        </button>
      </div>
    </div>
  );
}
