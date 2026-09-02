"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { useLanguage } from "@/lib/i18n";
import { useToast } from "@/lib/context/toast-context";
import { dbService } from "@/lib/store/data-service";
import { CandidatePosterBanner } from "@/components/layout/CandidatePosterBanner";
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
  Building,
  Calendar,
  X,
  User,
  RotateCcw,
  Sparkles,
  Radio,
} from "lucide-react";

export default function VolunteerPollingDayPage() {
  const { client, user, volunteer: authVolunteer } = useAuth();
  const { t, language } = useLanguage();
  const { success, error: toastError } = useToast();
  const [, startTransition] = useTransition();
  const isHindi = language === "hi";

  const clientId = client?.id || "client-1";
  const volunteerId = authVolunteer?.id || user?.id || "vol-1";
  const volunteerName = authVolunteer?.name || user?.full_name || "Field Volunteer";

  // Data state
  const [pollingDay, setPollingDay] = useState<any>(null);
  const [volunteer, setVolunteer] = useState<any>(null);
  const [voters, setVoters] = useState<any[]>([]);
  const [counts, setCounts] = useState({ total: 0, voteCast: 0, pending: 0, notReported: 0 });

  // Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "VOTE_CAST" | "NOT_REPORTED">("ALL");

  // Undo Tracking state
  const [lastUpdatedVoter, setLastUpdatedVoter] = useState<{ id: string; name: string } | null>(null);

  // Optimistic update timestamps state: voterId -> formatted time
  const [updatedTimestamps, setUpdatedTimestamps] = useState<Record<string, string>>({});

  const loadData = useCallback(() => {
    const pd = dbService.getPollingDay(clientId);
    setPollingDay(pd);

    const vol = dbService.getVolunteerById(clientId, volunteerId) || {
      id: volunteerId,
      name: volunteerName,
      assigned_booth_name: "Booth 101",
      assigned_area_name: "Hazratganj Main",
    };
    setVolunteer(vol);

    // Strict Volunteer Scoping: only fetch voters for this volunteer's assigned booth
    const res = dbService.getPollingDayVoters(clientId, volunteerId, {
      search,
      status: statusFilter,
      pageSize: 150,
    });
    setVoters(res.data);

    // Compute booth summary totals
    const allRes = dbService.getPollingDayVoters(clientId, volunteerId, { pageSize: 500 });
    const all = allRes.data;
    const voteCast = all.filter((v: any) => v.polling_status === "VOTE_CAST" || v.polling_status === "VOTING_REPORTED").length;
    const notReported = all.filter((v: any) => v.polling_status === "NOT_REPORTED").length;
    const pending = Math.max(0, all.length - voteCast - notReported);

    setCounts({
      total: all.length,
      voteCast,
      pending,
      notReported,
    });
  }, [clientId, volunteerId, volunteerName, search, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // One-tap rapid "VOTE CAST" or "PENDING" action (Section 11, 12, 14, 15)
  const handleUpdateStatus = (voterId: string, voterName: string, newStatus: PollingVoterStatus) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Optimistically update local state immediately
    setUpdatedTimestamps((prev) => ({ ...prev, [voterId]: timeString }));
    setVoters((prev) =>
      prev.map((v) => (v.id === voterId ? { ...v, polling_status: newStatus } : v))
    );
    setLastUpdatedVoter({ id: voterId, name: voterName });

    startTransition(() => {
      dbService.updatePollingVoterStatus(
        clientId,
        voterId,
        newStatus,
        volunteerId,
        undefined,
        "volunteer"
      );
      loadData();
      success(
        newStatus === "VOTE_CAST" ? "Vote Cast Recorded" : "Marked Pending",
        `${voterName} status saved at ${timeString}`
      );
    });
  };

  // Undo Handler (Section 14)
  const handleUndo = (voterId: string) => {
    dbService.undoPollingVoterStatus(clientId, voterId, volunteerName);
    setLastUpdatedVoter(null);
    loadData();
    success("Action Undone", "Voter polling status reverted.");
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-10 w-full overflow-hidden">
      {/* 1. TOP: CANDIDATE BRANDING POSTER (Tenant-Specific, Section 4, 5, 10) */}
      <CandidatePosterBanner
        client={client}
        moduleTitle={isHindi ? "मतदान दिवस" : "Polling Day"}
        badgeText={isHindi ? "मतदान दिवस लाइव" : "Polling Day Live"}
        compact={true}
      />

      {/* 2. OPERATIONAL BOOTH SUMMARY CARD (Section 10, 13) */}
      <div className="bg-[#714B67] text-white rounded-[4px] p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider font-semibold text-white/80">
            {volunteerName}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-[3px] text-xs font-bold bg-[#E8F5E9] text-[#2E7D32]">
            {isHindi ? "लाइव मतदान" : "LIVE POLLING"}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
          {pollingDay?.polling_date || client?.election_date || "12 December 2026"}
        </h1>

        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-white/90 mt-1.5">
          <Building className="w-4 h-4 flex-shrink-0" />
          <span className="font-semibold">{isHindi ? "आवंटित बूथ" : "Assigned Booth"}:</span>
          <span>{volunteer?.assigned_booth_name || "Booth 101"} ({volunteer?.assigned_area_name || "Assigned Area"})</span>
        </div>

        {/* Booth Progress Metrics Bar */}
        <div className="mt-3 pt-3 border-t border-white/20 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[11px] text-white/75 uppercase">{isHindi ? "कुल" : "Total"}</p>
            <p className="text-base sm:text-lg font-bold">{counts.total}</p>
          </div>
          <div>
            <p className="text-[11px] text-[#A5D6A7] uppercase">{isHindi ? "मतदान दर्ज" : "Vote Cast"}</p>
            <p className="text-base sm:text-lg font-bold text-[#A5D6A7]">{counts.voteCast}</p>
          </div>
          <div>
            <p className="text-[11px] text-[#FFE082] uppercase">{isHindi ? "लंबित" : "Pending"}</p>
            <p className="text-base sm:text-lg font-bold text-[#FFE082]">{counts.pending}</p>
          </div>
        </div>
      </div>

      {/* 3. FAST DEBOUNCED SEARCH INPUT (Section 11) */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-3 text-[#6C757D]" />
        <input
          type="text"
          placeholder={isHindi ? "मतदाता नाम, EPIC वोटर आईडी या मोबाइल से खोजें..." : "Search voter by name, voter ID (EPIC), or mobile..."}
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

      {/* 4. QUICK FILTER PILLS (Section 12) */}
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
          {isHindi ? "लंबित" : "PENDING"} ({counts.pending})
        </button>
        <button
          onClick={() => setStatusFilter("VOTE_CAST")}
          className={`px-3 py-1.5 rounded-[4px] text-xs font-bold border transition-colors whitespace-nowrap ${
            statusFilter === "VOTE_CAST"
              ? "bg-[#2E7D32] text-white border-[#2E7D32]"
              : "bg-white text-[#2E7D32] border-[#C8E6C9] hover:bg-[#E8F5E9]"
          }`}
        >
          {isHindi ? "मतदान दर्ज" : "VOTE CAST"} ({counts.voteCast})
        </button>
      </div>

      {/* 5. UNDO BANNER (Section 14) */}
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

      {/* 6. VOTER CARDS LIST WITH INSTANT VOTE CAST / PENDING ACTIONS (Section 11, 12, 14) */}
      <div className="space-y-3">
        {voters.map((v) => {
          const isVoteCast = v.polling_status === "VOTE_CAST" || v.polling_status === "VOTING_REPORTED";
          const isPending = v.polling_status === "PENDING";
          const optimisticTime = updatedTimestamps[v.id];

          return (
            <div
              key={v.id}
              className={`bg-white border rounded-[4px] p-3.5 transition-all ${
                isVoteCast
                  ? "border-[#C8E6C9] bg-[#FAFCFA]"
                  : "border-[#DEE2E6]"
              }`}
            >
              {/* Voter Info Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-bold text-[#212529] tracking-tight">{v.name}</h2>
                    <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-[#F1ECEF] text-[#714B67] font-bold">
                      {v.voter_id_card}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#6C757D] mt-1 flex-wrap">
                    <span>{v.booth_number || volunteer?.assigned_booth_name}</span>
                    {v.area_name && <span>• {v.area_name}</span>}
                    {v.mobile && (
                      <a href={`tel:${v.mobile}`} className="flex items-center gap-1 text-[#714B67] font-mono hover:underline">
                        <Phone className="w-3 h-3" />
                        {v.mobile}
                      </a>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                {isVoteCast ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[3px] text-xs font-bold bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {optimisticTime ? `${t("updatedAt")} ${optimisticTime}` : (isHindi ? "मतदान दर्ज" : "VOTE CAST")}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-[3px] text-xs font-bold bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2] flex-shrink-0">
                    {isHindi ? "लंबित" : "PENDING"}
                  </span>
                )}
              </div>

              {/* Action Buttons: Thumb-Friendly Touch Targets (Section 11, 14, 27) */}
              <div className="mt-3 pt-3 border-t border-[#F1F3F5] grid grid-cols-2 gap-2.5">
                <Button
                  size="md"
                  variant={isVoteCast ? "secondary" : "primary"}
                  className={`h-11 text-sm font-bold w-full justify-center ${
                    isVoteCast
                      ? "bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9] hover:bg-[#C8E6C9]"
                      : "bg-[#2E7D32] hover:bg-[#1B5E20] text-white border-none"
                  }`}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  onClick={() => handleUpdateStatus(v.id, v.name, "VOTE_CAST")}
                >
                  {isHindi ? "मतदान दर्ज" : "VOTE CAST"}
                </Button>

                <Button
                  size="md"
                  variant="secondary"
                  className="h-11 text-sm font-bold w-full justify-center text-[#E65100] border-[#FFE0B2] hover:bg-[#FFF3E0]"
                  leftIcon={<Clock className="w-4 h-4 text-[#E65100]" />}
                  onClick={() => handleUpdateStatus(v.id, v.name, "PENDING")}
                >
                  {isHindi ? "लंबित" : "PENDING"}
                </Button>
              </div>
            </div>
          );
        })}

        {voters.length === 0 && (
          <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-8 text-center text-[#6C757D]">
            <Search className="w-8 h-8 mx-auto text-[#ADB5BD] mb-2" />
            <p className="text-sm font-bold text-[#212529]">
              {isHindi ? "कोई मतदाता नहीं मिला" : "No voters found"}
            </p>
            <p className="text-xs text-[#6C757D] mt-1">
              {isHindi ? "कृपया अपनी खोज या फ़िल्टर साफ़ करें" : "Try clearing your search query or status filter"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
