"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/lib/context/toast-context";
import { Voter } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/Loading";
import {
  CheckCircle2,
  ThumbsUp,
  HelpCircle,
  ThumbsDown,
  Lock,
  ArrowLeft,
} from "lucide-react";

function SurveyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const voterIdParam = searchParams.get("voterId");

  const { client, volunteer, user } = useAuth();
  const { success, error: toastError } = useToast();
  const clientId = client?.id || "client-1";

  const [voters, setVoters] = useState<Voter[]>([]);
  const [selectedVoterId, setSelectedVoterId] = useState(voterIdParam || "");
  const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null);

  // Survey Form
  const [outcome, setOutcome] = useState<Voter["contact_status"]>("favorable");
  const [notes, setNotes] = useState("");

  // Follow-up sub-form
  const [scheduleFollowUp, setScheduleFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0]
  );
  const [followUpNote, setFollowUpNote] = useState("");

  useEffect(() => {
    const list = dbService.getVoters(clientId, { pageSize: 500 }).data;
    setVoters(list);

    if (voterIdParam) {
      const v = list.find((item) => item.id === voterIdParam);
      if (v) {
        setSelectedVoter(v);
        setSelectedVoterId(v.id);
        setOutcome(v.contact_status !== "uncontacted" ? v.contact_status : "favorable");
      }
    } else if (list.length > 0) {
      const firstUncontacted = list.find((v) => v.contact_status === "uncontacted") || list[0];
      setSelectedVoter(firstUncontacted);
      setSelectedVoterId(firstUncontacted.id);
    }
  }, [clientId, voterIdParam]);

  const handleSelectVoter = (id: string) => {
    setSelectedVoterId(id);
    const v = voters.find((item) => item.id === id) || null;
    setSelectedVoter(v);
    if (v) {
      setOutcome(v.contact_status !== "uncontacted" ? v.contact_status : "favorable");
      setNotes(v.notes || "");
    }
  };

  const handleSubmitSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVoter) {
      toastError("No Voter Selected", "Please select an elector to record the survey.");
      return;
    }

    dbService.recordFieldActivity(
      {
        client_id: clientId,
        campaign_id: selectedVoter.campaign_id || "camp-1",
        volunteer_id: volunteer?.id || "vol-1",
        volunteer_name: volunteer?.name || user?.full_name || "Volunteer",
        voter_id: selectedVoter.id,
        voter_name: selectedVoter.name,
        voter_card: selectedVoter.voter_id_card,
        booth_name: selectedVoter.booth_number,
        activity_type: "door_to_door",
        outcome:
          outcome === "favorable"
            ? "Supporter / Favorable"
            : outcome === "unfavorable"
            ? "Opposed / Unfavorable"
            : outcome === "undecided"
            ? "Undecided"
            : outcome === "not_available"
            ? "Not Available / Door Locked"
            : "Contacted",
        notes,
      },
      {
        contact_status: outcome,
        notes,
        follow_up: scheduleFollowUp
          ? {
              scheduled_date: followUpDate,
              note: followUpNote || `Follow up on ${selectedVoter.name}`,
              priority: "high",
            }
          : undefined,
      }
    );

    success("Survey Logged", `Saved record for ${selectedVoter.name}`);
    router.push("/volunteer");
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="h-8 w-8 flex items-center justify-center rounded-[3px] border border-[#DEE2E6] bg-white text-[#212529]"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base font-bold text-[#212529]">Field Canvassing Survey</h1>
          <p className="text-[11px] text-[#6C757D]">Record door-to-door feedback & schedule follow-ups</p>
        </div>
      </div>

      {/* Voter Selector Dropdown */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-3 shadow-none">
        <label className="text-xs font-semibold text-[#212529] block mb-1">
          Select Elector for Canvassing
        </label>
        <select
          value={selectedVoterId}
          onChange={(e) => handleSelectVoter(e.target.value)}
          className="w-full bg-white border border-[#DEE2E6] rounded-[3px] p-2 text-xs font-medium text-[#212529] focus:outline-none focus:border-[#714B67]"
        >
          {voters.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} ({v.voter_id_card}) - {v.booth_number} [{v.contact_status}]
            </option>
          ))}
        </select>
      </div>

      {/* Selected Voter Info Card */}
      {selectedVoter && (
        <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-3.5 space-y-3 shadow-none">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#212529]">{selectedVoter.name}</h2>
              <p className="text-[11px] font-mono text-[#714B67] font-semibold">{selectedVoter.voter_id_card}</p>
            </div>
            <Badge status={selectedVoter.contact_status} size="sm" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs bg-[#F8F9FA] p-2.5 rounded-[3px] border border-[#DEE2E6]">
            <div>
              <span className="text-[#6C757D] text-[11px]">Age / Sex:</span>
              <p className="font-semibold text-[#212529]">{selectedVoter.age || "—"} yrs • {selectedVoter.gender || "—"}</p>
            </div>
            <div>
              <span className="text-[#6C757D] text-[11px]">Booth:</span>
              <p className="font-semibold text-[#212529]">{selectedVoter.booth_number}</p>
            </div>
            {selectedVoter.address && (
              <div className="col-span-2">
                <span className="text-[#6C757D] text-[11px]">Address:</span>
                <p className="text-[#212529] text-xs">{selectedVoter.address}</p>
              </div>
            )}
          </div>

          {/* Stance Buttons */}
          <div>
            <label className="text-xs font-semibold text-[#212529] block mb-1.5">
              Electoral Sentiment / Feedback:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOutcome("favorable")}
                className={`p-2.5 rounded-[3px] border flex flex-col items-center justify-center gap-1 transition-colors text-xs font-medium ${
                  outcome === "favorable"
                    ? "bg-[#E8F5E9] border-[#2E7D32] text-[#2E7D32] font-semibold"
                    : "bg-white border-[#DEE2E6] text-[#212529] hover:bg-[#F8F9FA]"
                }`}
              >
                <ThumbsUp className="w-4 h-4 text-[#2E7D32]" />
                <span>Favorable / Supporter</span>
              </button>

              <button
                type="button"
                onClick={() => setOutcome("undecided")}
                className={`p-2.5 rounded-[3px] border flex flex-col items-center justify-center gap-1 transition-colors text-xs font-medium ${
                  outcome === "undecided"
                    ? "bg-[#FFF3E0] border-[#E65100] text-[#E65100] font-semibold"
                    : "bg-white border-[#DEE2E6] text-[#212529] hover:bg-[#F8F9FA]"
                }`}
              >
                <HelpCircle className="w-4 h-4 text-[#E65100]" />
                <span>Undecided / Neutral</span>
              </button>

              <button
                type="button"
                onClick={() => setOutcome("unfavorable")}
                className={`p-2.5 rounded-[3px] border flex flex-col items-center justify-center gap-1 transition-colors text-xs font-medium ${
                  outcome === "unfavorable"
                    ? "bg-[#FFEBEE] border-[#C62828] text-[#C62828] font-semibold"
                    : "bg-white border-[#DEE2E6] text-[#212529] hover:bg-[#F8F9FA]"
                }`}
              >
                <ThumbsDown className="w-4 h-4 text-[#C62828]" />
                <span>Unfavorable / Opposed</span>
              </button>

              <button
                type="button"
                onClick={() => setOutcome("not_available")}
                className={`p-2.5 rounded-[3px] border flex flex-col items-center justify-center gap-1 transition-colors text-xs font-medium ${
                  outcome === "not_available"
                    ? "bg-[#F8F9FA] border-[#6C757D] text-[#212529] font-semibold"
                    : "bg-white border-[#DEE2E6] text-[#212529] hover:bg-[#F8F9FA]"
                }`}
              >
                <Lock className="w-4 h-4 text-[#6C757D]" />
                <span>Door Locked / Absent</span>
              </button>
            </div>
          </div>

          {/* Notes Input */}
          <Textarea
            label="Canvassing Notes & Grievances"
            placeholder="Local concerns, party leaning, key demands..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {/* Schedule Follow-up Toggle */}
          <div className="pt-2 border-t border-[#DEE2E6]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#212529]">
                Schedule Callback / Second Visit?
              </span>
              <input
                type="checkbox"
                checked={scheduleFollowUp}
                onChange={(e) => setScheduleFollowUp(e.target.checked)}
                className="w-4 h-4 accent-[#714B67] rounded cursor-pointer"
              />
            </div>

            {scheduleFollowUp && (
              <div className="mt-2.5 p-2.5 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[3px] space-y-2">
                <Input
                  label="Target Callback Date"
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  required
                />
                <Input
                  label="Callback Reason"
                  placeholder="e.g. Bring pamphlet, follow up on water issue"
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Action Submit */}
          <div className="pt-2">
            <Button
              onClick={handleSubmitSurvey}
              className="w-full h-10 text-xs font-semibold"
              variant="primary"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Submit Field Survey
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VolunteerSurveyPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Loading survey engine..." />}>
      <SurveyContent />
    </Suspense>
  );
}
