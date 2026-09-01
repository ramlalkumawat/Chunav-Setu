"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { FieldActivity } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/utils";
import { Compass, CheckCircle2, MapPin } from "lucide-react";

export default function VolunteerActivityPage() {
  const { client, volunteer } = useAuth();
  const clientId = client?.id || "client-1";
  const volunteerId = volunteer?.id || "vol-1";

  const [activities, setActivities] = useState<FieldActivity[]>([]);

  useEffect(() => {
    setActivities(dbService.getFieldActivities(clientId, volunteerId));
  }, [clientId, volunteerId]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-[#172033]">My Field Canvassing History</h1>
        <p className="text-xs text-[#64748B]">All voter interactions and feedback logged from your device</p>
      </div>

      <div className="space-y-2.5">
        {activities.map((act) => (
          <Card key={act.id} padding="sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#EAEFF5] text-[#1F3A5F] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-[#172033]">{act.voter_name}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-[#EAF3EE] text-[#2F6B4F]">
                      {act.outcome}
                    </span>
                  </div>

                  {act.notes && (
                    <p className="text-xs text-[#172033] mt-1 bg-[#FAFAF8] p-2 rounded border border-[#E5E2DC] italic">
                      "{act.notes}"
                    </p>
                  )}

                  <p className="text-[10px] text-[#64748B] mt-1">
                    {act.booth_name} • {formatDateTime(act.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {activities.length === 0 && (
          <Card padding="lg" className="text-center py-10">
            <Compass className="w-8 h-8 text-[#64748B] mx-auto mb-2 opacity-50" />
            <p className="text-xs font-semibold text-[#172033]">No survey activities recorded yet</p>
          </Card>
        )}
      </div>
    </div>
  );
}
