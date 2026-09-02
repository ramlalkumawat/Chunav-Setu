"use client";

import React, { useState } from "react";
import { Voter, Client } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";
import { Phone, MessageSquare, FileText, PhoneCall } from "lucide-react";
import { PollingSlipModal } from "./PollingSlipModal";
import { WhatsAppMessageModal } from "./WhatsAppMessageModal";
import { CallLogModal } from "./CallLogModal";

interface VoterActionBarProps {
  voter: Voter;
  client?: Client | null;
  size?: "sm" | "md" | "lg";
  layout?: "row" | "compact" | "grid";
  onActionComplete?: () => void;
}

export function VoterActionBar({
  voter,
  client,
  size = "md",
  layout = "row",
  onActionComplete,
}: VoterActionBarProps) {
  const { language } = useLanguage();
  const isHindi = language === "hi";

  const [isSlipOpen, setIsSlipOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isCallOpen, setIsCallOpen] = useState(false);

  const isOptedOut = voter.opt_out;
  const hasPhone = !!voter.mobile;

  const handleCallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (voter.mobile) {
      // Trigger native phone dialer asynchronously
      window.location.href = `tel:${voter.mobile}`;
    }
    // Open call result logger
    setIsCallOpen(true);
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWhatsAppOpen(true);
  };

  const handleSlipClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSlipOpen(true);
  };

  if (layout === "compact") {
    return (
      <>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCallClick}
            disabled={!hasPhone}
            title={hasPhone ? (isHindi ? "कॉल करें" : "Call Voter") : "No phone number"}
            className="p-1.5 rounded-[3px] bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            onClick={handleWhatsAppClick}
            disabled={isOptedOut || !hasPhone}
            title={isHindi ? "व्हाट्सऐप संदेश" : "WhatsApp"}
            className="p-1.5 rounded-[3px] bg-[#E8F5E9] text-[#25D366] hover:bg-[#C8E6C9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={handleSlipClick}
            title={isHindi ? "मतदान पर्ची" : "Polling Slip"}
            className="p-1.5 rounded-[3px] bg-[#F1ECEF] text-[#714B67] hover:bg-[#D9CAD5] transition-colors"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>

        {/* Modals */}
        <PollingSlipModal
          isOpen={isSlipOpen}
          onClose={() => setIsSlipOpen(false)}
          voter={voter}
          client={client}
          onGenerated={onActionComplete}
        />
        <WhatsAppMessageModal
          isOpen={isWhatsAppOpen}
          onClose={() => setIsWhatsAppOpen(false)}
          voter={voter}
          client={client}
          onSent={onActionComplete}
        />
        <CallLogModal
          isOpen={isCallOpen}
          onClose={() => setIsCallOpen(false)}
          voter={voter}
          onLogged={onActionComplete}
        />
      </>
    );
  }

  return (
    <>
      <div
        className={
          layout === "grid"
            ? "grid grid-cols-3 gap-2 w-full"
            : "flex items-center gap-2 flex-wrap"
        }
      >
        {/* 1. CALL BUTTON */}
        <button
          onClick={handleCallClick}
          disabled={!hasPhone}
          className={`flex items-center justify-center gap-1.5 font-bold rounded-[4px] transition-all border ${
            hasPhone
              ? "bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9] hover:bg-[#C8E6C9] active:scale-[0.98]"
              : "bg-[#F8F9FA] text-[#ADB5BD] border-[#DEE2E6] cursor-not-allowed"
          } ${
            size === "sm"
              ? "px-2 py-1 text-xs"
              : size === "lg"
              ? "px-4 py-3 text-sm flex-1 min-h-[44px]"
              : "px-3 py-1.5 text-xs sm:text-sm"
          }`}
        >
          <Phone className={size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"} />
          <span>{isHindi ? "कॉल करें" : "Call"}</span>
        </button>

        {/* 2. WHATSAPP BUTTON */}
        <button
          onClick={handleWhatsAppClick}
          disabled={isOptedOut || !hasPhone}
          className={`flex items-center justify-center gap-1.5 font-bold rounded-[4px] transition-all border ${
            hasPhone && !isOptedOut
              ? "bg-[#E8F5E9] text-[#25D366] border-[#C8E6C9] hover:bg-[#C8E6C9] active:scale-[0.98]"
              : "bg-[#F8F9FA] text-[#ADB5BD] border-[#DEE2E6] cursor-not-allowed"
          } ${
            size === "sm"
              ? "px-2 py-1 text-xs"
              : size === "lg"
              ? "px-4 py-3 text-sm flex-1 min-h-[44px]"
              : "px-3 py-1.5 text-xs sm:text-sm"
          }`}
        >
          <MessageSquare className={size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"} />
          <span>{isHindi ? "व्हाट्सऐप" : "WhatsApp"}</span>
        </button>

        {/* 3. POLLING SLIP BUTTON */}
        <button
          onClick={handleSlipClick}
          className={`flex items-center justify-center gap-1.5 font-bold rounded-[4px] transition-all border bg-[#F1ECEF] text-[#714B67] border-[#D9CAD5] hover:bg-[#D9CAD5] active:scale-[0.98] ${
            size === "sm"
              ? "px-2 py-1 text-xs"
              : size === "lg"
              ? "px-4 py-3 text-sm flex-1 min-h-[44px]"
              : "px-3 py-1.5 text-xs sm:text-sm"
          }`}
        >
          <FileText className={size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"} />
          <span>{isHindi ? "मतदान पर्ची" : "Polling Slip"}</span>
        </button>
      </div>

      {/* Modals */}
      <PollingSlipModal
        isOpen={isSlipOpen}
        onClose={() => setIsSlipOpen(false)}
        voter={voter}
        client={client}
        onGenerated={onActionComplete}
      />
      <WhatsAppMessageModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        voter={voter}
        client={client}
        onSent={onActionComplete}
      />
      <CallLogModal
        isOpen={isCallOpen}
        onClose={() => setIsCallOpen(false)}
        voter={voter}
        onLogged={onActionComplete}
      />
    </>
  );
}
