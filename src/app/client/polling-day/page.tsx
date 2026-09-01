"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { useLanguage } from "@/lib/i18n";
import { useToast } from "@/lib/context/toast-context";
import { dbService } from "@/lib/store/data-service";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatNumber, formatDateTime } from "@/lib/utils";
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Calendar,
  Lock,
  Search,
  Filter,
  Activity,
  CheckSquare,
  Building,
  UserCheck,
  Smartphone,
  ChevronDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function PollingDayDashboardPage() {
  const { client, user } = useAuth();
  const { t, language } = useLanguage();
  const { success, error: toastError } = useToast();
  const clientId = client?.id || "client-1";
  const isHindi = language === "hi";

  // Dashboard Data State
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "booths" | "volunteers" | "hourly" | "timeline" | "followups" | "reports"
  >("booths");

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedBooth, setSelectedBooth] = useState("all");
  const [selectedArea, setSelectedArea] = useState("all");
  const [boothsList, setBoothsList] = useState<any[]>([]);
  const [areasList, setAreasList] = useState<any[]>([]);

  // Modals
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isLockConfirmOpen, setIsLockConfirmOpen] = useState(false);
  const [configForm, setConfigForm] = useState({
    title: "General Assembly Elections 2026 - Polling Day",
    polling_date: "12 December 2026",
    start_time: "07:00 AM",
    end_time: "06:00 PM",
    total_target_voters: "12450",
  });

  const loadDashboard = useCallback(() => {
    const data = dbService.getPollingDayDashboardStats(clientId);
    setStats(data);
    setBoothsList(dbService.getBooths(clientId));
    setAreasList(dbService.getAreas(clientId));

    if (data.pollingDay) {
      setConfigForm({
        title: data.pollingDay.title,
        polling_date: data.pollingDay.polling_date,
        start_time: data.pollingDay.start_time || "07:00 AM",
        end_time: data.pollingDay.end_time || "06:00 PM",
        total_target_voters: String(data.pollingDay.total_target_voters || 12450),
      });
    }
  }, [clientId]);

  useEffect(() => {
    loadDashboard();
    // 30s auto polling refresh for war room telemetry
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, [loadDashboard]);

  const handleSaveConfig = () => {
    dbService.configurePollingDay(clientId, {
      title: configForm.title,
      polling_date: configForm.polling_date,
      start_time: configForm.start_time,
      end_time: configForm.end_time,
      total_target_voters: parseInt(configForm.total_target_voters, 10) || 12450,
      status: "active",
    });
    success("Polling Day Configured", "Election day operational monitoring is now active.");
    setIsConfigOpen(false);
    loadDashboard();
  };

  const handleLockPollingDay = () => {
    dbService.lockPollingDay(clientId);
    success("Polling Day Locked", "Operations marked completed. Historical reports preserved.");
    setIsLockConfirmOpen(false);
    loadDashboard();
  };

  const handleResolveFollowUp = (followUpId: string) => {
    dbService.resolvePollingFollowUp(clientId, followUpId);
    success("Follow-up Resolved", "Elector follow-up issue resolved.");
    loadDashboard();
  };

  const handleExportReport = async () => {
    try {
      const res = await fetch("/api/polling-day/export", { method: "POST" });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Polling_Day_Operational_Report_${clientId}_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        success("Report Exported", "Operational polling day CSV downloaded.");
      }
    } catch {
      toastError("Export Failed", "Could not generate polling day export.");
    }
  };

  if (!stats) return null;

  // Filtered booth stats
  const filteredBooths = (stats.boothStats || []).filter((b: any) => {
    const matchesSearch =
      !search ||
      b.booth_number.toLowerCase().includes(search.toLowerCase()) ||
      b.booth_name.toLowerCase().includes(search.toLowerCase()) ||
      b.area_name.toLowerCase().includes(search.toLowerCase());
    const matchesBooth = selectedBooth === "all" || b.booth_id === selectedBooth;
    const matchesArea = selectedArea === "all" || b.area_name === selectedArea;
    return matchesSearch && matchesBooth && matchesArea;
  });

  // Filtered follow-ups
  const activeFollowUps = dbService.getPollingDayFollowUps(clientId);

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-hidden">
      {/* 1. TOP HEADER & OPERATIONAL STATUS BANNER */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-none">
        <div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#6C757D] font-medium">
            <span>{t("navCampaigns")}</span>
            <span>/</span>
            <span className="font-semibold text-[#212529]">{t("navPollingDay")}</span>
          </div>

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#212529] tracking-tight">
              {stats.pollingDay ? stats.pollingDay.title : t("pollingDayTitle")}
            </h1>

            {stats.pollingDay ? (
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-[3px] text-xs font-bold ${
                  stats.pollingDay.status === "active"
                    ? "bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] animate-pulse"
                    : stats.pollingDay.status === "completed"
                    ? "bg-[#ECEFF1] text-[#455A64] border border-[#CFD8DC]"
                    : "bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]"
                }`}
              >
                {stats.pollingDay.status === "active"
                  ? t("pollingDayStatusLive")
                  : stats.pollingDay.status === "completed"
                  ? t("pollingDayStatusCompleted")
                  : t("pollingDayStatusUpcoming")}
              </span>
            ) : null}
          </div>

          <p className="text-xs sm:text-sm text-[#6C757D] mt-1">
            {stats.pollingDay
              ? `${stats.pollingDay.polling_date} • ${stats.pollingDay.start_time || "07:00 AM"} – ${stats.pollingDay.end_time || "06:00 PM"} • ${t("internalReportNotice")}`
              : t("pollingDaySubtitle")}
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            size="sm"
            variant="secondary"
            className="h-9 px-3 text-xs sm:text-sm"
            leftIcon={<Download className="w-4 h-4 text-[#6C757D]" />}
            onClick={handleExportReport}
          >
            {t("exportCsv")}
          </Button>

          {stats.pollingDay?.status === "active" && (
            <Button
              size="sm"
              variant="secondary"
              className="h-9 px-3 text-xs sm:text-sm text-[#C62828] hover:bg-[#FFEBEE]"
              leftIcon={<Lock className="w-4 h-4 text-[#C62828]" />}
              onClick={() => setIsLockConfirmOpen(true)}
            >
              {t("lockPollingDay")}
            </Button>
          )}

          <Button
            size="sm"
            variant="primary"
            className="h-9 px-3.5 text-xs sm:text-sm"
            leftIcon={<Calendar className="w-4 h-4" />}
            onClick={() => setIsConfigOpen(true)}
          >
            {stats.pollingDay ? t("edit") : t("configurePollingDay")}
          </Button>
        </div>
      </div>

      {/* 2. UNCONFIGURED STATE CARD IF NO POLLING DAY */}
      {!stats.pollingDay && (
        <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-[4px] bg-[#F1ECEF] border border-[#D9CAD5] text-[#714B67] flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-[#212529]">{t("noPollingDayConfigured")}</h2>
          <p className="text-sm text-[#6C757D] max-w-md mx-auto">{t("noPollingDayDesc")}</p>
          <Button size="md" variant="primary" onClick={() => setIsConfigOpen(true)}>
            {t("configurePollingDay")}
          </Button>
        </div>
      )}

      {/* 3. ACTIVE DASHBOARD CONTENT */}
      {stats.pollingDay && (
        <>
          {/* KPI CARDS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <StatCard
              title={t("totalVotersKpi")}
              value={stats.totalVoters}
              icon={Users}
              iconColor="text-[#714B67]"
              iconBg="bg-[#F1ECEF]"
            />
            <StatCard
              title={t("statusReportedKpi")}
              value={stats.statusReported}
              subValue={`${stats.turnoutPercentage}% turnout`}
              icon={CheckCircle2}
              iconColor="text-[#2E7D32]"
              iconBg="bg-[#E8F5E9]"
              trend={{ value: `${stats.turnoutPercentage}%`, isPositive: true, label: t("turnoutCoverageKpi") }}
            />
            <StatCard
              title={t("votingActivityReportedKpi")}
              value={stats.votingActivityReported}
              icon={CheckSquare}
              iconColor="text-[#714B67]"
              iconBg="bg-[#F1ECEF]"
            />
            <StatCard
              title={t("pendingKpi")}
              value={stats.pendingVoters}
              icon={Clock}
              iconColor="text-[#6C757D]"
              iconBg="bg-[#F8F9FA]"
            />
            <StatCard
              title={t("followUpsKpi")}
              value={stats.followUpsCount}
              icon={AlertCircle}
              iconColor="text-[#E65100]"
              iconBg="bg-[#FFF3E0]"
            />
          </div>

          {/* TAB NAVIGATION */}
          <div className="border-b border-[#DEE2E6] flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar bg-white rounded-t-[4px] px-3 pt-2">
            <button
              onClick={() => setActiveTab("booths")}
              className={`px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "booths"
                  ? "border-[#714B67] text-[#714B67]"
                  : "border-transparent text-[#6C757D] hover:text-[#212529]"
              }`}
            >
              {t("boothProgressTab")} ({stats.boothStats?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("volunteers")}
              className={`px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "volunteers"
                  ? "border-[#714B67] text-[#714B67]"
                  : "border-transparent text-[#6C757D] hover:text-[#212529]"
              }`}
            >
              {t("volunteerTelemetryTab")} ({stats.volunteerStats?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("hourly")}
              className={`px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "hourly"
                  ? "border-[#714B67] text-[#714B67]"
                  : "border-transparent text-[#6C757D] hover:text-[#212529]"
              }`}
            >
              {t("hourlyActivityTab")}
            </button>
            <button
              onClick={() => setActiveTab("followups")}
              className={`px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "followups"
                  ? "border-[#714B67] text-[#714B67]"
                  : "border-transparent text-[#6C757D] hover:text-[#212529]"
              }`}
            >
              {t("followUpQueueTab")} ({activeFollowUps.filter((f) => f.status === "pending").length})
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              className={`px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "timeline"
                  ? "border-[#714B67] text-[#714B67]"
                  : "border-transparent text-[#6C757D] hover:text-[#212529]"
              }`}
            >
              {t("liveTimelineTab")}
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "reports"
                  ? "border-[#714B67] text-[#714B67]"
                  : "border-transparent text-[#6C757D] hover:text-[#212529]"
              }`}
            >
              {t("reportsTab")}
            </button>
          </div>

          {/* TAB 1: BOOTH PROGRESS TABLE */}
          {activeTab === "booths" && (
            <div className="bg-white border border-[#DEE2E6] border-t-0 rounded-b-[4px] p-4 sm:p-5 space-y-4">
              {/* Filter Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-[#6C757D]" />
                  <input
                    type="text"
                    placeholder="Filter booth number or area..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 bg-white border border-[#DEE2E6] rounded-[4px] text-xs sm:text-sm text-[#212529] focus:outline-none focus:border-[#714B67]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="h-10 bg-white border border-[#DEE2E6] rounded-[4px] text-xs sm:text-sm px-2.5 text-[#212529] focus:outline-none focus:border-[#714B67]"
                  >
                    <option value="all">All Wards / Areas</option>
                    {areasList.map((a) => (
                      <option key={a.id} value={a.name}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto w-full max-w-full">
                <table className="odoo-table">
                  <thead>
                    <tr>
                      <th>{t("boothNumber")}</th>
                      <th>{t("pollingStationName")}</th>
                      <th>{t("wardLocality")}</th>
                      <th className="text-center">{t("totalVotersKpi")}</th>
                      <th className="text-center">{t("statusReportedKpi")}</th>
                      <th className="text-center">{t("votingActivityReportedKpi")}</th>
                      <th className="text-center">{t("pendingKpi")}</th>
                      <th className="text-center">{t("turnoutCoverageKpi")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBooths.map((b: any) => (
                      <tr key={b.booth_id}>
                        <td className="font-mono text-sm font-bold text-[#714B67]">
                          {b.booth_number}
                        </td>
                        <td className="font-bold text-[#212529]">{b.booth_name}</td>
                        <td className="text-[13px] text-[#6C757D]">{b.area_name}</td>
                        <td className="text-center text-sm font-bold text-[#212529]">
                          {formatNumber(b.total_voters)}
                        </td>
                        <td className="text-center text-sm font-bold text-[#2E7D32]">
                          {formatNumber(b.reported_count)}
                        </td>
                        <td className="text-center text-sm font-bold text-[#714B67]">
                          {formatNumber(b.voting_reported_count)}
                        </td>
                        <td className="text-center text-sm font-medium text-[#6C757D]">
                          {formatNumber(b.pending_count)}
                        </td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-20 bg-[#E9ECEF] rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-[#714B67] h-full rounded-full"
                                style={{ width: `${b.progress_percentage}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-[#212529]">
                              {b.progress_percentage}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredBooths.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-sm text-[#6C757D]">
                          No booth matching the filter criteria found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: VOLUNTEER ACTIVITY ROSTER */}
          {activeTab === "volunteers" && (
            <div className="bg-white border border-[#DEE2E6] border-t-0 rounded-b-[4px] p-4 sm:p-5">
              <div className="overflow-x-auto w-full max-w-full">
                <table className="odoo-table">
                  <thead>
                    <tr>
                      <th>{t("volunteerName")}</th>
                      <th>{t("assignedBooth")}</th>
                      <th>{t("assignedArea")}</th>
                      <th className="text-center">Updates Today</th>
                      <th className="text-center">Pending Follow-ups</th>
                      <th>Last Telemetry Update</th>
                      <th className="text-center">{t("status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats.volunteerStats || []).map((v: any) => (
                      <tr key={v.volunteer_id}>
                        <td>
                          <p className="font-bold text-[#212529]">{v.name}</p>
                          <p className="text-xs text-[#6C757D] font-mono">{v.mobile}</p>
                        </td>
                        <td className="text-xs sm:text-sm text-[#212529] font-medium">
                          {v.assigned_booth_name}
                        </td>
                        <td className="text-xs sm:text-sm text-[#6C757D]">
                          {v.assigned_area_name}
                        </td>
                        <td className="text-center text-sm font-bold text-[#2E7D32]">
                          {v.updates_today}
                        </td>
                        <td className="text-center text-sm font-bold text-[#E65100]">
                          {v.pending_followups}
                        </td>
                        <td className="text-xs text-[#6C757D] font-mono">
                          {v.last_update_time ? formatDateTime(v.last_update_time) : "Active on field"}
                        </td>
                        <td className="text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-[3px] text-[11px] font-bold ${
                              v.is_active
                                ? "bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]"
                                : "bg-[#ECEFF1] text-[#6C757D] border border-[#CFD8DC]"
                            }`}
                          >
                            {v.is_active ? t("active") : t("inactive")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: HOURLY ACTIVITY CHART */}
          {activeTab === "hourly" && (
            <div className="bg-white border border-[#DEE2E6] border-t-0 rounded-b-[4px] p-4 sm:p-6 space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#212529]">
                  {t("hourlyDistributionTitle")}
                </h3>
                <p className="text-xs sm:text-sm text-[#6C757D]">
                  {t("hourlyDistributionSubtitle")}
                </p>
              </div>

              <div className="h-72 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.hourlyActivity} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <XAxis dataKey="label" tick={{ fontSize: 13, fill: "#212529", fontWeight: 600 }} />
                    <YAxis tick={{ fontSize: 12, fill: "#6C757D" }} />
                    <Tooltip
                      formatter={(value: any) => [`${value} Turnout Contacts`, "Hourly Volume"]}
                      contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#DEE2E6", borderRadius: 4, fontSize: 13 }}
                    />
                    <Bar dataKey="count" fill="#714B67" radius={[3, 3, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB 4: FOLLOW-UP QUEUE */}
          {activeTab === "followups" && (
            <div className="bg-white border border-[#DEE2E6] border-t-0 rounded-b-[4px] p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#212529]">{t("followUpQueueTab")}</h3>
                  <p className="text-xs sm:text-sm text-[#6C757D]">
                    Electors requiring operational assistance (transport, callbacks, queue updates)
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto w-full max-w-full">
                <table className="odoo-table">
                  <thead>
                    <tr>
                      <th>{t("electorName")}</th>
                      <th>{t("pollingBooth")}</th>
                      <th>{t("followUpReason")}</th>
                      <th>Logged Volunteer</th>
                      <th>Created At</th>
                      <th className="text-right">{t("actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeFollowUps.map((f: any) => (
                      <tr key={f.id}>
                        <td>
                          <p className="font-bold text-[#212529]">{f.voter_name}</p>
                          <p className="text-xs font-mono text-[#6C757D]">{f.voter_id_card}</p>
                        </td>
                        <td className="text-xs sm:text-sm text-[#495057]">{f.booth_number}</td>
                        <td>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-[3px] text-xs font-semibold bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]">
                            {f.reason}
                          </span>
                          {f.note && <p className="text-xs text-[#6C757D] mt-0.5 italic">"{f.note}"</p>}
                        </td>
                        <td className="text-xs sm:text-sm text-[#212529]">{f.volunteer_name}</td>
                        <td className="text-xs font-mono text-[#6C757D]">
                          {formatDateTime(f.created_at)}
                        </td>
                        <td className="text-right">
                          {f.status === "pending" ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="text-xs h-8 text-[#2E7D32] hover:bg-[#E8F5E9]"
                              onClick={() => handleResolveFollowUp(f.id)}
                            >
                              {t("markCompleted")}
                            </Button>
                          ) : (
                            <span className="text-xs text-[#2E7D32] font-semibold">Resolved</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {activeFollowUps.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-sm text-[#6C757D]">
                          No pending polling day follow-ups recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: LIVE TIMELINE */}
          {activeTab === "timeline" && (
            <div className="bg-white border border-[#DEE2E6] border-t-0 rounded-b-[4px] p-4 sm:p-5 space-y-3">
              <h3 className="text-base font-bold text-[#212529]">Real-Time Telemetry Feed</h3>
              <div className="divide-y divide-[#F1F3F5]">
                {(stats.recentUpdates || []).map((u: any) => (
                  <div key={u.id} className="py-3 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-[4px] flex items-center justify-center text-xs font-bold ${
                          u.status === "VOTING_REPORTED"
                            ? "bg-[#E8F5E9] text-[#2E7D32]"
                            : "bg-[#FFF3E0] text-[#E65100]"
                        }`}
                      >
                        {u.status === "VOTING_REPORTED" ? "VR" : "FU"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#212529]">
                          {u.voter_name} <span className="font-mono text-xs text-[#6C757D]">({u.voter_id_card})</span>
                        </p>
                        <p className="text-xs text-[#6C757D]">
                          {u.booth_number} • {u.area_name} • Reported by {u.updated_by}
                        </p>
                        {u.note && <p className="text-xs text-[#495057] italic mt-0.5">"{u.note}"</p>}
                      </div>
                    </div>

                    <span className="text-xs font-mono text-[#6C757D] flex-shrink-0">
                      {formatDateTime(u.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: REPORTS & EXPORT */}
          {activeTab === "reports" && (
            <div className="bg-white border border-[#DEE2E6] border-t-0 rounded-b-[4px] p-6 text-center max-w-2xl mx-auto space-y-4">
              <div className="w-12 h-12 rounded-[4px] bg-[#F1ECEF] border border-[#D9CAD5] text-[#714B67] flex items-center justify-center mx-auto">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#212529]">Internal Campaign Operational Report</h3>
              <p className="text-xs sm:text-sm text-[#6C757D]">
                Export complete aggregated booth-wise turnout coverage, volunteer productivity logs, and pending follow-ups for campaign analysis.
              </p>
              <div className="p-3 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px] text-xs text-[#6C757D]">
                {t("internalReportNotice")}
              </div>
              <Button size="md" variant="primary" leftIcon={<Download className="w-4 h-4" />} onClick={handleExportReport}>
                {t("exportOperationalReport")}
              </Button>
            </div>
          )}
        </>
      )}

      {/* CONFIGURE POLLING DAY MODAL */}
      <Modal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        title={t("configurePollingDay")}
        maxWidth="md"
      >
        <div className="space-y-4">
          <Input
            label={t("pollingTitleLabel")}
            value={configForm.title}
            onChange={(e) => setConfigForm({ ...configForm, title: e.target.value })}
            placeholder="e.g. General Assembly Election Polling Day"
          />

          <Input
            label={t("pollingDateLabel")}
            value={configForm.polling_date}
            onChange={(e) => setConfigForm({ ...configForm, polling_date: e.target.value })}
            placeholder="e.g. 12 December 2026"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Time"
              value={configForm.start_time}
              onChange={(e) => setConfigForm({ ...configForm, start_time: e.target.value })}
              placeholder="07:00 AM"
            />
            <Input
              label="End Time"
              value={configForm.end_time}
              onChange={(e) => setConfigForm({ ...configForm, end_time: e.target.value })}
              placeholder="06:00 PM"
            />
          </div>

          <Input
            label="Total Target Electors"
            type="number"
            value={configForm.total_target_voters}
            onChange={(e) => setConfigForm({ ...configForm, total_target_voters: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-[#DEE2E6]">
            <Button variant="secondary" onClick={() => setIsConfigOpen(false)}>
              {t("cancel")}
            </Button>
            <Button variant="primary" onClick={handleSaveConfig}>
              {t("save")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* LOCK POLLING DAY CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={isLockConfirmOpen}
        onClose={() => setIsLockConfirmOpen(false)}
        onConfirm={handleLockPollingDay}
        title={t("lockPollingDay")}
        message={t("lockPollingDayConfirm")}
        confirmText={t("lockPollingDay")}
        variant="danger"
      />
    </div>
  );
}
