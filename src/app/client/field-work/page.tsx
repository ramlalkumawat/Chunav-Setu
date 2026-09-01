"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { FieldActivity, Volunteer, Booth } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";
import { Compass, Search, UserCheck, MapPin, MessageSquare, Calendar } from "lucide-react";

export default function FieldWorkPage() {
  const { client } = useAuth();
  const clientId = client?.id || "client-1";

  const [activities, setActivities] = useState<FieldActivity[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [search, setSearch] = useState("");
  const [volFilter, setVolFilter] = useState("all");

  useEffect(() => {
    setActivities(dbService.getFieldActivities(clientId));
    setVolunteers(dbService.getVolunteers(clientId));
  }, [clientId]);

  const filteredActivities = activities.filter((act) => {
    const matchesVol = volFilter === "all" || act.volunteer_id === volFilter;
    const matchesSearch =
      act.voter_name.toLowerCase().includes(search.toLowerCase()) ||
      (act.voter_card && act.voter_card.toLowerCase().includes(search.toLowerCase())) ||
      act.volunteer_name.toLowerCase().includes(search.toLowerCase()) ||
      act.outcome.toLowerCase().includes(search.toLowerCase()) ||
      (act.notes && act.notes.toLowerCase().includes(search.toLowerCase()));

    return matchesVol && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
            Field Activity & Canvassing Stream
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time feed of door-to-door submissions and voter feedback logged by mobile volunteers
          </p>
        </div>

        <span className="px-3 py-1 bg-[#EAF3EE] text-[#2F6B4F] border border-[#C3DEC9] rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-[#2F6B4F] animate-pulse" />
          <span>Live Field Telemetry</span>
        </span>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search voter, volunteer, feedback note..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="w-full sm:w-60">
          <Select
            value={volFilter}
            onChange={(e) => setVolFilter(e.target.value)}
            options={[
              { value: "all", label: "All Volunteers" },
              ...volunteers.map((v) => ({ value: v.id, label: v.name })),
            ]}
          />
        </div>
      </div>

      {/* Activity Cards Feed */}
      <div className="space-y-3">
        {filteredActivities.map((act) => (
          <Card key={act.id} padding="md" className="hover:border-[#1F3A5F]/40 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#EAEFF5] text-[#1F3A5F] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-sm text-[#172033]">{act.voter_name}</h3>
                    {act.voter_card && (
                      <span className="text-[11px] font-mono text-[#64748B] bg-[#FAFAF8] px-1.5 py-0.5 rounded border border-[#E5E2DC]">
                        {act.voter_card}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EAF3EE] text-[#2F6B4F] border border-[#C3DEC9]">
                      {act.outcome}
                    </span>
                  </div>

                  {act.notes && (
                    <p className="text-xs text-[#172033] mt-2 bg-[#FAFAF8] p-2.5 rounded-md border border-[#E5E2DC]/80 leading-relaxed italic">
                      "{act.notes}"
                    </p>
                  )}

                  <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-[#64748B]">
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-[#1F3A5F]" />
                      <span>Canvasser: <strong className="text-[#172033]">{act.volunteer_name}</strong></span>
                    </span>

                    {act.booth_name && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>{act.booth_name}</span>
                      </span>
                    )}

                    <span className="capitalize text-[11px] px-2 py-0.5 bg-[#F1F3F5] rounded text-[#64748B]">
                      {act.activity_type.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>

              <span className="text-[11px] text-[#64748B] font-mono whitespace-nowrap self-end sm:self-start">
                {formatDateTime(act.created_at)}
              </span>
            </div>
          </Card>
        ))}

        {filteredActivities.length === 0 && (
          <Card padding="lg" className="text-center py-12">
            <Compass className="w-8 h-8 text-[#64748B] mx-auto mb-2 opacity-50" />
            <p className="text-xs font-semibold text-[#172033]">No field activities recorded</p>
            <p className="text-xs text-[#64748B] mt-0.5">
              Field surveys submitted via the volunteer mobile app will stream here in real time.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
