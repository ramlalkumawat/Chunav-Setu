"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useLanguage } from "@/lib/i18n";
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
  const { t } = useLanguage();
  const clientId = client?.id || "client-1";

  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    setStats(dbService.getClientDashboardStats(clientId));
  }, [clientId]);

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Control Panel / Dashboard Header */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-none">
        <div>
          <div className="flex items-center gap-2 text-[14px] text-[#6C757D] font-medium">
            <span>{t("navCampaigns")}</span>
            <span>/</span>
            <span className="font-semibold text-[#212529]">{t("dashboardTitle")}</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#212529] tracking-tight">
              {client?.candidate_name || "Candidate"} {t("navDashboard")}
            </h1>
            <Badge status="active" size="md" />
          </div>
          <p className="text-sm text-[#6C757D] mt-0.5">
            {client?.election_type} • {client?.location} • {client?.campaign_name}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link href="/client/voters/import">
            <Button variant="secondary" size="md" leftIcon={<FileSpreadsheet className="w-4 h-4 text-[#6C757D]" />}>
              {t("importVoters")}
            </Button>
          </Link>
          <Link href="/client/tasks">
            <Button size="md" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              {t("createTask")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Prominent ERP KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title={t("totalVoters")}
          value={stats.totalVoters}
          icon={Users}
          iconColor="text-[#714B67]"
          iconBg="bg-[#F1ECEF]"
          trend={{ value: "+3.8%", isPositive: true, label: "vs last wk" }}
        />
        <StatCard
          title={t("totalBooths")}
          value={stats.totalBooths}
          icon={Building}
          iconColor="text-[#714B67]"
          iconBg="bg-[#F1ECEF]"
        />
        <StatCard
          title={t("activeVolunteers")}
          value={stats.totalVolunteers}
          icon={UserCheck}
          iconColor="text-[#714B67]"
          iconBg="bg-[#F1ECEF]"
        />
        <StatCard
          title={t("contactedVoters")}
          value={stats.contacted}
          subValue={`${stats.contactPercentage}%`}
          icon={CheckCircle2}
          iconColor="text-[#2E7D32]"
          iconBg="bg-[#E8F5E9]"
          trend={{ value: `${stats.contactPercentage}%`, isPositive: true, label: t("coverageRate") }}
        />
        <StatCard
          title={t("todayFollowUps")}
          value={stats.pendingFollowUps}
          icon={Clock}
          iconColor="text-[#E65100]"
          iconBg="bg-[#FFF3E0]"
        />
        <StatCard
          title={t("pendingTasks")}
          value={stats.pendingTasks}
          subValue={`${stats.completedTasks} done`}
          icon={CheckSquare}
          iconColor="text-[#714B67]"
          iconBg="bg-[#F1ECEF]"
        />
      </div>

      {/* Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Booth Contact Progress (ERP Bar Chart) */}
        <Card padding="md" className="lg:col-span-2">
          <CardHeader
            title={t("boothCoverageTitle")}
            subtitle={t("dashboardSubtitle")}
            action={
              <Link href="/client/booths">
                <Button variant="secondary" size="sm">
                  {t("viewAll")}
                </Button>
              </Link>
            }
          />
          <div className="h-64 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.boothBreakdown}
                layout="vertical"
                margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
              >
                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 13, fill: "#6C757D" }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 13, fill: "#212529", fontWeight: 600 }} width={130} />
                <Tooltip
                  formatter={(value: any) => [`${value}% Contacted`, "Coverage"]}
                  contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#DEE2E6", borderRadius: 4, fontSize: 14, padding: "8px 12px" }}
                />
                <Bar dataKey="progress" fill="#714B67" radius={[0, 3, 3, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Voter Sentiment Distribution (ERP Pie Chart) */}
        <Card padding="md">
          <CardHeader
            title={t("voterStance")}
            subtitle={t("outcomeSentiment")}
          />
          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={68}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {stats.statusDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} electors`, name]}
                  contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#DEE2E6", borderRadius: 4, fontSize: 13 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-[#DEE2E6] grid grid-cols-2 gap-2 text-[13px]">
            {stats.statusDistribution.map((item: any) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: item.color }} />
                <span className="text-[#6C757D] truncate">{item.name}:</span>
                <span className="font-bold text-[#212529]">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Operational Grids: Today's Follow-ups & Field Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Today's Follow-ups */}
        <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
          <div className="px-5 py-3.5 border-b border-[#DEE2E6] flex items-center justify-between bg-[#F8F9FA]">
            <div>
              <h3 className="text-base font-bold text-[#212529]">
                {t("followUpsTitle")}
              </h3>
              <p className="text-[13px] text-[#6C757D]">{t("followUpsSubtitle")}</p>
            </div>
            <Link href="/client/follow-ups">
              <Button variant="secondary" size="sm">
                {t("viewAll")}
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
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
                      <p className="text-[13px] text-[#6C757D] truncate max-w-[180px]">{f.note}</p>
                    </td>
                    <td className="text-[14px] text-[#495057]">{f.booth_name}</td>
                    <td>
                      <Badge status={f.priority} size="sm" />
                    </td>
                    <td className="text-[14px] text-[#6C757D]">
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

        {/* Live Field Activity Feed */}
        <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
          <div className="px-5 py-3.5 border-b border-[#DEE2E6] flex items-center justify-between bg-[#F8F9FA]">
            <div>
              <h3 className="text-base font-bold text-[#212529]">
                {t("fieldWorkTitle")}
              </h3>
              <p className="text-[13px] text-[#6C757D]">{t("fieldWorkSubtitle")}</p>
            </div>
            <Link href="/client/field-work">
              <Button variant="secondary" size="sm">
                {t("viewAll")}
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
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
                        <p className="text-[13px] text-[#6C757D] italic truncate max-w-[180px]">
                          "{act.notes}"
                        </p>
                      )}
                    </td>
                    <td>
                      <Badge status={act.outcome} size="sm" />
                    </td>
                    <td className="text-[14px] text-[#495057]">
                      {act.volunteer_name} <span className="text-[#6C757D] text-xs">({act.booth_name})</span>
                    </td>
                    <td className="text-right text-[13px] text-[#6C757D] font-mono">
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
      </div>
    </div>
  );
}
