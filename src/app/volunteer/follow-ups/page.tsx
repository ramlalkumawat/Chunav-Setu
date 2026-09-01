"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/lib/context/toast-context";
import { FollowUp } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Clock, Phone, CheckCircle2, Calendar, MapPin } from "lucide-react";

export default function VolunteerFollowUpsPage() {
  const { client, volunteer } = useAuth();
  const { success } = useToast();
  const clientId = client?.id || "client-1";
  const volunteerId = volunteer?.id || "vol-1";

  const [followUps, setFollowUps] = useState<FollowUp[]>([]);

  const loadData = () => {
    setFollowUps(dbService.getFollowUps(clientId, volunteerId));
  };

  useEffect(() => {
    loadData();
  }, [clientId, volunteerId]);

  const handleResolve = (item: FollowUp) => {
    dbService.updateFollowUp(clientId, item.id, {
      status: "completed",
      resolution_note: "Resolved via volunteer mobile app.",
    });
    success("Follow-up Completed", `Marked follow-up for ${item.voter_name} as done.`);
    loadData();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-[#172033]">My Scheduled Follow-ups</h1>
        <p className="text-xs text-[#64748B]">Callbacks & revisit requests assigned to you</p>
      </div>

      <div className="space-y-2.5">
        {followUps.map((item) => {
          const isDone = item.status === "completed";
          return (
            <Card
              key={item.id}
              padding="sm"
              className={`transition-all ${isDone ? "opacity-75 bg-[#FAFAF8]" : "bg-white"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#172033]">{item.voter_name}</h3>
                    <Badge status={item.status} size="sm" />
                  </div>

                  <p className="text-xs text-[#172033] mt-1.5 leading-relaxed bg-[#FAFAF8] p-2 rounded border border-[#E5E2DC]">
                    {item.note}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[#64748B]">
                    <span className="flex items-center gap-1 font-semibold text-[#1F3A5F]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Date: {formatDate(item.scheduled_date)}</span>
                    </span>

                    {item.voter_address && (
                      <span className="flex items-center gap-1 truncate max-w-[200px]">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{item.voter_address}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {item.voter_mobile && (
                    <a
                      href={`tel:${item.voter_mobile}`}
                      className="p-2.5 rounded-lg bg-[#EAF3EE] text-[#2F6B4F] flex items-center justify-center shadow-sm"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}

                  {!isDone && (
                    <button
                      onClick={() => handleResolve(item)}
                      className="px-2.5 py-1 rounded bg-[#1F3A5F] text-white text-[11px] font-bold"
                    >
                      Done
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}

        {followUps.length === 0 && (
          <Card padding="lg" className="text-center py-10">
            <Clock className="w-8 h-8 text-[#64748B] mx-auto mb-2 opacity-50" />
            <p className="text-xs font-semibold text-[#172033]">No pending follow-ups</p>
          </Card>
        )}
      </div>
    </div>
  );
}
