"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useLanguage } from "@/lib/i18n";
import { Badge } from "@/components/ui/Badge";
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
  const { t } = useLanguage();
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
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-5 shadow-none">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#6C757D] uppercase tracking-wider">
            {t("canvassingProgress")}
          </span>
          <span className="px-2.5 py-1 rounded-[3px] bg-[#F1ECEF] text-[#714B67] border border-[#D9CAD5] text-xs font-bold">
            {stats.volunteer?.assigned_booth_name || "Booth 101"}
          </span>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <span className="text-3xl font-bold text-[#212529]">
              {stats.contactedVoters}
            </span>
            <span className="text-sm text-[#6C757D] ml-2 font-medium">
              / {stats.totalAssignedVoters} {t("electorsCount")}
            </span>
          </div>
          <span className="text-sm font-bold text-[#2E7D32]">
            {stats.progressPercentage}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-[#E9ECEF] rounded-[3px] mt-3 overflow-hidden">
          <div
            className="h-full bg-[#714B67] rounded-[3px]"
            style={{ width: `${stats.progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Big Action: Start Door-to-Door Canvassing */}
      <Link href="/volunteer/survey" className="block">
        <div className="p-4 bg-white border-2 border-[#714B67] hover:bg-[#FAF7F9] rounded-[4px] flex items-center justify-between transition-colors shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[4px] bg-[#714B67] text-white flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-base text-[#212529]">{t("surveyTitle")}</p>
              <p className="text-[13px] text-[#6C757D]">
                {t("surveySubtitle")}
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-[#714B67]" />
        </div>
      </Link>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/volunteer/voters" className="block">
          <div className="bg-white border border-[#DEE2E6] hover:border-[#714B67] rounded-[4px] p-4 transition-colors">
            <div className="flex items-center gap-2 text-sm font-bold text-[#212529]">
              <Users className="w-4 h-4 text-[#714B67]" />
              <span>{t("navVoters")}</span>
            </div>
            <p className="text-2xl font-bold text-[#212529] mt-2">
              {stats.totalAssignedVoters}
            </p>
            <p className="text-xs text-[#6C757D] font-medium">
              {stats.pendingVoters} {t("uncontacted")}
            </p>
          </div>
        </Link>

        <Link href="/volunteer/tasks" className="block">
          <div className="bg-white border border-[#DEE2E6] hover:border-[#714B67] rounded-[4px] p-4 transition-colors">
            <div className="flex items-center gap-2 text-sm font-bold text-[#212529]">
              <CheckSquare className="w-4 h-4 text-[#E65100]" />
              <span>{t("navTasks")}</span>
            </div>
            <p className="text-2xl font-bold text-[#212529] mt-2">
              {stats.pendingTasks.length}
            </p>
            <p className="text-xs text-[#6C757D] font-medium">{t("pendingTasks")}</p>
          </div>
        </Link>
      </div>

      {/* Today's Follow-up Calls */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
        <div className="px-4 py-3 border-b border-[#DEE2E6] flex items-center justify-between bg-[#F8F9FA]">
          <div className="flex items-center gap-2 text-sm font-bold text-[#212529]">
            <Clock className="w-4 h-4 text-[#E65100]" />
            <span>{t("todayFollowUps")} ({stats.todayFollowUps.length})</span>
          </div>
          <Link href="/volunteer/follow-ups" className="text-xs text-[#714B67] font-bold hover:underline">
            {t("viewAll")}
          </Link>
        </div>

        <div className="p-3 space-y-2">
          {stats.todayFollowUps.map((item: any) => (
            <div
              key={item.id}
              className="p-3 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px] flex items-center justify-between gap-3 text-sm"
            >
              <div>
                <p className="font-bold text-[#212529]">{item.voter_name}</p>
                <p className="text-xs text-[#6C757D] line-clamp-1">{item.note}</p>
              </div>

              {item.voter_mobile && (
                <a
                  href={`tel:${item.voter_mobile}`}
                  className="p-2 rounded-[3px] bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] flex items-center justify-center flex-shrink-0"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
            </div>
          ))}

          {stats.todayFollowUps.length === 0 && (
            <p className="text-sm text-[#6C757D] text-center py-4">
              No follow-ups due today.
            </p>
          )}
        </div>
      </div>

      {/* Recent Survey Activity */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
        <div className="px-4 py-3 border-b border-[#DEE2E6] flex items-center justify-between bg-[#F8F9FA]">
          <div className="flex items-center gap-2 text-sm font-bold text-[#212529]">
            <Compass className="w-4 h-4 text-[#714B67]" />
            <span>{t("navActivity")}</span>
          </div>
          <Link href="/volunteer/activity" className="text-xs text-[#714B67] font-bold hover:underline">
            {t("viewAll")}
          </Link>
        </div>

        <div className="p-3 space-y-2">
          {stats.recentActivities.map((act: any) => (
            <div
              key={act.id}
              className="p-3 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px] flex items-center justify-between text-sm"
            >
              <div>
                <p className="font-bold text-[#212529]">{act.voter_name}</p>
                <p className="text-xs text-[#6C757D] italic">"{act.notes || act.outcome}"</p>
              </div>
              <Badge status={act.outcome} size="md" />
            </div>
          ))}
          {stats.recentActivities.length === 0 && (
            <p className="text-sm text-[#6C757D] text-center py-4">
              No field activities recorded yet today.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
