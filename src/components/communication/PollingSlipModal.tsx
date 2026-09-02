"use client";

import React from "react";
import { Voter, Client, UserRole } from "@/lib/types";
import { useAuth } from "@/lib/context/auth-context";
import { useLanguage } from "@/lib/i18n";
import { useToast } from "@/lib/context/toast-context";
import { dbService } from "@/lib/store/data-service";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { PollingSlipCard } from "./PollingSlipCard";
import { MessageSquare, Download, Printer, CheckCircle, AlertTriangle } from "lucide-react";

interface PollingSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  voter: Voter | null;
  client?: Client | null;
  onGenerated?: () => void;
}

export function PollingSlipModal({
  isOpen,
  onClose,
  voter,
  client: propClient,
  onGenerated,
}: PollingSlipModalProps) {
  const { user, role, client: authClient, volunteer } = useAuth();
  const { t, language } = useLanguage();
  const { success, error: toastError } = useToast();
  const isHindi = language === "hi";

  const client = propClient || authClient;
  const clientId = client?.id || voter?.client_id || user?.client_id || "";
  const actorName = volunteer?.name || user?.full_name || "Campaign Team";
  const userRole: UserRole = (role as UserRole) || "volunteer";

  if (!voter) return null;

  const electionDate = client?.election_date || "12 December 2026";
  const boothNumber = voter.booth_number || "Booth 101";
  const boothName = voter.booth_name || "Government School / Community Hall";

  const buildWhatsAppMessage = () => {
    return isHindi
      ? `नमस्कार ${voter.name},

आपके मतदान से संबंधित आधिकारिक जानकारी:

मतदाता: ${voter.name}
पहचान क्रमांक (EPIC): ${voter.voter_id_card}
मतदान केंद्र: ${boothName}
बूथ संख्या: ${boothNumber}
मतदान दिनांक: ${electionDate}
मतदान समय: सुबह 07:00 बजे से शाम 06:00 बजे तक

कृपया आधिकारिक चुनाव निर्देशों के अनुसार मतदान केंद्र पर अपना पहचान पत्र लेकर जाएं।

— Chunav Setu (${client?.candidate_name || "अभियान सेवा केंद्र"})`
      : `Dear ${voter.name},

Official Polling Information Reminder:

Elector Name: ${voter.name}
EPIC Number: ${voter.voter_id_card}
Polling Station: ${boothName}
Booth Number: ${boothNumber}
Polling Date: ${electionDate}
Polling Time: 07:00 AM to 06:00 PM

Please bring an authorized photo ID to your polling booth as per official election instructions.

— Chunav Setu (${client?.candidate_name || "Campaign Desk"})`;
  };

  const handleShareWhatsApp = () => {
    if (voter.opt_out || voter.whatsapp_allowed === false) {
      toastError(
        "Communication Restricted",
        "Voter has opted out of automated WhatsApp communications."
      );
      return;
    }

    const message = buildWhatsAppMessage();
    const cleanPhone = (voter.mobile || "").replace(/\D/g, "");

    // Record communication log
    dbService.recordPollingSlipGenerated(clientId, {
      voterId: voter.id,
      userId: user?.id,
      userRole,
      actorName,
      sharedViaWhatsApp: true,
    });

    if (cleanPhone) {
      const waUrl = `https://wa.me/${cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone}?text=${encodeURIComponent(
        message
      )}`;
      window.open(waUrl, "_blank");
      success(
        isHindi ? "व्हाट्सऐप खोला गया" : "WhatsApp Dispatched",
        isHindi ? `${voter.name} के लिए मतदान पर्ची साझा की जा रही है।` : `Sharing polling slip with ${voter.name}`
      );
    } else {
      // Fallback click to share without direct phone
      const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");
      success(
        "WhatsApp Shared",
        "WhatsApp opened with prefilled slip message."
      );
    }

    if (onGenerated) onGenerated();
  };

  const handlePrint = () => {
    dbService.recordPollingSlipGenerated(clientId, {
      voterId: voter.id,
      userId: user?.id,
      userRole,
      actorName,
      sharedViaWhatsApp: false,
    });

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Polling Slip - ${voter.name} (${voter.voter_id_card})</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; color: #212529; }
            .slip { border: 2px solid #714B67; border-radius: 6px; padding: 20px; max-width: 480px; margin: 0 auto; }
            .header { background: #714B67; color: white; padding: 10px 14px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
            .title { font-weight: bold; font-size: 16px; margin: 0; }
            .sub { font-size: 11px; opacity: 0.9; margin: 2px 0 0 0; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #DEE2E6; }
            .label { font-size: 12px; color: #6C757D; font-weight: 600; text-transform: uppercase; }
            .val { font-size: 14px; font-weight: bold; color: #212529; text-align: right; }
            .notice { background: #FFF9E6; border: 1px solid #FFE082; padding: 8px; border-radius: 4px; font-size: 11px; color: #7F5F00; margin-top: 15px; line-height: 1.4; }
            .barcode { text-align: center; margin-top: 15px; font-family: monospace; letter-spacing: 2px; }
            @media print { body { padding: 0; } .slip { border: 2px solid #000; } }
          </style>
        </head>
        <body>
          <div class="slip">
            <div class="header">
              <div>
                <p class="title">CHUNAV SETU • POLLING SLIP</p>
                <p class="sub">${client?.candidate_name || "Official Campaign"} • ${client?.campaign_name || "Election 2026"}</p>
              </div>
            </div>
            <div class="row">
              <span class="label">Voter Name</span>
              <span class="val">${voter.name}</span>
            </div>
            <div class="row">
              <span class="label">EPIC / Voter ID</span>
              <span class="val" style="color: #714B67;">${voter.voter_id_card}</span>
            </div>
            <div class="row">
              <span class="label">Booth Number</span>
              <span class="val">${boothNumber}</span>
            </div>
            <div class="row">
              <span class="label">Polling Station</span>
              <span class="val">${boothName}</span>
            </div>
            <div class="row">
              <span class="label">Polling Area / Ward</span>
              <span class="val">${voter.area_name || "Sector 1"}</span>
            </div>
            <div class="row">
              <span class="label">Polling Date</span>
              <span class="val">${electionDate}</span>
            </div>
            <div class="row">
              <span class="label">Polling Time</span>
              <span class="val">07:00 AM – 06:00 PM</span>
            </div>
            <div class="barcode">
              ||| | |||| | ||||| || |||||| | |||<br />
              *${voter.voter_id_card}*
            </div>
            <div class="notice">
              Informational reminder only. Please carry your official Voter ID (EPIC) or approved photo ID to the polling station.
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();

    success(
      isHindi ? "पर्ची तैयार" : "Polling Slip Generated",
      `${voter.name} slip sent to printer.`
    );
    if (onGenerated) onGenerated();
  };

  const handleDownload = () => {
    handlePrint();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isHindi ? "डिजिटल मतदान पर्ची" : "Digital Polling Slip"}
      subtitle={`${voter.name} • ${voter.voter_id_card}`}
      maxWidth="md"
      footer={
        <div className="flex items-center justify-between w-full flex-wrap gap-2">
          <Button variant="secondary" size="md" onClick={onClose}>
            {t("cancel")}
          </Button>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="secondary"
              size="md"
              onClick={handlePrint}
              leftIcon={<Printer className="w-4 h-4 text-[#714B67]" />}
            >
              {isHindi ? "प्रिंट करें" : "Print"}
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={handleShareWhatsApp}
              className="bg-[#25D366] hover:bg-[#20bd5a] text-white border-transparent"
              leftIcon={<MessageSquare className="w-4 h-4" />}
            >
              {isHindi ? "व्हाट्सऐप पर भेजें" : "Share on WhatsApp"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Opt-out alert if applicable */}
        {voter.opt_out && (
          <div className="p-3 bg-[#FFEBEE] border border-[#FFCDD2] rounded-[4px] text-xs text-[#C62828] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>
              {isHindi
                ? "इस मतदाता ने संचार संदेशों से बाहर (Opt-out) विकल्प चुना है।"
                : "This elector has opted out of campaign communications."}
            </span>
          </div>
        )}

        {/* Live Visual Card */}
        <PollingSlipCard voter={voter} client={client} />
      </div>
    </Modal>
  );
}
