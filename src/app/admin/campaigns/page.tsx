"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/store/data-service";
import { Campaign, Client } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatNumber } from "@/lib/utils";
import { Flag, Calendar, Target, Building2 } from "lucide-react";

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    setCampaigns(dbService.getCampaigns());
    setClients(dbService.getClients());
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
          All Electoral Campaigns
        </h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Cross-tenant view of active, draft, and completed candidate campaigns
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((camp) => {
          const client = clients.find((c) => c.id === camp.client_id);
          return (
            <Card key={camp.id} padding="md" className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge status={camp.status} size="sm" />
                  <span className="text-[11px] text-[#64748B] font-mono">
                    {client?.election_type || "Election"}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#172033] leading-snug">
                  {camp.title}
                </h3>
                {camp.description && (
                  <p className="text-xs text-[#64748B] mt-1.5 line-clamp-2">
                    {camp.description}
                  </p>
                )}

                <div className="mt-4 pt-3 border-t border-[#E5E2DC] space-y-2 text-xs text-[#64748B]">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-[#1F3A5F]" />
                    <span className="font-semibold text-[#172033]">{client?.candidate_name || "Candidate"}</span>
                    <span>({client?.name})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#1F3A5F]" />
                    <span>Election Date: <strong className="text-[#172033]">{formatDate(camp.election_date)}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-[#1F3A5F]" />
                    <span>Target Voters: <strong className="text-[#172033]">{formatNumber(camp.target_voters)}</strong></span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
