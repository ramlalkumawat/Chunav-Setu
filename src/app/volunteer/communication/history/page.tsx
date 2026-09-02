"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/auth-context";
import { useLanguage } from "@/lib/i18n";
import { dbService } from "@/lib/store/data-service";
import { CommunicationLog, CommunicationChannel } from "@/lib/types";
import { CandidatePosterBanner } from "@/components/layout/CandidatePosterBanner";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/utils";
import {
  History,
  Phone,
  MessageSquare,
  FileText,
  ChevronLeft,
  PhoneCall,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default function VolunteerCommunicationHistoryPage() {
  const { client, volunteer, user } = useAuth();
  const { t, language } = useLanguage();
  const isHindi = language === "hi";

  const clientId = client?.id || "client-1";
  const volunteerId = volunteer?.id || user?.id || "vol-1";
  const assignedBoothName = volunteer?.assigned_booth_name || "Booth 101";

  const [logs, setLogs] = useState<CommunicationLog[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | CommunicationChannel>("ALL");

  const loadData = useCallback(() => {
    const res = dbService.getCommunicationLogs(clientId, {
      volunteerId,
      channel: activeTab,
      pageSize: 50,
    });
    setLogs(res.data);
  }, [clientId, volunteerId, activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-10 w-full overflow-hidden">
      {/* 1. TOP: CANDIDATE BRANDING POSTER */}
      <CandidatePosterBanner
        client={client}
        moduleTitle={isHindi ? "मेरी संचार गतिविधि" : "My Communication History"}
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
          {logs.length} Records
        </span>
      </div>

      {/* 3. TABS */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-1 flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`flex-1 py-1.5 px-2 rounded-[3px] text-xs font-bold transition-colors ${
            activeTab === "ALL" ? "bg-[#714B67] text-white" : "text-[#6C757D]"
          }`}
        >
          {t("allChannels")}
        </button>
        <button
          onClick={() => setActiveTab("CALL")}
          className={`flex-1 py-1.5 px-2 rounded-[3px] text-xs font-bold inline-flex items-center justify-center gap-1 transition-colors ${
            activeTab === "CALL" ? "bg-[#2E7D32] text-white" : "text-[#6C757D]"
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Calls</span>
        </button>
        <button
          onClick={() => setActiveTab("WHATSAPP")}
          className={`flex-1 py-1.5 px-2 rounded-[3px] text-xs font-bold inline-flex items-center justify-center gap-1 transition-colors ${
            activeTab === "WHATSAPP" ? "bg-[#25D366] text-white" : "text-[#6C757D]"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </button>
        <button
          onClick={() => setActiveTab("POLLING_SLIP")}
          className={`flex-1 py-1.5 px-2 rounded-[3px] text-xs font-bold inline-flex items-center justify-center gap-1 transition-colors ${
            activeTab === "POLLING_SLIP" ? "bg-[#714B67] text-white" : "text-[#6C757D]"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Slips</span>
        </button>
      </div>

      {/* 4. ACTIVITY LOGS LIST */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] divide-y divide-[#DEE2E6] shadow-none overflow-hidden">
        {logs.map((log) => (
          <div key={log.id} className="p-3 hover:bg-[#F8F9FA] space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                    log.channel === "CALL"
                      ? "bg-[#E8F5E9] text-[#2E7D32]"
                      : log.channel === "WHATSAPP"
                      ? "bg-[#E8F5E9] text-[#25D366]"
                      : "bg-[#F1ECEF] text-[#714B67]"
                  }`}
                >
                  {log.channel}
                </span>
                <span className="font-bold text-sm text-[#212529]">{log.voter_name}</span>
              </div>
              <span className="font-mono text-[10px] text-[#6C757D]">
                {formatDateTime(log.created_at)}
              </span>
            </div>

            <div className="flex items-center justify-between text-[#6C757D]">
              <span className="font-mono">{log.voter_card}</span>
              <span className="font-bold text-[#212529] bg-[#F8F9FA] px-1.5 py-0.2 rounded border border-[#DEE2E6]">
                {log.status}
              </span>
            </div>

            {log.note && (
              <p className="text-[11px] text-[#495057] italic bg-[#F8F9FA] p-1.5 rounded">
                "{log.note}"
              </p>
            )}
          </div>
        ))}

        {logs.length === 0 && (
          <div className="text-center py-12 text-xs text-[#6C757D]">
            No communication records logged yet.
          </div>
        )}
      </div>
    </div>
  );
}
