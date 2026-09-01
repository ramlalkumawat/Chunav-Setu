"use client";

import React, { useState } from "react";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/lib/context/toast-context";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OdooControlPanel } from "@/components/ui/OdooControlPanel";
import { ShieldCheck } from "lucide-react";

export default function CampaignSettingsPage() {
  const { client, user } = useAuth();
  const { success } = useToast();
  const { t } = useLanguage();
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
    <div className="space-y-4 max-w-3xl">
      {/* Odoo Control Panel */}
      <OdooControlPanel
        breadcrumb={t("navCampaigns")}
        title={t("settingsTitle")}
        subtitle={t("settingsSubtitle")}
        primaryAction={{
          label: t("saveChanges"),
          onClick: () => {
            const form = document.getElementById("settings-form") as HTMLFormElement;
            if (form) form.requestSubmit();
          },
        }}
      />

      {/* Form Sheet */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-6 sm:p-7 shadow-none">
        <form id="settings-form" onSubmit={handleSave} className="space-y-5">
          {/* General Information Group */}
          <div className="p-4 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px] space-y-3">
            <p className="text-xs font-bold text-[#6C757D] uppercase tracking-wider">
              {t("candidateProfile")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label={t("candidateName")}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label={t("mobileNumber")}
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
          <div className="p-4 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px] space-y-3">
            <p className="text-xs font-bold text-[#6C757D] uppercase tracking-wider">
              {t("constituency")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Campaign Title"
                value={formData.campaign_name}
                onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                required
              />
              <Input
                label={t("constituency")}
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Security & Multi-Tenancy */}
          <div className="p-4 bg-[#E8F5E9] border border-[#C8E6C9] rounded-[4px] text-sm flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#2E7D32] flex-shrink-0" />
            <p className="text-[#2E7D32]">
              <strong>Multi-Tenant Isolation Active:</strong> All records are partitioned by tenant <code className="bg-white/80 px-1.5 py-0.5 rounded text-xs font-mono text-[#2E7D32]">{clientId}</code>.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="md" variant="primary">
              {t("saveChanges")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
