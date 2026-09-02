"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/lib/context/toast-context";
import { useLanguage } from "@/lib/i18n";
import { storageService } from "@/lib/storage";
import { useStorageUrl } from "@/lib/hooks/use-storage-url";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OdooControlPanel } from "@/components/ui/OdooControlPanel";
import { ShieldCheck, Image as ImageIcon, Upload, Eye } from "lucide-react";

export default function CampaignSettingsPage() {
  const { client, user } = useAuth();
  const { success, error: toastError } = useToast();
  const { t } = useLanguage();
  const clientId = client?.id || user?.client_id || "";

  const [formData, setFormData] = useState({
    candidate_name: client?.candidate_name || "",
    name: client?.name || "",
    mobile: client?.mobile || "",
    email: client?.email || "",
    campaign_name: client?.campaign_name || "",
    location: client?.location || "",
    election_type: client?.election_type || "Vidhan Sabha",
    poster_url: client?.poster_url || "",
    poster_alt: client?.poster_alt || "",
  });

  useEffect(() => {
    if (client) {
      setFormData({
        candidate_name: client.candidate_name || "",
        name: client.name || "",
        mobile: client.mobile || "",
        email: client.email || "",
        campaign_name: client.campaign_name || "",
        location: client.location || "",
        election_type: client.election_type || "Vidhan Sabha",
        poster_url: client.poster_url || "",
        poster_alt: client.poster_alt || "",
      });
    }
  }, [client]);

  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const { url: resolvedPosterUrl } = useStorageUrl(formData.poster_url);

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = storageService.validateFile(file, [
      "image/jpeg",
      "image/png",
      "image/webp",
    ]);

    if (!validation.valid) {
      toastError("Invalid Image", validation.error || "Please select a valid image file.");
      return;
    }

    setPosterFile(file);
    const localUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, poster_url: localUrl }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalPosterUrl = formData.poster_url;
    let finalAltText = formData.poster_alt || `${formData.candidate_name} Official Campaign Poster`;

    if (posterFile) {
      setIsUploadingPoster(true);
      try {
        const uploadRes = await storageService.uploadCampaignFile(posterFile, {
          clientId,
          category: "posters",
          customName: posterFile.name,
          uploadedBy: user?.id,
          altText: finalAltText,
        });

        if (uploadRes.success && uploadRes.fileAsset) {
          finalPosterUrl = uploadRes.fileAsset.storage_path;
          dbService.setCandidatePosterAsset(clientId, {
            fileName: uploadRes.fileAsset.file_name,
            fileSize: uploadRes.fileAsset.file_size,
            mimeType: uploadRes.fileAsset.mime_type,
            storagePath: uploadRes.fileAsset.storage_path,
            uploadedBy: user?.id,
            altText: finalAltText,
          });
        }
      } catch (uploadErr) {
        console.warn("Poster upload error:", uploadErr);
      } finally {
        setIsUploadingPoster(false);
      }
    }

    dbService.updateClient(clientId, {
      ...formData,
      poster_url: finalPosterUrl,
      poster_alt: finalAltText,
    });

    dbService.logAction(
      { id: user?.id, name: user?.full_name || "Admin" },
      "CAMPAIGN_SETTINGS_UPDATED",
      "Client",
      clientId,
      { ...formData, poster_url: finalPosterUrl },
      clientId
    );

    success("Settings Saved", "Campaign parameters and branding updated successfully.");
  };

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Odoo Control Panel */}
      <OdooControlPanel
        breadcrumb={t("navCampaigns")}
        title={t("settingsTitle")}
        subtitle={t("settingsSubtitle")}
        primaryAction={{
          label: isUploadingPoster ? "Uploading..." : t("saveChanges"),
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

          {/* Candidate Branding Poster (Supabase Storage) */}
          <div className="p-4 bg-[#FAF7F9] border border-[#DEE2E6] rounded-[4px] space-y-3">
            <p className="text-xs font-bold text-[#714B67] uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-[#714B67]" />
              Candidate Campaign Branding Poster
            </p>
            <p className="text-xs text-[#6C757D]">
              Stored privately in Supabase Storage at <code className="text-[#714B67]">campaign-files/{clientId}/posters/</code>. Displays on your Candidate Dashboard, Volunteer App, and generated Polling Slips.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-full sm:w-1/2 space-y-2">
                <label className="block text-xs font-bold text-[#212529]">
                  Upload Poster File
                </label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePosterChange}
                      className="hidden"
                    />
                    <span className="px-3 py-1.5 bg-white border border-[#DEE2E6] hover:border-[#714B67] text-xs font-bold text-[#714B67] rounded inline-flex items-center gap-1.5 shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      Browse Image
                    </span>
                  </label>
                  <span className="text-xs text-[#6C757D] truncate">
                    {posterFile ? posterFile.name : "JPG, PNG, WebP (Max 50MB)"}
                  </span>
                </div>
              </div>

              {(formData.poster_url || resolvedPosterUrl) && (
                <div className="w-full sm:w-1/2 border border-[#DEE2E6] rounded-[4px] p-2 bg-white">
                  <p className="text-[11px] font-bold text-[#6C757D] mb-1 flex items-center gap-1">
                    <Eye className="w-3 h-3 text-[#714B67]" />
                    Banner Preview
                  </p>
                  <div className="w-full h-24 bg-black/10 rounded overflow-hidden">
                    <img
                      src={resolvedPosterUrl || formData.poster_url}
                      alt="Candidate Poster"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Security & Multi-Tenancy */}
          <div className="p-4 bg-[#E8F5E9] border border-[#C8E6C9] rounded-[4px] text-sm flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#2E7D32] flex-shrink-0" />
            <p className="text-[#2E7D32]">
              <strong>Multi-Tenant Isolation Active:</strong> All database records and storage buckets are strictly partitioned by tenant <code className="bg-white/80 px-1.5 py-0.5 rounded text-xs font-mono text-[#2E7D32]">{clientId}</code>.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="md" variant="primary" disabled={isUploadingPoster}>
              {isUploadingPoster ? "Uploading..." : t("saveChanges")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
