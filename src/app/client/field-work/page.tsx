"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useLanguage } from "@/lib/i18n";
import { FieldActivity, Volunteer } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { OdooControlPanel } from "@/components/ui/OdooControlPanel";
import { formatDateTime } from "@/lib/utils";

export default function FieldWorkPage() {
  const { client } = useAuth();
  const { t } = useLanguage();
  const clientId = client?.id || "";

  const [activities, setActivities] = useState<FieldActivity[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [search, setSearch] = useState("");
  const [volFilter, setVolFilter] = useState("all");

  useEffect(() => {
    setActivities(dbService.getFieldActivities(clientId));
    setVolunteers(dbService.getVolunteers(clientId));
  }, [clientId]);

  const filteredActivities = activities.filter((act) => {
    const matchesVol = volFilter === "all" || act.volunteer_id === volFilter;
    const matchesSearch =
      act.voter_name.toLowerCase().includes(search.toLowerCase()) ||
      (act.voter_card && act.voter_card.toLowerCase().includes(search.toLowerCase())) ||
      act.volunteer_name.toLowerCase().includes(search.toLowerCase()) ||
      act.outcome.toLowerCase().includes(search.toLowerCase()) ||
      (act.notes && act.notes.toLowerCase().includes(search.toLowerCase()));

    return matchesVol && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Odoo Control Panel */}
      <OdooControlPanel
        breadcrumb={t("navCampaigns")}
        title={t("fieldWorkTitle")}
        subtitle={t("fieldWorkSubtitle")}
        searchPlaceholder={t("searchVoterPlaceholder")}
        searchValue={search}
        onSearchChange={setSearch}
        filterComponent={
          <div className="w-full sm:w-72">
            <select
              value={volFilter}
              onChange={(e) => setVolFilter(e.target.value)}
              className="w-full h-10 bg-white border border-[#DEE2E6] rounded-[4px] text-sm px-3 text-[#212529] focus:outline-none focus:border-[#714B67]"
            >
              <option value="all">All Field Volunteers</option>
              {volunteers.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Readable Odoo Activity Table */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="odoo-table">
            <thead>
              <tr>
                <th>{t("electorName")} & EPIC</th>
                <th>{t("outcomeSentiment")}</th>
                <th>{t("assignedTo")}</th>
                <th>{t("pollingBooth")}</th>
                <th>Feedback & Observations</th>
                <th className="text-right">{t("loggedTime")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.map((act) => (
                <tr key={act.id}>
                  <td>
                    <p className="font-bold text-[#212529]">{act.voter_name}</p>
                    {act.voter_card && (
                      <span className="font-mono text-xs font-bold text-[#714B67]">
                        {act.voter_card}
                      </span>
                    )}
                  </td>
                  <td>
                    <Badge status={act.outcome} size="md" />
                  </td>
                  <td className="text-[14px]">
                    <span className="font-semibold text-[#212529]">{act.volunteer_name}</span>
                  </td>
                  <td className="text-[14px] text-[#495057]">
                    {act.booth_name || "—"}
                  </td>
                  <td className="text-[14px]">
                    {act.notes ? (
                      <p className="text-[#495057] italic max-w-md">"{act.notes}"</p>
                    ) : (
                      <span className="text-[#ADB5BD]">—</span>
                    )}
                  </td>
                  <td className="text-right text-[13px] text-[#6C757D] font-mono whitespace-nowrap">
                    {formatDateTime(act.created_at)}
                  </td>
                </tr>
              ))}
              {filteredActivities.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-[#6C757D]">
                    No field canvassing activities recorded matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
