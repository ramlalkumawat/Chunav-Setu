"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { useLanguage } from "@/lib/i18n";
import { useToast } from "@/lib/context/toast-context";
import { dbService } from "@/lib/store/data-service";
import { CandidatePosterBanner } from "@/components/layout/CandidatePosterBanner";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatNumber, formatDateTime } from "@/lib/utils";
import { PollingVoterStatus } from "@/lib/types";
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
  RotateCcw,
  X,
  Radio,
  BarChart2,
  FileSpreadsheet,
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
  const [, startTransition] = useTransition();
  const clientId = client?.id || user?.client_id || "";
  const isHindi = language === "hi";

  // Dashboard Data State
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "voter_turnout" | "booths" | "volunteers" | "hourly" | "timeline" | "followups" | "reports"
  >("voter_turnout");

  // Voter Search & List State
  const [voters, setVoters] = useState<any[]>([]);
  const [voterSearch, setVoterSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedBoothFilter, setSelectedBoothFilter] = useState("all");
  const [selectedAreaFilter, setSelectedAreaFilter] = useState("all");
  const [boothsList, setBoothsList] = useState<any[]>([]);
  const [areasList, setAreasList] = useState<any[]>([]);
  const [voterPage, setVoterPage] = useState(1);
  const [voterTotalPages, setVoterTotalPages] = useState(1);

  // Undo Tracking state
  const [lastUpdatedVoter, setLastUpdatedVoter] = useState<{ id: string; name: string } | null>(null);

  // Configuration Modal
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
    try {
      const data = dbService.getPollingDayDashboardStats(clientId);
      setStats(data);
      setBoothsList(dbService.getBooths(clientId));
      setAreasList(dbService.getAreas(clientId));

      if (data && data.pollingDay) {
        setConfigForm({
          title: data.pollingDay.title,
          polling_date: data.pollingDay.election_date || data.pollingDay.polling_date || "12 December 2026",
          start_time: data.pollingDay.start_time || "07:00 AM",
          end_time: data.pollingDay.end_time || "06:00 PM",
          total_target_voters: String(data.pollingDay.total_target_voters || 12450),
        });
      }
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    }
  }, [clientId]);

  const loadVotersList = useCallback(() => {
    try {
      const res = dbService.getPollingDayVoters(clientId, undefined, {
        search: voterSearch,
        status: statusFilter,
        boothId: selectedBoothFilter,
        page: voterPage,
        pageSize: 15,
      });
      setVoters(res.data);
      setVoterTotalPages(res.totalPages);
    } catch (err) {
      console.error("Failed to load polling voters:", err);
    }
  }, [clientId, voterSearch, statusFilter, selectedBoothFilter, voterPage]);

  useEffect(() => {
    loadDashboard();
    loadVotersList();
    const interval = setInterval(() => {
      loadDashboard();
    }, 25000);
    return () => clearInterval(interval);
  }, [loadDashboard, loadVotersList]);

  // One-Tap Polling Status Update Handler (Section 11, 12, 14, 15)
  const handleUpdateStatus = (voterId: string, voterName: string, newStatus: PollingVoterStatus) => {
    // Optimistic UI update
    setVoters((prev) =>
      prev.map((v) => (v.id === voterId ? { ...v, polling_status: newStatus } : v))
    );
    setLastUpdatedVoter({ id: voterId, name: voterName });

    startTransition(() => {
      dbService.updatePollingVoterStatus(
        clientId,
        voterId,
        newStatus,
        undefined,
        undefined,
        "candidate_admin"
      );
      loadDashboard();
      success(
        newStatus === "VOTE_CAST" ? "Vote Cast Recorded" : "Status Set to Pending",
        `${voterName} status updated.`
      );
    });
  };

  // Undo Handler (Section 14)
  const handleUndo = (voterId: string) => {
    dbService.undoPollingVoterStatus(clientId, voterId, user?.full_name || "Candidate Admin");
    setLastUpdatedVoter(null);
    loadDashboard();
    loadVotersList();
    success("Action Undone", "Voter polling status reverted.");
  };

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

  if (!stats) return null;

  const totalVoters = stats.totalVoters || 10000;
  const voteCast = stats.voteCastCount || 0;
  const pending = stats.pendingVoters || 0;
  const notReported = stats.notReportedCount || 0;
  const progressPercent = stats.turnoutPercentage || 0;

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      {/* 1. TOP: CANDIDATE BRANDING POSTER (Section 4, 5, 10) */}
      <CandidatePosterBanner
        client={client}
        moduleTitle={isHindi ? "मतदान दिवस वार रूम" : "Polling Day War Room"}
        badgeText={isHindi ? "मतदान दिवस लाइव" : "Polling Day Live"}
      />

      {/* 2. OPERATIONAL SUMMARY HEADER (Section 10) */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-none">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#2E7D32] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#714B67]">
              {isHindi ? "मतदान दिवस परिचालन" : "Polling Day Operations"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#212529] tracking-tight mt-1">
            {stats.pollingDay?.election_date || stats.pollingDay?.polling_date || client?.election_date || "12 December 2026"} • {stats.pollingDay?.title || "General Election Polling Day"}
          </h1>
          <p className="text-xs sm:text-sm text-[#6C757D] mt-0.5">
            {client?.election_type} • {client?.location} • {boothsList.length} Booths Mapped
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsConfigOpen(true)}
            leftIcon={<Calendar className="w-4 h-4 text-[#714B67]" />}
          >
            {isHindi ? "तिथि कॉन्फ़िगर करें" : "Configure Date"}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="text-[#C62828] border-[#FFCDD2] hover:bg-[#FFEBEE]"
            onClick={() => setIsLockConfirmOpen(true)}
            leftIcon={<Lock className="w-4 h-4" />}
          >
            {isHindi ? "मतदान दिवस लॉक करें" : "Lock Operations"}
          </Button>
        </div>
      </div>

      {/* 3. 5 CORE POLLING DAY KPIS (Section 16) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title={isHindi ? "कुल मतदाता" : "Total Voters"}
          value={formatNumber(totalVoters)}
          icon={Users}
          iconColor="text-[#714B67]"
          iconBg="bg-[#F1ECEF]"
        />
        <StatCard
          title={isHindi ? "मतदान दर्ज" : "Vote Cast"}
          value={formatNumber(voteCast)}
          subValue={`${progressPercent}% reported`}
          icon={CheckCircle2}
          iconColor="text-[#2E7D32]"
          iconBg="bg-[#E8F5E9]"
          trend={{ value: `${progressPercent}%`, isPositive: true, label: "Turnout" }}
        />
        <StatCard
          title={isHindi ? "लंबित मतदाता" : "Pending"}
          value={formatNumber(pending)}
          icon={Clock}
          iconColor="text-[#E65100]"
          iconBg="bg-[#FFF3E0]"
        />
        <StatCard
          title={isHindi ? "अप्रतिवेदित" : "Not Reported"}
          value={formatNumber(notReported)}
          icon={AlertCircle}
          iconColor="text-[#6C757D]"
          iconBg="bg-[#F8F9FA]"
        />
        <StatCard
          title={isHindi ? "मतदान प्रगति" : "Progress %"}
          value={`${progressPercent}%`}
          subValue={`${voteCast}/${totalVoters}`}
          icon={Radio}
          iconColor="text-[#714B67]"
          iconBg="bg-[#F1ECEF]"
          trend={{ value: `${progressPercent}%`, isPositive: true }}
        />
      </div>

      {/* 4. POLLING DAY MODULE NAVIGATION TABS (Section 10 & 11) */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-[#DEE2E6] pb-2 text-xs sm:text-sm font-bold no-scrollbar">
        <button
          onClick={() => setActiveTab("voter_turnout")}
          className={`px-4 py-2 rounded-[4px] transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === "voter_turnout"
              ? "bg-[#714B67] text-white"
              : "bg-white border border-[#DEE2E6] text-[#495057] hover:bg-[#F8F9FA]"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{isHindi ? "मतदाता पहचान एवं स्थिति दर्ज" : "Voter Search & Turnout"}</span>
        </button>

        <button
          onClick={() => setActiveTab("booths")}
          className={`px-4 py-2 rounded-[4px] transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === "booths"
              ? "bg-[#714B67] text-white"
              : "bg-white border border-[#DEE2E6] text-[#495057] hover:bg-[#F8F9FA]"
          }`}
        >
          <Building className="w-4 h-4" />
          <span>{isHindi ? "बूथवार एनालिटिक्स" : "Booth Analytics"}</span>
        </button>

        <button
          onClick={() => setActiveTab("volunteers")}
          className={`px-4 py-2 rounded-[4px] transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === "volunteers"
              ? "bg-[#714B67] text-white"
              : "bg-white border border-[#DEE2E6] text-[#495057] hover:bg-[#F8F9FA]"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>{isHindi ? "स्वयंसेवक गतिविधि" : "Volunteer Analytics"}</span>
        </button>

        <button
          onClick={() => setActiveTab("hourly")}
          className={`px-4 py-2 rounded-[4px] transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === "hourly"
              ? "bg-[#714B67] text-white"
              : "bg-white border border-[#DEE2E6] text-[#495057] hover:bg-[#F8F9FA]"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{isHindi ? "प्रति घंटा एनालिटिक्स" : "Hourly Analytics"}</span>
        </button>

        <button
          onClick={() => setActiveTab("timeline")}
          className={`px-4 py-2 rounded-[4px] transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === "timeline"
              ? "bg-[#714B67] text-white"
              : "bg-white border border-[#DEE2E6] text-[#495057] hover:bg-[#F8F9FA]"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{isHindi ? "लाइव गतिविधि लॉग" : "Activity Log"}</span>
        </button>
      </div>

      {/* 5. TAB 1: FAST VOTER IDENTIFICATION & STATUS UPDATE (Section 11, 12, 13, 14) */}
      {activeTab === "voter_turnout" && (
        <div className="space-y-4">
          {/* Fast Search & Booth Filter Bar */}
          <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-4 flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#6C757D]" />
              <input
                type="text"
                placeholder={isHindi ? "मतदाता नाम, EPIC वोटर आईडी, मोबाइल या बूथ नंबर से खोजें..." : "Search voter by name, voter ID (EPIC), mobile, or booth..."}
                value={voterSearch}
                onChange={(e) => {
                  setVoterSearch(e.target.value);
                  setVoterPage(1);
                }}
                className="w-full h-10 pl-9 pr-8 bg-white border border-[#DEE2E6] rounded-[4px] text-sm text-[#212529] focus:outline-none focus:border-[#714B67]"
              />
              {voterSearch && (
                <button
                  onClick={() => setVoterSearch("")}
                  className="absolute right-2.5 top-2.5 text-[#6C757D] hover:text-[#212529]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={selectedBoothFilter}
                onChange={(e) => {
                  setSelectedBoothFilter(e.target.value);
                  setVoterPage(1);
                }}
                className="h-10 px-3 bg-white border border-[#DEE2E6] rounded-[4px] text-xs sm:text-sm text-[#212529] focus:outline-none focus:border-[#714B67]"
              >
                <option value="all">All Booths ({boothsList.length})</option>
                {boothsList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.booth_number} - {b.booth_name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setVoterPage(1);
                }}
                className="h-10 px-3 bg-white border border-[#DEE2E6] rounded-[4px] text-xs sm:text-sm text-[#212529] focus:outline-none focus:border-[#714B67]"
              >
                <option value="ALL">All Statuses</option>
                <option value="VOTE_CAST">VOTE CAST (मतदान दर्ज)</option>
                <option value="PENDING">PENDING (लंबित)</option>
                <option value="NOT_REPORTED">NOT REPORTED (अप्रतिवेदित)</option>
              </select>
            </div>
          </div>

          {/* Undo Banner if recent action exists */}
          {lastUpdatedVoter && (
            <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-[4px] p-3 flex items-center justify-between text-xs sm:text-sm text-[#2E7D32]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>
                  Updated status for <strong>{lastUpdatedVoter.name}</strong>
                </span>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 text-xs font-bold text-[#714B67] border-[#D9CAD5]"
                onClick={() => handleUndo(lastUpdatedVoter.id)}
                leftIcon={<RotateCcw className="w-3 h-3" />}
              >
                {isHindi ? "पूर्ववत करें (Undo)" : "Undo"}
              </Button>
            </div>
          )}

          {/* Voter Fast Action Cards / Table (Section 11, 12, 14) */}
          <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
            <div className="overflow-x-auto">
              <table className="odoo-table">
                <thead>
                  <tr>
                    <th>Voter Name & ID</th>
                    <th>Booth / Station</th>
                    <th>Area / Locality</th>
                    <th>Current Polling Status</th>
                    <th className="text-right">Quick Polling Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {voters.map((v) => {
                    const isVoteCast = v.polling_status === "VOTE_CAST" || v.polling_status === "VOTING_REPORTED";
                    const isPending = v.polling_status === "PENDING";
                    const isNotReported = v.polling_status === "NOT_REPORTED";

                    return (
                      <tr
                        key={v.id}
                        className={isVoteCast ? "bg-[#FAFCFA]" : "hover:bg-[#FAF7F9]"}
                      >
                        <td>
                          <p className="font-bold text-[#212529]">{v.name}</p>
                          <div className="flex items-center gap-2 text-xs text-[#6C757D] font-mono mt-0.5">
                            <span className="font-bold text-[#714B67]">{v.voter_id_card}</span>
                            {v.mobile && <span>• {v.mobile}</span>}
                          </div>
                        </td>
                        <td className="text-xs sm:text-sm text-[#495057]">
                          <span className="font-semibold text-[#212529]">{v.booth_number}</span>
                          <p className="text-xs text-[#6C757D]">{v.booth_name}</p>
                        </td>
                        <td className="text-xs sm:text-sm text-[#6C757D]">
                          {v.area_name || v.address || "General"}
                        </td>
                        <td>
                          {isVoteCast ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[3px] text-xs font-bold bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {isHindi ? "मतदान दर्ज" : "VOTE CAST"}
                            </span>
                          ) : isNotReported ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-[3px] text-xs font-medium bg-[#F8F9FA] text-[#6C757D] border border-[#DEE2E6]">
                              {isHindi ? "अप्रतिवेदित" : "NOT REPORTED"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-[3px] text-xs font-bold bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]">
                              {isHindi ? "लंबित" : "PENDING"}
                            </span>
                          )}
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant={isVoteCast ? "secondary" : "primary"}
                              className={`h-9 px-3 text-xs font-bold ${
                                isVoteCast
                                  ? "bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9] hover:bg-[#C8E6C9]"
                                  : "bg-[#2E7D32] hover:bg-[#1B5E20] text-white border-none"
                              }`}
                              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                              onClick={() => handleUpdateStatus(v.id, v.name, "VOTE_CAST")}
                            >
                              {isHindi ? "मतदान दर्ज" : "VOTE CAST"}
                            </Button>

                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-9 px-3 text-xs font-bold text-[#E65100] border-[#FFE0B2] hover:bg-[#FFF3E0]"
                              onClick={() => handleUpdateStatus(v.id, v.name, "PENDING")}
                            >
                              {isHindi ? "लंबित" : "PENDING"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {voters.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-sm text-[#6C757D]">
                        No electors found matching search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {voterTotalPages > 1 && (
              <div className="p-3 border-t border-[#DEE2E6] flex items-center justify-between text-xs text-[#6C757D]">
                <span>Page {voterPage} of {voterTotalPages}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={voterPage === 1}
                    onClick={() => setVoterPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={voterPage >= voterTotalPages}
                    onClick={() => setVoterPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. TAB 2: BOOTH ANALYTICS TABLE (Section 17) */}
      {activeTab === "booths" && (
        <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
          <div className="px-5 py-3.5 border-b border-[#DEE2E6] flex items-center justify-between bg-[#F8F9FA]">
            <div>
              <h2 className="text-base font-bold text-[#212529]">
                {isHindi ? "बूथवार मतदान विश्लेषण" : "Booth-Wise Turnout Analytics"}
              </h2>
              <p className="text-xs sm:text-sm text-[#6C757D]">
                Real-time turnout, pending count, and cadre progress per polling booth
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="odoo-table">
              <thead>
                <tr>
                  <th>Polling Booth</th>
                  <th>Area / Sector</th>
                  <th className="text-center">Total Voters</th>
                  <th className="text-center">Vote Cast</th>
                  <th className="text-center">Pending</th>
                  <th className="text-center">Not Reported</th>
                  <th>Progress %</th>
                </tr>
              </thead>
              <tbody>
                {stats.boothStats.map((booth: any) => (
                  <tr key={booth.booth_id}>
                    <td>
                      <p className="font-bold text-[#212529]">{booth.booth_number}</p>
                      <p className="text-xs text-[#6C757D]">{booth.booth_name}</p>
                    </td>
                    <td className="text-xs sm:text-sm text-[#495057]">{booth.area_name}</td>
                    <td className="text-center text-sm font-bold text-[#212529]">
                      {booth.total_voters}
                    </td>
                    <td className="text-center text-sm font-bold text-[#2E7D32]">
                      {booth.vote_cast_count || booth.voting_reported_count || 0}
                    </td>
                    <td className="text-center text-sm font-bold text-[#E65100]">
                      {booth.pending_count}
                    </td>
                    <td className="text-center text-sm text-[#6C757D]">
                      {booth.not_reported_count || 0}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-[#E9ECEF] rounded overflow-hidden">
                          <div
                            className="h-full bg-[#714B67] rounded"
                            style={{ width: `${booth.progress_percentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-[#714B67] font-mono">
                          {booth.progress_percentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. TAB 3: VOLUNTEER ACTIVITY ANALYTICS (Section 18) */}
      {activeTab === "volunteers" && (
        <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
          <div className="px-5 py-3.5 border-b border-[#DEE2E6] flex items-center justify-between bg-[#F8F9FA]">
            <div>
              <h2 className="text-base font-bold text-[#212529]">
                {isHindi ? "स्वयंसेवक फील्ड गतिविधि रिपोर्ट" : "Volunteer Field Operational Activity"}
              </h2>
              <p className="text-xs sm:text-sm text-[#6C757D]">
                Updates recorded today by assigned field volunteers
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="odoo-table">
              <thead>
                <tr>
                  <th>Volunteer Name</th>
                  <th>Assigned Booth</th>
                  <th>Assigned Area</th>
                  <th className="text-center">Updates Today</th>
                  <th className="text-center">Vote Cast Updates</th>
                  <th className="text-center">Pending Updates</th>
                  <th className="text-right">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {stats.volunteerStats.map((vol: any) => (
                  <tr key={vol.volunteer_id}>
                    <td>
                      <p className="font-bold text-[#212529]">{vol.name}</p>
                      <p className="text-xs text-[#6C757D] font-mono">{vol.mobile}</p>
                    </td>
                    <td className="text-xs sm:text-sm font-semibold text-[#714B67]">
                      {vol.assigned_booth_name}
                    </td>
                    <td className="text-xs sm:text-sm text-[#495057]">
                      {vol.assigned_area_name}
                    </td>
                    <td className="text-center text-sm font-bold text-[#212529]">
                      {vol.updates_today}
                    </td>
                    <td className="text-center text-sm font-bold text-[#2E7D32]">
                      {vol.vote_cast_updates || vol.updates_today}
                    </td>
                    <td className="text-center text-sm font-bold text-[#E65100]">
                      {vol.pending_updates || 0}
                    </td>
                    <td className="text-right text-xs font-mono text-[#6C757D]">
                      {vol.last_update_time ? formatDateTime(vol.last_update_time) : "Active Today"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. TAB 4: HOURLY POLLING ANALYTICS (Section 19) */}
      {activeTab === "hourly" && (
        <Card padding="md" className="w-full overflow-hidden">
          <CardHeader
            title={isHindi ? "प्रति घंटा मतदान अपडेट्स (सुबह 8 – शाम 5)" : "Hourly Polling Updates (8 AM – 5 PM)"}
            subtitle={isHindi ? "प्रत्येक घंटे दर्ज किए गए मतदान की संख्या" : "Operational updates recorded during each hour of election day"}
          />
          <div className="h-72 w-full mt-4 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.hourlyActivity}>
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6C757D" }} />
                <YAxis tick={{ fontSize: 12, fill: "#6C757D" }} />
                <Tooltip
                  formatter={(val: any) => [`${val} Updates`, "Hourly Count"]}
                  contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#DEE2E6", borderRadius: 4, fontSize: 13 }}
                />
                <Bar dataKey="count" fill="#714B67" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* 9. TAB 5: POLLING DAY LIVE ACTIVITY LOG (Section 20) */}
      {activeTab === "timeline" && (
        <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
          <div className="px-5 py-3.5 border-b border-[#DEE2E6] flex items-center justify-between bg-[#F8F9FA]">
            <div>
              <h2 className="text-base font-bold text-[#212529]">
                {isHindi ? "लाइव गतिविधि ऑडिट ट्रेल" : "Live Activity Audit Log"}
              </h2>
              <p className="text-xs sm:text-sm text-[#6C757D]">
                Immutable timestamped trail of all polling day status changes
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="odoo-table">
              <thead>
                <tr>
                  <th>Voter</th>
                  <th>Booth</th>
                  <th>Status</th>
                  <th>Updated By</th>
                  <th>Role</th>
                  <th className="text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUpdates.map((u: any) => (
                  <tr key={u.id}>
                    <td>
                      <p className="font-bold text-[#212529]">{u.voter_name}</p>
                      <p className="text-xs text-[#6C757D] font-mono">{u.voter_id_card}</p>
                    </td>
                    <td className="text-xs sm:text-sm text-[#495057]">{u.booth_name}</td>
                    <td>
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
                        {u.status === "VOTE_CAST" || u.status === "VOTING_REPORTED" ? "VOTE CAST" : u.status}
                      </span>
                    </td>
                    <td className="text-xs sm:text-sm font-medium text-[#212529]">{u.updated_by}</td>
                    <td className="text-xs text-[#6C757D]">{u.updated_by_role || "Volunteer"}</td>
                    <td className="text-right text-xs text-[#6C757D] font-mono">
                      {formatDateTime(u.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Polling Configuration Modal */}
      <Modal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        title="Configure Polling Day Parameters"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#212529] mb-1.5">
              Election / Polling Title
            </label>
            <Input
              value={configForm.title}
              onChange={(e) => setConfigForm({ ...configForm, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#212529] mb-1.5">
              Polling Date
            </label>
            <Input
              value={configForm.polling_date}
              onChange={(e) => setConfigForm({ ...configForm, polling_date: e.target.value })}
              placeholder="e.g. 12 December 2026"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#212529] mb-1.5">
                Start Time
              </label>
              <Input
                value={configForm.start_time}
                onChange={(e) => setConfigForm({ ...configForm, start_time: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#212529] mb-1.5">
                End Time
              </label>
              <Input
                value={configForm.end_time}
                onChange={(e) => setConfigForm({ ...configForm, end_time: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#DEE2E6]">
            <Button variant="secondary" onClick={() => setIsConfigOpen(false)}>
              {t("cancel")}
            </Button>
            <Button variant="primary" onClick={handleSaveConfig}>
              Save Configuration
            </Button>
          </div>
        </div>
      </Modal>

      {/* Lock Polling Day Confirm Dialog */}
      <ConfirmDialog
        isOpen={isLockConfirmOpen}
        onClose={() => setIsLockConfirmOpen(false)}
        onConfirm={handleLockPollingDay}
        title="Lock Polling Day Operations?"
        message="Locking operations will finalize all polling counts and preserve reports for audit compliance."
        confirmText="Lock Operations"
        variant="danger"
      />
    </div>
  );
}
