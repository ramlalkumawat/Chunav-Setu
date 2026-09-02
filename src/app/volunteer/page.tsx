"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useLanguage } from "@/lib/i18n";
import { CandidatePosterBanner } from "@/components/layout/CandidatePosterBanner";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Users,
  CheckSquare,
  Clock,
  ArrowRight,
  Plus,
  Phone,
  Compass,
  Radio,
  Building,
  Search,
  MessageSquare,
  FileText,
  PhoneCall,
} from "lucide-react";
import { VoterActionBar } from "@/components/communication/VoterActionBar";

export default function VolunteerDashboardPage() {
  const { client, volunteer, user } = useAuth();
  const { t, language } = useLanguage();
  const isHindi = language === "hi";
  const clientId = client?.id || user?.client_id || "";
  const volunteerId = volunteer?.id || user?.id || "";

  const [stats, setStats] = useState<any>(null);
  const [commStats, setCommStats] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const loadDashboard = () => {
    if (!clientId) return;
    setStats(dbService.getVolunteerDashboardStats(clientId, volunteerId));
    setCommStats(dbService.getCommunicationSummary(clientId, volunteerId));
  };

  useEffect(() => {
    loadDashboard();
  }, [clientId, volunteerId]);

  useEffect(() => {
    if (!clientId || !search.trim()) {
      setSearchResults([]);
      return;
    }
    const res = dbService.getCallingList(clientId, volunteerId, {
      search,
      pageSize: 3,
    });
    setSearchResults(res.data);
  }, [search, clientId, volunteerId]);

  if (!clientId || !stats) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-[#6C757D]">
          {isHindi ? "फील्ड डेटा लोड हो रहा है..." : "Loading field dashboard..."}
        </p>
      </div>
    );
  }

  const volunteerName = volunteer?.name || user?.full_name || "Field Volunteer";
  const assignedBoothName = volunteer?.assigned_booth_name || (client ? `${client.campaign_name} (All Booths)` : "All Booths");
  const assignedAreaName = volunteer?.assigned_area_name || (client?.location || "Constituency");

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-10 w-full overflow-hidden">
      {/* 1. TOP: CANDIDATE BRANDING POSTER (Tenant-Specific, Section 4, 5, 24) */}
      <CandidatePosterBanner
        client={client}
        moduleTitle={isHindi ? "स्वयंसेवक फील्ड पोर्टल" : "Volunteer Field Portal"}
        badgeText={isHindi ? "फील्ड ड्यूटी" : "Field Operations"}
        compact={true}
      />

      {/* 2. WELCOME & ASSIGNED BOOTH HEADER (Section 24) */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-4 sm:p-5 shadow-none">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <span className="text-xs text-[#6C757D] font-medium">
              {isHindi ? "स्वागत है" : "Welcome"},
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#212529] tracking-tight">
              {volunteerName}
            </h1>
          </div>
          <span className="px-3 py-1 rounded-[3px] bg-[#F1ECEF] text-[#714B67] border border-[#D9CAD5] text-xs font-bold font-mono">
            {assignedBoothName}
          </span>
        </div>

        <div className="mt-2 pt-2 border-t border-[#F1F3F5] flex items-center gap-2 text-xs sm:text-sm text-[#495057]">
          <Building className="w-4 h-4 text-[#714B67] flex-shrink-0" />
          <span className="font-semibold">{isHindi ? "आवंटित क्षेत्र" : "Assigned Area"}:</span>
          <span>{assignedAreaName}</span>
        </div>
      </div>

      {/* 3. TODAY'S COMMUNICATION SUMMARY WIDGET (Section 14) */}
      {commStats && (
        <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-4 shadow-none space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#714B67]" />
              <h3 className="font-bold text-sm sm:text-base text-[#212529]">
                {t("todaysCommunication")}
              </h3>
            </div>
            <Link href="/volunteer/communication">
              <span className="text-xs font-bold text-[#714B67] hover:underline">
                {isHindi ? "विस्तृत देखें" : "View All"}
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <Link href="/volunteer/communication/calling" className="p-2.5 bg-[#F8F9FA] hover:bg-[#E8F5E9] border border-[#DEE2E6] rounded-[4px] transition-colors block">
              <Phone className="w-4 h-4 text-[#2E7D32] mx-auto mb-1" />
              <p className="font-mono font-extrabold text-base text-[#212529]">
                {commStats.todaysCalls}
              </p>
              <p className="text-[10px] font-bold text-[#6C757D] truncate">
                {t("myCalls")}
              </p>
            </Link>

            <Link href="/volunteer/communication/whatsapp" className="p-2.5 bg-[#F8F9FA] hover:bg-[#E8F5E9] border border-[#DEE2E6] rounded-[4px] transition-colors block">
              <MessageSquare className="w-4 h-4 text-[#25D366] mx-auto mb-1" />
              <p className="font-mono font-extrabold text-base text-[#212529]">
                {commStats.whatsAppActivity}
              </p>
              <p className="text-[10px] font-bold text-[#6C757D] truncate">
                WhatsApp
              </p>
            </Link>

            <Link href="/volunteer/communication/polling-slip" className="p-2.5 bg-[#F8F9FA] hover:bg-[#F1ECEF] border border-[#DEE2E6] rounded-[4px] transition-colors block">
              <FileText className="w-4 h-4 text-[#714B67] mx-auto mb-1" />
              <p className="font-mono font-extrabold text-base text-[#212529]">
                {commStats.pollingSlipsGenerated}
              </p>
              <p className="text-[10px] font-bold text-[#6C757D] truncate">
                {isHindi ? "पर्चियां" : "Slips"}
              </p>
            </Link>

            <Link href="/volunteer/follow-ups" className="p-2.5 bg-[#F8F9FA] hover:bg-[#FFF3E0] border border-[#DEE2E6] rounded-[4px] transition-colors block">
              <Clock className="w-4 h-4 text-[#E65100] mx-auto mb-1" />
              <p className="font-mono font-extrabold text-base text-[#212529]">
                {commStats.pendingFollowUps}
              </p>
              <p className="text-[10px] font-bold text-[#6C757D] truncate">
                {isHindi ? "फॉलो-अप" : "Follow-ups"}
              </p>
            </Link>
          </div>

          {/* Quick Search Voter (Section 14) */}
          <div className="pt-2 border-t border-[#F1F3F5] space-y-2">
            <div className="relative">
              <input
                type="text"
                placeholder={isHindi ? "मतदाता खोजें (कॉल / व्हाट्सऐप / पर्ची)..." : "Search booth voter (Call / WhatsApp / Slip)..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px] text-xs sm:text-sm px-3 pl-9 text-[#212529] focus:bg-white focus:outline-none focus:border-[#714B67]"
              />
              <Search className="w-3.5 h-3.5 text-[#6C757D] absolute left-3 top-3.5" />
            </div>

            {searchResults.length > 0 && (
              <div className="bg-white border border-[#DEE2E6] rounded-[4px] divide-y divide-[#DEE2E6] shadow-sm overflow-hidden animate-in fade-in duration-100">
                {searchResults.map((voter) => (
                  <div key={voter.id} className="p-3 hover:bg-[#F8F9FA] space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-sm text-[#212529]">{voter.name}</span>
                        <span className="font-mono text-xs font-bold text-[#714B67] ml-2">
                          {voter.voter_id_card}
                        </span>
                      </div>
                      <span className="text-xs text-[#6C757D] font-mono">
                        {voter.mobile || "No Mobile"}
                      </span>
                    </div>

                    <VoterActionBar
                      voter={voter}
                      client={client}
                      size="sm"
                      layout="grid"
                      onActionComplete={loadDashboard}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. POLLING DAY QUICK ACCESS CTA (Section 10, 14, 24) */}
      <Link href="/volunteer/polling-day" className="block">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#714B67] to-[#5B3852] text-white rounded-[4px] shadow-sm hover:opacity-95 transition-all">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-[4px] bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0">
                <Radio className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#E8F5E9] text-[#2E7D32]">
                    {isHindi ? "लाइव मतदान दिवस" : "Live Polling Day"}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  {isHindi ? "मतदान स्थिति दर्ज करें (VOTE CAST)" : "Record Polling Turnout (VOTE CAST)"}
                </h2>
                <p className="text-xs text-white/80">
                  {isHindi ? "त्वरित मतदाता खोज एवं मतदान दर्ज करें" : "Fast voter identification for your assigned booth"}
                </p>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-white flex-shrink-0" />
          </div>
        </div>
      </Link>

      {/* 4. DOOR-TO-DOOR CANVASSING / SURVEY CTA */}
      <Link href="/volunteer/survey" className="block">
        <div className="p-4 bg-white border border-[#DEE2E6] hover:border-[#714B67] rounded-[4px] flex items-center justify-between transition-colors shadow-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[4px] bg-[#F1ECEF] text-[#714B67] flex items-center justify-center flex-shrink-0">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm sm:text-base text-[#212529]">
                {isHindi ? "घर-घर संपर्क सर्वे दर्ज करें" : "Start Field Canvassing Survey"}
              </p>
              <p className="text-xs text-[#6C757D]">
                {isHindi ? "मतदाता फीडबैक और संपर्क स्थिति सहेजें" : "Record voter stance and local issues"}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#714B67]" />
        </div>
      </Link>

      {/* 5. TODAY'S TASKS & ASSIGNED ELECTORS (Section 24) */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/volunteer/voters" className="block">
          <div className="bg-white border border-[#DEE2E6] hover:border-[#714B67] rounded-[4px] p-4 transition-colors">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#212529]">
              <Users className="w-4 h-4 text-[#714B67]" />
              <span>{isHindi ? "आवंटित मतदाता" : "My Booth Voters"}</span>
            </div>
            <p className="text-2xl font-extrabold text-[#212529] mt-2 font-mono">
              {stats.totalAssignedVoters}
            </p>
            <p className="text-xs text-[#6C757D] font-medium">
              {assignedBoothName}
            </p>
          </div>
        </Link>

        <Link href="/volunteer/tasks" className="block">
          <div className="bg-white border border-[#DEE2E6] hover:border-[#714B67] rounded-[4px] p-4 transition-colors">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#212529]">
              <CheckSquare className="w-4 h-4 text-[#E65100]" />
              <span>{isHindi ? "आज के कार्य" : "Today's Tasks"}</span>
            </div>
            <p className="text-2xl font-extrabold text-[#212529] mt-2 font-mono">
              {stats.pendingTasks?.length || 0}
            </p>
            <p className="text-xs text-[#6C757D] font-medium">
              {isHindi ? "लंबित कार्य" : "Pending actions"}
            </p>
          </div>
        </Link>
      </div>

      {/* 6. TODAY'S FOLLOW-UP CALLS */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
        <div className="px-4 py-3 border-b border-[#DEE2E6] flex items-center justify-between bg-[#F8F9FA]">
          <div className="flex items-center gap-2 text-sm font-bold text-[#212529]">
            <Clock className="w-4 h-4 text-[#E65100]" />
            <span>{isHindi ? "आज के फॉलो-अप्स" : "Today's Follow-up Calls"} ({stats.todayFollowUps?.length || 0})</span>
          </div>
          <Link href="/volunteer/follow-ups" className="text-xs text-[#714B67] font-bold hover:underline">
            {t("viewAll")}
          </Link>
        </div>

        <div className="p-3 space-y-2">
          {stats.todayFollowUps && stats.todayFollowUps.map((item: any) => (
            <div
              key={item.id}
              className="p-3 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px] flex items-center justify-between gap-3 text-sm"
            >
              <div>
                <p className="font-bold text-[#212529]">{item.voter_name}</p>
                <p className="text-xs text-[#6C757D] line-clamp-1">{item.note}</p>
              </div>

              {item.voter_mobile && (
                <a
                  href={`tel:${item.voter_mobile}`}
                  className="p-2 rounded-[3px] bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] flex items-center justify-center flex-shrink-0"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
            </div>
          ))}

          {(!stats.todayFollowUps || stats.todayFollowUps.length === 0) && (
            <p className="text-xs sm:text-sm text-[#6C757D] text-center py-4">
              No follow-ups due today for your booth.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
