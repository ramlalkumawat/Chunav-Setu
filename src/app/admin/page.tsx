"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, formatDateTime } from "@/lib/utils";
import {
  Building2,
  Flag,
  Users,
  UserCheck,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  ArrowRight,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { switchRole } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    setStats(dbService.getSuperAdminStats());
  }, []);

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
            Platform Overview
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Cross-tenant system health, active client accounts, and tenant operations
          </p>
        </div>

        <Link href="/admin/clients">
          <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Provision New Client
          </Button>
        </Link>
      </div>

      {/* 4 Core Super Admin KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          subValue={`${stats.activeClients} active`}
          icon={Building2}
          iconColor="text-[#1F3A5F]"
          iconBg="bg-[#EAEFF5]"
          trend={{ value: "+2 this month", isPositive: true }}
        />
        <StatCard
          title="Active Campaigns"
          value={stats.activeCampaigns}
          icon={Flag}
          iconColor="text-[#2F6B4F]"
          iconBg="bg-[#EAF3EE]"
          trend={{ value: "100% active", isPositive: true }}
        />
        <StatCard
          title="Total Volunteers"
          value={stats.totalVolunteers}
          icon={UserCheck}
          iconColor="text-[#B7791F]"
          iconBg="bg-[#FEF7EC]"
          trend={{ value: "Across all tenants", isPositive: true }}
        />
        <StatCard
          title="Total Voters Registered"
          value={stats.totalVoters}
          icon={Users}
          iconColor="text-[#1F3A5F]"
          iconBg="bg-[#EAEFF5]"
          trend={{ value: "Verified in RLS", isPositive: true }}
        />
      </div>

      {/* Clients Overview Table */}
      <Card padding="none">
        <div className="p-4 sm:p-5 border-b border-[#E5E2DC] flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#172033]">
              Active Client Campaigns
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Isolated tenant instances provisioned on PostgreSQL
            </p>
          </div>
          <Link href="/admin/clients">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFAF8] text-[#64748B] font-semibold border-b border-[#E5E2DC] uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Client / Organization</th>
                <th className="px-5 py-3">Candidate</th>
                <th className="px-5 py-3">Election / Location</th>
                <th className="px-5 py-3">Volunteers</th>
                <th className="px-5 py-3">Voters</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Quick Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2DC] text-[#172033]">
              {stats.clientsList.map((client: any) => (
                <tr key={client.id} className="hover:bg-[#F7F6F2]/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-[#172033]">{client.name}</p>
                    <p className="text-[11px] text-[#64748B]">{client.email}</p>
                  </td>
                  <td className="px-5 py-3.5 font-medium">{client.candidate_name}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-[#1F3A5F]">{client.election_type}</p>
                    <p className="text-[11px] text-[#64748B]">{client.location}</p>
                  </td>
                  <td className="px-5 py-3.5 font-semibold">{client.volunteer_count || 0}</td>
                  <td className="px-5 py-3.5 font-semibold">{client.voter_count || 0}</td>
                  <td className="px-5 py-3.5">
                    <Badge status={client.status} size="sm" />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => switchRole("client_admin", client.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#1F3A5F] hover:underline"
                    >
                      <span>Enter Portal</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* System Activity Logs */}
      <Card padding="md">
        <CardHeader
          title="System Audit Trail"
          subtitle="Recent security, tenant management, and campaign operations"
          action={
            <Link href="/admin/audit-logs">
              <Button variant="ghost" size="sm">
                View Log History
              </Button>
            </Link>
          }
        />
        <div className="space-y-3">
          {stats.recentLogs.map((log: any) => (
            <div
              key={log.id}
              className="flex items-start justify-between gap-4 p-3 bg-[#FAFAF8] border border-[#E5E2DC] rounded-lg text-xs"
            >
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#EAEFF5] text-[#1F3A5F] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#172033]">{log.action}</span>
                    {log.client_name && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-[#E5E2DC] text-[#64748B]">
                        {log.client_name}
                      </span>
                    )}
                  </div>
                  <p className="text-[#64748B] mt-0.5">
                    Performed by <strong className="text-[#172033]">{log.actor_name}</strong> on {log.target_type}
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-[#64748B] flex-shrink-0 font-mono">
                {formatDateTime(log.created_at)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
