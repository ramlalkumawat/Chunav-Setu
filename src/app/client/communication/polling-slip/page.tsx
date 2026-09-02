"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/auth-context";
import { useLanguage } from "@/lib/i18n";
import { useToast } from "@/lib/context/toast-context";
import { dbService } from "@/lib/store/data-service";
import { Voter, Booth, Area } from "@/lib/types";
import { CandidatePosterBanner } from "@/components/layout/CandidatePosterBanner";
import { Button } from "@/components/ui/Button";
import { OdooControlPanel } from "@/components/ui/OdooControlPanel";
import { Pagination } from "@/components/ui/Pagination";
import { PollingSlipModal } from "@/components/communication/PollingSlipModal";
import { BatchPollingSlipModal } from "@/components/communication/BatchPollingSlipModal";
import { VoterActionBar } from "@/components/communication/VoterActionBar";
import {
  FileText,
  Printer,
  MessageSquare,
  Users,
  CheckSquare,
  Square,
  X,
  Layers,
  Phone,
  History,
  Eye,
  Building,
} from "lucide-react";

export default function CandidatePollingSlipPage() {
  const { client } = useAuth();
  const { t, language } = useLanguage();
  const { success } = useToast();
  const isHindi = language === "hi";
  const clientId = client?.id || "";

  // Data
  const [voters, setVoters] = useState<Voter[]>([]);
  const [booths, setBooths] = useState<Booth[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [boothFilter, setBoothFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Selection state
  const [selectedVoterIds, setSelectedVoterIds] = useState<string[]>([]);
  const [previewVoter, setPreviewVoter] = useState<Voter | null>(null);
  const [isBatchOpen, setIsBatchOpen] = useState(false);

  const loadData = useCallback(() => {
    setBooths(dbService.getBooths(clientId));
    setAreas(dbService.getAreas(clientId));

    const res = dbService.getPollingSlipVoters(clientId, undefined, {
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

  const toggleSelectAll = () => {
    if (selectedVoterIds.length === voters.length) {
      setSelectedVoterIds([]);
    } else {
      setSelectedVoterIds(voters.map((v) => v.id));
    }
  };

  const toggleSelectVoter = (id: string) => {
    if (selectedVoterIds.includes(id)) {
      setSelectedVoterIds(selectedVoterIds.filter((item) => item !== id));
    } else {
      setSelectedVoterIds([...selectedVoterIds, id]);
    }
  };

  const selectedVoters = voters.filter((v) => selectedVoterIds.includes(v.id));

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      {/* 1. TOP: CANDIDATE BRANDING POSTER */}
      <CandidatePosterBanner
        client={client}
        moduleTitle={isHindi ? "डिजिटल मतदान पर्ची जनरेटर" : "Digital Polling Slip Generator"}
        badgeText={isHindi ? "आधिकारिक मतदान पर्ची" : "Official Polling Desk"}
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
            <span className="px-3 py-1.5 rounded-[4px] text-xs font-bold bg-[#714B67] text-white inline-flex items-center gap-1.5 shadow-2xs">
              <FileText className="w-4 h-4" />
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
            <span className="px-3 py-1.5 rounded-[4px] text-xs font-bold bg-white text-[#495057] hover:bg-[#F8F9FA] inline-flex items-center gap-1.5 transition-colors">
              <History className="w-4 h-4 text-[#6C757D]" />
              <span>{t("communicationHistory")}</span>
            </span>
          </Link>
        </div>
      </div>

      {/* 3. CONTROL PANEL */}
      <OdooControlPanel
        title={t("pollingSlip")}
        subtitle={
          isHindi
            ? "मतदाता चुनें और आधिकारिक डिजिटल मतदान पर्ची तैयार, डाउनलोड या व्हाट्सएप पर साझा करें"
            : "Generate, preview, print or WhatsApp official digital polling slips"
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

      {/* 4. BATCH ACTIONS BAR */}
      {selectedVoterIds.length > 0 && (
        <div className="bg-[#F1ECEF] border border-[#D9CAD5] rounded-[4px] px-4 py-2.5 flex items-center justify-between text-sm animate-in fade-in duration-100">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#714B67]">
              {selectedVoterIds.length} {t("selectedCount")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsBatchOpen(true)}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              {t("batchGenerateSlips")}
            </Button>
            <button
              onClick={() => setSelectedVoterIds([])}
              className="text-[#6C757D] hover:text-[#212529] p-1.5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* 5. VOTERS TABLE */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="odoo-table">
            <thead>
              <tr>
                <th className="w-10 text-center">
                  <button
                    onClick={toggleSelectAll}
                    className="text-[#6C757D] hover:text-[#212529] inline-flex items-center"
                  >
                    {selectedVoterIds.length === voters.length && voters.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-[#714B67]" />
                    ) : (
                      <Square className="w-5 h-5 text-[#CED4DA]" />
                    )}
                  </button>
                </th>
                <th>{t("voterIdCard")}</th>
                <th>{t("electorName")}</th>
                <th>{t("pollingBooth")}</th>
                <th>{isHindi ? "अंतिम पर्ची स्थिति" : "Last Slip Status"}</th>
                <th className="text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {voters.map((voter) => {
                const isSelected = selectedVoterIds.includes(voter.id);
                return (
                  <tr key={voter.id} className={isSelected ? "selected" : ""}>
                    <td className="text-center">
                      <button
                        onClick={() => toggleSelectVoter(voter.id)}
                        className="text-[#6C757D] hover:text-[#212529] inline-flex items-center"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-[#714B67]" />
                        ) : (
                          <Square className="w-5 h-5 text-[#CED4DA]" />
                        )}
                      </button>
                    </td>
                    <td className="font-mono text-xs sm:text-sm font-bold text-[#714B67]">
                      {voter.voter_id_card}
                    </td>
                    <td>
                      <p className="font-bold text-[#212529]">{voter.name}</p>
                      <p className="text-xs text-[#6C757D]">
                        {voter.age ? `${voter.age} yrs` : "—"} • {voter.gender || "—"} • {voter.mobile || "No phone"}
                      </p>
                    </td>
                    <td>
                      <p className="font-semibold text-xs text-[#212529]">
                        {voter.booth_number} - {voter.booth_name}
                      </p>
                      <p className="text-[11px] text-[#6C757D]">{voter.area_name}</p>
                    </td>
                    <td>
                      {voter.last_slip_generated_at ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded border border-[#C8E6C9]">
                          <FileText className="w-3 h-3" />
                          Generated
                        </span>
                      ) : (
                        <span className="text-xs text-[#ADB5BD]">Not Generated</span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setPreviewVoter(voter)}
                          leftIcon={<Eye className="w-3.5 h-3.5 text-[#714B67]" />}
                        >
                          {isHindi ? "पर्ची देखें" : "Generate Slip"}
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

      {/* Single Preview Slip Modal */}
      {previewVoter && (
        <PollingSlipModal
          isOpen={true}
          onClose={() => setPreviewVoter(null)}
          voter={previewVoter}
          client={client}
          onGenerated={loadData}
        />
      )}

      {/* Batch Slip Generator Modal */}
      <BatchPollingSlipModal
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        voters={selectedVoters}
        client={client}
        onCompleted={() => {
          setSelectedVoterIds([]);
          loadData();
        }}
      />
    </div>
  );
}
