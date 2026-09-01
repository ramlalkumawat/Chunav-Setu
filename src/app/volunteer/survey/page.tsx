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
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/Loading";
import {
  Compass,
  UserCheck,
  CheckCircle2,
  ThumbsUp,
  HelpCircle,
  ThumbsDown,
  Lock,
  Calendar,
  Clock,
  ArrowLeft,
  Search,
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

    success("Field Survey Recorded", `Survey logged for ${selectedVoter.name}`);
    router.push("/volunteer");
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-lg border border-[#E5E2DC] bg-white text-[#172033]"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-[#172033]">Door-to-Door Field Survey</h1>
          <p className="text-xs text-[#64748B]">Log resident feedback & schedule callbacks</p>
        </div>
      </div>

      {/* Voter Selector Dropdown */}
      <Card padding="sm" className="bg-[#FAFAF8]">
        <label className="text-xs font-semibold text-[#172033] block mb-1">
          Select Elector for Canvassing
        </label>
        <select
          value={selectedVoterId}
          onChange={(e) => handleSelectVoter(e.target.value)}
          className="w-full bg-white border border-[#E5E2DC] rounded-lg p-2.5 text-xs font-medium text-[#172033] focus:border-[#1F3A5F]"
        >
          {voters.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} ({v.voter_id_card}) - {v.booth_number} [{v.contact_status}]
            </option>
          ))}
        </select>
      </Card>

      {/* Selected Voter Info Card */}
      {selectedVoter && (
        <Card padding="md" className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold text-[#172033]">{selectedVoter.name}</h2>
              <p className="text-xs font-mono text-[#64748B] mt-0.5">{selectedVoter.voter_id_card}</p>
            </div>
            <Badge status={selectedVoter.contact_status} size="sm" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs bg-[#FAFAF8] p-2.5 rounded-lg border border-[#E5E2DC]">
            <div>
              <span className="text-[#64748B]">Age / Sex:</span>
              <p className="font-semibold text-[#172033]">{selectedVoter.age || "—"} yrs • {selectedVoter.gender || "—"}</p>
            </div>
            <div>
              <span className="text-[#64748B]">Booth:</span>
              <p className="font-semibold text-[#172033]">{selectedVoter.booth_number}</p>
            </div>
            {selectedVoter.address && (
              <div className="col-span-2">
                <span className="text-[#64748B]">Address:</span>
                <p className="text-[#172033]">{selectedVoter.address}</p>
              </div>
            )}
          </div>

          {/* Big Touch-Target Canvassing Sentiment Buttons */}
          <div>
            <label className="text-xs font-bold text-[#172033] block mb-2">
              Voter Stance / Canvassing Outcome:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOutcome("favorable")}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold ${
                  outcome === "favorable"
                    ? "bg-[#EAF3EE] border-[#2F6B4F] text-[#2F6B4F] shadow-sm ring-2 ring-[#2F6B4F]"
                    : "bg-white border-[#E5E2DC] text-[#172033] hover:bg-[#F7F6F2]"
                }`}
              >
                <ThumbsUp className="w-5 h-5 text-[#2F6B4F]" />
                <span>Favorable / Supporter</span>
              </button>

              <button
                type="button"
                onClick={() => setOutcome("undecided")}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold ${
                  outcome === "undecided"
                    ? "bg-[#FEF7EC] border-[#B7791F] text-[#B7791F] shadow-sm ring-2 ring-[#B7791F]"
                    : "bg-white border-[#E5E2DC] text-[#172033] hover:bg-[#F7F6F2]"
                }`}
              >
                <HelpCircle className="w-5 h-5 text-[#B7791F]" />
                <span>Undecided / Neutral</span>
              </button>

              <button
                type="button"
                onClick={() => setOutcome("unfavorable")}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold ${
                  outcome === "unfavorable"
                    ? "bg-[#FDF2F2] border-[#B94A48] text-[#B94A48] shadow-sm ring-2 ring-[#B94A48]"
                    : "bg-white border-[#E5E2DC] text-[#172033] hover:bg-[#F7F6F2]"
                }`}
              >
                <ThumbsDown className="w-5 h-5 text-[#B94A48]" />
                <span>Unfavorable / Opposed</span>
              </button>

              <button
                type="button"
                onClick={() => setOutcome("not_available")}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold ${
                  outcome === "not_available"
                    ? "bg-[#F1F3F5] border-[#64748B] text-[#172033] shadow-sm ring-2 ring-[#64748B]"
                    : "bg-white border-[#E5E2DC] text-[#172033] hover:bg-[#F7F6F2]"
                }`}
              >
                <Lock className="w-5 h-5 text-[#64748B]" />
                <span>Door Locked / Absent</span>
              </button>
            </div>
          </div>

          {/* Notes Input */}
          <Textarea
            label="Field Canvassing Notes"
            placeholder="Key demands (water, roads, streetlights), party preference, influential family members..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {/* 1-Tap Schedule Follow-up Toggle */}
          <div className="pt-2 border-t border-[#E5E2DC]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#172033]">
                Schedule Callback or Second Visit?
              </span>
              <input
                type="checkbox"
                checked={scheduleFollowUp}
                onChange={(e) => setScheduleFollowUp(e.target.checked)}
                className="w-4 h-4 text-[#1F3A5F] rounded focus:ring-[#1F3A5F]"
              />
            </div>

            {scheduleFollowUp && (
              <div className="mt-3 p-3 bg-[#FAFAF8] border border-[#E5E2DC] rounded-lg space-y-2.5 animate-in fade-in">
                <Input
                  label="Target Follow-up Date"
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  required
                />
                <Input
                  label="Follow-up Objective"
                  placeholder="e.g. Bring candidate brochure, answer grievance on power cut"
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Big Action Submit */}
          <div className="pt-3">
            <Button
              onClick={handleSubmitSurvey}
              className="w-full py-3 text-sm font-bold shadow-md"
              leftIcon={<CheckCircle2 className="w-5 h-5" />}
            >
              Submit Field Survey
            </Button>
          </div>
        </Card>
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
