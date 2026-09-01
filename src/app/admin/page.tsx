"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
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
  Activity,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { switchRole } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    setStats(dbService.getSuperAdminStats());
  }, []);

  if (!stats) return null;

  return (
    <div className="space-y-3">
      {/* Odoo Control Panel */}
      <OdooControlPanel
        breadcrumb="System"
        title="Super Admin Portal"
        subtitle="Multi-tenant cluster health, active candidates, and platform audit logs"
        primaryAction={{
          label: "Provision Client",
          href: "/admin/clients",
          icon: <Plus className="w-3.5 h-3.5" />,
        }}
      />

      {/* 4 Core Super Admin KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          subValue={`${stats.activeClients} active`}
          icon={Building}
          iconColor="text-[#714B67]"
          iconBg="bg-[#F1ECEF]"
          trend={{ value: "+2 active", isPositive: true }}
        />
        <StatCard
          title="Campaigns"
          value={stats.activeCampaigns}
          icon={Flag}
          iconColor="text-[#2E7D32]"
          iconBg="bg-[#E8F5E9]"
          trend={{ value: "100% active", isPositive: true }}
        />
        <StatCard
          title="Total Field Cadre"
          value={stats.totalVolunteers}
          icon={UserCheck}
          iconColor="text-[#E65100]"
          iconBg="bg-[#FFF3E0]"
          trend={{ value: "All tenants", isPositive: true }}
        />
        <StatCard
          title="Electors Indexed"
          value={stats.totalVoters}
          icon={Users}
          iconColor="text-[#714B67]"
          iconBg="bg-[#F1ECEF]"
          trend={{ value: "RLS protected", isPositive: true }}
        />
      </div>

      {/* Clients Overview Table */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
        <div className="px-3.5 py-2.5 border-b border-[#DEE2E6] flex items-center justify-between bg-[#F8F9FA]">
          <div>
            <h2 className="text-xs font-semibold text-[#212529] uppercase tracking-wider">
              Tenant Database Instances
            </h2>
            <p className="text-[11px] text-[#6C757D]">
              Row-Level Security isolated tenant instances
            </p>
          </div>
          <Link href="/admin/clients">
            <Button variant="secondary" size="sm">
              Manage Clients
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="odoo-table">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Candidate Name</th>
                <th>Constituency / AC</th>
                <th className="text-center">Volunteers</th>
                <th className="text-center">Electors</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {stats.clientsList.map((client: any) => (
                <tr key={client.id}>
                  <td>
                    <p className="font-semibold text-[#212529]">{client.name}</p>
                    <p className="text-[11px] text-[#6C757D]">{client.email}</p>
                  </td>
                  <td className="text-xs font-medium text-[#212529]">{client.candidate_name}</td>
                  <td className="text-xs">
                    <p className="font-medium text-[#714B67]">{client.election_type}</p>
                    <p className="text-[11px] text-[#6C757D]">{client.location}</p>
                  </td>
                  <td className="text-center text-xs font-semibold">{client.volunteer_count || 0}</td>
                  <td className="text-center text-xs font-semibold">{client.voter_count || 0}</td>
                  <td>
                    <Badge status={client.status} size="sm" />
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => switchRole("client_admin", client.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#714B67] hover:underline"
                    >
                      <span>Open Workspace</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Audit Log Stream */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
        <div className="px-3.5 py-2.5 border-b border-[#DEE2E6] flex items-center justify-between bg-[#F8F9FA]">
          <div>
            <h3 className="text-xs font-semibold text-[#212529] uppercase tracking-wider">
              System Audit Trail
            </h3>
            <p className="text-[11px] text-[#6C757D]">Recent security operations & tenant mutations</p>
          </div>
          <Link href="/admin/audit-logs">
            <Button variant="secondary" size="sm">
              Full Audit Log
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="odoo-table">
            <thead>
              <tr>
                <th>Operation</th>
                <th>Target Object</th>
                <th>Operator</th>
                <th>Tenant Context</th>
                <th className="text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentLogs.map((log: any) => (
                <tr key={log.id}>
                  <td>
                    <span className="font-semibold text-[#212529]">{log.action}</span>
                  </td>
                  <td className="text-xs text-[#495057]">{log.target_type}</td>
                  <td className="text-xs font-medium text-[#212529]">{log.actor_name}</td>
                  <td className="text-xs text-[#6C757D]">
                    {log.client_name || "System"}
                  </td>
                  <td className="text-right text-[11px] text-[#6C757D] font-mono whitespace-nowrap">
                    {formatDateTime(log.created_at)}
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
