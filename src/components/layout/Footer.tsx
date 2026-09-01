"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n";
import { Phone, HelpCircle } from "lucide-react";

export function Footer() {
  const { language } = useLanguage();
  const isHindi = language === "hi";

  return (
    <footer className="mt-auto border-t border-[#DEE2E6] bg-white py-5 sm:py-6 px-3.5 sm:px-8 w-full max-w-full overflow-hidden transition-colors">
      <div className="max-w-[1600px] mx-auto flex flex-col items-center justify-center text-center space-y-3.5 sm:space-y-4">
        
        {/* Primary Application Brand & Subtitle */}
        <div className="flex flex-col items-center space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-[3px] bg-[#714B67] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
              CS
            </span>
            <span className="text-base sm:text-lg font-bold text-[#212529] tracking-tight">
              {isHindi ? "चुनाव सेतु" : "Chunav Setu"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6C757D] font-medium max-w-md break-words">
            {isHindi 
              ? "निर्वाचन प्रबंधन एवं फील्ड ऑपरेशंस सिस्टम" 
              : "Election Management & Field Operations System"}
          </p>
        </div>

        {/* Powered by CampaignX Tech Provider Attribution Card */}
        <div className="flex flex-col items-center justify-center py-2 px-3.5 sm:px-5 rounded-[4px] bg-[#F8F9FA] border border-[#E9ECEF] max-w-md w-full">
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <span className="text-xs sm:text-[13px] font-medium text-[#6C757D]">
              {isHindi ? "पावर्ड बाय" : "Powered by"}
            </span>
            <span className="inline-flex items-center gap-0.5 text-xs sm:text-[13px] font-bold text-[#714B67] bg-[#F1ECEF] border border-[#D9CAD5] px-2 py-0.5 rounded-[3px] tracking-wide">
              <span>Campaign</span>
              <span className="text-[#8E24AA]">X</span>
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-[#6C757D] mt-1 font-medium break-words text-center">
            {isHindi
              ? "इलेक्शन कैंपेन मैनेजमेंट एवं डिजिटल सॉल्यूशंस"
              : "Election Campaign Management & Digital Solutions"}
          </p>
        </div>

        {/* Enquiry Contact Info Bar */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-[13px] text-[#6C757D]">
          <span className="font-semibold text-[#212529] flex items-center gap-1.5 whitespace-nowrap">
            <HelpCircle className="w-3.5 h-3.5 text-[#714B67] flex-shrink-0" />
            <span>{isHindi ? "पूछताछ एवं शिकायत" : "For Enquiry & Complaint"}:</span>
          </span>
          <span className="text-[#212529] font-medium whitespace-nowrap">
            {isHindi ? "रामलाल कुमावत" : "Ramlal Kumawat"}
          </span>
          <span className="text-[#DEE2E6] hidden sm:inline">•</span>
          <a
            href="tel:6375983593"
            className="inline-flex items-center gap-1 text-[#714B67] hover:underline font-bold font-mono text-xs sm:text-sm whitespace-nowrap"
          >
            <Phone className="w-3 h-3 flex-shrink-0" />
            <span>6375983593</span>
          </a>
        </div>

        {/* Bottom Tier: CampaignX Copyright */}
        <div className="pt-2 border-t border-[#F1F3F5] w-full max-w-sm text-center text-[11px] sm:text-xs text-[#ADB5BD] font-medium">
          © 2026 CampaignX. All rights reserved.
        </div>

      </div>
    </footer>
  );
}
