"use client";

import React, { useState } from "react";
import { Voter, Client, UserRole } from "@/lib/types";
import { useAuth } from "@/lib/context/auth-context";
import { useLanguage } from "@/lib/i18n";
import { useToast } from "@/lib/context/toast-context";
import { dbService } from "@/lib/store/data-service";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { PollingSlipCard } from "./PollingSlipCard";
import { FileStack, Printer, CheckCircle2, AlertCircle, Download } from "lucide-react";

interface BatchPollingSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  voters: Voter[];
  client?: Client | null;
  onCompleted?: () => void;
}

export function BatchPollingSlipModal({
  isOpen,
  onClose,
  voters,
  client: propClient,
  onCompleted,
}: BatchPollingSlipModalProps) {
  const { user, role, client: authClient, volunteer } = useAuth();
  const { t, language } = useLanguage();
  const { success } = useToast();
  const isHindi = language === "hi";

  const client = propClient || authClient;
  const clientId = client?.id || "client-1";
  const actorName = volunteer?.name || user?.full_name || "Campaign Team";
  const userRole: UserRole = (role as UserRole) || "volunteer";

  const [currentIndex, setCurrentIndex] = useState(0);

  if (voters.length === 0) return null;

  const currentVoter = voters[currentIndex] || voters[0];

  const handlePrintBatch = () => {
    // Generate slips in data store
    dbService.batchGeneratePollingSlips(
      clientId,
      voters.map((v) => v.id),
      {
        userId: user?.id,
        userRole,
        actorName,
      }
    );

    const electionDate = client?.election_date || "12 December 2026";
    const candidateName = client?.candidate_name || "Official Campaign";

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.print();
      return;
    }

    const slipsHtml = voters
      .map((voter) => {
        return `
        <div class="slip" style="page-break-inside: avoid; margin-bottom: 20px; border: 2px solid #714B67; border-radius: 6px; padding: 15px; font-family: sans-serif;">
          <div style="background: #714B67; color: white; padding: 8px 12px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div>
              <strong style="font-size: 14px;">CHUNAV SETU • POLLING SLIP</strong>
              <div style="font-size: 10px; opacity: 0.9;">${candidateName}</div>
            </div>
            <div style="font-size: 10px; font-family: monospace; font-weight: bold;">PS-${voter.booth_number?.replace(/\D/g, "") || "101"}-${voter.voter_id_card.slice(-6)}</div>
          </div>
          <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #EEE;"><td style="padding: 4px 0; color: #666; font-weight: bold;">VOTER NAME</td><td style="padding: 4px 0; text-align: right; font-weight: bold;">${voter.name} (${voter.age || "—"} yrs / ${voter.gender || "—"})</td></tr>
            <tr style="border-bottom: 1px solid #EEE;"><td style="padding: 4px 0; color: #666; font-weight: bold;">EPIC NO.</td><td style="padding: 4px 0; text-align: right; font-weight: bold; color: #714B67; font-family: monospace;">${voter.voter_id_card}</td></tr>
            <tr style="border-bottom: 1px solid #EEE;"><td style="padding: 4px 0; color: #666; font-weight: bold;">BOOTH NO.</td><td style="padding: 4px 0; text-align: right; font-weight: bold;">${voter.booth_number || "Booth 101"}</td></tr>
            <tr style="border-bottom: 1px solid #EEE;"><td style="padding: 4px 0; color: #666; font-weight: bold;">POLLING STATION</td><td style="padding: 4px 0; text-align: right; font-weight: bold;">${voter.booth_name || "Government Primary School"}</td></tr>
            <tr style="border-bottom: 1px solid #EEE;"><td style="padding: 4px 0; color: #666; font-weight: bold;">POLLING AREA</td><td style="padding: 4px 0; text-align: right; font-weight: bold;">${voter.area_name || "Sector 1"}</td></tr>
            <tr style="border-bottom: 1px solid #EEE;"><td style="padding: 4px 0; color: #666; font-weight: bold;">POLLING DATE & TIME</td><td style="padding: 4px 0; text-align: right; font-weight: bold;">${electionDate} (07:00 AM – 06:00 PM)</td></tr>
          </table>
          <div style="margin-top: 10px; font-size: 10px; background: #FFF9E6; border: 1px solid #FFE082; padding: 6px; border-radius: 4px; color: #7F5F00;">
            Informational polling reminder only. Please carry your official Voter ID (EPIC) to the booth.
          </div>
        </div>
      `;
      })
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Batch Polling Slips - ${voters.length} Electors</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; color: #212529; }
            @media print {
              body { padding: 0; }
              .slip { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <h2 style="font-size: 16px; margin-bottom: 15px;">Chunav Setu • Batch Polling Slips (${voters.length} Electors)</h2>
          ${slipsHtml}
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();

    success(
      isHindi ? "सामूहिक पर्चियां तैयार" : "Batch Slips Generated",
      `${voters.length} polling slips compiled for print.`
    );
    onClose();
    if (onCompleted) onCompleted();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isHindi ? "सामूहिक मतदान पर्ची निर्माण" : "Batch Polling Slip Generator"}
      subtitle={`${voters.length} ${isHindi ? "मतदाता चयनित" : "electors selected for slip generation"}`}
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full flex-wrap gap-2">
          <Button variant="secondary" size="md" onClick={onClose}>
            {t("cancel")}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="md"
              onClick={handlePrintBatch}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              {isHindi ? `सभी ${voters.length} पर्चियां प्रिंट / डाउनलोड करें` : `Print All ${voters.length} Slips`}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Compliance Notice */}
        <div className="p-3 bg-[#E3F2FD] border border-[#BBDEFB] rounded-[4px] text-xs text-[#0D47A1] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">
              {isHindi ? "सामूहिक पर्ची वितरण दिशानिर्देश" : "Batch Slip Distribution Guidelines"}
            </p>
            <p className="mt-0.5">
              {isHindi
                ? "यह टूल सभी चयनित मतदाताओं के लिए एक साथ व्यवस्थित प्रिंटेबल पर्चियां तैयार करता है। नियमों के अनुसार सामूहिक व्हाट्सएप संदेश अलग से भेजने होते हैं।"
                : "Batch generating compiles clean, printable slips for ground volunteer distribution. Mass automated messaging is restricted per compliance guidelines."}
            </p>
          </div>
        </div>

        {/* Elector Selector Slider */}
        <div className="flex items-center justify-between p-3 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px]">
          <span className="text-xs font-bold text-[#6C757D] uppercase">
            {isHindi ? "पूर्वावलोकन मतदाता" : "Previewing Voter"} {currentIndex + 1} of {voters.length}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-2 py-1 bg-white border border-[#DEE2E6] text-xs font-bold rounded disabled:opacity-40"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(voters.length - 1, prev + 1))}
              disabled={currentIndex === voters.length - 1}
              className="px-2 py-1 bg-white border border-[#DEE2E6] text-xs font-bold rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>

        {/* Selected Slip Preview */}
        <PollingSlipCard voter={currentVoter} client={client} />
      </div>
    </Modal>
  );
}
