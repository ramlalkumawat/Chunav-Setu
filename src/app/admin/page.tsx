"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useLanguage } from "@/lib/i18n";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { OdooControlPanel } from "@/components/ui/OdooControlPanel";
import { formatDateTime } from "@/lib/utils";
import {
  Building,
  Flag,
  Users,
  UserCheck,
  Plus,
  ArrowUpRight,
  Radio,
  FileSpreadsheet,
  Activity,
  Image as ImageIcon,
  Calendar,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { switchRole } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    setStats(dbService.getSuperAdminStats());
  }, []);

  if (!stats) return null;

  return (
    <div className="space-y-4">
      {/* Odoo Control Panel */}
      <OdooControlPanel
        breadcrumb="System"
        title="Super Admin SaaS Command Center"
        subtitle="Multi-tenant master controller: candidates, voter databases, branding assets, and polling operations"
        primaryAction={{
          label: "Create Candidate",
          href: "/admin/clients",
          icon: <Plus className="w-4 h-4" />,
        }}
        secondaryActions={[
          {
            label: "Upload Voter List",
            href: "/admin/clients?action=upload",
            icon: <FileSpreadsheet className="w-4 h-4" />,
          },
        ]}
      />

      {/* 6 Required Super Admin Master SaaS KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total Candidates"
          value={stats.totalClients}
          subValue={`${stats.activeClients} Active`}
          icon={Building}
          iconColor="text-[#714B67]"
          iconBg="bg-[#F1ECEF]"
        />
        <StatCard
          title="Active Candidates"
          value={stats.activeClients}
          icon={Building}
          iconColor="text-[#2E7D32]"
          iconBg="bg-[#E8F5E9]"
          trend={{ value: "Operational", isPositive: true }}
        />
        <StatCard
          title="Total Campaigns"
          value={stats.totalCampaigns || stats.activeCampaigns}
          icon={Flag}
          iconColor="text-[#714B67]"
          iconBg="bg-[#F1ECEF]"
        />
        <StatCard
          title="Total Voters"
          value={stats.totalVoters}
          icon={Users}
          iconColor="text-[#714B67]"
          iconBg="bg-[#F1ECEF]"
          trend={{ value: "RLS Isolated", isPositive: true }}
        />
        <StatCard
          title="Total Volunteers"
          value={stats.totalVolunteers}
          icon={UserCheck}
          iconColor="text-[#E65100]"
          iconBg="bg-[#FFF3E0]"
        />
        <StatCard
          title="Polling Day Active"
          value={stats.activePollingCampaigns || 1}
          icon={Radio}
          iconColor="text-[#C62828]"
          iconBg="bg-[#FFEBEE]"
          trend={{ value: "Live Monitoring", isPositive: true }}
        />
      </div>

      {/* Candidates Overview Table */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
        <div className="px-5 py-3.5 border-b border-[#DEE2E6] flex items-center justify-between bg-[#F8F9FA] flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold text-[#212529]">
              Candidate Workspace Instances
            </h2>
            <p className="text-xs sm:text-sm text-[#6C757D]">
              Complete tenant isolation with candidate-specific branding and voter rolls
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/clients">
              <Button variant="secondary" size="sm">
                Manage All Candidates
              </Button>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="odoo-table">
            <thead>
              <tr>
                <th>Candidate & Campaign</th>
                <th>Branding Poster</th>
                <th>Constituency / AC</th>
                <th className="text-center">{t("activeVolunteers")}</th>
                <th className="text-center">{t("electorsCount")}</th>
                <th>Election Date</th>
                <th>{t("status")}</th>
                <th className="text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {stats.clientsList.map((client: any) => (
                <tr key={client.id}>
                  <td>
                    <p className="font-bold text-[#212529]">{client.candidate_name}</p>
                    <p className="text-xs text-[#6C757D]">{client.name} • {client.email}</p>
                  </td>
                  <td>
                    {client.poster_url ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
                        <ImageIcon className="w-3 h-3" />
                        Poster Active
                      </span>
                    ) : (
                      <span className="text-xs text-[#ADB5BD] italic">No Poster</span>
                    )}
                  </td>
                  <td className="text-[14px]">
                    <p className="font-semibold text-[#714B67]">{client.election_type}</p>
                    <p className="text-xs text-[#6C757D]">{client.location}</p>
                  </td>
                  <td className="text-center text-[14px] font-bold">{client.volunteer_count || 0}</td>
                  <td className="text-center text-[14px] font-bold">{client.voter_count || 0}</td>
                  <td className="text-xs text-[#495057] font-mono">
                    {client.election_date || "2026"}
                  </td>
                  <td>
                    <Badge status={client.status} size="md" />
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href="/admin/clients">
                        <Button size="sm" variant="secondary" className="h-8 text-xs">
                          Manage
                        </Button>
                      </Link>
                      <button
                        onClick={() => switchRole("client_admin", client.id)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#714B67] hover:underline px-2 py-1 rounded hover:bg-[#F1ECEF]"
                        title="Enter Candidate Workspace"
                      >
                        <span>Login as Candidate</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity & System Audit Log Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* System Audit Log Stream */}
        <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
          <div className="px-5 py-3.5 border-b border-[#DEE2E6] flex items-center justify-between bg-[#F8F9FA]">
            <div>
              <h3 className="text-base font-bold text-[#212529]">
                System Audit Trail
              </h3>
              <p className="text-xs sm:text-sm text-[#6C757D]">Recent security operations & tenant mutations</p>
            </div>
            <Link href="/admin/audit-logs">
              <Button variant="secondary" size="sm">
                {t("viewAll")}
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="odoo-table">
              <thead>
                <tr>
                  <th>Operation</th>
                  <th>Target</th>
                  <th>Operator</th>
                  <th className="text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentLogs.map((log: any) => (
                  <tr key={log.id}>
                    <td>
                      <span className="font-bold text-[#212529] text-xs sm:text-sm">{log.action}</span>
                    </td>
                    <td className="text-xs sm:text-[13px] text-[#495057]">{log.target_type}</td>
                    <td className="text-xs sm:text-[13px] font-semibold text-[#212529]">{log.actor_name}</td>
                    <td className="text-right text-[11px] sm:text-xs text-[#6C757D] font-mono whitespace-nowrap">
                      {formatDateTime(log.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Polling Day Activity Live Stream */}
        <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
          <div className="px-5 py-3.5 border-b border-[#DEE2E6] flex items-center justify-between bg-[#F8F9FA]">
            <div>
              <h3 className="text-base font-bold text-[#212529]">
                Polling Day Live Telemetry
              </h3>
              <p className="text-xs sm:text-sm text-[#6C757D]">Real-time operational polling updates across tenants</p>
            </div>
            <Badge status="active" size="sm" />
          </div>

          <div className="p-3 space-y-2">
            {stats.recentPollingUpdates && stats.recentPollingUpdates.length > 0 ? (
              stats.recentPollingUpdates.map((update: any) => (
                <div
                  key={update.id}
                  className="p-2.5 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px] flex items-center justify-between gap-2 text-xs sm:text-sm"
                >
                  <div>
                    <span className="font-bold text-[#212529]">{update.voter_name}</span>
                    <span className="text-[#6C757D] text-xs ml-2 font-mono">({update.voter_id_card})</span>
                    <p className="text-xs text-[#6C757D] mt-0.5">
                      {update.booth_name} • Recorded by {update.volunteer_name || update.updated_by}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] flex-shrink-0">
                    {update.status === "VOTE_CAST" || update.status === "VOTING_REPORTED" ? "VOTE CAST" : update.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-xs sm:text-sm text-[#6C757D]">
                No polling activity recorded yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
