"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/store/data-service";
import { useLanguage } from "@/lib/i18n";
import { Campaign, Client } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { OdooControlPanel } from "@/components/ui/OdooControlPanel";
import { formatDate, formatNumber } from "@/lib/utils";

export default function AdminCampaignsPage() {
  const { t } = useLanguage();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    setCampaigns(dbService.getCampaigns());
    setClients(dbService.getClients());
  }, []);

  return (
    <div className="space-y-4">
      {/* Odoo Control Panel */}
      <OdooControlPanel
        breadcrumb="System"
        title="Active Campaigns"
        subtitle="Cross-tenant overview of all running, scheduled, and past electoral campaigns"
      />

      {/* Readable Odoo Table */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="odoo-table">
            <thead>
              <tr>
                <th>Campaign Title</th>
                <th>Candidate & Organization</th>
                <th>Election Level</th>
                <th>Election Date</th>
                <th className="text-center">Target Electors</th>
                <th>{t("status")}</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((camp) => {
                const client = clients.find((c) => c.id === camp.client_id);
                return (
                  <tr key={camp.id}>
                    <td>
                      <p className="font-bold text-[#212529]">{camp.title}</p>
                      {camp.description && (
                        <p className="text-xs text-[#6C757D] truncate max-w-md">{camp.description}</p>
                      )}
                    </td>
                    <td className="text-[14px]">
                      <p className="font-semibold text-[#212529]">{client?.candidate_name || "—"}</p>
                      <p className="text-xs text-[#6C757D]">{client?.name}</p>
                    </td>
                    <td className="text-[14px] text-[#714B67] font-semibold">
                      {client?.election_type || "Vidhan Sabha"}
                    </td>
                    <td className="text-[14px] text-[#495057] font-mono">
                      {formatDate(camp.election_date)}
                    </td>
                    <td className="text-center text-[14px] font-bold text-[#212529]">
                      {formatNumber(camp.target_voters)}
                    </td>
                    <td>
                      <Badge status={camp.status} size="md" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
