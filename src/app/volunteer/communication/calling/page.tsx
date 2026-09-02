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
import { CallLogModal } from "@/components/communication/CallLogModal";
import {
  Phone,
  PhoneCall,
  Search,
  ChevronLeft,
  CheckCircle2,
  PhoneForwarded,
  Clock,
  PhoneOff,
} from "lucide-react";

export default function VolunteerCallingPage() {
  const { client, volunteer, user } = useAuth();
  const { t, language } = useLanguage();
  const isHindi = language === "hi";

  const clientId = client?.id || user?.client_id || "";
  const volunteerId = volunteer?.id || user?.id || "vol-1";
  const assignedBoothName = volunteer?.assigned_booth_name || "Booth 101";

  const [voters, setVoters] = useState<Voter[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [callingVoter, setCallingVoter] = useState<Voter | null>(null);

  const loadData = useCallback(() => {
    const res = dbService.getCallingList(clientId, volunteerId, {
      search,
      callStatus: statusFilter,
      pageSize: 100,
    });
    setVoters(res.data);
  }, [clientId, volunteerId, search, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDial = (voter: Voter) => {
    if (voter.mobile) {
      window.location.href = `tel:${voter.mobile}`;
    }
    setCallingVoter(voter);
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-10 w-full overflow-hidden">
      {/* 1. TOP: CANDIDATE BRANDING POSTER */}
      <CandidatePosterBanner
        client={client}
        moduleTitle={isHindi ? "बूथ कॉलिंग कतार" : "Booth Calling Queue"}
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
        <span className="text-xs font-bold text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-1 rounded border border-[#C8E6C9]">
          {voters.filter((v) => !!v.mobile).length} Call Ready
        </span>
      </div>

      {/* 3. SEARCH & STATUS FILTER PILLS */}
      <div className="space-y-2">
        <div className="relative">
          <input
            type="text"
            placeholder={isHindi ? "मतदाता खोजें (नाम / मोबाइल)..." : "Search voter by name, phone..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 bg-white border border-[#DEE2E6] rounded-[4px] text-sm px-3 pl-9 text-[#212529] focus:outline-none focus:border-[#714B67]"
          />
          <Search className="w-4 h-4 text-[#6C757D] absolute left-3 top-3.5" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-[4px] font-semibold transition-colors ${
              statusFilter === "all"
                ? "bg-[#714B67] text-white"
                : "bg-white border border-[#DEE2E6] text-[#495057]"
            }`}
          >
            All ({voters.length})
          </button>
          <button
            onClick={() => setStatusFilter("Not Called")}
            className={`px-3 py-1.5 rounded-[4px] font-semibold transition-colors ${
              statusFilter === "Not Called"
                ? "bg-[#714B67] text-white"
                : "bg-white border border-[#DEE2E6] text-[#495057]"
            }`}
          >
            Not Called
          </button>
          <button
            onClick={() => setStatusFilter("Connected")}
            className={`px-3 py-1.5 rounded-[4px] font-semibold transition-colors ${
              statusFilter === "Connected"
                ? "bg-[#2E7D32] text-white"
                : "bg-white border border-[#DEE2E6] text-[#495057]"
            }`}
          >
            Connected
          </button>
          <button
            onClick={() => setStatusFilter("Follow-up Required")}
            className={`px-3 py-1.5 rounded-[4px] font-semibold transition-colors ${
              statusFilter === "Follow-up Required"
                ? "bg-[#E65100] text-white"
                : "bg-white border border-[#DEE2E6] text-[#495057]"
            }`}
          >
            Follow-up
          </button>
        </div>
      </div>

      {/* 4. CALLING QUEUE LIST */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] divide-y divide-[#DEE2E6] shadow-none overflow-hidden">
        {voters.map((voter) => {
          const hasPhone = !!voter.mobile;
          return (
            <div key={voter.id} className="p-3.5 hover:bg-[#F8F9FA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#212529]">{voter.name}</span>
                  <span className="font-mono text-xs font-bold text-[#714B67]">{voter.voter_id_card}</span>
                </div>
                <p className="text-xs text-[#6C757D] font-mono mt-0.5">
                  {voter.mobile ? `📞 ${voter.mobile}` : "No Phone"} • {voter.booth_number}
                </p>

                {voter.last_call_status && (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.2 rounded mt-1 border ${
                      voter.last_call_status === "Connected"
                        ? "bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]"
                        : voter.last_call_status === "Follow-up Required"
                        ? "bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]"
                        : "bg-[#F8F9FA] text-[#495057] border-[#DEE2E6]"
                    }`}
                  >
                    {voter.last_call_status === "Connected" && <CheckCircle2 className="w-3 h-3" />}
                    {voter.last_call_status === "Follow-up Required" && <PhoneForwarded className="w-3 h-3" />}
                    <span>{voter.last_call_status}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="md"
                  variant={hasPhone ? "primary" : "secondary"}
                  disabled={!hasPhone}
                  onClick={() => handleDial(voter)}
                  className={`w-full sm:w-auto font-bold ${
                    hasPhone ? "bg-[#2E7D32] hover:bg-[#256628] text-white" : ""
                  }`}
                  leftIcon={<PhoneCall className="w-4 h-4" />}
                >
                  {isHindi ? "कॉल करें" : "Call"}
                </Button>
              </div>
            </div>
          );
        })}

        {voters.length === 0 && (
          <div className="text-center py-12 text-xs text-[#6C757D]">
            {t("noVotersFound")}
          </div>
        )}
      </div>

      {/* Call Result Logger Modal */}
      {callingVoter && (
        <CallLogModal
          isOpen={true}
          onClose={() => setCallingVoter(null)}
          voter={callingVoter}
          onLogged={loadData}
        />
      )}
    </div>
  );
}
