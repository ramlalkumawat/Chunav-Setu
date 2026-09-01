"use client";

import React from "react";
import { dbService } from "@/lib/store/data-service";
import { useToast } from "@/lib/context/toast-context";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OdooControlPanel } from "@/components/ui/OdooControlPanel";
import { RotateCcw, Database, Server } from "lucide-react";

export default function AdminSettingsPage() {
  const { success } = useToast();

  const handleResetDemoData = () => {
    dbService.resetToSeed();
    success("Database Reset", "Default election demo data restored successfully.");
    window.location.reload();
  };

  return (
    <div className="space-y-3 max-w-3xl">
      {/* Odoo Control Panel */}
      <OdooControlPanel
        breadcrumb="System"
        title="Platform Settings"
        subtitle="Global SaaS multi-tenant configuration, database maintenance, and seed management"
      />

      {/* Database Maintenance Sheet */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-4 sm:p-5 shadow-none space-y-4">
        <div className="pb-3 border-b border-[#DEE2E6]">
          <h3 className="text-sm font-semibold text-[#212529]">Platform Storage & Tenant Engine</h3>
          <p className="text-xs text-[#6C757D]">PostgreSQL schema isolation status</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[3px]">
            <div className="flex items-center gap-1.5 font-semibold text-[#212529]">
              <Database className="w-3.5 h-3.5 text-[#714B67]" />
              <span>Row Level Security (RLS)</span>
            </div>
            <p className="text-[#6C757D] mt-1 text-[11px]">
              Enforced on all tables. Queries automatically scoped to <code className="text-[#714B67] font-semibold">client_id</code>.
            </p>
          </div>

          <div className="p-3 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[3px]">
            <div className="flex items-center gap-1.5 font-semibold text-[#2E7D32]">
              <Server className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>Multi-Tenant Partitioning</span>
            </div>
            <p className="text-[#6C757D] mt-1 text-[11px]">
              Isolated tenant partitions with zero cross-leakage.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-[#DEE2E6] flex items-center justify-between">
          <div>
            <p className="font-semibold text-xs text-[#212529]">Reset Sample Election Data</p>
            <p className="text-[11px] text-[#6C757D]">
              Restores the 3 pre-seeded demo campaigns (Sharma HQ, Verma Samiti, Deshmukh Office).
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={handleResetDemoData}
          >
            Reset Seed Data
          </Button>
        </div>
      </div>

      {/* Operator Credentials Sheet */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-4 sm:p-5 shadow-none space-y-3">
        <div className="pb-2 border-b border-[#DEE2E6]">
          <h3 className="text-sm font-semibold text-[#212529]">Administrator Credentials</h3>
          <p className="text-xs text-[#6C757D]">Current operator session</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <Input label="System Admin Email" value="superadmin@chunavsetu.com" disabled />
          <Input label="Role Permission" value="Super Administrator (System Root)" disabled />
        </div>
      </div>
    </div>
  );
}
