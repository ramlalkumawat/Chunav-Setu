"use client";

import React from "react";
import { dbService } from "@/lib/store/data-service";
import { useToast } from "@/lib/context/toast-context";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OdooControlPanel } from "@/components/ui/OdooControlPanel";
import { RotateCcw, Database, Server } from "lucide-react";

export default function AdminSettingsPage() {
  const { success } = useToast();
  const { t } = useLanguage();

  const handleResetDemoData = () => {
    dbService.resetToSeed();
    success("Database Reset", "Default election demo data restored successfully.");
    window.location.reload();
  };

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Odoo Control Panel */}
      <OdooControlPanel
        breadcrumb="System"
        title="Platform Settings"
        subtitle="Global SaaS multi-tenant configuration, database maintenance, and seed management"
      />

      {/* Database Maintenance Sheet */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-6 sm:p-7 shadow-none space-y-5">
        <div className="pb-3.5 border-b border-[#DEE2E6]">
          <h3 className="text-base font-bold text-[#212529]">Platform Storage & Tenant Engine</h3>
          <p className="text-sm text-[#6C757D]">PostgreSQL schema isolation status</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="p-4 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px]">
            <div className="flex items-center gap-2 font-bold text-[#212529]">
              <Database className="w-4 h-4 text-[#714B67]" />
              <span>Row Level Security (RLS)</span>
            </div>
            <p className="text-[#6C757D] mt-1.5 text-xs leading-relaxed">
              Enforced on all tables. Queries automatically scoped to <code className="text-[#714B67] font-bold">client_id</code>.
            </p>
          </div>

          <div className="p-4 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px]">
            <div className="flex items-center gap-2 font-bold text-[#2E7D32]">
              <Server className="w-4 h-4 text-[#2E7D32]" />
              <span>Multi-Tenant Partitioning</span>
            </div>
            <p className="text-[#6C757D] mt-1.5 text-xs leading-relaxed">
              Isolated tenant partitions with zero cross-leakage.
            </p>
          </div>

          <div className="p-4 bg-[#FAF7F9] border border-[#DEE2E6] rounded-[4px]">
            <div className="flex items-center gap-2 font-bold text-[#714B67]">
              <Database className="w-4 h-4 text-[#714B67]" />
              <span>Supabase Storage Engine</span>
            </div>
            <p className="text-[#6C757D] mt-1.5 text-xs leading-relaxed">
              Private buckets <code className="text-[#714B67] font-bold">campaign-files</code> & <code className="text-[#714B67] font-bold">voter-files</code> linked with <code className="text-[#714B67] font-bold">public.file_assets</code>.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-[#DEE2E6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-bold text-sm text-[#212529]">Reset Sample Election Data</p>
            <p className="text-xs text-[#6C757D] mt-0.5">
              Restores the 3 pre-seeded demo campaigns (Sharma HQ, Verma Samiti, Deshmukh Office).
            </p>
          </div>
          <Button
            variant="secondary"
            size="md"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            onClick={handleResetDemoData}
          >
            Reset Seed Data
          </Button>
        </div>
      </div>

      {/* Operator Credentials Sheet */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-6 sm:p-7 shadow-none space-y-4">
        <div className="pb-3 border-b border-[#DEE2E6]">
          <h3 className="text-base font-bold text-[#212529]">Administrator Credentials</h3>
          <p className="text-sm text-[#6C757D]">Current operator session</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="System Admin Email" value="superadmin@chunavsetu.com" disabled />
          <Input label="Role Permission" value="Super Administrator (System Root)" disabled />
        </div>
      </div>
    </div>
  );
}
