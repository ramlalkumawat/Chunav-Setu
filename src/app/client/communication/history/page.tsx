"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/auth-context";
import { useLanguage } from "@/lib/i18n";
import { dbService } from "@/lib/store/data-service";
import { CommunicationLog, CommunicationChannel } from "@/lib/types";
import { CandidatePosterBanner } from "@/components/layout/CandidatePosterBanner";
import { OdooControlPanel } from "@/components/ui/OdooControlPanel";
import { Pagination } from "@/components/ui/Pagination";
import { formatDateTime } from "@/lib/utils";
import {
  History,
  Phone,
  MessageSquare,
  FileText,
  Layers,
  PhoneCall,
  CheckCircle2,
  PhoneForwarded,
  PhoneOff,
  Clock,
  Search,
} from "lucide-react";

export default function CandidateCommunicationHistoryPage() {
  const { client } = useAuth();
  const { t, language } = useLanguage();
  const isHindi = language === "hi";
  const clientId = client?.id || "";

  // Data
  const [logs, setLogs] = useState<CommunicationLog[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [activeTab, setActiveTab] = useState<"ALL" | CommunicationChannel>("ALL");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const loadData = useCallback(() => {
    const res = dbService.getCommunicationLogs(clientId, {
      channel: activeTab,
      status: statusFilter,
      search,
      page: currentPage,
      pageSize,
    });

    setLogs(res.data);
    setTotalRecords(res.total);
    setTotalPages(res.totalPages);
  }, [clientId, activeTab, statusFilter, search, currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      {/* 1. TOP: CANDIDATE BRANDING POSTER */}
      <CandidatePosterBanner
        client={client}
        moduleTitle={isHindi ? "संचार इतिहास एवं ऑडिट" : "Communication History & Audit"}
        badgeText={isHindi ? "ऑडिट लॉग" : "Immutable Telemetry"}
      />

      {/* 2. SUBNAV BAR */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-2 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link href="/client/communication">
            <span className="px-3 py-1.5 rounded-[4px] text-xs font-bold bg-white text-[#495057] hover:bg-[#F8F9FA] inline-flex items-center gap-1.5 transition-colors">
              <Layers className="w-4 h-4 text-[#6C757D]" />
              <span>{isHindi ? "सिंहावलोकन" : "Overview"}</span>
            </span>
          </Link>
          <Link href="/client/communication/polling-slip">
            <span className="px-3 py-1.5 rounded-[4px] text-xs font-bold bg-white text-[#495057] hover:bg-[#F8F9FA] inline-flex items-center gap-1.5 transition-colors">
              <FileText className="w-4 h-4 text-[#714B67]" />
              <span>{t("pollingSlip")}</span>
            </span>
          </Link>
          <Link href="/client/communication/calling">
            <span className="px-3 py-1.5 rounded-[4px] text-xs font-bold bg-white text-[#495057] hover:bg-[#F8F9FA] inline-flex items-center gap-1.5 transition-colors">
              <Phone className="w-4 h-4 text-[#2E7D32]" />
              <span>{t("callingService")}</span>
            </span>
          </Link>
          <Link href="/client/communication/whatsapp">
            <span className="px-3 py-1.5 rounded-[4px] text-xs font-bold bg-white text-[#495057] hover:bg-[#F8F9FA] inline-flex items-center gap-1.5 transition-colors">
              <MessageSquare className="w-4 h-4 text-[#25D366]" />
              <span>WhatsApp</span>
            </span>
          </Link>
          <Link href="/client/communication/history">
            <span className="px-3 py-1.5 rounded-[4px] text-xs font-bold bg-[#714B67] text-white inline-flex items-center gap-1.5 shadow-2xs">
              <History className="w-4 h-4" />
              <span>{t("communicationHistory")}</span>
            </span>
          </Link>
        </div>
      </div>

      {/* 3. TABS: ALL / CALLS / WHATSAPP / POLLING SLIPS */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-1 flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab("ALL");
            setCurrentPage(1);
          }}
          className={`flex-1 py-2 px-3 rounded-[3px] text-xs sm:text-sm font-bold transition-colors ${
            activeTab === "ALL"
              ? "bg-[#714B67] text-white"
              : "text-[#6C757D] hover:bg-[#F8F9FA]"
          }`}
        >
          {t("allChannels")}
        </button>
        <button
          onClick={() => {
            setActiveTab("CALL");
            setCurrentPage(1);
          }}
          className={`flex-1 py-2 px-3 rounded-[3px] text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === "CALL"
              ? "bg-[#2E7D32] text-white"
              : "text-[#6C757D] hover:bg-[#F8F9FA]"
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>{t("callsTab")}</span>
        </button>
        <button
          onClick={() => {
            setActiveTab("WHATSAPP");
            setCurrentPage(1);
          }}
          className={`flex-1 py-2 px-3 rounded-[3px] text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === "WHATSAPP"
              ? "bg-[#25D366] text-white"
              : "text-[#6C757D] hover:bg-[#F8F9FA]"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{t("whatsAppTab")}</span>
        </button>
        <button
          onClick={() => {
            setActiveTab("POLLING_SLIP");
            setCurrentPage(1);
          }}
          className={`flex-1 py-2 px-3 rounded-[3px] text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === "POLLING_SLIP"
              ? "bg-[#714B67] text-white"
              : "text-[#6C757D] hover:bg-[#F8F9FA]"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t("slipsTab")}</span>
        </button>
      </div>

      {/* 4. CONTROL PANEL */}
      <OdooControlPanel
        title={t("communicationHistory")}
        subtitle={
          isHindi
            ? "सभी कॉल्स, व्हाट्सऐप संदेशों एवं निर्मित मतदान पर्चियों का संपूर्ण ऑडिट रिकॉर्ड"
            : "Complete audit log of all citizen outreach, dialer results, and generated polling slips"
        }
        searchPlaceholder={t("searchVoterPlaceholder")}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        pagination={{
          currentPage,
          totalPages,
          totalRecords,
          pageSize,
          onPageChange: (p) => setCurrentPage(p),
        }}
      />

      {/* 5. AUDIT LOGS TABLE */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="odoo-table">
            <thead>
              <tr>
                <th>{isHindi ? "माध्यम" : "Channel"}</th>
                <th>{t("electorName")}</th>
                <th>{isHindi ? "कार्यकर्ता / कॉलर" : "Initiated By"}</th>
                <th>{t("status")}</th>
                <th>{isHindi ? "विवरण / टिप्पणी" : "Details / Note"}</th>
                <th className="text-right">{isHindi ? "दिनांक व समय" : "Date & Time"}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold ${
                        log.channel === "CALL"
                          ? "bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]"
                          : log.channel === "WHATSAPP"
                          ? "bg-[#E8F5E9] text-[#25D366] border border-[#C8E6C9]"
                          : "bg-[#F1ECEF] text-[#714B67] border border-[#D9CAD5]"
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
                    <p className="text-xs font-mono text-[#6C757D]">
                      {log.voter_card} {log.voter_mobile ? `• ${log.voter_mobile}` : ""}
                    </p>
                  </td>
                  <td>
                    <p className="font-bold text-xs text-[#212529]">{log.actor_name}</p>
                    <span className="text-[10px] uppercase font-bold text-[#714B67] bg-[#F8F9FA] px-1.5 py-0.2 rounded border border-[#DEE2E6]">
                      {log.user_role}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#F8F9FA] border border-[#DEE2E6] text-[#212529]">
                      {log.status}
                    </span>
                  </td>
                  <td className="text-xs text-[#495057] max-w-sm">
                    {log.note || "—"}
                  </td>
                  <td className="text-right text-xs font-mono text-[#6C757D]">
                    {formatDateTime(log.created_at)}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-[#6C757D]">
                    {t("noVotersFound")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          pageSize={pageSize}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </div>
    </div>
  );
}
