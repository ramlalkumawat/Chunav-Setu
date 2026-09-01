"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { useLanguage } from "@/lib/i18n";
import { useToast } from "@/lib/context/toast-context";
import { dbService } from "@/lib/store/data-service";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PollingVoterStatus } from "@/lib/types";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  MapPin,
  Send,
  Building,
  Calendar,
  X,
  User,
  Filter,
} from "lucide-react";

export default function VolunteerPollingDayPage() {
  const { client, user } = useAuth();
  const { t, language } = useLanguage();
  const { success, error: toastError } = useToast();
  const [, startTransition] = useTransition();

  const clientId = client?.id || "client-1";
  const volunteerId = user?.id || "vol-1";
  const volunteerName = user?.full_name || "Amit Kumar";

  // Data state
  const [pollingDay, setPollingDay] = useState<any>(null);
  const [volunteer, setVolunteer] = useState<any>(null);
  const [voters, setVoters] = useState<any[]>([]);
  const [counts, setCounts] = useState({ total: 0, reported: 0, pending: 0, followUp: 0 });

  // Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "VOTING_REPORTED" | "FOLLOW_UP_REQUIRED">("ALL");

  // Follow-up modal state
  const [selectedVoter, setSelectedVoter] = useState<any>(null);
  const [followUpReason, setFollowUpReason] = useState("Transport Assistance Required");
  const [followUpNote, setFollowUpNote] = useState("");
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);

  // Optimistic update timestamps state: voterId -> formatted time
  const [updatedTimestamps, setUpdatedTimestamps] = useState<Record<string, string>>({});

  const loadData = useCallback(() => {
    const pd = dbService.getPollingDay(clientId);
    setPollingDay(pd);

    const vol = dbService.getVolunteerById(clientId, volunteerId) || {
      id: volunteerId,
      name: volunteerName,
      assigned_booth_name: "Booth 101",
      assigned_area_name: "Shastri Nagar",
    };
    setVolunteer(vol);

    const res = dbService.getPollingDayVoters(clientId, volunteerId, {
      search,
      status: statusFilter,
      pageSize: 100,
    });
    setVoters(res.data);

    // Compute booth summary totals
    const allRes = dbService.getPollingDayVoters(clientId, volunteerId, { pageSize: 500 });
    const all = allRes.data;
    const reported = all.filter((v: any) => v.polling_status === "VOTING_REPORTED").length;
    const followUp = all.filter((v: any) => v.polling_status === "FOLLOW_UP_REQUIRED").length;
    const pending = all.filter((v: any) => v.polling_status === "PENDING").length;

    setCounts({
      total: all.length,
      reported,
      pending,
      followUp,
    });
  }, [clientId, volunteerId, volunteerName, search, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // One-tap rapid "Reported" action
  const handleQuickReport = (voterId: string) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Optimistically update local state immediately
    setUpdatedTimestamps((prev) => ({ ...prev, [voterId]: timeString }));
    setVoters((prev) =>
      prev.map((v) => (v.id === voterId ? { ...v, polling_status: "VOTING_REPORTED" as PollingVoterStatus } : v))
    );

    startTransition(() => {
      dbService.updatePollingVoterStatus(clientId, voterId, "VOTING_REPORTED", volunteerId);
      loadData();
      success("Status Recorded", `Turnout reported at ${timeString}`);
    });
  };

  // Open follow-up modal
  const handleOpenFollowUp = (voter: any) => {
    setSelectedVoter(voter);
    setFollowUpReason("Transport Assistance Required");
    setFollowUpNote("");
    setIsFollowUpModalOpen(true);
  };

  // Save follow-up action
  const handleSaveFollowUp = () => {
    if (!selectedVoter) return;

    dbService.createPollingFollowUp(clientId, {
      client_id: clientId,
      campaign_id: "campaign-1",
      polling_day_id: `pd-${clientId}`,
      voter_id: selectedVoter.id,
      voter_name: selectedVoter.name,
      voter_id_card: selectedVoter.voter_id_card,
      booth_id: selectedVoter.booth_id || "booth-1",
      booth_number: selectedVoter.booth_number || "Booth 101",
      booth_name: selectedVoter.booth_name || "Govt School",
      area_name: selectedVoter.area_name || "Shastri Nagar",
      volunteer_id: volunteerId,
      volunteer_name: volunteerName,
      reason: followUpReason,
      note: followUpNote,
    });

    setIsFollowUpModalOpen(false);
    loadData();
    success("Follow-up Logged", "Operational follow-up recorded in war room queue.");
  };

  const followUpReasons = [
    { value: "Transport Assistance Required", label: t("transportNeeded") },
    { value: "Long Queue / Delay at Booth", label: t("queueTooLong") },
    { value: "Out of Station / Travel Delay", label: t("outOfStation") },
    { value: "Requested Candidate Information", label: t("undecidedCallback") },
  ];

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-10 w-full overflow-hidden">
      {/* 1. TOP GREETING & BOOTH BANNER */}
      <div className="bg-[#714B67] text-white rounded-[4px] p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider font-semibold text-white/80">
            {t("goodMorning")}, {volunteerName}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-[3px] text-xs font-bold bg-[#E8F5E9] text-[#2E7D32]">
            {t("pollingDayStatusLive")}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
          {pollingDay?.polling_date || "12 December 2026"} • {t("navPollingDay")}
        </h1>

        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-white/90 mt-1.5">
          <Building className="w-4 h-4 flex-shrink-0" />
          <span className="font-semibold">{t("assignedBoothBadge")}:</span>
          <span>{volunteer?.assigned_booth_name || "Booth 101"} ({volunteer?.assigned_area_name || "Shastri Nagar"})</span>
        </div>

        {/* Mini progress bar */}
        <div className="mt-3 pt-3 border-t border-white/20 grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-[11px] text-white/75 uppercase">Total</p>
            <p className="text-base sm:text-lg font-bold">{counts.total}</p>
          </div>
          <div>
            <p className="text-[11px] text-[#A5D6A7] uppercase">Reported</p>
            <p className="text-base sm:text-lg font-bold text-[#A5D6A7]">{counts.reported}</p>
          </div>
          <div>
            <p className="text-[11px] text-[#FFE082] uppercase">Follow-up</p>
            <p className="text-base sm:text-lg font-bold text-[#FFE082]">{counts.followUp}</p>
          </div>
          <div>
            <p className="text-[11px] text-white/75 uppercase">Pending</p>
            <p className="text-base sm:text-lg font-bold">{counts.pending}</p>
          </div>
        </div>
      </div>

      {/* 2. DEBOUNCED SEARCH INPUT */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-3 text-[#6C757D]" />
        <input
          type="text"
          placeholder={t("searchVoterPollingPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-11 pr-4 bg-white border border-[#DEE2E6] rounded-[4px] text-sm text-[#212529] placeholder-[#ADB5BD] focus:outline-none focus:border-[#714B67] shadow-none"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-3 text-[#6C757D] hover:text-[#212529]"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 3. QUICK FILTER PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => setStatusFilter("ALL")}
          className={`px-3 py-1.5 rounded-[4px] text-xs font-bold border transition-colors whitespace-nowrap ${
            statusFilter === "ALL"
              ? "bg-[#714B67] text-white border-[#714B67]"
              : "bg-white text-[#495057] border-[#DEE2E6] hover:bg-[#F8F9FA]"
          }`}
        >
          {t("all")} ({counts.total})
        </button>
        <button
          onClick={() => setStatusFilter("PENDING")}
          className={`px-3 py-1.5 rounded-[4px] text-xs font-bold border transition-colors whitespace-nowrap ${
            statusFilter === "PENDING"
              ? "bg-[#714B67] text-white border-[#714B67]"
              : "bg-white text-[#495057] border-[#DEE2E6] hover:bg-[#F8F9FA]"
          }`}
        >
          {t("pending")} ({counts.pending})
        </button>
        <button
          onClick={() => setStatusFilter("VOTING_REPORTED")}
          className={`px-3 py-1.5 rounded-[4px] text-xs font-bold border transition-colors whitespace-nowrap ${
            statusFilter === "VOTING_REPORTED"
              ? "bg-[#2E7D32] text-white border-[#2E7D32]"
              : "bg-white text-[#2E7D32] border-[#C8E6C9] hover:bg-[#E8F5E9]"
          }`}
        >
          {t("votingReportedStatus")} ({counts.reported})
        </button>
        <button
          onClick={() => setStatusFilter("FOLLOW_UP_REQUIRED")}
          className={`px-3 py-1.5 rounded-[4px] text-xs font-bold border transition-colors whitespace-nowrap ${
            statusFilter === "FOLLOW_UP_REQUIRED"
              ? "bg-[#E65100] text-white border-[#E65100]"
              : "bg-white text-[#E65100] border-[#FFE0B2] hover:bg-[#FFF3E0]"
          }`}
        >
          {t("followUpButton")} ({counts.followUp})
        </button>
      </div>

      {/* 4. VOTER CARDS LIST */}
      <div className="space-y-3">
        {voters.map((v) => {
          const isReported = v.polling_status === "VOTING_REPORTED";
          const isFollowUp = v.polling_status === "FOLLOW_UP_REQUIRED";
          const optimisticTime = updatedTimestamps[v.id];

          return (
            <div
              key={v.id}
              className={`bg-white border rounded-[4px] p-3.5 transition-all ${
                isReported
                  ? "border-[#C8E6C9] bg-[#FAFCFA]"
                  : isFollowUp
                  ? "border-[#FFE0B2] bg-[#FFFDF9]"
                  : "border-[#DEE2E6]"
              }`}
            >
              {/* Voter Info Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-bold text-[#212529] tracking-tight">{v.name}</h2>
                    <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-[#F1F3F5] text-[#495057] font-semibold">
                      {v.voter_id_card}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#6C757D] mt-1 flex-wrap">
                    <span>
                      {v.age ? `${v.age} yrs` : ""} {v.gender ? `• ${v.gender}` : ""}
                    </span>
                    {v.mobile && (
                      <a href={`tel:${v.mobile}`} className="flex items-center gap-1 text-[#714B67] font-mono hover:underline">
                        <Phone className="w-3 h-3" />
                        {v.mobile}
                      </a>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                {isReported ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[3px] text-xs font-bold bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {optimisticTime ? `${t("updatedAt")} ${optimisticTime}` : t("votingReportedStatus")}
                  </span>
                ) : isFollowUp ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[3px] text-xs font-bold bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2] flex-shrink-0">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {t("followUpRequiredStatus")}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-[3px] text-xs font-medium bg-[#F8F9FA] text-[#6C757D] border border-[#DEE2E6] flex-shrink-0">
                    {t("pendingStatus")}
                  </span>
                )}
              </div>

              {/* Address */}
              {v.address && (
                <div className="flex items-start gap-1 text-xs text-[#6C757D] mt-2">
                  <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span>{v.address}</span>
                </div>
              )}

              {/* Action Buttons: Thumb-Friendly */}
              <div className="mt-3 pt-3 border-t border-[#F1F3F5] grid grid-cols-2 gap-2.5">
                <Button
                  size="md"
                  variant={isReported ? "secondary" : "primary"}
                  className={`h-11 text-sm font-bold w-full justify-center ${
                    isReported
                      ? "bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9] hover:bg-[#C8E6C9]"
                      : "bg-[#2E7D32] hover:bg-[#1B5E20] text-white border-none"
                  }`}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  onClick={() => handleQuickReport(v.id)}
                >
                  {isReported ? t("votingReportedStatus") : t("reportedButton")}
                </Button>

                <Button
                  size="md"
                  variant="secondary"
                  className="h-11 text-sm font-bold w-full justify-center text-[#E65100] border-[#FFE0B2] hover:bg-[#FFF3E0]"
                  leftIcon={<AlertCircle className="w-4 h-4 text-[#E65100]" />}
                  onClick={() => handleOpenFollowUp(v)}
                >
                  {t("followUpButton")}
                </Button>
              </div>
            </div>
          );
        })}

        {voters.length === 0 && (
          <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-8 text-center text-[#6C757D]">
            <Search className="w-8 h-8 mx-auto text-[#ADB5BD] mb-2" />
            <p className="text-sm font-bold text-[#212529]">No voters found</p>
            <p className="text-xs text-[#6C757D] mt-1">Try clearing your search query or filter</p>
          </div>
        )}
      </div>

      {/* 5. FOLLOW-UP BOTTOM SHEET / MODAL */}
      <Modal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        title={`${t("followUpButton")}: ${selectedVoter?.name || ""}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#212529] mb-1.5">
              {t("followUpReason")}
            </label>
            <select
              value={followUpReason}
              onChange={(e) => setFollowUpReason(e.target.value)}
              className="w-full h-11 px-3 bg-white border border-[#DEE2E6] rounded-[4px] text-sm text-[#212529] focus:outline-none focus:border-[#714B67]"
            >
              {followUpReasons.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#212529] mb-1.5">
              Operational Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={followUpNote}
              onChange={(e) => setFollowUpNote(e.target.value)}
              placeholder="e.g. Needs car pickup from main square at 2:00 PM..."
              className="w-full p-3 bg-white border border-[#DEE2E6] rounded-[4px] text-sm text-[#212529] placeholder-[#ADB5BD] focus:outline-none focus:border-[#714B67]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#DEE2E6]">
            <Button variant="secondary" onClick={() => setIsFollowUpModalOpen(false)}>
              {t("cancel")}
            </Button>
            <Button variant="primary" onClick={handleSaveFollowUp}>
              {t("saveFollowUp")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
