"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/store/data-service";
import { AuditLog } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { formatDateTime } from "@/lib/utils";
import { Search, ShieldAlert, History, Filter } from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLogs(dbService.getAuditLogs());
  }, []);

  const filteredLogs = logs.filter((l) => {
    return (
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actor_name.toLowerCase().includes(search.toLowerCase()) ||
      (l.client_name && l.client_name.toLowerCase().includes(search.toLowerCase())) ||
      l.target_type.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
            Security & Activity Audit Logs
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Immutable system logs tracking client management, voter imports, and tenant actions
          </p>
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Search action, user, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFAF8] text-[#64748B] font-semibold border-b border-[#E5E2DC] uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Actor / User</th>
                <th className="px-5 py-3">Target Scope</th>
                <th className="px-5 py-3">Tenant / Client</th>
                <th className="px-5 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2DC] text-[#172033]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F7F6F2]/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-[#64748B] whitespace-nowrap">
                    {formatDateTime(log.created_at)}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-[#1F3A5F]">
                    {log.action}
                  </td>
                  <td className="px-5 py-3.5 font-medium">
                    {log.actor_name}
                  </td>
                  <td className="px-5 py-3.5 text-[#64748B]">
                    {log.target_type} {log.target_id && `(${log.target_id})`}
                  </td>
                  <td className="px-5 py-3.5">
                    {log.client_name ? (
                      <span className="px-2 py-0.5 rounded bg-white border border-[#E5E2DC] text-[11px] font-semibold text-[#172033]">
                        {log.client_name}
                      </span>
                    ) : (
                      <span className="text-[#64748B]">Platform Global</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-[#64748B]">
                    {log.details ? JSON.stringify(log.details) : "—"}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-xs text-[#64748B]">
                    No audit records found matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
