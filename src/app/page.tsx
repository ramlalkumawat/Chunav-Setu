"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/layout/Footer";
import {
  Users,
  Building,
  CheckSquare,
  Smartphone,
  BarChart3,
  ShieldCheck,
  PhoneCall,
  Vote,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  const { language, setLanguage, t } = useLanguage();
  const isHindi = language === "hi";

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col text-[#212529] w-full max-w-full overflow-x-hidden">
      {/* Top Application Header */}
      <header className="min-h-14 bg-white border-b border-[#DEE2E6] px-4 sm:px-8 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-sm gap-2">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          <div className="w-8 h-8 rounded-[4px] bg-[#714B67] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            CS
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-lg tracking-tight text-[#212529]">
              {t("appTitle")}
            </span>
            <span className="text-xs text-[#6C757D] hidden sm:inline font-medium">
              {isHindi ? "इलेक्शन रिसोर्स प्लानिंग (ERP)" : "Election Resource Planning (ERP)"}
            </span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Language Switcher */}
          <div className="flex items-center bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px] p-0.5">
            <button
              onClick={() => setLanguage("en")}
              className={`px-2.5 py-1 rounded-[2px] text-xs font-bold transition-colors ${
                language === "en"
                  ? "bg-[#714B67] text-white"
                  : "text-[#6C757D] hover:text-[#212529]"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("hi")}
              className={`px-2.5 py-1 rounded-[2px] text-xs font-bold transition-colors ${
                language === "hi"
                  ? "bg-[#714B67] text-white"
                  : "text-[#6C757D] hover:text-[#212529]"
              }`}
            >
              हिन्दी
            </button>
          </div>

          <Link href="/login">
            <Button size="sm" variant="primary" className="h-9 px-4 text-xs sm:text-sm font-bold">
              <span>{t("signIn")}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 min-w-0">
        {/* Hero Section Card */}
        <div className="bg-white border border-[#DEE2E6] rounded-[6px] p-6 sm:p-10 shadow-sm">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-[#F1ECEF] text-[#714B67] text-xs font-bold border border-[#D9CAD5]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isHindi ? "मल्टी-टेनेंट इलेक्शन SaaS" : "Multi-Tenant Election SaaS"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#212529] leading-tight">
              {isHindi
                ? "निर्वाचन प्रबंधन एवं ग्राउंड फील्ड ऑपरेशंस सिस्टम"
                : "Election Management & Field Operations System"}
            </h1>
            <p className="text-sm sm:text-base text-[#6C757D] leading-relaxed">
              {isHindi
                ? "चुनाव सेतु एक सुरक्षित, एंटरप्राइज-ग्रेड प्लेटफ़ॉर्म है जिसे विधानसभा, लोकसभा, एवं नगर निगम चुनावों के लिए मतदाता सूची प्रबंधन, बूथ स्तर पर वॉलंटियर समन्वय, डोर-टू-डोर कैनवासिंग, और मतदान दिवस टर्नआउट की निगरानी के लिए डिज़ाइन किया गया है।"
                : "Chunav Setu is an enterprise-grade ERP system built for candidate campaigns, political war rooms, and ground volunteer cadres to organize voter registers, booth committee hierarchies, door-to-door telemetry, and polling day turnout."}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link href="/login">
                <Button size="lg" variant="primary" className="font-bold text-sm px-6 h-11">
                  <span>{isHindi ? "पोर्टल में प्रवेश करें" : "Access Workspace"}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Key ERP Capabilities Grid */}
          <div className="mt-10 pt-8 border-t border-[#DEE2E6] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px]">
              <div className="w-8 h-8 rounded-[4px] bg-[#F1ECEF] text-[#714B67] flex items-center justify-center mb-2.5">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-[#212529]">
                {isHindi ? "मतदाता डेटाबेस एवं बूथ मैपिंग" : "Voter Registry & Booth Mapping"}
              </h3>
              <p className="text-xs text-[#6C757D] mt-1 leading-normal">
                {isHindi
                  ? "बूथ-वार मतदाता सूची, संपर्क स्थिति, और त्वरित सर्च।"
                  : "Booth-wise electoral roll, contact tracking, and instant search."}
              </p>
            </div>

            <div className="p-4 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px]">
              <div className="w-8 h-8 rounded-[4px] bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mb-2.5">
                <Smartphone className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-[#212529]">
                {isHindi ? "वॉलंटियर फील्ड ऑपरेशंस" : "Volunteer Field Operations"}
              </h3>
              <p className="text-xs text-[#6C757D] mt-1 leading-normal">
                {isHindi
                  ? "डोर-टू-डोर सर्वे, कार्य आवंटन, और फीडबैक रिपोर्टिंग।"
                  : "Door-to-door surveys, task delegation, and ground feedback."}
              </p>
            </div>

            <div className="p-4 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px]">
              <div className="w-8 h-8 rounded-[4px] bg-[#FFF3E0] text-[#E65100] flex items-center justify-center mb-2.5">
                <Vote className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-[#212529]">
                {isHindi ? "मतदान दिवस टर्नआउट (Polling Day)" : "Polling Day Turnout"}
              </h3>
              <p className="text-xs text-[#6C757D] mt-1 leading-normal">
                {isHindi
                  ? "रियल-टाइम मतदान प्रगति, पेंडिंग वोटर्स, और बूथ समन्वय।"
                  : "Real-time voting telemetry, pending electors, and booth turnout."}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
