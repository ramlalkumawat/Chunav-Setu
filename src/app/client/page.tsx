"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
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
  Compass,
  ArrowRight,
  Plus,
  FileSpreadsheet,
  Download,
  Filter,
  Layers,
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
  const { client, user, quickLoginDemo } = useAuth();
  const clientId = client?.id || "client-1";

  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    setStats(dbService.getClientDashboardStats(clientId));
  }, [clientId]);

  if (!stats) return null;

  return (
    <div className="space-y-4">
      {/* Odoo ERP Control Panel / Dashboard Header */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-none">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#6C757D]">
            <span>Campaign</span>
            <span>/</span>
            <span className="font-semibold text-[#212529]">Overview & Analytics</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="text-lg font-bold text-[#212529] tracking-tight">
              {client?.candidate_name || "Candidate"} Dashboard
            </h1>
            <Badge status="active" size="sm" />
          </div>
          <p className="text-xs text-[#6C757D]">
            {client?.election_type} • {client?.location} • {client?.campaign_name}
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Link href="/client/voters/import">
            <Button variant="secondary" size="sm" leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-[#6C757D]" />}>
              Import Voters
            </Button>
          </Link>
          <Link href="/client/tasks">
            <Button size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              New Task
            </Button>
          </Link>
        </div>
      </div>

      {/* Compact ERP KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Total Voters"
          value={stats.totalVoters}
          icon={Users}
          iconColor="text-[#714B67]"
          iconBg="bg-[#F1ECEF]"
          trend={{ value: "+3.8%", isPositive: true, label: "vs last wk" }}
        />
        <StatCard
          title="Polling Booths"
          value={stats.totalBooths}
          icon={Building}
          iconColor="text-[#714B67]"
          iconBg="bg-[#F1ECEF]"
        />
        <StatCard
          title="Volunteers"
          value={stats.totalVolunteers}
          icon={UserCheck}
          iconColor="text-[#714B67]"
          iconBg="bg-[#F1ECEF]"
        />
        <StatCard
          title="Contacted"
          value={stats.contacted}
          subValue={`${stats.contactPercentage}%`}
          icon={CheckCircle2}
          iconColor="text-[#2E7D32]"
          iconBg="bg-[#E8F5E9]"
          trend={{ value: `${stats.contactPercentage}%`, isPositive: true, label: "canvassed" }}
        />
        <StatCard
          title="Follow-ups Due"
          value={stats.pendingFollowUps}
          icon={Clock}
          iconColor="text-[#E65100]"
          iconBg="bg-[#FFF3E0]"
        />
        <StatCard
          title="Active Tasks"
          value={stats.pendingTasks}
          subValue={`${stats.completedTasks} done`}
          icon={CheckSquare}
          iconColor="text-[#714B67]"
          iconBg="bg-[#F1ECEF]"
        />
      </div>

      {/* Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Booth Contact Progress (ERP Bar Chart) */}
        <Card padding="md" className="lg:col-span-2">
          <CardHeader
            title="Booth-wise Voter Outreach Coverage"
            subtitle="Percentage of registered electors contacted per polling station"
            action={
              <Link href="/client/booths">
                <Button variant="secondary" size="sm">
                  View Booths
                </Button>
              </Link>
            }
          />
          <div className="h-60 w-full mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.boothBreakdown}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: "#6C757D" }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#212529", fontWeight: 500 }} width={120} />
                <Tooltip
                  formatter={(value: any) => [`${value}% Contacted`, "Coverage"]}
                  contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#DEE2E6", borderRadius: 4, fontSize: 12, padding: "6px 10px" }}
                />
                <Bar dataKey="progress" fill="#714B67" radius={[0, 2, 2, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Voter Sentiment Distribution (ERP Pie Chart) */}
        <Card padding="md">
          <CardHeader
            title="Electoral Sentiment"
            subtitle="Feedback distribution from field surveys"
          />
          <div className="h-40 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={62}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {stats.statusDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} electors`, name]}
                  contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#DEE2E6", borderRadius: 4, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#DEE2E6] grid grid-cols-2 gap-1.5 text-xs">
            {stats.statusDistribution.map((item: any) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: item.color }} />
                <span className="text-[#6C757D] text-[11px] truncate">{item.name}:</span>
                <span className="font-semibold text-[#212529] text-[11px]">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Operational Grids: Today's Follow-ups & Field Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's Follow-ups (Dense ERP List) */}
        <Card padding="none">
          <div className="px-3.5 py-2.5 border-b border-[#DEE2E6] flex items-center justify-between bg-[#F8F9FA]">
            <div>
              <h3 className="text-xs font-semibold text-[#212529] uppercase tracking-wider">
                Priority Follow-up Queue
              </h3>
              <p className="text-[11px] text-[#6C757D]">Scheduled voter callbacks and pending visits</p>
            </div>
            <Link href="/client/follow-ups">
              <Button variant="secondary" size="sm">
                View Queue
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="odoo-table">
              <thead>
                <tr>
                  <th>Voter</th>
                  <th>Booth / Ward</th>
                  <th>Priority</th>
                  <th>Assigned</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.todaysFollowUps.map((f: any) => (
                  <tr key={f.id}>
                    <td>
                      <p className="font-semibold text-[#212529]">{f.voter_name}</p>
                      <p className="text-[11px] text-[#6C757D] truncate max-w-[160px]">{f.note}</p>
                    </td>
                    <td className="text-xs text-[#495057]">{f.booth_name}</td>
                    <td>
                      <Badge status={f.priority} size="sm" />
                    </td>
                    <td className="text-xs text-[#6C757D]">
                      {f.volunteer_name || "Unassigned"}
                    </td>
                    <td className="text-right">
                      <Link href="/client/follow-ups">
                        <button className="px-2 py-0.5 text-[11px] font-medium text-[#714B67] bg-white border border-[#DEE2E6] hover:bg-[#F8F9FA] rounded-[3px]">
                          Resolve
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {stats.todaysFollowUps.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-xs text-[#6C757D]">
                      No pending follow-ups scheduled for today.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Live Field Activity Feed */}
        <Card padding="none">
          <div className="px-3.5 py-2.5 border-b border-[#DEE2E6] flex items-center justify-between bg-[#F8F9FA]">
            <div>
              <h3 className="text-xs font-semibold text-[#212529] uppercase tracking-wider">
                Field Activity Log
              </h3>
              <p className="text-[11px] text-[#6C757D]">Real-time door-to-door submissions</p>
            </div>
            <Link href="/client/field-work">
              <Button variant="secondary" size="sm">
                Full Log
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="odoo-table">
              <thead>
                <tr>
                  <th>Voter</th>
                  <th>Outcome</th>
                  <th>Volunteer</th>
                  <th className="text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentActivities.map((act: any) => (
                  <tr key={act.id}>
                    <td>
                      <p className="font-semibold text-[#212529]">{act.voter_name}</p>
                      {act.notes && (
                        <p className="text-[11px] text-[#6C757D] italic truncate max-w-[160px]">
                          "{act.notes}"
                        </p>
                      )}
                    </td>
                    <td>
                      <Badge status={act.outcome} size="sm" />
                    </td>
                    <td className="text-xs text-[#495057]">
                      {act.volunteer_name} <span className="text-[#6C757D] text-[10px]">({act.booth_name})</span>
                    </td>
                    <td className="text-right text-[11px] text-[#6C757D] font-mono">
                      {formatDateTime(act.created_at)}
                    </td>
                  </tr>
                ))}
                {stats.recentActivities.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-xs text-[#6C757D]">
                      No field survey activities logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
