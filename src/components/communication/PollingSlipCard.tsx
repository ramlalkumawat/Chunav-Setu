"use client";

import React from "react";
import { Voter, Client } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";
import { useStorageUrl } from "@/lib/hooks/use-storage-url";
import { MapPin, Calendar, Clock, Building, ShieldCheck, PhoneCall } from "lucide-react";

interface PollingSlipCardProps {
  voter: Voter;
  client?: Client | null;
  slipNumber?: string;
  isPrintMode?: boolean;
}

export function PollingSlipCard({
  voter,
  client,
  slipNumber,
  isPrintMode = false,
}: PollingSlipCardProps) {
  const { language } = useLanguage();
  const isHindi = language === "hi";

  const { url: resolvedPosterUrl } = useStorageUrl(client?.poster_url);

  const candidateName = client?.candidate_name || "Official Campaign";
  const campaignName = client?.campaign_name || "Election Campaign 2026";
  const electionType = client?.election_type || "General Assembly";
  const location = client?.location || "Constituency Sector";
  const electionDate = client?.election_date || "12 December 2026";
  const slipId = slipNumber || `PS-${voter.booth_number?.replace(/\D/g, "") || "101"}-${voter.voter_id_card.slice(-6)}`;
  const posterUrl = resolvedPosterUrl || client?.poster_url;

  return (
    <div
      className={`bg-white text-[#212529] font-sans border border-[#DEE2E6] rounded-[6px] shadow-sm max-w-lg mx-auto overflow-hidden relative ${
        isPrintMode ? "print:border-2 print:border-black print:shadow-none print:max-w-none w-full" : ""
      }`}
    >
      {/* Top Decorative Header Strip */}
      <div className="bg-[#714B67] text-white px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[3px] bg-white text-[#714B67] font-black text-xs flex items-center justify-center tracking-tighter">
            CS
          </div>
          <div>
            <h2 className="font-extrabold text-sm uppercase tracking-wider leading-tight">
              Chunav Setu
            </h2>
            <p className="text-[10px] text-white/80 uppercase font-semibold tracking-widest">
              {isHindi ? "आधिकारिक डिजिटल मतदान पर्ची" : "Official Digital Polling Slip"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="font-mono text-[11px] font-bold bg-white/15 px-2 py-0.5 rounded-[2px] border border-white/20">
            {slipId}
          </span>
        </div>
      </div>

      {/* Candidate Tenant Header Banner */}
      <div className="bg-[#F8F9FA] border-b border-[#DEE2E6] px-5 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] uppercase font-bold text-[#6C757D] tracking-wider block">
            {isHindi ? "अभियान सेवा केंद्र" : "Campaign Service Desk"}
          </span>
          <p className="text-sm font-bold text-[#212529] truncate leading-snug">
            {candidateName}
          </p>
          <p className="text-[11px] text-[#714B67] font-semibold truncate">
            {campaignName} • {electionType} ({location})
          </p>
        </div>

        {posterUrl && (
          <div className="w-12 h-12 rounded-[4px] border border-[#DEE2E6] overflow-hidden flex-shrink-0 bg-white shadow-2xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={posterUrl}
              alt={candidateName}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Main Polling Slip Body */}
      <div className="p-5 space-y-4">
        {/* Title Center Pill */}
        <div className="text-center pb-2 border-b border-dashed border-[#DEE2E6]">
          <span className="px-3 py-1 rounded-[3px] bg-[#F1ECEF] text-[#714B67] font-black text-xs uppercase tracking-wider border border-[#D9CAD5]">
            {isHindi ? "मतदान विवरण (POLLING INFORMATION)" : "POLLING INFORMATION"}
          </span>
        </div>

        {/* 1. Voter Primary Identity */}
        <div className="bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px] p-3.5 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[11px] uppercase font-bold text-[#6C757D] tracking-wide block">
                {isHindi ? "मतदाता का नाम" : "Voter Name"}
              </span>
              <p className="text-lg font-black text-[#212529] leading-tight mt-0.5">
                {voter.name}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] uppercase font-bold text-[#6C757D] tracking-wide block">
                {isHindi ? "आयु / लिंग" : "Age / Gender"}
              </span>
              <p className="text-sm font-bold text-[#495057] mt-0.5 font-mono">
                {voter.age ? `${voter.age} yrs` : "—"} • {voter.gender || "—"}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#E9ECEF] flex items-center justify-between">
            <span className="text-xs font-bold text-[#6C757D]">
              {isHindi ? "पहचान क्रमांक (EPIC Ref):" : "Voter Reference (EPIC):"}
            </span>
            <span className="font-mono font-black text-base text-[#714B67] tracking-wider">
              {voter.voter_id_card}
            </span>
          </div>
        </div>

        {/* 2. Polling Station & Booth Details Grid */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 bg-white border border-[#DEE2E6] rounded-[4px]">
            <div className="flex items-center gap-1.5 text-[#6C757D] font-bold mb-1">
              <Building className="w-3.5 h-3.5 text-[#714B67]" />
              <span>{isHindi ? "बूथ संख्या" : "Booth Number"}</span>
            </div>
            <p className="font-extrabold text-sm text-[#212529]">
              {voter.booth_number || "Booth 101"}
            </p>
          </div>

          <div className="p-3 bg-white border border-[#DEE2E6] rounded-[4px]">
            <div className="flex items-center gap-1.5 text-[#6C757D] font-bold mb-1">
              <MapPin className="w-3.5 h-3.5 text-[#714B67]" />
              <span>{isHindi ? "मतदान क्षेत्र / वार्ड" : "Polling Area"}</span>
            </div>
            <p className="font-extrabold text-sm text-[#212529] truncate">
              {voter.area_name || "Ward Sector 1"}
            </p>
          </div>
        </div>

        {/* 3. Polling Station Location Address */}
        <div className="p-3.5 bg-white border border-[#DEE2E6] rounded-[4px] space-y-1">
          <span className="text-[11px] uppercase font-bold text-[#6C757D] tracking-wide flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#714B67]" />
            {isHindi ? "मतदान केंद्र (Polling Station)" : "Polling Station"}
          </span>
          <p className="text-sm font-bold text-[#212529]">
            {voter.booth_name || "Government Primary & Inter College"}
          </p>
          {voter.address && (
            <p className="text-xs text-[#6C757D] leading-snug">
              {voter.address}
            </p>
          )}
        </div>

        {/* 4. Date & Official Time */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px]">
            <div className="flex items-center gap-1.5 text-[#6C757D] font-bold mb-1">
              <Calendar className="w-3.5 h-3.5 text-[#714B67]" />
              <span>{isHindi ? "मतदान दिनांक" : "Polling Date"}</span>
            </div>
            <p className="font-bold text-sm text-[#212529] font-mono">
              {electionDate}
            </p>
          </div>

          <div className="p-3 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px]">
            <div className="flex items-center gap-1.5 text-[#6C757D] font-bold mb-1">
              <Clock className="w-3.5 h-3.5 text-[#714B67]" />
              <span>{isHindi ? "मतदान समय" : "Polling Time"}</span>
            </div>
            <p className="font-bold text-xs text-[#212529]">
              07:00 AM – 06:00 PM
            </p>
          </div>
        </div>

        {/* 5. Barcode & QR Verification Block */}
        <div className="pt-2 border-t border-dashed border-[#DEE2E6] flex items-center justify-between gap-3">
          <div className="flex-1">
            <div className="h-6 bg-repeating-linear-gradient flex items-center px-1">
              <div className="w-full flex justify-between h-4 items-center">
                {Array.from({ length: 32 }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-full bg-black inline-block ${
                      i % 3 === 0 ? "w-1" : i % 2 === 0 ? "w-0.5" : "w-1.5"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-[10px] font-mono text-center text-[#6C757D] mt-0.5 font-bold tracking-wider">
              *{voter.voter_id_card}*
            </p>
          </div>

          <div className="w-14 h-14 border border-[#DEE2E6] bg-white rounded-[3px] p-1 flex flex-col items-center justify-center flex-shrink-0 text-center">
            <ShieldCheck className="w-7 h-7 text-[#714B67]" />
            <span className="text-[8px] font-mono font-bold text-[#6C757D] uppercase">
              VERIFIED
            </span>
          </div>
        </div>

        {/* 6. Strict Neutral Election Disclaimer */}
        <div className="p-2.5 bg-[#FFF9E6] border border-[#FFE082] rounded-[4px] text-[11px] text-[#7F5F00] leading-snug flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 flex-shrink-0 text-[#B78103] mt-0.5" />
          <p>
            {isHindi
              ? "यह केवल एक सूचनात्मक मतदान पर्ची है। कृपया आधिकारिक चुनाव आयोग के निर्देशों के अनुसार मतदान केंद्र पर अपना पहचान पत्र लेकर जाएं।"
              : "This is strictly an informational polling slip reminder. Please carry an official government photo identity document to your designated polling booth."}
          </p>
        </div>
      </div>

      {/* Footer Strip */}
      <div className="bg-[#F8F9FA] border-t border-[#DEE2E6] px-5 py-2.5 flex items-center justify-between text-xs text-[#6C757D]">
        <div className="flex items-center gap-1">
          <PhoneCall className="w-3 h-3 text-[#714B67]" />
          <span className="font-semibold">{client?.mobile || "Helpdesk 6375983593"}</span>
        </div>
        <span className="font-bold text-[#714B67]">Chunav Setu © 2026</span>
      </div>
    </div>
  );
}
