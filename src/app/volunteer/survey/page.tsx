"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/lib/context/toast-context";
import { useLanguage } from "@/lib/i18n";
import { Voter } from "@/lib/types";
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
  const { t } = useLanguage();
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="h-10 w-10 flex items-center justify-center rounded-[4px] border border-[#DEE2E6] bg-white text-[#212529]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#212529]">{t("surveyTitle")}</h1>
          <p className="text-[13px] text-[#6C757D]">{t("surveySubtitle")}</p>
        </div>
      </div>

      {/* Voter Selector Dropdown */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-4 shadow-none">
        <label className="text-[15px] font-bold text-[#212529] block mb-2">
          {t("voterDetails")}
        </label>
        <select
          value={selectedVoterId}
          onChange={(e) => handleSelectVoter(e.target.value)}
          className="w-full h-11 bg-white border border-[#DEE2E6] rounded-[4px] px-3 text-[15px] font-medium text-[#212529] focus:outline-none focus:border-[#714B67]"
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
        <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-5 space-y-4 shadow-none">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#212529]">{selectedVoter.name}</h2>
              <p className="text-sm font-mono text-[#714B67] font-bold">{selectedVoter.voter_id_card}</p>
            </div>
            <Badge status={selectedVoter.contact_status} size="md" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm bg-[#F8F9FA] p-3.5 rounded-[4px] border border-[#DEE2E6]">
            <div>
              <span className="text-[#6C757D] text-xs font-semibold">{t("genderAge")}:</span>
              <p className="font-bold text-[#212529]">{selectedVoter.age || "—"} yrs • {selectedVoter.gender || "—"}</p>
            </div>
            <div>
              <span className="text-[#6C757D] text-xs font-semibold">{t("pollingBooth")}:</span>
              <p className="font-bold text-[#212529]">{selectedVoter.booth_number}</p>
            </div>
            {selectedVoter.address && (
              <div className="col-span-2">
                <span className="text-[#6C757D] text-xs font-semibold">{t("addressWard")}:</span>
                <p className="text-[#212529] text-sm">{selectedVoter.address}</p>
              </div>
            )}
          </div>

          {/* Stance Buttons */}
          <div>
            <label className="text-[15px] font-bold text-[#212529] block mb-2">
              {t("outcomeSentiment")}:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOutcome("favorable")}
                className={`p-3.5 rounded-[4px] border flex flex-col items-center justify-center gap-1.5 transition-colors text-[14px] font-semibold ${
                  outcome === "favorable"
                    ? "bg-[#E8F5E9] border-[#2E7D32] text-[#2E7D32] font-bold shadow-sm"
                    : "bg-white border-[#DEE2E6] text-[#212529] hover:bg-[#F8F9FA]"
                }`}
              >
                <ThumbsUp className="w-5 h-5 text-[#2E7D32]" />
                <span>{t("favorable")}</span>
              </button>

              <button
                type="button"
                onClick={() => setOutcome("undecided")}
                className={`p-3.5 rounded-[4px] border flex flex-col items-center justify-center gap-1.5 transition-colors text-[14px] font-semibold ${
                  outcome === "undecided"
                    ? "bg-[#FFF3E0] border-[#E65100] text-[#E65100] font-bold shadow-sm"
                    : "bg-white border-[#DEE2E6] text-[#212529] hover:bg-[#F8F9FA]"
                }`}
              >
                <HelpCircle className="w-5 h-5 text-[#E65100]" />
                <span>{t("undecided")}</span>
              </button>

              <button
                type="button"
                onClick={() => setOutcome("unfavorable")}
                className={`p-3.5 rounded-[4px] border flex flex-col items-center justify-center gap-1.5 transition-colors text-[14px] font-semibold ${
                  outcome === "unfavorable"
                    ? "bg-[#FFEBEE] border-[#C62828] text-[#C62828] font-bold shadow-sm"
                    : "bg-white border-[#DEE2E6] text-[#212529] hover:bg-[#F8F9FA]"
                }`}
              >
                <ThumbsDown className="w-5 h-5 text-[#C62828]" />
                <span>{t("unfavorable")}</span>
              </button>

              <button
                type="button"
                onClick={() => setOutcome("not_available")}
                className={`p-3.5 rounded-[4px] border flex flex-col items-center justify-center gap-1.5 transition-colors text-[14px] font-semibold ${
                  outcome === "not_available"
                    ? "bg-[#F8F9FA] border-[#6C757D] text-[#212529] font-bold shadow-sm"
                    : "bg-white border-[#DEE2E6] text-[#212529] hover:bg-[#F8F9FA]"
                }`}
              >
                <Lock className="w-5 h-5 text-[#6C757D]" />
                <span>{t("notAvailable")}</span>
              </button>
            </div>
          </div>

          {/* Notes Input */}
          <Textarea
            label={t("canvassingNotes")}
            placeholder="Local concerns, party leaning, key demands..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {/* Schedule Follow-up Toggle */}
          <div className="pt-3 border-t border-[#DEE2E6]">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-semibold text-[#212529]">
                Schedule Callback / Second Visit?
              </span>
              <input
                type="checkbox"
                checked={scheduleFollowUp}
                onChange={(e) => setScheduleFollowUp(e.target.checked)}
                className="w-5 h-5 accent-[#714B67] rounded cursor-pointer"
              />
            </div>

            {scheduleFollowUp && (
              <div className="mt-3 p-3.5 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px] space-y-3">
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
          <div className="pt-3">
            <Button
              onClick={handleSubmitSurvey}
              className="w-full h-12 text-base font-bold"
              variant="primary"
              leftIcon={<CheckCircle2 className="w-5 h-5" />}
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
