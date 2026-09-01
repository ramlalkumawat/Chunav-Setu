"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/store/data-service";
import { Subscription, Client } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatNumber } from "@/lib/utils";
import { CreditCard, Users, UserCheck, Calendar } from "lucide-react";

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    setSubs(dbService.getSubscriptions());
    setClients(dbService.getClients());
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
          Client Subscriptions & Quotas
        </h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Tenant tier allocations, database limits, and subscription expiration schedules
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {subs.map((sub) => {
          const client = clients.find((c) => c.id === sub.client_id);
          const voterUsage = client?.voter_count || 0;
          const volUsage = client?.volunteer_count || 0;

          const voterPercent = Math.min(100, Math.round((voterUsage / sub.max_voters) * 100));
          const volPercent = Math.min(100, Math.round((volUsage / sub.max_volunteers) * 100));

          return (
            <Card key={sub.id} padding="md" className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1F3A5F]">
                    {sub.plan_name.replace("_", " ")}
                  </span>
                  <Badge status={sub.status} size="sm" />
                </div>

                <h3 className="text-base font-bold text-[#172033]">
                  {client?.name || sub.client_name || "Client"}
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Candidate: {client?.candidate_name}
                </p>

                {/* Quota Usage Meters */}
                <div className="mt-5 space-y-3.5">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#64748B] mb-1">
                      <span>Voter Capacity:</span>
                      <span className="font-semibold text-[#172033]">
                        {formatNumber(voterUsage)} / {formatNumber(sub.max_voters)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#E5E2DC] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1F3A5F] rounded-full transition-all"
                        style={{ width: `${voterPercent}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs text-[#64748B] mb-1">
                      <span>Volunteer Seats:</span>
                      <span className="font-semibold text-[#172033]">
                        {volUsage} / {sub.max_volunteers}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#E5E2DC] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2F6B4F] rounded-full transition-all"
                        style={{ width: `${volPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#E5E2DC] flex items-center justify-between text-xs text-[#64748B]">
                  <span>Valid Until:</span>
                  <span className="font-semibold text-[#172033] font-mono">
                    {formatDate(sub.valid_until)}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
