"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/auth-context";
import { useLanguage } from "@/lib/i18n";
import { dbService } from "@/lib/store/data-service";
import { CommunicationSummaryStats, Voter, CommunicationLog } from "@/lib/types";
import { CandidatePosterBanner } from "@/components/layout/CandidatePosterBanner";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { VoterActionBar } from "@/components/communication/VoterActionBar";
import { formatDateTime } from "@/lib/utils";
import {
  Phone,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle2,
  Users,
  Search,
  ArrowRight,
  Radio,
  PhoneCall,
  History,
  Layers,
  Building,
} from "lucide-react";

export default function VolunteerCommunicationHubPage() {
  const { client, volunteer, user } = useAuth();
  const { t, language } = useLanguage();
  const isHindi = language === "hi";

  const clientId = client?.id || "client-1";
  const volunteerId = volunteer?.id || user?.id || "vol-1";
  const volunteerName = volunteer?.name || user?.full_name || "Field Volunteer";
  const assignedBoothName = volunteer?.assigned_booth_name || "Booth 101";

  const [summary, setSummary] = useState<CommunicationSummaryStats | null>(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Voter[]>([]);
  const [recentLogs, setRecentLogs] = useState<CommunicationLog[]>([]);

  const loadData = useCallback(() => {
    const s = dbService.getCommunicationSummary(clientId, volunteerId);
    setSummary(s);
    setRecentLogs(s.recentLogs);
  }, [clientId, volunteerId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }
    const res = dbService.getCallingList(clientId, volunteerId, {
      search,
      pageSize: 4,
    });
    setSearchResults(res.data);
  }, [search, clientId, volunteerId]);

  if (!summary) return null;

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-10 w-full overflow-hidden">
      {/* 1. TOP: CANDIDATE BRANDING POSTER */}
      <CandidatePosterBanner
        client={client}
        moduleTitle={isHindi ? "स्वयंसेवक संचार केंद्र" : "Volunteer Outreach Hub"}
        badgeText={assignedBoothName}
        compact={true}
      />

      {/* 2. SUBNAV PILLS */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-1.5 flex items-center gap-1 overflow-x-auto">
        <Link href="/volunteer/communication" className="flex-1">
          <span className="w-full py-1.5 px-2 rounded-[3px] text-xs font-bold bg-[#714B67] text-white flex items-center justify-center gap-1 shadow-2xs">
            <Layers className="w-3.5 h-3.5" />
            <span>{isHindi ? "होम" : "Hub"}</span>
          </span>
        </Link>
        <Link href="/volunteer/communication/polling-slip" className="flex-1">
          <span className="w-full py-1.5 px-2 rounded-[3px] text-xs font-bold bg-[#F8F9FA] text-[#495057] hover:bg-[#F1ECEF] flex items-center justify-center gap-1">
            <FileText className="w-3.5 h-3.5 text-[#714B67]" />
            <span>{isHindi ? "पर्ची" : "Slip"}</span>
          </span>
        </Link>
        <Link href="/volunteer/communication/calling" className="flex-1">
          <span className="w-full py-1.5 px-2 rounded-[3px] text-xs font-bold bg-[#F8F9FA] text-[#495057] hover:bg-[#E8F5E9] flex items-center justify-center gap-1">
            <Phone className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>{isHindi ? "कॉलिंग" : "Call"}</span>
          </span>
        </Link>
        <Link href="/volunteer/communication/whatsapp" className="flex-1">
          <span className="w-full py-1.5 px-2 rounded-[3px] text-xs font-bold bg-[#F8F9FA] text-[#495057] hover:bg-[#E8F5E9] flex items-center justify-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
            <span>WhatsApp</span>
          </span>
        </Link>
        <Link href="/volunteer/communication/history" className="flex-1">
          <span className="w-full py-1.5 px-2 rounded-[3px] text-xs font-bold bg-[#F8F9FA] text-[#495057] hover:bg-[#F8F9FA] flex items-center justify-center gap-1">
            <History className="w-3.5 h-3.5 text-[#6C757D]" />
            <span>{isHindi ? "इतिहास" : "History"}</span>
          </span>
        </Link>
      </div>

      {/* 3. 4 SUMMARY MINI CARDS */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="p-2.5 bg-white border border-[#DEE2E6] rounded-[4px] shadow-none">
          <Phone className="w-4 h-4 text-[#2E7D32] mx-auto mb-1" />
          <p className="font-mono font-extrabold text-lg text-[#212529]">
            {summary.todaysCalls}
          </p>
          <p className="text-[10px] font-bold text-[#6C757D]">
            {t("myCalls")}
          </p>
        </div>

        <div className="p-2.5 bg-white border border-[#DEE2E6] rounded-[4px] shadow-none">
          <MessageSquare className="w-4 h-4 text-[#25D366] mx-auto mb-1" />
          <p className="font-mono font-extrabold text-lg text-[#212529]">
            {summary.whatsAppActivity}
          </p>
          <p className="text-[10px] font-bold text-[#6C757D]">
            WhatsApp
          </p>
        </div>

        <div className="p-2.5 bg-white border border-[#DEE2E6] rounded-[4px] shadow-none">
          <FileText className="w-4 h-4 text-[#714B67] mx-auto mb-1" />
          <p className="font-mono font-extrabold text-lg text-[#212529]">
            {summary.pollingSlipsGenerated}
          </p>
          <p className="text-[10px] font-bold text-[#6C757D]">
            {isHindi ? "पर्चियां" : "Slips"}
          </p>
        </div>

        <div className="p-2.5 bg-white border border-[#DEE2E6] rounded-[4px] shadow-none">
          <Clock className="w-4 h-4 text-[#E65100] mx-auto mb-1" />
          <p className="font-mono font-extrabold text-lg text-[#212529]">
            {summary.pendingFollowUps}
          </p>
          <p className="text-[10px] font-bold text-[#6C757D]">
            {isHindi ? "फॉलो-अप" : "Pending"}
          </p>
        </div>
      </div>

      {/* 4. QUICK SEARCH FOR BOOTH VOTERS */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-3.5 shadow-none space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm text-[#212529]">
            {isHindi ? "बूथ मतदाता त्वरित संपर्क" : "Assigned Booth Elector Outreach"}
          </h2>
          <span className="text-[11px] font-mono text-[#714B67] font-bold">
            {assignedBoothName}
          </span>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder={isHindi ? "मतदाता खोजें (नाम / EPIC / मोबाइल)..." : "Search voter by name, EPIC, mobile..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px] text-sm px-3 pl-9 text-[#212529] focus:bg-white focus:outline-none focus:border-[#714B67]"
          />
          <Search className="w-4 h-4 text-[#6C757D] absolute left-3 top-3.5" />
        </div>

        {searchResults.length > 0 && (
          <div className="bg-white border border-[#DEE2E6] rounded-[4px] divide-y divide-[#DEE2E6] shadow-sm overflow-hidden animate-in fade-in duration-100">
            {searchResults.map((voter) => (
              <div key={voter.id} className="p-3 hover:bg-[#F8F9FA] space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-sm text-[#212529]">{voter.name}</span>
                    <span className="font-mono text-xs font-bold text-[#714B67] ml-2">
                      {voter.voter_id_card}
                    </span>
                    <p className="text-xs text-[#6C757D] mt-0.5">
                      {voter.age ? `${voter.age} yrs` : ""} • {voter.gender || ""} • {voter.mobile || "No Mobile"}
                    </p>
                  </div>
                </div>

                <VoterActionBar
                  voter={voter}
                  client={client}
                  size="md"
                  layout="grid"
                  onActionComplete={loadData}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. 3 BIG TOUCH ACTION CARDS */}
      <div className="space-y-3">
        {/* Polling Slip Link */}
        <Link href="/volunteer/communication/polling-slip" className="block">
          <div className="p-4 bg-white border border-[#DEE2E6] hover:border-[#714B67] rounded-[4px] shadow-none flex items-center justify-between transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[4px] bg-[#F1ECEF] text-[#714B67] flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#212529]">
                  {isHindi ? "डिजिटल मतदान पर्ची जनरेटर" : "Polling Slip Generator"}
                </h3>
                <p className="text-xs text-[#6C757D]">
                  {isHindi ? "बूथ मतदाताओं की पर्ची बनाएं और व्हाट्सऐप पर भेजें" : "Generate & share slips for assigned booth electors"}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#714B67] flex-shrink-0" />
          </div>
        </Link>

        {/* Calling Queue Link */}
        <Link href="/volunteer/communication/calling" className="block">
          <div className="p-4 bg-white border border-[#DEE2E6] hover:border-[#2E7D32] rounded-[4px] shadow-none flex items-center justify-between transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[4px] bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#212529]">
                  {isHindi ? "बूथ कॉलिंग कतार" : "Booth Calling Queue"}
                </h3>
                <p className="text-xs text-[#6C757D]">
                  {isHindi ? "1-टैप कॉल और परिणाम दर्ज करें (Connected / Follow-up)" : "1-tap direct dialer & outcome logger"}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#2E7D32] flex-shrink-0" />
          </div>
        </Link>

        {/* WhatsApp Sender Link */}
        <Link href="/volunteer/communication/whatsapp" className="block">
          <div className="p-4 bg-white border border-[#DEE2E6] hover:border-[#25D366] rounded-[4px] shadow-none flex items-center justify-between transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[4px] bg-[#E8F5E9] text-[#25D366] flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#212529]">
                  {isHindi ? "व्हाट्सऐप सूचना प्रेषक" : "WhatsApp Outreach"}
                </h3>
                <p className="text-xs text-[#6C757D]">
                  {isHindi ? "मतदान केंद्र व समय की आधिकारिक जानकारी भेजें" : "Send official polling station details & timing"}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#25D366] flex-shrink-0" />
          </div>
        </Link>
      </div>

      {/* 6. RECENT ACTIVITY LOG FOR VOLUNTEER */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-3.5 shadow-none space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#6C757D]">
            {isHindi ? "मेरी हालिया संचार गतिविधि" : "My Recent Communication Log"}
          </h3>
          <Link href="/volunteer/communication/history">
            <span className="text-xs font-bold text-[#714B67]">
              {t("viewAll")}
            </span>
          </Link>
        </div>

        <div className="divide-y divide-[#F1F3F5]">
          {recentLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
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
                  <p className="font-bold text-[#212529] truncate">{log.voter_name}</p>
                </div>
                <p className="text-[11px] text-[#6C757D] mt-0.5 truncate">{log.status} • {log.note || "Logged"}</p>
              </div>
              <span className="font-mono text-[10px] text-[#6C757D] flex-shrink-0">
                {formatDateTime(log.created_at)}
              </span>
            </div>
          ))}
          {recentLogs.length === 0 && (
            <p className="py-6 text-center text-xs text-[#6C757D]">
              No communication records logged yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
