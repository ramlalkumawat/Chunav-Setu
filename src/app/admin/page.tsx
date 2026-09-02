"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  Radio,
  FileSpreadsheet,
  Image as ImageIcon,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [clientsRes, logsRes] = await Promise.all([
          fetch("/api/admin/clients"),
          fetch("/api/admin/audit-logs"),
        ]);

        const clientsData = clientsRes.ok ? await clientsRes.json() : [];
        const logsData = logsRes.ok ? await logsRes.json() : [];

        setClients(clientsData);
        setLogs(logsData);

        const totalVoters = clientsData.reduce((acc: number, c: any) => acc + (c.voter_count || 0), 0);
        const totalVolunteers = clientsData.reduce((acc: number, c: any) => acc + (c.volunteer_count || 0), 0);
        const activeClients = clientsData.filter((c: any) => c.status === "active").length;

        setStats({
          totalClients: clientsData.length,
          activeClients,
          totalCampaigns: clientsData.length,
          totalVoters,
          totalVolunteers,
        });
      } catch (err) {
        console.error("Error loading admin stats:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="space-y-4">
      {/* Odoo Control Panel */}
      <OdooControlPanel
        breadcrumb="System"
        title="Super Admin SaaS Command Center"
        subtitle="Multi-tenant master controller: candidates, voter databases, branding assets, and platform operations"
        primaryAction={{
          label: "Create Candidate",
          href: "/admin/clients",
          icon: <Plus className="w-4 h-4" />,
        }}
        secondaryActions={[
          {
            label: "Upload Voter List",
            href: "/admin/clients",
            icon: <FileSpreadsheet className="w-4 h-4" />,
          },
        ]}
      />

      {/* 6 Required Super Admin Master SaaS KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total Candidates"
          value={stats?.totalClients || 0}
          subValue={`${stats?.activeClients || 0} Active`}
          icon={Building}
          iconColor="text-[#714B67]"
          iconBg="bg-[#F1ECEF]"
        />
        <StatCard
          title="Active Candidates"
          value={stats?.activeClients || 0}
          icon={Building}
          iconColor="text-[#2E7D32]"
          iconBg="bg-[#E8F5E9]"
          trend={{ value: "Operational", isPositive: true }}
        />
        <StatCard
          title="Total Campaigns"
          value={stats?.totalCampaigns || 0}
          icon={Flag}
          iconColor="text-[#714B67]"
          iconBg="bg-[#F1ECEF]"
        />
        <StatCard
          title="Total Voters"
          value={stats?.totalVoters || 0}
          icon={Users}
          iconColor="text-[#714B67]"
          iconBg="bg-[#F1ECEF]"
          trend={{ value: "RLS Isolated", isPositive: true }}
        />
        <StatCard
          title="Total Volunteers"
          value={stats?.totalVolunteers || 0}
          icon={UserCheck}
          iconColor="text-[#E65100]"
          iconBg="bg-[#FFF3E0]"
        />
        <StatCard
          title="Polling Day Telemetry"
          value={stats?.activeClients > 0 ? stats.activeClients : 0}
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
          {clients.length > 0 ? (
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
                {clients.map((client: any) => (
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
                      <Link href={`/admin/clients`}>
                        <Button size="sm" variant="secondary" className="h-8 text-xs">
                          Manage
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 px-4 space-y-3">
              <Building className="w-10 h-10 text-[#CED4DA] mx-auto" />
              <h3 className="font-bold text-base text-[#212529]">No Candidates Provisioned Yet</h3>
              <p className="text-xs sm:text-sm text-[#6C757D] max-w-sm mx-auto">
                Create your first candidate client account to initialize voter registries and campaign workspaces.
              </p>
              <Link href="/admin/clients" className="inline-block mt-2">
                <Button variant="primary" size="sm">
                  <Plus className="w-4 h-4 mr-1.5" />
                  <span>Create Candidate</span>
                </Button>
              </Link>
            </div>
          )}
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
            {logs.length > 0 ? (
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
                  {logs.slice(0, 8).map((log: any) => (
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
            ) : (
              <p className="text-center py-8 text-xs text-[#6C757D]">No audit records logged yet.</p>
            )}
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

          <div className="p-4 space-y-2">
            <p className="text-center py-8 text-xs sm:text-sm text-[#6C757D]">
              Real-time turnout monitoring active for configured elections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
