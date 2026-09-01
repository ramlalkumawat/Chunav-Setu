"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/lib/context/toast-context";
import { exportToCsv } from "@/lib/utils/csv-parser";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatNumber } from "@/lib/utils";
import {
  BarChart3,
  Download,
  Building2,
  Users,
  UserCheck,
  CheckCircle2,
  TrendingUp,
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
  Legend,
} from "recharts";

export default function ReportsPage() {
  const { client } = useAuth();
  const { success } = useToast();
  const clientId = client?.id || "client-1";

  const [booths, setBooths] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    setBooths(dbService.getBooths(clientId));
    setVolunteers(dbService.getVolunteers(clientId));
    setAreas(dbService.getAreas(clientId));
    setStats(dbService.getClientDashboardStats(clientId));
  }, [clientId]);

  const handleExportBoothReport = () => {
    const headers = [
      "Booth Number",
      "Booth Name",
      "Area / Ward",
      "Total Registered Voters",
      "Contacted Voters",
      "Coverage %",
      "Assigned Volunteers",
    ];

    const rows = booths.map((b) => [
      b.booth_number,
      b.booth_name,
      b.area_name,
      b.voter_count,
      b.contacted_count,
      `${b.progress_percentage}%`,
      b.assigned_volunteers_count,
    ]);

    exportToCsv(`Booth_Report_${client?.candidate_name || "Campaign"}`, headers, rows);
    success("Report Downloaded", "Booth coverage CSV exported successfully.");
  };

  const handleExportVolunteerLeaderboard = () => {
    const headers = [
      "Volunteer Name",
      "Mobile",
      "Assigned Booth",
      "Assigned Area",
      "Surveys Logged",
      "Pending Tasks",
      "Completed Tasks",
      "Status",
    ];

    const rows = volunteers.map((v) => [
      v.name,
      v.mobile,
      v.assigned_booth_name,
      v.assigned_area_name,
      v.total_contacts,
      v.pending_tasks,
      v.completed_tasks,
      v.status,
    ]);

    exportToCsv(`Volunteer_Performance_${client?.candidate_name || "Campaign"}`, headers, rows);
    success("Report Downloaded", "Volunteer performance CSV exported successfully.");
  };

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
            Campaign Analytics & Reports
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time data visualization on voter penetration, booth committee targets, and volunteer productivity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExportBoothReport}
          >
            Export Booth Summary
          </Button>
          <Button
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExportVolunteerLeaderboard}
          >
            Export Volunteer Report
          </Button>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booth-wise Registered Voters and Contact Coverage */}
        <Card padding="md">
          <CardHeader
            title="Booth Registered Electors & Contacted Progress"
            subtitle="Comparison of enrolled voter base vs canvassed voters"
          />
          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={booths.map((b) => ({
                  name: b.booth_number,
                  total: b.voter_count,
                  contacted: b.contacted_count,
                }))}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#172033" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E5E2DC", borderRadius: 8, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar dataKey="total" name="Total Voters" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="contacted" name="Contacted" fill="#1F3A5F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Volunteer Productivity Leaderboard */}
        <Card padding="md">
          <CardHeader
            title="Volunteer Field Canvassing Productivity"
            subtitle="Surveys and door-to-door registrations completed per volunteer"
          />
          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={volunteers.map((v) => ({
                  name: v.name.split(" ")[0],
                  contacts: v.total_contacts,
                }))}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748B" }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#172033", fontWeight: 600 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} door visits`, "Surveys Completed"]}
                  contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E5E2DC", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="contacts" fill="#2F6B4F" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Booth-wise Summary Data Table */}
      <Card padding="none">
        <div className="p-4 sm:p-5 border-b border-[#E5E2DC]">
          <h3 className="text-base font-bold text-[#172033]">Booth Performance Summary</h3>
          <p className="text-xs text-[#64748B] mt-0.5">Aggregated metrics by polling station</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFAF8] text-[#64748B] font-semibold border-b border-[#E5E2DC] uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Booth Number</th>
                <th className="px-5 py-3">Venue / Location</th>
                <th className="px-5 py-3">Ward / Area</th>
                <th className="px-5 py-3 text-center">Voter Count</th>
                <th className="px-5 py-3 text-center">Contacted</th>
                <th className="px-5 py-3 text-center">Progress %</th>
                <th className="px-5 py-3 text-center">Assigned Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2DC] text-[#172033]">
              {booths.map((b) => (
                <tr key={b.id} className="hover:bg-[#F7F6F2]/50 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-[#1F3A5F]">{b.booth_number}</td>
                  <td className="px-5 py-3.5 font-medium">{b.booth_name}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{b.area_name}</td>
                  <td className="px-5 py-3.5 text-center font-semibold">{b.voter_count || 0}</td>
                  <td className="px-5 py-3.5 text-center font-semibold text-[#2F6B4F]">
                    {b.contacted_count || 0}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="font-bold text-[#172033]">{b.progress_percentage}%</span>
                  </td>
                  <td className="px-5 py-3.5 text-center font-medium">
                    {b.assigned_volunteers_count || 0} Volunteers
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
