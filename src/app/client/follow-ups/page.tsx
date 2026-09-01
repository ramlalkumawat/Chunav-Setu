"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/lib/context/toast-context";
import { FollowUp, Volunteer } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { formatDate } from "@/lib/utils";
import {
  Clock,
  Search,
  CheckCircle2,
  Calendar,
  Phone,
  UserCheck,
  Building2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

export default function FollowUpsPage() {
  const { client, user } = useAuth();
  const { success } = useToast();
  const clientId = client?.id || "client-1";

  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");

  // Resolving modal
  const [resolvingItem, setResolvingItem] = useState<FollowUp | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");

  const loadData = () => {
    setFollowUps(dbService.getFollowUps(clientId));
    setVolunteers(dbService.getVolunteers(clientId));
  };

  useEffect(() => {
    loadData();
  }, [clientId]);

  const filteredFollowUps = followUps.filter((f) => {
    const matchesStatus = statusFilter === "all" || f.status === statusFilter;
    const matchesSearch =
      f.voter_name.toLowerCase().includes(search.toLowerCase()) ||
      (f.note && f.note.toLowerCase().includes(search.toLowerCase())) ||
      (f.volunteer_name && f.volunteer_name.toLowerCase().includes(search.toLowerCase())) ||
      (f.voter_mobile && f.voter_mobile.includes(search));

    return matchesStatus && matchesSearch;
  });

  const handleResolve = () => {
    if (!resolvingItem) return;
    dbService.updateFollowUp(clientId, resolvingItem.id, {
      status: "completed",
      resolution_note: resolutionNote || "Resolved follow up successfully.",
    });

    dbService.logAction(
      { id: user?.id, name: user?.full_name || "Admin" },
      "FOLLOW_UP_RESOLVED",
      "FollowUp",
      resolvingItem.id,
      { voter: resolvingItem.voter_name, note: resolutionNote },
      clientId
    );

    success("Follow-up Resolved", `Marked follow-up for ${resolvingItem.voter_name} as completed.`);
    setResolvingItem(null);
    setResolutionNote("");
    loadData();
  };

  const handleCancel = (item: FollowUp) => {
    dbService.updateFollowUp(clientId, item.id, { status: "cancelled" });
    success("Follow-up Cancelled", `Cancelled follow-up for ${item.voter_name}`);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
            Follow-up & Callback Tracker
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Monitor undecided voters, pending inquiries, and scheduled second-round visits
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E5E2DC] rounded-lg text-xs font-semibold">
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              statusFilter === "pending" ? "bg-[#1F3A5F] text-white" : "text-[#64748B] hover:text-[#172033]"
            }`}
          >
            Pending ({followUps.filter((f) => f.status === "pending").length})
          </button>
          <button
            onClick={() => setStatusFilter("completed")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              statusFilter === "completed" ? "bg-[#2F6B4F] text-white" : "text-[#64748B] hover:text-[#172033]"
            }`}
          >
            Completed ({followUps.filter((f) => f.status === "completed").length})
          </button>
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              statusFilter === "all" ? "bg-[#1F3A5F] text-white" : "text-[#64748B] hover:text-[#172033]"
            }`}
          >
            All ({followUps.length})
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search voter, volunteer, note..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Follow-up Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFollowUps.map((item) => (
          <Card key={item.id} padding="md" className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge status={item.priority} size="sm" />
                <Badge status={item.status} size="sm" />
              </div>

              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-sm font-bold text-[#172033]">{item.voter_name}</h3>
                {item.voter_mobile && (
                  <a
                    href={`tel:${item.voter_mobile}`}
                    className="inline-flex items-center gap-1 text-xs font-mono text-[#1F3A5F] hover:underline"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{item.voter_mobile}</span>
                  </a>
                )}
              </div>

              {item.note && (
                <p className="text-xs text-[#172033] mt-2 bg-[#FAFAF8] p-2.5 rounded-md border border-[#E5E2DC] leading-relaxed">
                  {item.note}
                </p>
              )}

              {item.resolution_note && (
                <div className="mt-2 bg-[#EAF3EE] p-2 rounded-md border border-[#C3DEC9] text-[11px] text-[#2F6B4F]">
                  <strong>Resolution:</strong> {item.resolution_note}
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-[#E5E2DC] flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748B]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#1F3A5F]" />
                  <span>Scheduled: <strong className="text-[#172033]">{formatDate(item.scheduled_date)}</strong></span>
                </span>

                <span className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>{item.volunteer_name || "Unassigned"}</span>
                </span>
              </div>
            </div>

            {item.status === "pending" && (
              <div className="mt-4 pt-3 border-t border-[#E5E2DC] flex items-center justify-end gap-2">
                <button
                  onClick={() => handleCancel(item)}
                  className="px-2.5 py-1 text-xs font-medium text-[#64748B] hover:text-[#B94A48]"
                >
                  Cancel
                </button>
                <Button
                  size="sm"
                  variant="success"
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  onClick={() => setResolvingItem(item)}
                >
                  Mark Resolved
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {filteredFollowUps.length === 0 && (
        <Card padding="lg" className="text-center py-12">
          <Clock className="w-8 h-8 text-[#64748B] mx-auto mb-2 opacity-50" />
          <p className="text-xs font-semibold text-[#172033]">No follow-ups in this view</p>
          <p className="text-xs text-[#64748B] mt-0.5">
            Follow-ups scheduled during field surveys will appear here for tracking.
          </p>
        </Card>
      )}

      {/* Resolve Follow-up Modal */}
      {resolvingItem && (
        <Modal
          isOpen={true}
          onClose={() => setResolvingItem(null)}
          title="Resolve Voter Follow-up"
          subtitle={`Completing callback for ${resolvingItem.voter_name}`}
          maxWidth="sm"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setResolvingItem(null)}>
                Cancel
              </Button>
              <Button variant="success" size="sm" onClick={handleResolve}>
                Save Resolution
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <div className="p-2.5 bg-[#FAFAF8] rounded border border-[#E5E2DC] text-xs">
              <p className="font-semibold text-[#172033]">Original Note:</p>
              <p className="text-[#64748B] mt-0.5">{resolvingItem.note}</p>
            </div>

            <Textarea
              label="Resolution Summary / Feedback"
              placeholder="e.g. Spoke over phone, answered query on drainage project, confirmed vote."
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              required
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
