"use client";

import React, { useState } from "react";
import { Client } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";
import { useStorageUrl } from "@/lib/hooks/use-storage-url";
import { Award, Calendar, MapPin, Flag, User, Sparkles } from "lucide-react";

interface CandidatePosterBannerProps {
  client: Client | null;
  moduleTitle?: string;
  badgeText?: string;
  compact?: boolean;
  className?: string;
}

export function CandidatePosterBanner({
  client,
  moduleTitle,
  badgeText,
  compact = false,
  className = "",
}: CandidatePosterBannerProps) {
  const { language } = useLanguage();
  const isHindi = language === "hi";
  const [imageError, setImageError] = useState(false);

  const { url: resolvedPosterUrl } = useStorageUrl(client?.poster_url);

  if (!client) return null;

  const candidateName = client.candidate_name || client.name || "Candidate";
  const campaignName = client.campaign_name || "Official Campaign";
  const electionType = client.election_type || "Vidhan Sabha";
  const location = client.location || "Constituency";
  const electionDate = client.election_date || "2026";
  const posterUrl = resolvedPosterUrl || client.poster_url;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-[6px] border border-[#DEE2E6] bg-white shadow-sm transition-all ${className}`}
    >
      {/* 1. If an actual custom poster image is uploaded, render the clean responsive container */}
      {posterUrl && !imageError ? (
        <div className="relative w-full bg-[#1A1A1A]">
          {/* Responsive aspect container to avoid pushing content below the fold */}
          <div
            className={`w-full relative overflow-hidden flex items-center justify-center ${
              compact
                ? "h-28 sm:h-36 md:h-44"
                : "h-36 sm:h-48 md:h-60 lg:h-72"
            }`}
          >
            {/* Background blur for aspect padding if contain is used */}
            <div
              className="absolute inset-0 bg-cover bg-center blur-lg opacity-40 scale-110"
              style={{ backgroundImage: `url(${posterUrl})` }}
              aria-hidden="true"
            />

            {/* Candidate Custom Poster */}
            <img
              src={posterUrl}
              alt={client.poster_alt || `${candidateName} - Campaign Poster`}
              onError={() => setImageError(true)}
              className="relative z-10 w-full h-full object-cover sm:object-contain object-center transition-all duration-300"
            />

            {/* Elegant tenant badge overlay */}
            <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-black/65 backdrop-blur-md text-white text-[11px] sm:text-xs font-semibold border border-white/20">
              <Sparkles className="w-3 h-3 text-[#FFD54F]" />
              <span className="truncate max-w-[160px] sm:max-w-xs">{candidateName}</span>
              <span className="text-white/40">•</span>
              <span className="text-white/80">{electionType}</span>
            </div>

            {badgeText && (
              <div className="absolute bottom-2.5 left-2.5 z-20 px-2.5 py-1 rounded-[3px] bg-[#714B67]/90 backdrop-blur-md text-white text-xs font-bold border border-white/20 shadow">
                {badgeText}
              </div>
            )}
          </div>

          {/* Under-banner quick credential summary bar */}
          <div className="px-3.5 sm:px-5 py-2 bg-[#F8F9FA] border-t border-[#DEE2E6] flex flex-wrap items-center justify-between gap-2 text-xs sm:text-[13px] text-[#495057]">
            <div className="flex items-center gap-2 flex-wrap font-medium">
              <span className="font-bold text-[#212529] flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#714B67]" />
                {candidateName}
              </span>
              <span className="text-[#ADB5BD]">|</span>
              <span className="text-[#6C757D] flex items-center gap-1">
                <Flag className="w-3.5 h-3.5 text-[#714B67]" />
                {campaignName}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 text-xs text-[#6C757D]">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#6C757D]" />
                {location}
              </span>
              {electionDate && (
                <span className="flex items-center gap-1 font-mono font-medium text-[#212529]">
                  <Calendar className="w-3 h-3 text-[#714B67]" />
                  {electionDate}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* 2. Fallback Premium Odoo-themed candidate branding banner */
        <div className="relative bg-gradient-to-r from-[#5B3852] via-[#714B67] to-[#4A2D43] text-white p-4 sm:p-6 overflow-hidden">
          {/* Subtle geometric pattern overlay */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-[3px] bg-white/20 backdrop-blur-sm text-[11px] font-bold uppercase tracking-wider text-white border border-white/25">
                  {electionType}
                </span>
                {badgeText && (
                  <span className="px-2 py-0.5 rounded-[3px] bg-[#E8F5E9] text-[#2E7D32] text-[11px] font-bold border border-[#C8E6C9]">
                    {badgeText}
                  </span>
                )}
                {moduleTitle && (
                  <span className="text-white/70 text-xs font-medium">
                    / {moduleTitle}
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight break-words">
                {candidateName}
              </h1>

              <p className="text-xs sm:text-sm text-white/90 font-medium flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <Flag className="w-3.5 h-3.5 text-white/80" />
                  {campaignName}
                </span>
                <span className="text-white/40">•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-white/80" />
                  {location}
                </span>
              </p>
            </div>

            {/* Right details box */}
            <div className="flex items-center gap-2.5 sm:gap-4 self-start md:self-auto flex-wrap">
              <div className="bg-black/25 backdrop-blur-sm rounded-[4px] px-3.5 py-2 border border-white/15 text-right">
                <div className="text-[11px] text-white/70 uppercase tracking-wider font-semibold">
                  {isHindi ? "निर्वाचन तिथि" : "Election Date"}
                </div>
                <div className="text-sm sm:text-base font-bold text-white font-mono flex items-center gap-1.5 justify-end">
                  <Calendar className="w-4 h-4 text-[#FFD54F]" />
                  <span>{electionDate}</span>
                </div>
              </div>

              {client.logo_url && (
                <div className="w-12 h-12 rounded-[4px] bg-white p-1 shadow flex-shrink-0 flex items-center justify-center">
                  <img
                    src={client.logo_url}
                    alt={candidateName}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
