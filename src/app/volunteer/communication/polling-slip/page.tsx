"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/auth-context";
import { useLanguage } from "@/lib/i18n";
import { useToast } from "@/lib/context/toast-context";
import { dbService } from "@/lib/store/data-service";
import { Voter } from "@/lib/types";
import { CandidatePosterBanner } from "@/components/layout/CandidatePosterBanner";
import { Button } from "@/components/ui/Button";
import { PollingSlipModal } from "@/components/communication/PollingSlipModal";
import {
  FileText,
  Search,
  MessageSquare,
  Printer,
  ChevronLeft,
  Eye,
  Building,
  CheckCircle2,
} from "lucide-react";

export default function VolunteerPollingSlipPage() {
  const { client, volunteer, user } = useAuth();
  const { t, language } = useLanguage();
  const isHindi = language === "hi";

  const clientId = client?.id || user?.client_id || "";
  const volunteerId = volunteer?.id || user?.id || "vol-1";
  const assignedBoothName = volunteer?.assigned_booth_name || "Booth 101";

  const [voters, setVoters] = useState<Voter[]>([]);
  const [search, setSearch] = useState("");
  const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null);

  const loadData = useCallback(() => {
    const res = dbService.getPollingSlipVoters(clientId, volunteerId, {
      search,
      pageSize: 100,
    });
    setVoters(res.data);
  }, [clientId, volunteerId, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-10 w-full overflow-hidden">
      {/* 1. TOP: CANDIDATE BRANDING POSTER */}
      <CandidatePosterBanner
        client={client}
        moduleTitle={isHindi ? "मतदान पर्ची जनरेटर" : "Polling Slip Desk"}
        badgeText={assignedBoothName}
        compact={true}
      />

      {/* 2. TOP NAV HEADER */}
      <div className="flex items-center justify-between gap-2">
        <Link href="/volunteer/communication">
          <Button variant="secondary" size="sm" leftIcon={<ChevronLeft className="w-4 h-4" />}>
            {isHindi ? "संचार हब" : "Back to Hub"}
          </Button>
        </Link>
        <span className="text-xs font-bold text-[#714B67] bg-[#F1ECEF] px-2.5 py-1 rounded border border-[#D9CAD5]">
          {voters.length} {isHindi ? "मतदाता" : "Electors"}
        </span>
      </div>

      {/* 3. SEARCH BAR */}
      <div className="relative">
        <input
          type="text"
          placeholder={isHindi ? "मतदाता खोजें (नाम / EPIC ID / मोबाइल)..." : "Search voter by name, EPIC ID, mobile..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 bg-white border border-[#DEE2E6] rounded-[4px] text-sm px-3 pl-9 text-[#212529] focus:outline-none focus:border-[#714B67]"
        />
        <Search className="w-4 h-4 text-[#6C757D] absolute left-3 top-3.5" />
      </div>

      {/* 4. VOTERS LIST WITH SLIP ACTIONS */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] divide-y divide-[#DEE2E6] shadow-none overflow-hidden">
        {voters.map((voter) => (
          <div key={voter.id} className="p-3.5 hover:bg-[#F8F9FA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#212529]">{voter.name}</span>
                <span className="font-mono text-xs font-bold text-[#714B67]">{voter.voter_id_card}</span>
              </div>
              <p className="text-xs text-[#6C757D] mt-0.5">
                {voter.age ? `${voter.age} yrs` : ""} • {voter.gender || ""} • {voter.booth_number}
              </p>
              {voter.last_slip_generated_at && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2E7D32] mt-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Slip issued
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="primary"
                onClick={() => setSelectedVoter(voter)}
                className="bg-[#714B67] w-full sm:w-auto"
                leftIcon={<Eye className="w-3.5 h-3.5" />}
              >
                {isHindi ? "पर्ची बनाएं" : "Generate Slip"}
              </Button>
            </div>
          </div>
        ))}

        {voters.length === 0 && (
          <div className="text-center py-12 text-xs text-[#6C757D]">
            {t("noVotersFound")}
          </div>
        )}
      </div>

      {/* Polling Slip Modal */}
      {selectedVoter && (
        <PollingSlipModal
          isOpen={true}
          onClose={() => setSelectedVoter(null)}
          voter={selectedVoter}
          client={client}
          onGenerated={loadData}
        />
      )}
    </div>
  );
}
