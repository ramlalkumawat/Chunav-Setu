"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/lib/context/toast-context";
import { exportToCsv } from "@/lib/utils/csv-parser";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { OdooControlPanel } from "@/components/ui/OdooControlPanel";
import {
  Download,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function ReportsPage() {
  const { client } = useAuth();
  const { success } = useToast();
  const clientId = client?.id || "client-1";

  const [booths, setBooths] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    setBooths(dbService.getBooths(clientId));
    setVolunteers(dbService.getVolunteers(clientId));
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
    <div className="space-y-3">
      {/* Odoo Control Panel */}
      <OdooControlPanel
        breadcrumb="Campaign"
        title="Reports & Statistical Analytics"
        subtitle="Aggregated voter outreach, booth performance metrics, and field cadre productivity"
        primaryAction={{
          label: "Export Booth Summary",
          onClick: handleExportBoothReport,
          icon: <Download className="w-3.5 h-3.5" />,
        }}
        secondaryActions={[
          {
            label: "Export Volunteer Report",
            onClick: handleExportVolunteerLeaderboard,
            icon: <Download className="w-3.5 h-3.5 text-[#6C757D]" />,
          },
        ]}
      />

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Booth Progress Chart */}
        <Card padding="md">
          <CardHeader
            title="Enrolled Electors vs Contacted Electors"
            subtitle="Comparison of voter base and outreach coverage per booth"
          />
          <div className="h-64 w-full mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={booths.map((b) => ({
                  name: b.booth_number,
                  total: b.voter_count,
                  contacted: b.contacted_count,
                }))}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#212529" }} />
                <YAxis tick={{ fontSize: 11, fill: "#6C757D" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#DEE2E6", borderRadius: 4, fontSize: 12, padding: "6px 10px" }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
                <Bar dataKey="total" name="Total Electors" fill="#DEE2E6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="contacted" name="Contacted" fill="#714B67" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Volunteer Productivity Leaderboard */}
        <Card padding="md">
          <CardHeader
            title="Volunteer Field Canvassing Productivity"
            subtitle="Total door visits and surveys logged per volunteer"
          />
          <div className="h-64 w-full mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={volunteers.map((v) => ({
                  name: v.name.split(" ")[0],
                  contacts: v.total_contacts,
                }))}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <XAxis type="number" tick={{ fontSize: 11, fill: "#6C757D" }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#212529", fontWeight: 500 }} width={70} />
                <Tooltip
                  formatter={(val: any) => [`${val} door visits`, "Surveys Completed"]}
                  contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#DEE2E6", borderRadius: 4, fontSize: 12 }}
                />
                <Bar dataKey="contacts" fill="#2E7D32" radius={[0, 2, 2, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Booth-wise Summary Data Table */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
        <div className="px-3.5 py-2.5 border-b border-[#DEE2E6] bg-[#F8F9FA]">
          <h3 className="text-xs font-semibold text-[#212529] uppercase tracking-wider">
            Polling Station Performance Summary
          </h3>
          <p className="text-[11px] text-[#6C757D]">Aggregated turnout projections and coverage rate</p>
        </div>

        <div className="overflow-x-auto">
          <table className="odoo-table">
            <thead>
              <tr>
                <th>Booth Number</th>
                <th>Station Venue</th>
                <th>Ward / Area</th>
                <th className="text-center">Enrolled</th>
                <th className="text-center">Contacted</th>
                <th className="text-center">Progress %</th>
                <th className="text-center">Assigned Cadre</th>
              </tr>
            </thead>
            <tbody>
              {booths.map((b) => (
                <tr key={b.id}>
                  <td className="font-mono text-xs font-semibold text-[#714B67]">{b.booth_number}</td>
                  <td className="font-medium text-[#212529]">{b.booth_name}</td>
                  <td className="text-xs text-[#6C757D]">{b.area_name}</td>
                  <td className="text-center text-xs font-semibold text-[#212529]">{b.voter_count || 0}</td>
                  <td className="text-center text-xs font-semibold text-[#2E7D32]">
                    {b.contacted_count || 0}
                  </td>
                  <td className="text-center text-xs font-bold text-[#212529]">
                    {b.progress_percentage}%
                  </td>
                  <td className="text-center text-xs text-[#495057]">
                    {b.assigned_volunteers_count || 0} Volunteers
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
