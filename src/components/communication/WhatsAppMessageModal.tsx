"use client";

import React, { useState, useEffect } from "react";
import { Voter, Client, UserRole } from "@/lib/types";
import { useAuth } from "@/lib/context/auth-context";
import { useLanguage } from "@/lib/i18n";
import { useToast } from "@/lib/context/toast-context";
import { dbService } from "@/lib/store/data-service";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { MessageSquare, AlertTriangle, ShieldCheck, Check } from "lucide-react";

interface WhatsAppMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  voter: Voter | null;
  client?: Client | null;
  onSent?: () => void;
}

export function WhatsAppMessageModal({
  isOpen,
  onClose,
  voter,
  client: propClient,
  onSent,
}: WhatsAppMessageModalProps) {
  const { user, role, client: authClient, volunteer } = useAuth();
  const { t, language } = useLanguage();
  const { success, error: toastError } = useToast();
  const isHindi = language === "hi";

  const client = propClient || authClient;
  const clientId = client?.id || "client-1";
  const actorName = volunteer?.name || user?.full_name || "Campaign Team";
  const userRole: UserRole = (role as UserRole) || "volunteer";

  const [message, setMessage] = useState("");
  const [templateType, setTemplateType] = useState<"polling_info" | "polling_reminder">("polling_info");

  useEffect(() => {
    if (!voter) return;

    const electionDate = client?.election_date || "12 December 2026";
    const boothNumber = voter.booth_number || "Booth 101";
    const boothName = voter.booth_name || "Government Primary School";

    if (templateType === "polling_info") {
      setMessage(
        isHindi
          ? `नमस्कार ${voter.name},

आपके मतदान से संबंधित आधिकारिक जानकारी:

मतदाता का नाम: ${voter.name}
पहचान क्रमांक (EPIC): ${voter.voter_id_card}
मतदान केंद्र: ${boothName}
बूथ संख्या: ${boothNumber}
मतदान दिनांक: ${electionDate}
मतदान समय: सुबह 07:00 बजे से शाम 06:00 बजे तक

कृपया आधिकारिक चुनाव निर्देशों के अनुसार मतदान केंद्र पर अपना पहचान पत्र लेकर जाएं।

— Chunav Setu (${client?.candidate_name || "अभियान सेवा केंद्र"})`
          : `Dear ${voter.name},

Official Polling Information Reminder:

Elector: ${voter.name}
EPIC ID: ${voter.voter_id_card}
Polling Station: ${boothName}
Booth Number: ${boothNumber}
Polling Date: ${electionDate}
Polling Time: 07:00 AM to 06:00 PM

Please cast your vote in accordance with official Election Commission directives.

— Chunav Setu (${client?.candidate_name || "Campaign Desk"})`
      );
    } else {
      setMessage(
        isHindi
          ? `नमस्कार ${voter.name},

मतदान दिवस स्मरण पत्र:
दिनांक ${electionDate} को कृपया अपने आवंटित बूथ (${boothNumber} - ${boothName}) पर पहुंचकर अपने बहुमूल्य मताधिकार का प्रयोग करें।

— Chunav Setu`
          : `Dear ${voter.name},

Polling Day Reminder:
Please exercise your democratic right on ${electionDate} at your designated booth (${boothNumber} - ${boothName}).

— Chunav Setu`
      );
    }
  }, [voter, client, templateType, isHindi]);

  if (!voter) return null;

  const handleSendWhatsApp = () => {
    if (voter.opt_out || voter.whatsapp_allowed === false) {
      toastError(
        "Communication Blocked",
        "This elector has opted out of automated WhatsApp messages."
      );
      return;
    }

    const cleanPhone = (voter.mobile || "").replace(/\D/g, "");

    dbService.recordWhatsAppOpen(clientId, {
      voterId: voter.id,
      userId: user?.id,
      userRole,
      actorName,
      messageText: message,
    });

    if (cleanPhone) {
      const waUrl = `https://wa.me/${cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone}?text=${encodeURIComponent(
        message
      )}`;
      window.open(waUrl, "_blank");
    } else {
      const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");
    }

    success(
      isHindi ? "व्हाट्सऐप संदेश प्रेषित" : "WhatsApp Dispatched",
      isHindi ? `${voter.name} के लिए चैट विंडो खोली गई।` : `WhatsApp opened for ${voter.name}`
    );

    onClose();
    if (onSent) onSent();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isHindi ? "व्हाट्सऐप संदेश भेजें" : "Send WhatsApp Information"}
      subtitle={`${voter.name} • ${voter.mobile || "Phone not registered"}`}
      maxWidth="md"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            size="md"
            variant="primary"
            onClick={handleSendWhatsApp}
            className="bg-[#25D366] hover:bg-[#20bd5a] text-white border-transparent"
            leftIcon={<MessageSquare className="w-4 h-4" />}
          >
            {isHindi ? "व्हाट्सऐप खोलें" : "Open WhatsApp"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Opt-out Warning */}
        {voter.opt_out && (
          <div className="p-3 bg-[#FFEBEE] border border-[#FFCDD2] rounded-[4px] text-xs text-[#C62828] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>
              {isHindi
                ? "सावधान: इस मतदाता ने संपर्क संदेशों से बाहर (Opt-out) रहने का अनुरोध किया है।"
                : "Notice: This voter has requested to opt out of campaign messaging."}
            </span>
          </div>
        )}

        {/* Template Selector */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTemplateType("polling_info")}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-[4px] border transition-colors ${
              templateType === "polling_info"
                ? "bg-[#714B67] text-white border-[#714B67]"
                : "bg-white text-[#495057] border-[#DEE2E6] hover:bg-[#F8F9FA]"
            }`}
          >
            {isHindi ? "मतदान पर्ची विवरण" : "Polling Station Details"}
          </button>
          <button
            type="button"
            onClick={() => setTemplateType("polling_reminder")}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-[4px] border transition-colors ${
              templateType === "polling_reminder"
                ? "bg-[#714B67] text-white border-[#714B67]"
                : "bg-white text-[#495057] border-[#DEE2E6] hover:bg-[#F8F9FA]"
            }`}
          >
            {isHindi ? "मतदान दिवस स्मरण" : "Quick Turnout Reminder"}
          </button>
        </div>

        {/* Message Preview & Editor */}
        <Textarea
          label={isHindi ? "संदेश पूर्वावलोकन (Message Content)" : "Message Preview"}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={8}
          className="font-sans text-sm leading-relaxed"
        />

        {/* Official Compliance Notice */}
        <div className="p-2.5 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px] flex items-center gap-2 text-xs text-[#6C757D]">
          <ShieldCheck className="w-4 h-4 text-[#2E7D32] flex-shrink-0" />
          <span>
            {isHindi
              ? "सूचनात्मक चुनाव संदेश • कोई राजनीतिक प्रलोभन या गुप्त मतदान की जानकारी शामिल नहीं है।"
              : "Compliant informational reminder • Strictly neutral polling details."}
          </span>
        </div>
      </div>
    </Modal>
  );
}
