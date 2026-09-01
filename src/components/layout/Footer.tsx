"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n";
import { Phone, HelpCircle } from "lucide-react";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto border-t border-[#DEE2E6] bg-white py-3.5 sm:py-4 px-3 sm:px-8 text-center sm:text-left transition-colors w-full max-w-full overflow-hidden">
      <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 text-xs sm:text-[14px] text-[#6C757D]">
        {/* Enquiry Contact Info */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
          <span className="font-semibold text-[#212529] flex items-center gap-1.5 whitespace-nowrap">
            <HelpCircle className="w-4 h-4 text-[#714B67] flex-shrink-0" />
            <span>{t("footerEnquiry")}:</span>
          </span>
          <span className="text-[#212529] font-medium whitespace-nowrap">{t("footerContactPerson")}</span>
          <span className="text-[#DEE2E6] hidden sm:inline">|</span>
          <a
            href="tel:6375983593"
            className="inline-flex items-center gap-1 text-[#714B67] hover:underline font-bold font-mono text-xs sm:text-[15px] whitespace-nowrap"
          >
            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
            <span>6375983593</span>
          </a>
        </div>

        {/* Copyright */}
        <div className="text-[12px] sm:text-[13px] text-[#6C757D] font-medium whitespace-nowrap">
          {t("footerCopyright")}
        </div>
      </div>
    </footer>
  );
}
