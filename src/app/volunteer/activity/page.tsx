"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useLanguage } from "@/lib/i18n";
import { FieldActivity } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";

export default function VolunteerActivityPage() {
  const { client, volunteer, user } = useAuth();
  const { t } = useLanguage();
  const clientId = client?.id || user?.client_id || "";
  const volunteerId = volunteer?.id || user?.id || "";

  const [activities, setActivities] = useState<FieldActivity[]>([]);

  useEffect(() => {
    setActivities(dbService.getFieldActivities(clientId, volunteerId));
  }, [clientId, volunteerId]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-[#212529]">{t("fieldWorkTitle")}</h1>
        <p className="text-sm text-[#6C757D] mt-0.5">{t("fieldWorkSubtitle")}</p>
      </div>

      <div className="bg-white border border-[#DEE2E6] rounded-[4px] divide-y divide-[#DEE2E6] shadow-none overflow-hidden">
        {activities.map((act) => (
          <div key={act.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <p className="font-bold text-[15px] text-[#212529]">{act.voter_name}</p>
                  <Badge status={act.outcome} size="md" />
                </div>

                {act.notes && (
                  <p className="text-sm text-[#495057] mt-2 bg-[#F8F9FA] p-3 rounded-[4px] border border-[#DEE2E6] italic">
                    "{act.notes}"
                  </p>
                )}

                <p className="text-xs text-[#6C757D] mt-2 font-mono">
                  {act.booth_name ? `${act.booth_name} • ` : ""}{formatDateTime(act.created_at)}
                </p>
              </div>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="text-center py-12 text-sm text-[#6C757D]">
            No survey activities recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
