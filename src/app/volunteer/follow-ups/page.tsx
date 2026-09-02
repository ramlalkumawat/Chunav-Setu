"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/lib/context/toast-context";
import { useLanguage } from "@/lib/i18n";
import { FollowUp } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { Phone, Calendar, MapPin } from "lucide-react";

export default function VolunteerFollowUpsPage() {
  const { client, volunteer, user } = useAuth();
  const { success } = useToast();
  const { t } = useLanguage();
  const clientId = client?.id || user?.client_id || "";
  const volunteerId = volunteer?.id || user?.id || "";

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
        <h1 className="text-xl font-bold text-[#212529]">{t("followUpsTitle")}</h1>
        <p className="text-sm text-[#6C757D] mt-0.5">{t("followUpsSubtitle")}</p>
      </div>

      <div className="bg-white border border-[#DEE2E6] rounded-[4px] divide-y divide-[#DEE2E6] shadow-none overflow-hidden">
        {followUps.map((item) => {
          const isDone = item.status === "completed";
          return (
            <div
              key={item.id}
              className={`p-4 transition-colors ${isDone ? "bg-[#F8F9FA] opacity-75" : "bg-white"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-bold text-[15px] text-[#212529]">{item.voter_name}</h3>
                    <Badge status={item.status} size="md" />
                  </div>

                  <p className="text-sm text-[#212529] mt-2 bg-[#F8F9FA] p-3 rounded-[4px] border border-[#DEE2E6]">
                    {item.note}
                  </p>

                  <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-[#6C757D]">
                    <span className="flex items-center gap-1 font-mono text-[#714B67] font-bold">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Date: {formatDate(item.scheduled_date)}</span>
                    </span>

                    {item.voter_address && (
                      <span className="flex items-center gap-1 truncate max-w-[240px]">
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
                      className="p-2 rounded-[3px] bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] flex items-center justify-center"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}

                  {!isDone && (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleResolve(item)}
                    >
                      {t("resolve")}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {followUps.length === 0 && (
          <div className="text-center py-12 text-sm text-[#6C757D]">
            No pending follow-ups assigned to you.
          </div>
        )}
      </div>
    </div>
  );
}
