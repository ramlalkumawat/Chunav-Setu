"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { FieldActivity } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";

export default function VolunteerActivityPage() {
  const { client, volunteer } = useAuth();
  const clientId = client?.id || "client-1";
  const volunteerId = volunteer?.id || "vol-1";

  const [activities, setActivities] = useState<FieldActivity[]>([]);

  useEffect(() => {
    setActivities(dbService.getFieldActivities(clientId, volunteerId));
  }, [clientId, volunteerId]);

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-base font-bold text-[#212529]">My Field Canvassing History</h1>
        <p className="text-[11px] text-[#6C757D]">All elector interactions and surveys logged from your device</p>
      </div>

      <div className="bg-white border border-[#DEE2E6] rounded-[4px] divide-y divide-[#DEE2E6] shadow-none overflow-hidden">
        {activities.map((act) => (
          <div key={act.id} className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-xs text-[#212529]">{act.voter_name}</p>
                  <Badge status={act.outcome} size="sm" />
                </div>

                {act.notes && (
                  <p className="text-xs text-[#495057] mt-1 bg-[#F8F9FA] p-2 rounded-[3px] border border-[#DEE2E6] italic">
                    "{act.notes}"
                  </p>
                )}

                <p className="text-[10px] text-[#6C757D] mt-1 font-mono">
                  {act.booth_name ? `${act.booth_name} • ` : ""}{formatDateTime(act.created_at)}
                </p>
              </div>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="text-center py-8 text-xs text-[#6C757D]">
            No survey activities recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
