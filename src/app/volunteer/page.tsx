"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Users,
  CheckSquare,
  Clock,
  ArrowRight,
  Plus,
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
    <div className="space-y-3">
      {/* Target Progress Card */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-3.5 shadow-none">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-[#6C757D] uppercase tracking-wider">
            Today's Canvassing Target
          </span>
          <span className="px-2 py-0.5 rounded-[2px] bg-[#F1ECEF] text-[#714B67] border border-[#D9CAD5] text-[10px] font-semibold">
            {stats.volunteer?.assigned_booth_name || "Booth 101"}
          </span>
        </div>

        <div className="mt-2.5 flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-bold text-[#212529]">
              {stats.contactedVoters}
            </span>
            <span className="text-xs text-[#6C757D] ml-1.5">
              / {stats.totalAssignedVoters} electors contacted
            </span>
          </div>
          <span className="text-xs font-bold text-[#2E7D32]">
            {stats.progressPercentage}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[#E9ECEF] rounded-[2px] mt-2 overflow-hidden">
          <div
            className="h-full bg-[#714B67] rounded-[2px]"
            style={{ width: `${stats.progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Big Action: Start Door-to-Door Canvassing */}
      <Link href="/volunteer/survey" className="block">
        <div className="p-3 bg-white border border-[#714B67] hover:bg-[#FAF7F9] rounded-[4px] flex items-center justify-between transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[3px] bg-[#714B67] text-white flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs text-[#212529]">New Field Survey</p>
              <p className="text-[11px] text-[#6C757D]">
                Log elector contact, voter sentiment & issue follow-up
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#714B67]" />
        </div>
      </Link>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <Link href="/volunteer/voters" className="block">
          <div className="bg-white border border-[#DEE2E6] hover:border-[#714B67] rounded-[4px] p-3 transition-colors">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#212529]">
              <Users className="w-3.5 h-3.5 text-[#714B67]" />
              <span>Assigned Voters</span>
            </div>
            <p className="text-lg font-bold text-[#212529] mt-1.5">
              {stats.totalAssignedVoters}
            </p>
            <p className="text-[10px] text-[#6C757D]">
              {stats.pendingVoters} uncontacted
            </p>
          </div>
        </Link>

        <Link href="/volunteer/tasks" className="block">
          <div className="bg-white border border-[#DEE2E6] hover:border-[#714B67] rounded-[4px] p-3 transition-colors">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#212529]">
              <CheckSquare className="w-3.5 h-3.5 text-[#E65100]" />
              <span>My Tasks</span>
            </div>
            <p className="text-lg font-bold text-[#212529] mt-1.5">
              {stats.pendingTasks.length}
            </p>
            <p className="text-[10px] text-[#6C757D]">Assigned to you</p>
          </div>
        </Link>
      </div>

      {/* Today's Follow-up Calls */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
        <div className="px-3 py-2 border-b border-[#DEE2E6] flex items-center justify-between bg-[#F8F9FA]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#212529]">
            <Clock className="w-3.5 h-3.5 text-[#E65100]" />
            <span>Today's Follow-ups ({stats.todayFollowUps.length})</span>
          </div>
          <Link href="/volunteer/follow-ups" className="text-[11px] text-[#714B67] font-medium hover:underline">
            View All
          </Link>
        </div>

        <div className="p-2 space-y-1.5">
          {stats.todayFollowUps.map((item: any) => (
            <div
              key={item.id}
              className="p-2 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[3px] flex items-center justify-between gap-2 text-xs"
            >
              <div>
                <p className="font-semibold text-[#212529]">{item.voter_name}</p>
                <p className="text-[11px] text-[#6C757D] line-clamp-1">{item.note}</p>
              </div>

              {item.voter_mobile && (
                <a
                  href={`tel:${item.voter_mobile}`}
                  className="p-1.5 rounded-[3px] bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] flex items-center justify-center flex-shrink-0"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}

          {stats.todayFollowUps.length === 0 && (
            <p className="text-xs text-[#6C757D] text-center py-2.5">
              No follow-ups due today.
            </p>
          )}
        </div>
      </div>

      {/* Recent Survey Activity */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
        <div className="px-3 py-2 border-b border-[#DEE2E6] flex items-center justify-between bg-[#F8F9FA]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#212529]">
            <Compass className="w-3.5 h-3.5 text-[#714B67]" />
            <span>My Recent Field Logs</span>
          </div>
          <Link href="/volunteer/activity" className="text-[11px] text-[#714B67] font-medium hover:underline">
            History
          </Link>
        </div>

        <div className="p-2 space-y-1.5">
          {stats.recentActivities.map((act: any) => (
            <div
              key={act.id}
              className="p-2 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[3px] flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-semibold text-[#212529]">{act.voter_name}</p>
                <p className="text-[11px] text-[#6C757D] italic">"{act.notes || act.outcome}"</p>
              </div>
              <Badge status={act.outcome} size="sm" />
            </div>
          ))}
          {stats.recentActivities.length === 0 && (
            <p className="text-xs text-[#6C757D] text-center py-2.5">
              No field activities recorded yet today.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
