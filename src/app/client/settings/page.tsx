"use client";

import React, { useState } from "react";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/lib/context/toast-context";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OdooControlPanel } from "@/components/ui/OdooControlPanel";
import { ShieldCheck } from "lucide-react";

export default function CampaignSettingsPage() {
  const { client, user } = useAuth();
  const { success } = useToast();
  const clientId = client?.id || "client-1";

  const [formData, setFormData] = useState({
    candidate_name: client?.candidate_name || "Rajesh Sharma",
    name: client?.name || "Sharma Campaign HQ",
    mobile: client?.mobile || "+91 98201 12345",
    email: client?.email || "rajesh.sharma@chunavsetu.com",
    campaign_name: client?.campaign_name || "Central Assembly 2026",
    location: client?.location || "Lucknow Central (AC-174)",
    election_type: client?.election_type || "Vidhan Sabha",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.updateClient(clientId, formData);
    dbService.logAction(
      { id: user?.id, name: user?.full_name || "Admin" },
      "CAMPAIGN_SETTINGS_UPDATED",
      "Client",
      clientId,
      formData,
      clientId
    );
    success("Settings Saved", "Campaign parameters updated successfully.");
  };

  return (
    <div className="space-y-3 max-w-3xl">
      {/* Odoo Control Panel */}
      <OdooControlPanel
        breadcrumb="Campaign"
        title="Settings & Configuration"
        subtitle="Manage candidate parameters, constituency profile, and tenant security status"
        primaryAction={{
          label: "Save Changes",
          onClick: () => {
            const form = document.getElementById("settings-form") as HTMLFormElement;
            if (form) form.requestSubmit();
          },
        }}
      />

      {/* Form Sheet */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-4 sm:p-5 shadow-none">
        <form id="settings-form" onSubmit={handleSave} className="space-y-4 text-xs">
          {/* General Information Group */}
          <div className="p-3 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[3px] space-y-2.5">
            <p className="text-[11px] font-semibold text-[#6C757D] uppercase tracking-wider">
              Candidate Profile
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Input
                label="Candidate Full Name"
                value={formData.candidate_name}
                onChange={(e) => setFormData({ ...formData, candidate_name: e.target.value })}
                required
              />
              <Input
                label="Campaign Committee Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Input
                label="Official Contact Mobile"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                required
              />
              <Input
                label="Official Campaign Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Constituency Information Group */}
          <div className="p-3 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[3px] space-y-2.5">
            <p className="text-[11px] font-semibold text-[#6C757D] uppercase tracking-wider">
              Constituency & Electoral Details
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Input
                label="Campaign Title"
                value={formData.campaign_name}
                onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                required
              />
              <Input
                label="Constituency / AC / Ward"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Security & Multi-Tenancy */}
          <div className="p-3 bg-[#E8F5E9] border border-[#C8E6C9] rounded-[3px] text-xs flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#2E7D32] flex-shrink-0" />
            <p className="text-[#2E7D32]">
              <strong>Multi-Tenant Isolation Active:</strong> All records are partitioned by tenant <code className="bg-white/70 px-1 py-0.5 rounded text-[11px] font-mono text-[#2E7D32]">{clientId}</code>.
            </p>
          </div>

          <div className="flex justify-end pt-1">
            <Button type="submit" size="sm" variant="primary">
              Save Campaign Settings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
