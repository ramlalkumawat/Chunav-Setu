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
import { WhatsAppMessageModal } from "@/components/communication/WhatsAppMessageModal";
import {
  MessageSquare,
  Search,
  ChevronLeft,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export default function VolunteerWhatsAppPage() {
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
    const res = dbService.getWhatsAppList(clientId, volunteerId, {
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
        moduleTitle={isHindi ? "व्हाट्सऐप संदेश केंद्र" : "WhatsApp Outreach"}
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
        <span className="text-xs font-bold text-[#25D366] bg-[#E8F5E9] px-2.5 py-1 rounded border border-[#C8E6C9]">
          WhatsApp Desk
        </span>
      </div>

      {/* 3. SEARCH BAR */}
      <div className="relative">
        <input
          type="text"
          placeholder={isHindi ? "मतदाता खोजें (नाम / मोबाइल)..." : "Search voter by name, mobile..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 bg-white border border-[#DEE2E6] rounded-[4px] text-sm px-3 pl-9 text-[#212529] focus:outline-none focus:border-[#714B67]"
        />
        <Search className="w-4 h-4 text-[#6C757D] absolute left-3 top-3.5" />
      </div>

      {/* 4. WHATSAPP VOTERS LIST */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] divide-y divide-[#DEE2E6] shadow-none overflow-hidden">
        {voters.map((voter) => {
          const hasPhone = !!voter.mobile;
          const isOptedOut = voter.opt_out || voter.whatsapp_allowed === false;
          return (
            <div key={voter.id} className="p-3.5 hover:bg-[#F8F9FA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#212529]">{voter.name}</span>
                  <span className="font-mono text-xs font-bold text-[#714B67]">{voter.voter_id_card}</span>
                </div>
                <p className="text-xs text-[#6C757D] font-mono mt-0.5">
                  {voter.mobile || "No Mobile"} • {voter.booth_number}
                </p>

                {isOptedOut ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C62828] bg-[#FFEBEE] px-2 py-0.2 rounded mt-1 border border-[#FFCDD2]">
                    <AlertTriangle className="w-3 h-3" />
                    Opted Out
                  </span>
                ) : voter.last_whatsapp_at ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.2 rounded mt-1 border border-[#C8E6C9]">
                    <CheckCircle2 className="w-3 h-3" />
                    Sent
                  </span>
                ) : null}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="md"
                  variant={hasPhone && !isOptedOut ? "primary" : "secondary"}
                  disabled={!hasPhone || isOptedOut}
                  onClick={() => setSelectedVoter(voter)}
                  className={`w-full sm:w-auto font-bold ${
                    hasPhone && !isOptedOut
                      ? "bg-[#25D366] hover:bg-[#20bd5a] text-white border-transparent"
                      : ""
                  }`}
                  leftIcon={<MessageSquare className="w-4 h-4" />}
                >
                  {isHindi ? "व्हाट्सऐप संदेश" : "WhatsApp"}
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

      {/* WhatsApp Message Modal */}
      {selectedVoter && (
        <WhatsAppMessageModal
          isOpen={true}
          onClose={() => setSelectedVoter(null)}
          voter={selectedVoter}
          client={client}
          onSent={loadData}
        />
      )}
    </div>
  );
}
