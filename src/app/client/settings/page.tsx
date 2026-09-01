"use client";

import React, { useState } from "react";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/lib/context/toast-context";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Settings, ShieldCheck, Building2 } from "lucide-react";

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
    success("Settings Updated", "Campaign parameters saved.");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
          Campaign Settings & Profile
        </h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Configure constituency parameters, official candidate contact, and security preferences
        </p>
      </div>

      <Card padding="md">
        <CardHeader
          title="Candidate & Election Information"
          subtitle="Constituency details displayed on volunteer mobile apps and reports"
        />

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Campaign Title"
              value={formData.campaign_name}
              onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
              required
            />
            <Input
              label="Constituency / Ward"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="sm">
              Save Campaign Parameters
            </Button>
          </div>
        </form>
      </Card>

      <Card padding="md">
        <CardHeader
          title="Tenant Isolation Status"
          subtitle="PostgreSQL Row Level Security tenant enforcement"
        />
        <div className="p-3 bg-[#EAF3EE] border border-[#C3DEC9] rounded-lg text-xs flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-[#2F6B4F] flex-shrink-0" />
          <p className="text-[#2F6B4F]">
            <strong>Tenant Isolation Active:</strong> All voter, booth, task, and volunteer data is strictly partitioned by <code className="bg-white/60 px-1 py-0.5 rounded font-mono">{clientId}</code>.
          </p>
        </div>
      </Card>
    </div>
  );
}
