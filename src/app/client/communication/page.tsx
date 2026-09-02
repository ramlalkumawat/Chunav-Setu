"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/auth-context";
import { useLanguage } from "@/lib/i18n";
import { dbService } from "@/lib/store/data-service";
import { CommunicationSummaryStats, Voter, CommunicationLog } from "@/lib/types";
import { CandidatePosterBanner } from "@/components/layout/CandidatePosterBanner";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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
  BarChart3,
  ShieldCheck,
  PhoneCall,
  History,
  Layers,
} from "lucide-react";

export default function CandidateCommunicationPage() {
  const { client } = useAuth();
  const { t, language } = useLanguage();
  const isHindi = language === "hi";
  const clientId = client?.id || "";

  const [summary, setSummary] = useState<CommunicationSummaryStats | null>(null);
  const [quickSearch, setQuickSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Voter[]>([]);
  const [recentLogs, setRecentLogs] = useState<CommunicationLog[]>([]);

  const loadData = useCallback(() => {
    const s = dbService.getCommunicationSummary(clientId);
    setSummary(s);
    setRecentLogs(s.recentLogs);
  }, [clientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!quickSearch.trim()) {
      setSearchResults([]);
      return;
    }
    const res = dbService.getCallingList(clientId, undefined, {
      search: quickSearch,
      pageSize: 5,
    });
    setSearchResults(res.data);
  }, [quickSearch, clientId]);

  if (!summary) return null;

  return (
    <div className="space-y-5 w-full max-w-full overflow-hidden">
      {/* 1. TOP: CANDIDATE BRANDING POSTER */}
      <CandidatePosterBanner
        client={client}
        moduleTitle={isHindi ? "संचार एवं मतदान सेवाएं" : "Communication & Polling Services"}
        badgeText={isHindi ? "आधिकारिक संचार केंद्र" : "Official Outreach Hub"}
      />

      {/* 2. SUBNAV BAR */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-2 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link href="/client/communication">
            <span className="px-3.5 py-2 rounded-[4px] text-xs sm:text-sm font-bold bg-[#714B67] text-white inline-flex items-center gap-1.5 shadow-2xs">
              <Layers className="w-4 h-4" />
              <span>{isHindi ? "सिंहावलोकन" : "Overview"}</span>
            </span>
          </Link>
          <Link href="/client/communication/polling-slip">
            <span className="px-3.5 py-2 rounded-[4px] text-xs sm:text-sm font-bold bg-white text-[#495057] hover:bg-[#F8F9FA] border border-transparent hover:border-[#DEE2E6] inline-flex items-center gap-1.5 transition-colors">
              <FileText className="w-4 h-4 text-[#714B67]" />
              <span>{t("pollingSlip")}</span>
            </span>
          </Link>
          <Link href="/client/communication/calling">
            <span className="px-3.5 py-2 rounded-[4px] text-xs sm:text-sm font-bold bg-white text-[#495057] hover:bg-[#F8F9FA] border border-transparent hover:border-[#DEE2E6] inline-flex items-center gap-1.5 transition-colors">
              <Phone className="w-4 h-4 text-[#2E7D32]" />
              <span>{t("callingService")}</span>
            </span>
          </Link>
          <Link href="/client/communication/whatsapp">
            <span className="px-3.5 py-2 rounded-[4px] text-xs sm:text-sm font-bold bg-white text-[#495057] hover:bg-[#F8F9FA] border border-transparent hover:border-[#DEE2E6] inline-flex items-center gap-1.5 transition-colors">
              <MessageSquare className="w-4 h-4 text-[#25D366]" />
              <span>WhatsApp</span>
            </span>
          </Link>
          <Link href="/client/communication/history">
            <span className="px-3.5 py-2 rounded-[4px] text-xs sm:text-sm font-bold bg-white text-[#495057] hover:bg-[#F8F9FA] border border-transparent hover:border-[#DEE2E6] inline-flex items-center gap-1.5 transition-colors">
              <History className="w-4 h-4 text-[#6C757D]" />
              <span>{t("communicationHistory")}</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href="/client/voters">
            <Button variant="secondary" size="sm" leftIcon={<Users className="w-4 h-4" />}>
              {t("navVoters")}
            </Button>
          </Link>
        </div>
      </div>

      {/* 3. 4 CORE PROMINENT KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
        <StatCard
          title={t("todaysCalls")}
          value={summary.todaysCalls}
          subValue={`${summary.connectedCalls} Connected`}
          icon={PhoneCall}
          iconColor="text-[#2E7D32]"
          iconBg="bg-[#E8F5E9]"
        />
        <StatCard
          title={t("whatsAppActivity")}
          value={summary.whatsAppActivity}
          subValue="Dispatched"
          icon={MessageSquare}
          iconColor="text-[#25D366]"
          iconBg="bg-[#E8F5E9]"
        />
        <StatCard
          title={t("pollingSlipsGenerated")}
          value={summary.pollingSlipsGenerated}
          subValue="Ready & Shared"
          icon={FileText}
          iconColor="text-[#714B67]"
          iconBg="bg-[#F1ECEF]"
        />
        <StatCard
          title={t("pendingFollowUps")}
          value={summary.pendingFollowUps}
          subValue="Require Action"
          icon={Clock}
          iconColor="text-[#E65100]"
          iconBg="bg-[#FFF3E0]"
        />
      </div>

      {/* 4. QUICK VOTER OUTREACH SEARCH */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-4 sm:p-5 shadow-none space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base text-[#212529]">
              {isHindi ? "त्वरित मतदाता खोज एवं सीधा संपर्क" : "Quick Elector Search & Direct Outreach"}
            </h2>
            <p className="text-xs text-[#6C757D] mt-0.5">
              {isHindi
                ? "मतदाता का नाम, पहचान पत्र (EPIC) या मोबाइल खोजकर 1-क्लिक में कॉल, व्हाट्सऐप या पर्ची बनाएं"
                : "Search by name, EPIC ID or phone to initiate 1-click call, WhatsApp message, or polling slip"}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#714B67] bg-[#F1ECEF] px-2.5 py-1 rounded border border-[#D9CAD5]">
            {summary.contactablePhoneVoters} Phone Available
          </span>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder={t("searchVoterToCommunicate")}
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
            className="w-full h-11 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px] text-sm px-4 pl-10 text-[#212529] focus:bg-white focus:outline-none focus:border-[#714B67] transition-colors"
          />
          <Search className="w-4 h-4 text-[#6C757D] absolute left-3.5 top-3.5" />
        </div>

        {searchResults.length > 0 && (
          <div className="bg-white border border-[#DEE2E6] rounded-[4px] divide-y divide-[#DEE2E6] shadow-sm overflow-hidden">
            {searchResults.map((voter) => (
              <div
                key={voter.id}
                className="p-3.5 hover:bg-[#F8F9FA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#212529]">{voter.name}</span>
                    <span className="font-mono text-xs font-bold text-[#714B67]">{voter.voter_id_card}</span>
                  </div>
                  <p className="text-xs text-[#6C757D] mt-0.5">
                    {voter.mobile || "No Mobile"} • {voter.booth_number} ({voter.booth_name || "School"}) • {voter.area_name}
                  </p>
                </div>

                <div className="flex-shrink-0">
                  <VoterActionBar voter={voter} client={client} size="sm" onActionComplete={loadData} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. 3 FEATURE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Polling Slip Card */}
        <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-4 flex flex-col justify-between hover:border-[#714B67] transition-colors">
          <div>
            <div className="w-10 h-10 rounded-[4px] bg-[#F1ECEF] text-[#714B67] flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#212529]">{t("pollingSlip")}</h3>
            <p className="text-xs text-[#6C757D] mt-1 leading-relaxed">
              {isHindi
                ? "स्वच्छ, आधिकारिक एवं डिजिटल पर्चियां तैयार करें। एकल व सामूहिक (Batch) प्रिंट एवं व्हाट्सऐप साझाकरण।"
                : "Generate clean, official digital polling slips. Single or batch printing and 1-click WhatsApp sharing."}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F1F3F5]">
            <Link href="/client/communication/polling-slip">
              <Button size="sm" variant="primary" className="w-full justify-between">
                <span>{isHindi ? "पर्ची जनरेटर खोलें" : "Open Slip Generator"}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Calling Card */}
        <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-4 flex flex-col justify-between hover:border-[#2E7D32] transition-colors">
          <div>
            <div className="w-10 h-10 rounded-[4px] bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mb-3">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#212529]">{t("callingService")}</h3>
            <p className="text-xs text-[#6C757D] mt-1 leading-relaxed">
              {isHindi
                ? "सीधी नेटिव कॉलिंग, परिणाम रिकॉर्डिंग (Connected/Busy/Follow-up) और स्वचालित फॉलो-अप प्रबंधन।"
                : "Native 1-click dialing, call outcome logging (Connected/Busy/Follow-up), and automated callbacks."}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F1F3F5]">
            <Link href="/client/communication/calling">
              <Button size="sm" variant="secondary" className="w-full justify-between">
                <span>{isHindi ? "कॉलिंग डेस्क खोलें" : "Open Calling Desk"}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* WhatsApp Card */}
        <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-4 flex flex-col justify-between hover:border-[#25D366] transition-colors">
          <div>
            <div className="w-10 h-10 rounded-[4px] bg-[#E8F5E9] text-[#25D366] flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#212529]">WhatsApp</h3>
            <p className="text-xs text-[#6C757D] mt-1 leading-relaxed">
              {isHindi
                ? "आधिकारिक सूचनात्मक टेम्पलेट्स, मतदान केंद्र विवरण और सहमति (Consent) अनुपालन।"
                : "Official bilingual informational templates, booth details, and consent compliance management."}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F1F3F5]">
            <Link href="/client/communication/whatsapp">
              <Button size="sm" variant="secondary" className="w-full justify-between">
                <span>{isHindi ? "व्हाट्सऐप केंद्र खोलें" : "Open WhatsApp Hub"}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 6. RECENT COMMUNICATION ACTIVITY LOG TABLE */}
      <Card>
        <CardHeader
          title={t("communicationLogs")}
          subtitle={isHindi ? "वास्तविक समय फील्ड कॉल, संदेश और पर्ची गतिविधि" : "Real-time communication telemetry across all channels"}
          action={
            <Link href="/client/communication/history">
              <Button size="sm" variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                {t("viewAll")}
              </Button>
            </Link>
          }
        />

        <div className="overflow-x-auto">
          <table className="odoo-table">
            <thead>
              <tr>
                <th>{isHindi ? "चैनल" : "Channel"}</th>
                <th>{t("electorName")}</th>
                <th>{isHindi ? "कार्यकर्ता / कॉलर" : "Actor"}</th>
                <th>{t("status")}</th>
                <th>{isHindi ? "टिप्पणी" : "Note"}</th>
                <th className="text-right">{isHindi ? "समय" : "Time"}</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                        log.channel === "CALL"
                          ? "bg-[#E8F5E9] text-[#2E7D32]"
                          : log.channel === "WHATSAPP"
                          ? "bg-[#E8F5E9] text-[#25D366]"
                          : "bg-[#F1ECEF] text-[#714B67]"
                      }`}
                    >
                      {log.channel === "CALL" && <Phone className="w-3 h-3" />}
                      {log.channel === "WHATSAPP" && <MessageSquare className="w-3 h-3" />}
                      {log.channel === "POLLING_SLIP" && <FileText className="w-3 h-3" />}
                      <span>{log.channel}</span>
                    </span>
                  </td>
                  <td>
                    <p className="font-bold text-[#212529]">{log.voter_name}</p>
                    <p className="text-xs font-mono text-[#6C757D]">{log.voter_card}</p>
                  </td>
                  <td>
                    <p className="font-semibold text-xs text-[#495057]">{log.actor_name}</p>
                    <span className="text-[10px] uppercase font-bold text-[#6C757D]">{log.user_role}</span>
                  </td>
                  <td>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#F8F9FA] border border-[#DEE2E6] text-[#212529]">
                      {log.status}
                    </span>
                  </td>
                  <td className="text-xs text-[#6C757D] max-w-xs truncate">
                    {log.note || "—"}
                  </td>
                  <td className="text-right text-xs font-mono text-[#6C757D]">
                    {formatDateTime(log.created_at)}
                  </td>
                </tr>
              ))}
              {recentLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-xs text-[#6C757D]">
                    No communication records logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
