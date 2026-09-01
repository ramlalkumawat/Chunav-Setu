"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/lib/context/toast-context";
import { FollowUp } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { Phone, Calendar, MapPin, CheckCircle2 } from "lucide-react";

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
    <div className="space-y-3">
      <div>
        <h1 className="text-base font-bold text-[#212529]">My Scheduled Follow-ups</h1>
        <p className="text-[11px] text-[#6C757D]">Callbacks & revisit requests assigned to you</p>
      </div>

      <div className="bg-white border border-[#DEE2E6] rounded-[4px] divide-y divide-[#DEE2E6] shadow-none overflow-hidden">
        {followUps.map((item) => {
          const isDone = item.status === "completed";
          return (
            <div
              key={item.id}
              className={`p-3 transition-colors ${isDone ? "bg-[#F8F9FA] opacity-75" : "bg-white"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-xs text-[#212529]">{item.voter_name}</h3>
                    <Badge status={item.status} size="sm" />
                  </div>

                  <p className="text-xs text-[#212529] mt-1 bg-[#F8F9FA] p-2 rounded-[3px] border border-[#DEE2E6]">
                    {item.note}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-[#6C757D]">
                    <span className="flex items-center gap-1 font-mono text-[#714B67] font-semibold">
                      <Calendar className="w-3 h-3" />
                      <span>Date: {formatDate(item.scheduled_date)}</span>
                    </span>

                    {item.voter_address && (
                      <span className="flex items-center gap-1 truncate max-w-[200px]">
                        <MapPin className="w-3 h-3" />
                        <span>{item.voter_address}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  {item.voter_mobile && (
                    <a
                      href={`tel:${item.voter_mobile}`}
                      className="p-1.5 rounded-[3px] bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] flex items-center justify-center"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {!isDone && (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleResolve(item)}
                    >
                      Done
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {followUps.length === 0 && (
          <div className="text-center py-8 text-xs text-[#6C757D]">
            No pending follow-ups assigned to you.
          </div>
        )}
      </div>
    </div>
  );
}
