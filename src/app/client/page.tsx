"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, formatDateTime, formatNumber } from "@/lib/utils";
import {
  Users,
  Building2,
  UserCheck,
  CheckCircle2,
  Clock,
  CheckSquare,
  Compass,
  ArrowRight,
  Plus,
  TrendingUp,
  AlertCircle,
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
  const clientId = client?.id || "client-1";

  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    setStats(dbService.getClientDashboardStats(clientId));
  }, [clientId]);

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Campaign Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5E2DC]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
              {client?.candidate_name || "Candidate"} Campaign Command
            </h1>
            <Badge variant="success" size="sm">Active</Badge>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            {client?.election_type} • {client?.location} • {client?.campaign_name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/client/voters/import">
            <Button variant="outline" size="sm" leftIcon={<FileSpreadsheet className="w-4 h-4" />}>
              Import CSV
            </Button>
          </Link>
          <Link href="/client/tasks">
            <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              New Task
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total Voters"
          value={stats.totalVoters}
          icon={Users}
          iconColor="text-[#1F3A5F]"
          iconBg="bg-[#EAEFF5]"
        />
        <StatCard
          title="Polling Booths"
          value={stats.totalBooths}
          icon={Building2}
          iconColor="text-[#1F3A5F]"
          iconBg="bg-[#EAEFF5]"
        />
        <StatCard
          title="Field Volunteers"
          value={stats.totalVolunteers}
          icon={UserCheck}
          iconColor="text-[#1F3A5F]"
          iconBg="bg-[#EAEFF5]"
        />
        <StatCard
          title="Voters Contacted"
          value={stats.contacted}
          subValue={`${stats.contactPercentage}%`}
          icon={CheckCircle2}
          iconColor="text-[#2F6B4F]"
          iconBg="bg-[#EAF3EE]"
        />
        <StatCard
          title="Pending Follow-ups"
          value={stats.pendingFollowUps}
          icon={Clock}
          iconColor="text-[#B7791F]"
          iconBg="bg-[#FEF7EC]"
        />
        <StatCard
          title="Active Tasks"
          value={stats.pendingTasks}
          subValue={`${stats.completedTasks} done`}
          icon={CheckSquare}
          iconColor="text-[#1F3A5F]"
          iconBg="bg-[#EAEFF5]"
        />
      </div>

      {/* Visual Analytics Row (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booth Coverage Bar Chart */}
        <Card padding="md" className="lg:col-span-2">
          <CardHeader
            title="Booth-wise Contact Coverage"
            subtitle="Percentage of verified registered voters contacted per booth"
            action={
              <Link href="/client/booths">
                <Button variant="ghost" size="sm">
                  View Booths
                </Button>
              </Link>
            }
          />
          <div className="h-64 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.boothBreakdown}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: "#64748B" }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#172033", fontWeight: 600 }} />
                <Tooltip
                  formatter={(value: any) => [`${value}% Coverage`, "Progress"]}
                  contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E5E2DC", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="progress" fill="#1F3A5F" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Voter Sentiment Distribution Pie Chart */}
        <Card padding="md">
          <CardHeader
            title="Voter Sentiment Breakdown"
            subtitle="Feedback from door-to-door visits"
          />
          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {stats.statusDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} voters`, name]}
                  contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E5E2DC", borderRadius: 8, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E5E2DC] grid grid-cols-2 gap-2 text-xs">
            {stats.statusDistribution.map((item: any) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[#64748B]">{item.name}:</span>
                <span className="font-bold text-[#172033]">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Operational Feed: Follow-ups & Recent Field Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Follow-ups */}
        <Card padding="md">
          <CardHeader
            title="Today's Priority Follow-ups"
            subtitle="Scheduled callbacks and second-round visits"
            action={
              <Link href="/client/follow-ups">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            }
          />
          <div className="space-y-3">
            {stats.todaysFollowUps.map((f: any) => (
              <div
                key={f.id}
                className="p-3 bg-[#FAFAF8] border border-[#E5E2DC] rounded-lg flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#172033]">{f.voter_name}</span>
                    <Badge status={f.priority} size="sm" />
                  </div>
                  <p className="text-[#64748B] mt-1 line-clamp-1">{f.note}</p>
                  <p className="text-[11px] text-[#1F3A5F] mt-1 font-medium">
                    Assigned: {f.volunteer_name || "Unassigned"} • {f.booth_name}
                  </p>
                </div>
                <Link href="/client/follow-ups">
                  <button className="px-2.5 py-1 rounded bg-white border border-[#E5E2DC] hover:bg-[#F7F6F2] font-semibold text-[11px] text-[#1F3A5F] whitespace-nowrap">
                    Review
                  </button>
                </Link>
              </div>
            ))}
            {stats.todaysFollowUps.length === 0 && (
              <p className="text-xs text-[#64748B] text-center py-6">
                No pending follow-ups scheduled for today.
              </p>
            )}
          </div>
        </Card>

        {/* Live Field Activity Stream */}
        <Card padding="md">
          <CardHeader
            title="Live Field Activity Feed"
            subtitle="Real-time door-to-door submissions by volunteers"
            action={
              <Link href="/client/field-work">
                <Button variant="ghost" size="sm">
                  Full Stream
                </Button>
              </Link>
            }
          />
          <div className="space-y-3">
            {stats.recentActivities.map((act: any) => (
              <div
                key={act.id}
                className="p-3 bg-[#FAFAF8] border border-[#E5E2DC] rounded-lg flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#EAEFF5] text-[#1F3A5F] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#172033]">{act.voter_name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white border border-[#E5E2DC] text-[#2F6B4F]">
                        {act.outcome}
                      </span>
                    </div>
                    {act.notes && (
                      <p className="text-[#64748B] mt-0.5 line-clamp-1 italic">
                        "{act.notes}"
                      </p>
                    )}
                    <p className="text-[10px] text-[#64748B] mt-1">
                      Logged by <strong>{act.volunteer_name}</strong> • {act.booth_name}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-[#64748B] font-mono whitespace-nowrap">
                  {formatDateTime(act.created_at)}
                </span>
              </div>
            ))}
            {stats.recentActivities.length === 0 && (
              <p className="text-xs text-[#64748B] text-center py-6">
                No field surveys recorded yet. Dispatched volunteers will appear here.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
