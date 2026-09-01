"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/store/data-service";
import { useLanguage } from "@/lib/i18n";
import { Subscription, Client } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { OdooControlPanel } from "@/components/ui/OdooControlPanel";
import { formatDate, formatNumber } from "@/lib/utils";

export default function AdminSubscriptionsPage() {
  const { t } = useLanguage();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    setSubs(dbService.getSubscriptions());
    setClients(dbService.getClients());
  }, []);

  return (
    <div className="space-y-4">
      {/* Odoo Control Panel */}
      <OdooControlPanel
        breadcrumb="System"
        title="Client Subscriptions & Quotas"
        subtitle="Manage tenant tier allocations, elector limits, and license periods"
      />

      {/* Readable Odoo Table */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="odoo-table">
            <thead>
              <tr>
                <th>Client Organization</th>
                <th>Candidate</th>
                <th>Assigned Plan</th>
                <th>Elector Capacity</th>
                <th>Volunteer Seats</th>
                <th>{t("status")}</th>
                <th className="text-right">License Expiry</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((sub) => {
                const client = clients.find((c) => c.id === sub.client_id);
                const voterUsage = client?.voter_count || 0;
                const volUsage = client?.volunteer_count || 0;
                const voterPercent = Math.min(100, Math.round((voterUsage / sub.max_voters) * 100));

                return (
                  <tr key={sub.id}>
                    <td>
                      <p className="font-bold text-[#212529]">{client?.name || sub.client_name || "Client"}</p>
                    </td>
                    <td className="text-[14px] font-semibold text-[#212529]">{client?.candidate_name}</td>
                    <td>
                      <span className="text-[14px] font-bold text-[#714B67] uppercase">
                        {sub.plan_name.replace("_", " ")}
                      </span>
                    </td>
                    <td className="text-[14px]">
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-[#212529]">{formatNumber(voterUsage)} / {formatNumber(sub.max_voters)}</span>
                        <div className="w-20 h-2 bg-[#E9ECEF] rounded-[2px] overflow-hidden">
                          <div
                            className="h-full bg-[#714B67]"
                            style={{ width: `${voterPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="text-[14px] text-[#495057]">
                      {volUsage} / {sub.max_volunteers}
                    </td>
                    <td>
                      <Badge status={sub.status} size="md" />
                    </td>
                    <td className="text-right text-[14px] font-mono text-[#6C757D]">
                      {formatDate(sub.valid_until)}
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
