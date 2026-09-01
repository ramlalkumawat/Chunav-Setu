"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/lib/context/toast-context";
import { FollowUp, Volunteer } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { OdooControlPanel } from "@/components/ui/OdooControlPanel";
import { formatDate } from "@/lib/utils";
import {
  Clock,
  Search,
  CheckCircle2,
  Phone,
  XCircle,
} from "lucide-react";

export default function FollowUpsPage() {
  const { client, user } = useAuth();
  const { success } = useToast();
  const clientId = client?.id || "client-1";

  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");

  // Resolving modal
  const [resolvingItem, setResolvingItem] = useState<FollowUp | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");

  const loadData = () => {
    setFollowUps(dbService.getFollowUps(clientId));
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
    <div className="space-y-3">
      {/* Odoo Control Panel */}
      <OdooControlPanel
        breadcrumb="Campaign"
        title="Follow-ups & Callbacks"
        subtitle="Manage pending elector inquiries, second-round visits, and scheduled responses"
        searchPlaceholder="Search voter, note, volunteer..."
        searchValue={search}
        onSearchChange={setSearch}
        filterComponent={
          <div className="flex items-center gap-1">
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-2.5 py-1 rounded-[3px] text-xs font-medium transition-colors ${
                statusFilter === "pending" ? "bg-[#714B67] text-white" : "bg-white text-[#495057] border border-[#DEE2E6] hover:bg-[#F8F9FA]"
              }`}
            >
              Pending ({followUps.filter((f) => f.status === "pending").length})
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-2.5 py-1 rounded-[3px] text-xs font-medium transition-colors ${
                statusFilter === "completed" ? "bg-[#2E7D32] text-white" : "bg-white text-[#495057] border border-[#DEE2E6] hover:bg-[#F8F9FA]"
              }`}
            >
              Completed ({followUps.filter((f) => f.status === "completed").length})
            </button>
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded-[3px] text-xs font-medium transition-colors ${
                statusFilter === "all" ? "bg-[#714B67] text-white" : "bg-white text-[#495057] border border-[#DEE2E6] hover:bg-[#F8F9FA]"
              }`}
            >
              All Records ({followUps.length})
            </button>
          </div>
        }
      />

      {/* Dense Odoo Table for Follow-ups */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="odoo-table">
            <thead>
              <tr>
                <th>Elector & Contact</th>
                <th>Inquiry / Callback Reason</th>
                <th>Scheduled Date</th>
                <th>Assigned Canvasser</th>
                <th>Priority</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredFollowUps.map((item) => (
                <tr key={item.id}>
                  <td>
                    <p className="font-semibold text-[#212529]">{item.voter_name}</p>
                    {item.voter_mobile && (
                      <span className="font-mono text-[11px] text-[#6C757D] flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {item.voter_mobile}
                      </span>
                    )}
                  </td>
                  <td className="text-xs">
                    <p className="text-[#212529] max-w-md">{item.note}</p>
                    {item.resolution_note && (
                      <p className="text-[11px] text-[#2E7D32] mt-0.5 font-medium">
                        Resolution: {item.resolution_note}
                      </p>
                    )}
                  </td>
                  <td className="text-xs text-[#495057] font-mono">
                    {formatDate(item.scheduled_date)}
                  </td>
                  <td className="text-xs text-[#495057]">
                    {item.volunteer_name || "Unassigned"}
                  </td>
                  <td>
                    <Badge status={item.priority} size="sm" />
                  </td>
                  <td>
                    <Badge status={item.status} size="sm" />
                  </td>
                  <td className="text-right">
                    {item.status === "pending" ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleCancel(item)}
                          className="px-2 py-0.5 text-[11px] text-[#6C757D] hover:text-[#C62828] bg-transparent rounded"
                        >
                          Cancel
                        </button>
                        <Button
                          size="sm"
                          variant="success"
                          leftIcon={<CheckCircle2 className="w-3 h-3" />}
                          onClick={() => setResolvingItem(item)}
                        >
                          Resolve
                        </Button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#2E7D32] font-semibold">
                        Resolved
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredFollowUps.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-xs text-[#6C757D]">
                    No follow-ups recorded matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolve Follow-up Modal */}
      {resolvingItem && (
        <Modal
          isOpen={true}
          onClose={() => setResolvingItem(null)}
          title="Resolve Elector Callback"
          subtitle={`Completing callback for ${resolvingItem.voter_name}`}
          maxWidth="sm"
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setResolvingItem(null)}>
                Discard
              </Button>
              <Button variant="primary" size="sm" onClick={handleResolve}>
                Save Resolution
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="p-2.5 bg-[#F8F9FA] rounded-[3px] border border-[#DEE2E6]">
              <p className="font-semibold text-[#212529]">Original Follow-up Reason:</p>
              <p className="text-[#6C757D] mt-0.5">{resolvingItem.note}</p>
            </div>

            <Textarea
              label="Resolution Summary & Action Taken"
              placeholder="e.g. Spoke over phone, answered query regarding local road tender, voter confirmed support."
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
