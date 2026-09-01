"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useLanguage } from "@/lib/i18n";
import { Voter } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import {
  MapPin,
  ChevronRight,
} from "lucide-react";

export default function VolunteerVotersPage() {
  const router = useRouter();
  const { client, volunteer } = useAuth();
  const { t } = useLanguage();
  const clientId = client?.id || "client-1";

  const [voters, setVoters] = useState<Voter[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const all = dbService.getVoters(clientId, { pageSize: 500 }).data;
    setVoters(all);
  }, [clientId]);

  const filteredVoters = voters.filter((v) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "uncontacted" ? v.contact_status === "uncontacted" : v.contact_status !== "uncontacted");

    const matchesSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.voter_id_card.toLowerCase().includes(search.toLowerCase()) ||
      (v.mobile && v.mobile.includes(search)) ||
      (v.address && v.address.toLowerCase().includes(search.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-[#212529]">{t("votersTitle")}</h1>
        <p className="text-sm text-[#6C757D] mt-0.5">
          {volunteer?.assigned_booth_name || "Booth 101"} • Tap any elector row to record survey
        </p>
      </div>

      {/* Search and Status Pills */}
      <div className="space-y-2.5">
        <input
          type="text"
          placeholder={t("searchVoterPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 bg-white border border-[#DEE2E6] rounded-[4px] text-[15px] px-3.5 text-[#212529] placeholder-[#ADB5BD] focus:outline-none focus:border-[#714B67]"
        />

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-sm">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-[4px] text-xs sm:text-sm font-semibold transition-colors ${
              statusFilter === "all"
                ? "bg-[#714B67] text-white"
                : "bg-white border border-[#DEE2E6] text-[#495057] hover:bg-[#F8F9FA]"
            }`}
          >
            All ({voters.length})
          </button>
          <button
            onClick={() => setStatusFilter("uncontacted")}
            className={`px-3 py-1.5 rounded-[4px] text-xs sm:text-sm font-semibold transition-colors ${
              statusFilter === "uncontacted"
                ? "bg-[#714B67] text-white"
                : "bg-white border border-[#DEE2E6] text-[#495057] hover:bg-[#F8F9FA]"
            }`}
          >
            {t("uncontacted")} ({voters.filter((v) => v.contact_status === "uncontacted").length})
          </button>
          <button
            onClick={() => setStatusFilter("contacted")}
            className={`px-3 py-1.5 rounded-[4px] text-xs sm:text-sm font-semibold transition-colors ${
              statusFilter === "contacted"
                ? "bg-[#2E7D32] text-white"
                : "bg-white border border-[#DEE2E6] text-[#495057] hover:bg-[#F8F9FA]"
            }`}
          >
            Contacted ({voters.filter((v) => v.contact_status !== "uncontacted").length})
          </button>
        </div>
      </div>

      {/* Voters List */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] divide-y divide-[#DEE2E6] shadow-none overflow-hidden">
        {filteredVoters.map((voter) => (
          <div
            key={voter.id}
            onClick={() => router.push(`/volunteer/survey?voterId=${voter.id}`)}
            className="p-3.5 hover:bg-[#F8F9FA] active:bg-[#F1ECEF] transition-colors cursor-pointer flex items-center justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-[15px] text-[#212529]">
                  {voter.name}
                </h3>
                <span className="text-xs font-mono text-[#714B67] font-bold">
                  {voter.voter_id_card}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#6C757D] mt-0.5 font-medium">
                {voter.age ? `${voter.age} yrs` : ""} • {voter.gender || ""} • {voter.booth_number}
              </p>

              {voter.address && (
                <p className="text-xs text-[#6C757D] truncate mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{voter.address}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge status={voter.contact_status} size="md" />
              <ChevronRight className="w-5 h-5 text-[#ADB5BD]" />
            </div>
          </div>
        ))}

        {filteredVoters.length === 0 && (
          <div className="text-center py-12 text-sm text-[#6C757D]">
            {t("noVotersFound")}
          </div>
        )}
      </div>
    </div>
  );
}
