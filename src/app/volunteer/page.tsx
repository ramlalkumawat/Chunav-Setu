"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, formatNumber } from "@/lib/utils";
import {
  Users,
  Building2,
  CheckCircle2,
  Clock,
  CheckSquare,
  ArrowRight,
  PlusCircle,
  Phone,
  Compass,
} from "lucide-react";

export default function VolunteerDashboardPage() {
  const { client, volunteer } = useAuth();
  const clientId = client?.id || "client-1";
  const volunteerId = volunteer?.id || "vol-1";

  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    setStats(dbService.getVolunteerDashboardStats(clientId, volunteerId));
  }, [clientId, volunteerId]);

  if (!stats) return null;

  return (
    <div className="space-y-4">
      {/* Target Progress Card */}
      <Card padding="md" className="bg-[#1F3A5F] text-white border-0 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-slate-300 uppercase">
            Today's Canvassing Target
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-white">
            {stats.volunteer?.assigned_booth_name || "Booth 101"}
          </span>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <span className="text-3xl font-extrabold text-white">
              {stats.contactedVoters}
            </span>
            <span className="text-xs text-slate-300 ml-1.5">
              / {stats.totalAssignedVoters} voters contacted
            </span>
          </div>
          <span className="text-sm font-bold text-emerald-400">
            {stats.progressPercentage}% Done
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/20 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-300"
            style={{ width: `${stats.progressPercentage}%` }}
          />
        </div>
      </Card>

      {/* Big Action: Start Door-to-Door Canvassing */}
      <Link href="/volunteer/survey" className="block">
        <div className="p-4 bg-white border-2 border-[#1F3A5F] rounded-xl flex items-center justify-between shadow-sm active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#1F3A5F] text-white flex items-center justify-center">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#172033]">New Field Survey</p>
              <p className="text-[11px] text-[#64748B]">
                Log voter contact, sentiment, & follow-ups
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-[#1F3A5F]" />
        </div>
      </Link>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/volunteer/voters" className="block">
          <Card padding="sm" className="hover:border-[#1F3A5F]/40 active:scale-95 transition-all">
            <div className="flex items-center gap-2 text-xs font-bold text-[#172033]">
              <Users className="w-4 h-4 text-[#1F3A5F]" />
              <span>Assigned Voters</span>
            </div>
            <p className="text-xl font-bold text-[#172033] mt-2">
              {stats.totalAssignedVoters}
            </p>
            <p className="text-[10px] text-[#64748B] mt-0.5">
              {stats.pendingVoters} uncontacted
            </p>
          </Card>
        </Link>

        <Link href="/volunteer/tasks" className="block">
          <Card padding="sm" className="hover:border-[#1F3A5F]/40 active:scale-95 transition-all">
            <div className="flex items-center gap-2 text-xs font-bold text-[#172033]">
              <CheckSquare className="w-4 h-4 text-[#B7791F]" />
              <span>My Tasks</span>
            </div>
            <p className="text-xl font-bold text-[#172033] mt-2">
              {stats.pendingTasks.length}
            </p>
            <p className="text-[10px] text-[#64748B] mt-0.5">Assigned to you</p>
          </Card>
        </Link>
      </div>

      {/* Today's Follow-up Calls */}
      <Card padding="md">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E2DC] mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#172033]">
            <Clock className="w-4 h-4 text-[#B7791F]" />
            <span>Today's Follow-ups ({stats.todayFollowUps.length})</span>
          </div>
          <Link href="/volunteer/follow-ups" className="text-[11px] text-[#1F3A5F] font-semibold">
            View All
          </Link>
        </div>

        <div className="space-y-2.5">
          {stats.todayFollowUps.map((item: any) => (
            <div
              key={item.id}
              className="p-2.5 bg-[#FAFAF8] border border-[#E5E2DC] rounded-lg flex items-center justify-between gap-2 text-xs"
            >
              <div>
                <p className="font-bold text-[#172033]">{item.voter_name}</p>
                <p className="text-[11px] text-[#64748B] line-clamp-1">{item.note}</p>
              </div>

              {item.voter_mobile && (
                <a
                  href={`tel:${item.voter_mobile}`}
                  className="p-2 rounded-lg bg-[#EAF3EE] text-[#2F6B4F] flex items-center justify-center flex-shrink-0"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
            </div>
          ))}

          {stats.todayFollowUps.length === 0 && (
            <p className="text-xs text-[#64748B] text-center py-3">
              No follow-ups due today. Great job!
            </p>
          )}
        </div>
      </Card>

      {/* Recent Survey Activity */}
      <Card padding="md">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E2DC] mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#172033]">
            <Compass className="w-4 h-4 text-[#1F3A5F]" />
            <span>My Recent Field Logs</span>
          </div>
          <Link href="/volunteer/activity" className="text-[11px] text-[#1F3A5F] font-semibold">
            History
          </Link>
        </div>

        <div className="space-y-2">
          {stats.recentActivities.map((act: any) => (
            <div
              key={act.id}
              className="p-2.5 bg-[#FAFAF8] border border-[#E5E2DC] rounded-lg flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-bold text-[#172033]">{act.voter_name}</p>
                <p className="text-[11px] text-[#64748B] italic">"{act.notes || act.outcome}"</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-[#EAF3EE] text-[#2F6B4F]">
                {act.outcome}
              </span>
            </div>
          ))}
          {stats.recentActivities.length === 0 && (
            <p className="text-xs text-[#64748B] text-center py-3">
              No field activities recorded yet today.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
