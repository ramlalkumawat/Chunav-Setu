"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/store/data-service";
import { useLanguage } from "@/lib/i18n";
import { AuditLog } from "@/lib/types";
import { OdooControlPanel } from "@/components/ui/OdooControlPanel";
import { formatDateTime } from "@/lib/utils";

export default function AdminAuditLogsPage() {
  const { t } = useLanguage();
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
    <div className="space-y-4">
      {/* Odoo Control Panel */}
      <OdooControlPanel
        breadcrumb="System"
        title="Security & Audit Logs"
        subtitle="Chronological audit records tracking tenant lifecycle, authentication, and data operations"
        searchPlaceholder="Search action, actor, tenant..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      {/* Readable Odoo Table */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="odoo-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Operation</th>
                <th>Operator</th>
                <th>Target Entity</th>
                <th>Tenant Context</th>
                <th>Payload Metadata</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td className="font-mono text-xs text-[#6C757D] whitespace-nowrap">
                    {formatDateTime(log.created_at)}
                  </td>
                  <td className="font-bold text-sm text-[#714B67]">
                    {log.action}
                  </td>
                  <td className="text-[14px] font-semibold text-[#212529]">
                    {log.actor_name}
                  </td>
                  <td className="text-[14px] text-[#495057]">
                    {log.target_type} {log.target_id && <span className="font-mono text-xs text-[#6C757D]">({log.target_id})</span>}
                  </td>
                  <td className="text-[14px]">
                    {log.client_name ? (
                      <span className="font-bold text-[#212529]">{log.client_name}</span>
                    ) : (
                      <span className="text-[#ADB5BD]">System Cluster</span>
                    )}
                  </td>
                  <td className="font-mono text-xs text-[#6C757D] max-w-xs truncate">
                    {log.details ? JSON.stringify(log.details) : "—"}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-[#6C757D]">
                    No audit records found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
