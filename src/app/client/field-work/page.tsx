"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { FieldActivity, Volunteer } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { OdooControlPanel } from "@/components/ui/OdooControlPanel";
import { formatDateTime } from "@/lib/utils";

export default function FieldWorkPage() {
  const { client } = useAuth();
  const clientId = client?.id || "client-1";

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
    <div className="space-y-3">
      {/* Odoo Control Panel */}
      <OdooControlPanel
        breadcrumb="Campaign"
        title="Field Canvassing Stream"
        subtitle="Real-time chronological log of door-to-door submissions from volunteer mobile workers"
        searchPlaceholder="Search voter, volunteer, notes..."
        searchValue={search}
        onSearchChange={setSearch}
        filterComponent={
          <div className="w-full sm:w-60">
            <select
              value={volFilter}
              onChange={(e) => setVolFilter(e.target.value)}
              className="w-full h-8 bg-white border border-[#DEE2E6] rounded-[3px] text-xs px-2 text-[#212529] focus:outline-none focus:border-[#714B67]"
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

      {/* Dense Odoo Activity Table */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="odoo-table">
            <thead>
              <tr>
                <th>Elector Name & EPIC</th>
                <th>Outcome / Sentiment</th>
                <th>Volunteer Canvasser</th>
                <th>Polling Station</th>
                <th>Feedback & Observations</th>
                <th className="text-right">Logged Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.map((act) => (
                <tr key={act.id}>
                  <td>
                    <p className="font-semibold text-[#212529]">{act.voter_name}</p>
                    {act.voter_card && (
                      <span className="font-mono text-[11px] text-[#714B67]">
                        {act.voter_card}
                      </span>
                    )}
                  </td>
                  <td>
                    <Badge status={act.outcome} size="sm" />
                  </td>
                  <td className="text-xs">
                    <span className="font-medium text-[#212529]">{act.volunteer_name}</span>
                  </td>
                  <td className="text-xs text-[#495057]">
                    {act.booth_name || "—"}
                  </td>
                  <td className="text-xs">
                    {act.notes ? (
                      <p className="text-[#495057] italic max-w-md">"{act.notes}"</p>
                    ) : (
                      <span className="text-[#ADB5BD]">—</span>
                    )}
                  </td>
                  <td className="text-right text-[11px] text-[#6C757D] font-mono whitespace-nowrap">
                    {formatDateTime(act.created_at)}
                  </td>
                </tr>
              ))}
              {filteredActivities.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-xs text-[#6C757D]">
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
