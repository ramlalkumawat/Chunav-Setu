"use client";

import React, { useState } from "react";
import { Voter, CallOutcome, UserRole } from "@/lib/types";
import { useAuth } from "@/lib/context/auth-context";
import { useLanguage } from "@/lib/i18n";
import { useToast } from "@/lib/context/toast-context";
import { dbService } from "@/lib/store/data-service";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import {
  PhoneCall,
  PhoneForwarded,
  CheckCircle2,
  PhoneOff,
  Clock,
  AlertCircle,
  Calendar,
} from "lucide-react";

interface CallLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  voter: Voter | null;
  onLogged?: () => void;
}

export function CallLogModal({
  isOpen,
  onClose,
  voter,
  onLogged,
}: CallLogModalProps) {
  const { user, role, client, volunteer } = useAuth();
  const { t, language } = useLanguage();
  const { success } = useToast();
  const isHindi = language === "hi";

  const [callStatus, setCallStatus] = useState<CallOutcome>("Connected");
  const [note, setNote] = useState("");
  const [followUpDate, setFollowUpDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!voter) return null;

  const clientId = client?.id || voter?.client_id || user?.client_id || "";
  const actorName = volunteer?.name || user?.full_name || "Campaign Team";
  const userRole: UserRole = (role as UserRole) || "volunteer";

  const outcomes: { value: CallOutcome; label: string; icon: any; color: string }[] = [
    {
      value: "Connected",
      label: isHindi ? "कॉल कनेक्टेड (Connected)" : "Connected / Spoke with Elector",
      icon: CheckCircle2,
      color: "text-[#2E7D32] bg-[#E8F5E9] border-[#C8E6C9]",
    },
    {
      value: "No Answer",
      label: isHindi ? "उत्तर नहीं दिया (No Answer)" : "Ringing / No Answer",
      icon: PhoneOff,
      color: "text-[#E65100] bg-[#FFF3E0] border-[#FFE0B2]",
    },
    {
      value: "Busy",
      label: isHindi ? "व्यस्त / बाद में कॉल (Busy)" : "Busy / Call Later",
      icon: Clock,
      color: "text-[#1565C0] bg-[#E3F2FD] border-[#BBDEFB]",
    },
    {
      value: "Follow-up Required",
      label: isHindi ? "पुनः संपर्क आवश्यक (Follow-up Required)" : "Follow-up Required (Callback / Assistance)",
      icon: PhoneForwarded,
      color: "text-[#714B67] bg-[#F1ECEF] border-[#D9CAD5]",
    },
    {
      value: "Wrong Number",
      label: isHindi ? "गलत नंबर (Wrong Number)" : "Wrong / Disconnected Number",
      icon: AlertCircle,
      color: "text-[#C62828] bg-[#FFEBEE] border-[#FFCDD2]",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      dbService.recordCallResult(clientId, {
        voterId: voter.id,
        userId: user?.id,
        userRole,
        actorName,
        callStatus,
        note: note.trim() || undefined,
        scheduleFollowUp: callStatus === "Follow-up Required",
        followUpDate: callStatus === "Follow-up Required" ? followUpDate : undefined,
      });

      success(
        isHindi ? "कॉल परिणाम दर्ज" : "Call Logged Successfully",
        isHindi
          ? `${voter.name} के लिए स्थिति "${callStatus}" दर्ज की गई।`
          : `Call outcome "${callStatus}" recorded for ${voter.name}.`
      );

      setNote("");
      onClose();
      if (onLogged) onLogged();
    } catch (err) {
      console.error("Failed to log call:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isHindi ? "कॉल परिणाम दर्ज करें" : "Record Call Outcome"}
      subtitle={`${voter.name} • ${voter.mobile || voter.voter_id_card}`}
      maxWidth="md"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            size="md"
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            leftIcon={<PhoneCall className="w-4 h-4" />}
          >
            {isHindi ? "परिणाम सहेजें" : "Save Call Log"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Voter Quick Info Strip */}
        <div className="p-3 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px] flex items-center justify-between">
          <div>
            <p className="font-bold text-sm text-[#212529]">{voter.name}</p>
            <p className="text-xs text-[#6C757D] font-mono">
              {voter.voter_id_card} • {voter.booth_number || "Booth 101"}
            </p>
          </div>
          {voter.mobile && (
            <a
              href={`tel:${voter.mobile}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] text-xs font-bold font-mono"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{voter.mobile}</span>
            </a>
          )}
        </div>

        {/* Outcome Choices */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#6C757D] uppercase tracking-wider block">
            {isHindi ? "कॉल परिणाम चुनें" : "Select Call Result"}
          </label>
          <div className="space-y-1.5">
            {outcomes.map((item) => {
              const Icon = item.icon;
              const isSelected = callStatus === item.value;
              return (
                <label
                  key={item.value}
                  className={`flex items-center gap-3 p-3 rounded-[4px] border cursor-pointer transition-all ${
                    isSelected
                      ? `${item.color} font-bold shadow-2xs`
                      : "bg-white border-[#DEE2E6] hover:bg-[#F8F9FA] text-[#495057]"
                  }`}
                >
                  <input
                    type="radio"
                    name="callStatus"
                    value={item.value}
                    checked={isSelected}
                    onChange={() => setCallStatus(item.value)}
                    className="w-4 h-4 text-[#714B67] focus:ring-[#714B67]"
                  />
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Conditional Follow-up Date Field */}
        {callStatus === "Follow-up Required" && (
          <div className="p-3 bg-[#F1ECEF] border border-[#D9CAD5] rounded-[4px] space-y-2 animate-in fade-in duration-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#714B67] uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" />
              <span>{isHindi ? "फॉलो-अप तिथि निर्धारित करें" : "Schedule Follow-up Date"}</span>
            </div>
            <Input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              required
            />
          </div>
        )}

        {/* Optional Notes */}
        <div>
          <Textarea
            label={isHindi ? "अतिरिक्त टिप्पणी / मतदाता फीडबैक" : "Call Notes / Voter Feedback"}
            placeholder={
              isHindi
                ? "बातचीत का मुख्य विवरण, शिकायतें या मतदान की पुष्टि..."
                : "Key points discussed, polling queries or assistance notes..."
            }
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
        </div>
      </form>
    </Modal>
  );
}
