"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useLanguage } from "@/lib/i18n";
import { CandidatePosterBanner } from "@/components/layout/CandidatePosterBanner";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDateTime, formatNumber } from "@/lib/utils";
import {
  Users,
  Building,
  UserCheck,
  CheckCircle2,
  Clock,
  CheckSquare,
  Plus,
  FileSpreadsheet,
  Radio,
  BarChart3,
  ArrowRight,
  Sparkles,
  MessageSquare,
  FileText,
  PhoneCall,
  Phone,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function ClientDashboardPage() {
  const { client } = useAuth();
  const { t, language } = useLanguage();
  const isHindi = language === "hi";
  const clientId = client?.id || "client-1";

  const [stats, setStats] = useState<any>(null);
  const [pollingStats, setPollingStats] = useState<any>(null);
  const [commSummary, setCommSummary] = useState<any>(null);

  useEffect(() => {
    setStats(dbService.getClientDashboardStats(clientId));
    setPollingStats(dbService.getPollingDayDashboardStats(clientId));
    setCommSummary(dbService.getCommunicationSummary(clientId));
  }, [clientId]);

  if (!stats) return null;

  const candidateName = client?.candidate_name || "Candidate";
  const campaignName = client?.campaign_name || "Official Campaign";
  const electionDate = client?.election_date || "12 December 2026";
  const pollingTurnout = pollingStats?.turnoutPercentage || stats.contactPercentage || 68;

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      {/* 1. TOP: CANDIDATE BRANDING POSTER (Tenant-Specific, Section 4, 5, 23) */}
      <CandidatePosterBanner
        client={client}
        moduleTitle={isHindi ? "कमांड सेंटर" : "Command Center"}
        badgeText={isHindi ? "सक्रिय अभियान" : "Active Campaign"}
      />

      {/* 2. GREETING & CAMPAIGN HEADER (Section 23) */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3.5 shadow-none w-full">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#6C757D] font-medium">
            <span>{isHindi ? "स्वागत है" : "Welcome"},</span>
            <span className="font-bold text-[#714B67]">{candidateName}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#212529] tracking-tight">
              {campaignName}
            </h1>
            <span className="px-2.5 py-0.5 rounded-[3px] bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] text-xs font-bold font-mono">
              {electionDate}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6C757D] mt-0.5">
            {client?.election_type} • {client?.location}
          </p>
        </div>

        {/* Quick Direct Actions Bar (Section 23) */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <Link href="/client/voters">
            <Button variant="secondary" size="sm" className="h-10 text-xs sm:text-sm font-bold" leftIcon={<Users className="w-4 h-4 text-[#714B67]" />}>
              {isHindi ? "मतदाता" : "Voters"}
            </Button>
          </Link>
          <Link href="/client/volunteers">
            <Button variant="secondary" size="sm" className="h-10 text-xs sm:text-sm font-bold" leftIcon={<UserCheck className="w-4 h-4 text-[#714B67]" />}>
              {isHindi ? "स्वयंसेवक" : "Volunteers"}
            </Button>
          </Link>
          <Link href="/client/polling-day">
            <Button variant="primary" size="sm" className="h-10 text-xs sm:text-sm font-bold bg-[#714B67] hover:bg-[#5B3852]" leftIcon={<Radio className="w-4 h-4" />}>
              {isHindi ? "मतदान दिवस" : "Polling Day"}
            </Button>
          </Link>
          <Link href="/client/reports">
            <Button variant="secondary" size="sm" className="h-10 text-xs sm:text-sm font-bold" leftIcon={<BarChart3 className="w-4 h-4 text-[#6C757D]" />}>
              {isHindi ? "रिपोर्ट" : "Reports"}
            </Button>
          </Link>
        </div>
      </div>

      {/* 3. 4 CORE PROMINENT ERP KPI CARDS (Section 23) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
        <StatCard
          title={isHindi ? "कुल मतदाता" : "Total Voters"}
          value={stats.totalVoters}
          subValue={`${stats.contacted} Contacted`}
          icon={Users}
          iconColor="text-[#714B67]"
          iconBg="bg-[#F1ECEF]"
          trend={{ value: "+3.8%", isPositive: true, label: "vs last wk" }}
        />
        <StatCard
          title={isHindi ? "कुल बूथ" : "Total Booths"}
          value={stats.totalBooths}
          subValue="All Sectors Mapped"
          icon={Building}
          iconColor="text-[#714B67]"
          iconBg="bg-[#F1ECEF]"
        />
        <StatCard
          title={isHindi ? "सक्रिय स्वयंसेवक" : "Active Volunteers"}
          value={stats.totalVolunteers}
          subValue="Field Cadre Assigned"
          icon={UserCheck}
          iconColor="text-[#714B67]"
          iconBg="bg-[#F1ECEF]"
        />
        <StatCard
          title={isHindi ? "मतदान प्रगति" : "Polling Progress"}
          value={`${pollingTurnout}%`}
          subValue={`${pollingStats?.voteCastCount || 0} Votes Cast`}
          icon={Radio}
          iconColor="text-[#2E7D32]"
          iconBg="bg-[#E8F5E9]"
          trend={{ value: `${pollingTurnout}%`, isPositive: true, label: "Turnout" }}
        />
      </div>

      {/* 4. POLLING DAY LIVE SUMMARY CARD (Section 23) */}
      {pollingStats && (
        <div className="bg-gradient-to-r from-[#FAF7F9] via-white to-[#FAF7F9] border-2 border-[#714B67]/30 rounded-[4px] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#714B67]">
                {isHindi ? "मतदान दिवस लाइव ऑपरेशन्स सारांश" : "Polling Day Live Operational Telemetry"}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#212529]">
              {pollingStats.voteCastCount} {isHindi ? "मतदान दर्ज" : "Votes Cast"} • {pollingStats.pendingVoters} {isHindi ? "लंबित" : "Pending"}
            </h3>
            <p className="text-xs sm:text-sm text-[#6C757D]">
              Election Day telemetry active across all {stats.totalBooths} polling booths with real-time field reporting.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/client/polling-day">
              <Button variant="primary" size="md" className="h-11 font-bold bg-[#714B67]" rightIcon={<ArrowRight className="w-4 h-4" />}>
                {isHindi ? "वार रूम खोलें" : "Open Polling War Room"}
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 5. COMMUNICATION & POLLING OUTREACH SUMMARY CARD (Section 13) */}
      {commSummary && (
        <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-4 sm:p-5 shadow-none space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F3F5]">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#714B67]" />
                <h3 className="font-bold text-base text-[#212529]">
                  {isHindi ? "संचार एवं संपर्क सारांश (Communication Summary)" : "Communication & Voter Outreach Summary"}
                </h3>
              </div>
              <p className="text-xs text-[#6C757D] mt-0.5">
                {isHindi
                  ? "आज की कॉलिंग, व्हाट्सऐप संदेश, डिजिटल मतदान पर्चियां और आवश्यक फॉलो-अप्स"
                  : "Today's calls, WhatsApp messaging activity, polling slips generated, and pending callbacks"}
              </p>
            </div>

            {/* Quick Actions (Section 13) */}
            <div className="flex items-center gap-2 flex-wrap">
              <Link href="/client/communication/polling-slip">
                <Button size="sm" variant="primary" className="bg-[#714B67]" leftIcon={<FileText className="w-3.5 h-3.5" />}>
                  {isHindi ? "पर्ची बनाएं" : "Generate Polling Slip"}
                </Button>
              </Link>
              <Link href="/client/communication/calling">
                <Button size="sm" variant="secondary" leftIcon={<Phone className="w-3.5 h-3.5 text-[#2E7D32]" />}>
                  {isHindi ? "कॉल करें" : "Call Voter"}
                </Button>
              </Link>
              <Link href="/client/communication/whatsapp">
                <Button size="sm" variant="secondary" leftIcon={<MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />}>
                  {isHindi ? "व्हाट्सऐप" : "WhatsApp"}
                </Button>
              </Link>
              <Link href="/client/communication">
                <Button size="sm" variant="secondary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  {isHindi ? "सभी देखें" : "View Hub"}
                </Button>
              </Link>
            </div>
          </div>

          {/* 4 Outreach Mini Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px]">
              <span className="text-[11px] font-bold text-[#6C757D] uppercase block">
                {t("todaysCalls")}
              </span>
              <p className="text-xl font-extrabold text-[#212529] mt-1 font-mono">
                {commSummary.todaysCalls}
              </p>
              <p className="text-[11px] text-[#2E7D32] font-semibold">
                {commSummary.connectedCalls} Connected
              </p>
            </div>

            <div className="p-3 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px]">
              <span className="text-[11px] font-bold text-[#6C757D] uppercase block">
                {t("whatsAppActivity")}
              </span>
              <p className="text-xl font-extrabold text-[#212529] mt-1 font-mono">
                {commSummary.whatsAppActivity}
              </p>
              <p className="text-[11px] text-[#25D366] font-semibold">
                Dispatched
              </p>
            </div>

            <div className="p-3 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px]">
              <span className="text-[11px] font-bold text-[#6C757D] uppercase block">
                {t("pollingSlipsGenerated")}
              </span>
              <p className="text-xl font-extrabold text-[#212529] mt-1 font-mono">
                {commSummary.pollingSlipsGenerated}
              </p>
              <p className="text-[11px] text-[#714B67] font-semibold">
                Slips Issued
              </p>
            </div>

            <div className="p-3 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px]">
              <span className="text-[11px] font-bold text-[#6C757D] uppercase block">
                {t("pendingFollowUps")}
              </span>
              <p className="text-xl font-extrabold text-[#212529] mt-1 font-mono">
                {commSummary.pendingFollowUps}
              </p>
              <p className="text-[11px] text-[#E65100] font-semibold">
                Require Action
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. BOOTH PROGRESS & SENTIMENT BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 w-full">
        {/* Booth Coverage Progress (Section 23) */}
        <Card padding="md" className="lg:col-span-2 w-full max-w-full overflow-hidden">
          <CardHeader
            title={isHindi ? "बूथवार संपर्क एवं मतदान प्रगति" : "Booth Progress & Coverage"}
            subtitle={isHindi ? "बूथ स्तर पर मतदाता संपर्क और प्रगति विश्लेषण" : "Elector coverage percentage per polling station"}
            action={
              <Link href="/client/booths">
                <Button variant="secondary" size="sm">
                  {t("viewAll")}
                </Button>
              </Link>
            }
          />
          <div className="h-64 w-full mt-2 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.boothBreakdown}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: "#6C757D" }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "#212529", fontWeight: 600 }} width={90} />
                <Tooltip
                  formatter={(value: any) => [`${value}% Progress`, "Coverage"]}
                  contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#DEE2E6", borderRadius: 4, fontSize: 13, padding: "8px 12px" }}
                />
                <Bar dataKey="progress" fill="#714B67" radius={[0, 3, 3, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Voter Stance Sentiment (ERP Pie Chart) */}
        <Card padding="md" className="w-full max-w-full overflow-hidden">
          <CardHeader
            title={isHindi ? "मतदाता रुझान वितरण" : "Voter Outreach Sentiment"}
            subtitle={isHindi ? "फील्ड सर्वे रिपोर्टिंग सारांश" : "Field canvassing stance overview"}
          />
          <div className="h-44 w-full flex items-center justify-center min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {stats.statusDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} Electors`, name]}
                  contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#DEE2E6", borderRadius: 4, fontSize: 13 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-[#DEE2E6] grid grid-cols-2 gap-2 text-xs sm:text-[13px]">
            {stats.statusDistribution.map((item: any) => (
              <div key={item.name} className="flex items-center gap-1.5 sm:gap-2 truncate">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[2px] flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[#6C757D] truncate">{item.name}:</span>
                <span className="font-bold text-[#212529] flex-shrink-0">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 6. OPERATIONAL GRIDS: RECENT ACTIVITY & TODAY'S FOLLOW-UPS (Section 23) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 w-full">
        {/* Live Field Activity Feed */}
        <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none w-full max-w-full">
          <div className="px-3.5 sm:px-5 py-3 sm:py-3.5 border-b border-[#DEE2E6] flex items-center justify-between bg-[#F8F9FA]">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#212529]">
                {isHindi ? "हालिया फील्ड गतिविधि" : "Recent Field Activity"}
              </h3>
              <p className="text-xs sm:text-[13px] text-[#6C757D]">
                {isHindi ? "स्वयंसेवकों द्वारा दर्ज किए गए नवीनतम सर्वे" : "Latest voter surveys and canvassing logs"}
              </p>
            </div>
            <Link href="/client/field-work">
              <Button variant="secondary" size="sm">
                {t("viewAll")}
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto w-full max-w-full">
            <table className="odoo-table">
              <thead>
                <tr>
                  <th>{t("electorName")}</th>
                  <th>{t("outcomeSentiment")}</th>
                  <th>{t("assignedTo")}</th>
                  <th className="text-right">{t("loggedTime")}</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentActivities.map((act: any) => (
                  <tr key={act.id}>
                    <td>
                      <p className="font-bold text-[#212529]">{act.voter_name}</p>
                      {act.notes && (
                        <p className="text-xs sm:text-[13px] text-[#6C757D] italic truncate max-w-[180px]">
                          "{act.notes}"
                        </p>
                      )}
                    </td>
                    <td>
                      <Badge status={act.outcome} size="sm" />
                    </td>
                    <td className="text-xs sm:text-[14px] text-[#495057]">
                      {act.volunteer_name} <span className="text-[#6C757D] text-xs">({act.booth_name})</span>
                    </td>
                    <td className="text-right text-xs sm:text-[13px] text-[#6C757D] font-mono">
                      {formatDateTime(act.created_at)}
                    </td>
                  </tr>
                ))}
                {stats.recentActivities.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-sm text-[#6C757D]">
                      No field survey activities logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today's Follow-ups */}
        <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none w-full max-w-full">
          <div className="px-3.5 sm:px-5 py-3 sm:py-3.5 border-b border-[#DEE2E6] flex items-center justify-between bg-[#F8F9FA]">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#212529]">
                {t("followUpsTitle")}
              </h3>
              <p className="text-xs sm:text-[13px] text-[#6C757D]">{t("followUpsSubtitle")}</p>
            </div>
            <Link href="/client/follow-ups">
              <Button variant="secondary" size="sm">
                {t("viewAll")}
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto w-full max-w-full">
            <table className="odoo-table">
              <thead>
                <tr>
                  <th>{t("electorName")}</th>
                  <th>{t("pollingBooth")}</th>
                  <th>{t("priority")}</th>
                  <th>{t("assignedTo")}</th>
                  <th className="text-right">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {stats.todaysFollowUps.map((f: any) => (
                  <tr key={f.id}>
                    <td>
                      <p className="font-bold text-[#212529]">{f.voter_name}</p>
                      <p className="text-xs sm:text-[13px] text-[#6C757D] truncate max-w-[180px]">{f.note}</p>
                    </td>
                    <td className="text-xs sm:text-[14px] text-[#495057]">{f.booth_name}</td>
                    <td>
                      <Badge status={f.priority} size="sm" />
                    </td>
                    <td className="text-xs sm:text-[14px] text-[#6C757D]">
                      {f.volunteer_name || "Unassigned"}
                    </td>
                    <td className="text-right">
                      <Link href="/client/follow-ups">
                        <Button size="sm" variant="secondary">
                          {t("resolve")}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {stats.todaysFollowUps.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-sm text-[#6C757D]">
                      No pending follow-ups scheduled for today.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
