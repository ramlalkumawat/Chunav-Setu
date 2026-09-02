"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/auth-context";
import { useLanguage } from "@/lib/i18n";
import { useToast } from "@/lib/context/toast-context";
import { dbService } from "@/lib/store/data-service";
import { Voter, Booth } from "@/lib/types";
import { CandidatePosterBanner } from "@/components/layout/CandidatePosterBanner";
import { Button } from "@/components/ui/Button";
import { OdooControlPanel } from "@/components/ui/OdooControlPanel";
import { Pagination } from "@/components/ui/Pagination";
import { WhatsAppMessageModal } from "@/components/communication/WhatsAppMessageModal";
import { formatDateTime } from "@/lib/utils";
import {
  MessageSquare,
  FileText,
  Phone,
  Layers,
  History,
  ShieldCheck,
  AlertTriangle,
  Send,
  CheckCircle2,
} from "lucide-react";

export default function CandidateWhatsAppPage() {
  const { client } = useAuth();
  const { t, language } = useLanguage();
  const { success } = useToast();
  const isHindi = language === "hi";
  const clientId = client?.id || "client-1";

  // Data
  const [voters, setVoters] = useState<Voter[]>([]);
  const [booths, setBooths] = useState<Booth[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [boothFilter, setBoothFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Modals
  const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null);

  const loadData = useCallback(() => {
    setBooths(dbService.getBooths(clientId));

    const res = dbService.getWhatsAppList(clientId, undefined, {
      search,
      boothId: boothFilter,
      page: currentPage,
      pageSize,
    });

    setVoters(res.data);
    setTotalRecords(res.total);
    setTotalPages(res.totalPages);
  }, [clientId, search, boothFilter, currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleOptOut = (voter: Voter) => {
    const nextOptOut = !voter.opt_out;
    dbService.updateVoterCommunicationPreferences(clientId, voter.id, {
      opt_out: nextOptOut,
      whatsapp_allowed: !nextOptOut,
    });
    success(
      "Preferences Updated",
      `${voter.name} is now ${nextOptOut ? "Opted Out" : "Opted In"}`
    );
    loadData();
  };

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      {/* 1. TOP: CANDIDATE BRANDING POSTER */}
      <CandidatePosterBanner
        client={client}
        moduleTitle={isHindi ? "व्हाट्सऐप संदेश केंद्र" : "WhatsApp Outreach Center"}
        badgeText={isHindi ? "आधिकारिक व्हाट्सऐप सेवा" : "Official Messaging Desk"}
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
            <span className="px-3 py-1.5 rounded-[4px] text-xs font-bold bg-[#714B67] text-white inline-flex items-center gap-1.5 shadow-2xs">
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </span>
          </Link>
          <Link href="/client/communication/history">
            <span className="px-3 py-1.5 rounded-[4px] text-xs font-bold bg-white text-[#495057] hover:bg-[#F8F9FA] inline-flex items-center gap-1.5 transition-colors">
              <History className="w-4 h-4 text-[#6C757D]" />
              <span>{t("communicationHistory")}</span>
            </span>
          </Link>
        </div>
      </div>

      {/* 3. CONTROL PANEL */}
      <OdooControlPanel
        title="WhatsApp Outreach"
        subtitle={
          isHindi
            ? "मतदाताओं को आधिकारिक सूचनात्मक संदेश और मतदान विवरण सीधे व्हाट्सऐप पर भेजें"
            : "Send compliant informational reminders and polling details directly via WhatsApp"
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
        filterComponent={
          <div className="flex items-center gap-2">
            <select
              value={boothFilter}
              onChange={(e) => {
                setBoothFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 bg-white border border-[#DEE2E6] rounded-[4px] text-xs sm:text-sm px-2.5 text-[#212529] focus:outline-none focus:border-[#714B67]"
            >
              <option value="all">{t("allBooths")}</option>
              {booths.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.booth_number} - {b.booth_name}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* 4. VOTERS WHATSAPP LIST TABLE */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="odoo-table">
            <thead>
              <tr>
                <th>{t("electorName")}</th>
                <th>{t("mobileNumber")}</th>
                <th>{t("pollingBooth")}</th>
                <th>{isHindi ? "सहमति स्थिति" : "Consent / Channel"}</th>
                <th>{isHindi ? "अंतिम प्रेषित समय" : "Last WhatsApp"}</th>
                <th className="text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {voters.map((voter) => {
                const hasPhone = !!voter.mobile;
                const isOptedOut = voter.opt_out || voter.whatsapp_allowed === false;
                return (
                  <tr key={voter.id}>
                    <td>
                      <p className="font-bold text-[#212529]">{voter.name}</p>
                      <p className="font-mono text-xs text-[#714B67]">{voter.voter_id_card}</p>
                    </td>
                    <td>
                      {voter.mobile ? (
                        <span className="font-mono text-xs sm:text-sm font-bold text-[#212529]">
                          {voter.mobile}
                        </span>
                      ) : (
                        <span className="text-xs text-[#ADB5BD]">No Phone</span>
                      )}
                    </td>
                    <td>
                      <p className="font-semibold text-xs text-[#212529]">
                        {voter.booth_number} - {voter.booth_name}
                      </p>
                      <p className="text-[11px] text-[#6C757D]">{voter.area_name}</p>
                    </td>
                    <td>
                      {isOptedOut ? (
                        <button
                          onClick={() => handleToggleOptOut(voter)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#C62828] bg-[#FFEBEE] px-2 py-0.5 rounded border border-[#FFCDD2] hover:bg-[#FFCDD2]"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          Opted Out
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleOptOut(voter)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#25D366] bg-[#E8F5E9] px-2 py-0.5 rounded border border-[#C8E6C9] hover:bg-[#C8E6C9]"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          Allowed
                        </button>
                      )}
                    </td>
                    <td className="text-xs font-mono text-[#6C757D]">
                      {voter.last_whatsapp_at ? (
                        <span className="text-[#2E7D32] font-semibold">
                          {formatDateTime(voter.last_whatsapp_at)}
                        </span>
                      ) : (
                        "Not Sent"
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant={hasPhone && !isOptedOut ? "primary" : "secondary"}
                          disabled={!hasPhone || isOptedOut}
                          onClick={() => setSelectedVoter(voter)}
                          className={
                            hasPhone && !isOptedOut
                              ? "bg-[#25D366] hover:bg-[#20bd5a] text-white border-transparent"
                              : ""
                          }
                          leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                        >
                          {isHindi ? "संदेश भेजें" : "Send WhatsApp"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {voters.length === 0 && (
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
