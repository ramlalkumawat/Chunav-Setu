"use client";

import React from "react";
import { dbService } from "@/lib/store/data-service";
import { useToast } from "@/lib/context/toast-context";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { RotateCcw, Database, Shield, Server } from "lucide-react";

export default function AdminSettingsPage() {
  const { success } = useToast();

  const handleResetDemoData = () => {
    dbService.resetToSeed();
    success("Database Reset", "Default election demo data restored successfully.");
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
          System & Platform Settings
        </h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Global SaaS configuration, database management, and maintenance controls
        </p>
      </div>

      <Card padding="md">
        <CardHeader
          title="Platform Database & Storage"
          subtitle="PostgreSQL multi-tenant engine status and maintenance tools"
        />
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-[#FAFAF8] border border-[#E5E2DC] rounded-lg">
              <div className="flex items-center gap-2 font-bold text-[#172033]">
                <Database className="w-4 h-4 text-[#1F3A5F]" />
                <span>Row Level Security (RLS)</span>
              </div>
              <p className="text-[#64748B] mt-1">
                Enforced on all tables. Queries automatically scoped to <code className="text-[#1F3A5F]">client_id</code>.
              </p>
            </div>

            <div className="p-3.5 bg-[#FAFAF8] border border-[#E5E2DC] rounded-lg">
              <div className="flex items-center gap-2 font-bold text-[#172033]">
                <Server className="w-4 h-4 text-[#2F6B4F]" />
                <span>Multi-Tenant Architecture</span>
              </div>
              <p className="text-[#64748B] mt-1">
                Single PostgreSQL database with tenant isolation index clustering.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5E2DC] flex items-center justify-between">
            <div>
              <p className="font-semibold text-[#172033]">Reset Sample Election Data</p>
              <p className="text-[#64748B]">
                Restores the 3 pre-seeded demo campaigns (Sharma HQ, Verma Samiti, Deshmukh Office).
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw className="w-4 h-4" />}
              onClick={handleResetDemoData}
            >
              Reset Seed Data
            </Button>
          </div>
        </div>
      </Card>

      <Card padding="md">
        <CardHeader
          title="Super Admin Credentials"
          subtitle="Current administrative operator identity"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <Input label="System Admin Email" value="superadmin@chunavsetu.com" disabled />
          <Input label="Role Permission" value="Super Administrator (Full Tenant Bypass)" disabled />
        </div>
      </Card>
    </div>
  );
}
