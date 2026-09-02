"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/lib/context/toast-context";
import { useLanguage } from "@/lib/i18n";
import { Client } from "@/lib/types";
import { storageService } from "@/lib/storage";
import { parseVoterCsv, CsvParseResult } from "@/lib/utils/csv-parser";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { OdooControlPanel } from "@/components/ui/OdooControlPanel";
import { formatDate, formatDateTime } from "@/lib/utils";
import {
  Plus,
  Edit2,
  Power,
  ArrowUpRight,
  Upload,
  FileSpreadsheet,
  Image as ImageIcon,
  KeyRound,
  Eye,
  CheckCircle2,
  AlertCircle,
  Users,
  Building,
  Flag,
  Calendar,
  Sparkles,
  MapPin,
  RefreshCw,
  Phone,
  Mail,
  Lock,
} from "lucide-react";

export default function AdminClientsPage() {
  const { user, switchRole } = useAuth();
  const { success, error: toastError } = useToast();
  const { t, language } = useLanguage();
  const isHindi = language === "hi";

  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [provisionPosterFile, setProvisionPosterFile] = useState<File | null>(null);

  // Candidate Profile View modal state
  const [viewingClient, setViewingClient] = useState<Client | null>(null);

  // Poster modal state
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [posterClient, setPosterClient] = useState<Client | null>(null);
  const [posterUrlInput, setPosterUrlInput] = useState("");
  const [posterAltInput, setPosterAltInput] = useState("");
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);

  // Reset Credentials modal state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetClient, setResetClient] = useState<Client | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [tempPasswordResult, setTempPasswordResult] = useState<string | null>(null);

  // Voter List Upload modal state (Section 6)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTargetClientId, setUploadTargetClientId] = useState<string>("");
  const [csvContent, setCsvContent] = useState("");
  const [uploadFileName, setUploadFileName] = useState("");
  const [rawUploadFile, setRawUploadFile] = useState<File | null>(null);
  const [uploadParseResult, setUploadParseResult] = useState<CsvParseResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    total: number;
    inserted: number;
    duplicates: number;
    invalid: number;
    skipped: number;
  } | null>(null);

  // Create / Edit Candidate Form fields (Section 3)
  const [formData, setFormData] = useState({
    name: "",
    candidate_name: "",
    mobile: "",
    email: "",
    username: "",
    password: "",
    campaign_name: "",
    election_type: "Vidhan Sabha",
    election_date: "2026-12-12",
    location: "",
    status: "active" as Client["status"],
  });

  // Toggle status dialog state
  const [statusDialogClient, setStatusDialogClient] = useState<Client | null>(null);

  const loadClients = () => {
    setClients(dbService.getClients());
  };

  useEffect(() => {
    loadClients();
  }, []);

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.candidate_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenCreate = () => {
    setEditingClient(null);
    setProvisionPosterFile(null);
    setFormData({
      name: "",
      candidate_name: "",
      mobile: "",
      email: "",
      username: "",
      password: `Setu@${Math.floor(1000 + Math.random() * 9000)}`,
      campaign_name: "",
      election_type: "Vidhan Sabha",
      election_date: "2026-12-12",
      location: "",
      status: "active",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setProvisionPosterFile(null);
    setFormData({
      name: client.name,
      candidate_name: client.candidate_name,
      mobile: client.mobile,
      email: client.email,
      username: client.username || client.email.split("@")[0],
      password: "",
      campaign_name: client.campaign_name,
      election_type: client.election_type,
      election_date: client.election_date || "2026-12-12",
      location: client.location,
      status: client.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.candidate_name || !formData.email || !formData.campaign_name) {
      toastError("Validation Error", "Please fill in Candidate Name, Email, and Campaign Name.");
      return;
    }

    if (editingClient) {
      dbService.updateClient(editingClient.id, {
        name: formData.name || `${formData.candidate_name} HQ`,
        candidate_name: formData.candidate_name,
        mobile: formData.mobile,
        email: formData.email,
        username: formData.username,
        campaign_name: formData.campaign_name,
        election_type: formData.election_type,
        election_date: formData.election_date,
        location: formData.location,
        status: formData.status,
      });

      // Upload poster if selected during edit
      if (provisionPosterFile) {
        try {
          const uploadRes = await storageService.uploadCampaignFile(provisionPosterFile, {
            clientId: editingClient.id,
            category: "posters",
            customName: provisionPosterFile.name,
            uploadedBy: user?.id,
            altText: `${formData.candidate_name} Official Campaign Poster`,
          });
          if (uploadRes.success && uploadRes.fileAsset) {
            dbService.setCandidatePosterAsset(editingClient.id, {
              fileName: uploadRes.fileAsset.file_name,
              fileSize: uploadRes.fileAsset.file_size,
              mimeType: uploadRes.fileAsset.mime_type,
              storagePath: uploadRes.fileAsset.storage_path,
              uploadedBy: user?.id,
              altText: `${formData.candidate_name} Official Campaign Poster`,
            });
          }
        } catch (uploadErr) {
          console.warn("Poster upload during candidate update notice:", uploadErr);
        }
      }

      dbService.logAction(
        { id: user?.id, name: user?.full_name || "Super Admin" },
        "CLIENT_UPDATED",
        "Client",
        editingClient.id,
        { candidate: formData.candidate_name },
        editingClient.id
      );
      success("Candidate Updated", `Updated details for ${formData.candidate_name}`);
    } else {
      const created = dbService.createClient({
        name: formData.name || `${formData.candidate_name} Campaign Office`,
        candidate_name: formData.candidate_name,
        mobile: formData.mobile || "+91 98000 00000",
        email: formData.email,
        username: formData.username || formData.email.split("@")[0],
        password: formData.password || "Chunav@2026",
        campaign_name: formData.campaign_name,
        election_type: formData.election_type,
        election_date: formData.election_date,
        location: formData.location || "Constituency",
        status: formData.status || "active",
      });

      // Upload poster if selected during creation
      if (provisionPosterFile) {
        try {
          const uploadRes = await storageService.uploadCampaignFile(provisionPosterFile, {
            clientId: created.id,
            category: "posters",
            customName: provisionPosterFile.name,
            uploadedBy: user?.id,
            altText: `${formData.candidate_name} Official Campaign Poster`,
          });
          if (uploadRes.success && uploadRes.fileAsset) {
            dbService.setCandidatePosterAsset(created.id, {
              fileName: uploadRes.fileAsset.file_name,
              fileSize: uploadRes.fileAsset.file_size,
              mimeType: uploadRes.fileAsset.mime_type,
              storagePath: uploadRes.fileAsset.storage_path,
              uploadedBy: user?.id,
              altText: `${formData.candidate_name} Official Campaign Poster`,
            });
          }
        } catch (uploadErr) {
          console.warn("Poster upload during candidate creation notice:", uploadErr);
        }
      }

      dbService.logAction(
        { id: user?.id, name: user?.full_name || "Super Admin" },
        "CLIENT_CREATED",
        "Client",
        created.id,
        { candidate: formData.candidate_name, election: formData.election_type },
        created.id
      );
      success("Candidate Provisioned", `Successfully created workspace for ${formData.candidate_name}`);
    }

    setIsModalOpen(false);
    loadClients();
  };

  const handleToggleStatus = () => {
    if (!statusDialogClient) return;
    const newStatus = statusDialogClient.status === "active" ? "inactive" : "active";
    dbService.updateClient(statusDialogClient.id, { status: newStatus });
    dbService.logAction(
      { id: user?.id, name: user?.full_name || "Super Admin" },
      newStatus === "active" ? "CLIENT_ACTIVATED" : "CLIENT_DEACTIVATED",
      "Client",
      statusDialogClient.id,
      { previousStatus: statusDialogClient.status, newStatus },
      statusDialogClient.id
    );

    success("Status Updated", `Candidate marked as ${newStatus}`);
    setStatusDialogClient(null);
    loadClients();
  };

  // Branding Poster Handlers (Section 4 & 5)
  const handleOpenPosterModal = (client: Client) => {
    setPosterClient(client);
    setPosterUrlInput(client.poster_url || "");
    setPosterAltInput(client.poster_alt || `${client.candidate_name} Official Campaign Poster`);
    setPosterFile(null);
    setIsPosterModalOpen(true);
  };

  const handlePosterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    // Create temporary local blob preview
    const previewUrl = URL.createObjectURL(file);
    setPosterUrlInput(previewUrl);
  };

  const handleSavePoster = async () => {
    if (!posterClient) return;

    // 1. If physical file is uploaded, store in Supabase Storage
    if (posterFile) {
      setIsUploadingPoster(true);
      try {
        const uploadResult = await storageService.uploadCampaignFile(posterFile, {
          clientId: posterClient.id,
          category: "posters",
          customName: posterFile.name,
          uploadedBy: user?.id,
          altText: posterAltInput.trim(),
        });

        if (!uploadResult.success || !uploadResult.fileAsset) {
          toastError("Upload Failed", uploadResult.error || "Could not save poster to Supabase Storage.");
          setIsUploadingPoster(false);
          return;
        }

        dbService.setCandidatePosterAsset(posterClient.id, {
          fileName: uploadResult.fileAsset.file_name,
          fileSize: uploadResult.fileAsset.file_size,
          mimeType: uploadResult.fileAsset.mime_type,
          storagePath: uploadResult.fileAsset.storage_path,
          uploadedBy: user?.id,
          altText: posterAltInput.trim(),
        });

        success(
          "Poster Stored",
          `Branding poster stored in Supabase Storage (campaign-files/${posterClient.id}/posters/).`
        );
      } catch (err: any) {
        console.error("Poster upload error:", err);
        toastError("Upload Error", err.message || "Failed to upload poster file.");
        setIsUploadingPoster(false);
        return;
      } finally {
        setIsUploadingPoster(false);
      }
    } else if (posterUrlInput.trim()) {
      // Manual URL fallback
      dbService.updateCandidatePoster(posterClient.id, posterUrlInput.trim(), posterAltInput.trim());
      success("Poster Updated", `Personal branding updated for ${posterClient.candidate_name}`);
    }

    setIsPosterModalOpen(false);
    loadClients();
    if (viewingClient && viewingClient.id === posterClient.id) {
      setViewingClient(dbService.getClientById(posterClient.id) || null);
    }
  };

  // Reset Credentials Handlers
  const handleOpenResetModal = (client: Client) => {
    setResetClient(client);
    setNewPasswordInput(`Setu@${Math.floor(1000 + Math.random() * 9000)}`);
    setTempPasswordResult(null);
    setIsResetModalOpen(true);
  };

  const handleSaveReset = () => {
    if (!resetClient) return;
    const res = dbService.resetCandidateCredentials(resetClient.id, newPasswordInput);
    setTempPasswordResult(res.tempPassword);
    success("Credentials Reset", `New login password set for ${resetClient.candidate_name}`);
  };

  // Voter List Upload Handlers (Section 6 & 8)
  const handleOpenUploadModal = (client?: Client) => {
    setUploadTargetClientId(client ? client.id : clients[0]?.id || "client-1");
    setCsvContent("");
    setUploadFileName("");
    setRawUploadFile(null);
    setUploadParseResult(null);
    setImportSummary(null);
    setIsUploadModalOpen(true);
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRawUploadFile(file);
    setUploadFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setCsvContent(text);
      processUploadCsv(text);
    };
    reader.readAsText(file);
  };

  const processUploadCsv = (text: string) => {
    const existingVoters = dbService.getVoters(uploadTargetClientId || "client-1", { pageSize: 10000 }).data;
    const existingCards = new Set(existingVoters.map((v) => v.voter_id_card.trim().toUpperCase()));
    const result = parseVoterCsv(text, existingCards);
    setUploadParseResult(result);
  };

  const handleSampleUploadLoad = () => {
    const sampleCsv = `Voter ID,Full Name,Mobile,Age,Gender,Address,Status
UP/48/281/009101,Ramesh Chandra Tiwari,+91 94150 99881,51,Male,H.No 102/B Park Street,uncontacted
UP/48/281/009102,Shalini Tiwari,+91 94150 99882,47,Female,H.No 102/B Park Street,uncontacted
UP/48/281/009103,Manish Kumar Verma,+91 98390 11990,29,Male,Flat 301 Krishna Heights,uncontacted
UP/48/281/009104,Geeta Devi Verma,,63,Female,Flat 301 Krishna Heights,uncontacted
UP/48/281/009105,Mohammad Irfan,+91 97920 44332,34,Male,Shop 12 Market Complex,uncontacted
UP/48/281/009106,Nasreen Bano,,30,Female,H.No 45 New Basti,uncontacted
UP/48/281/001421,Duplicate Existing Voter,+91 99999 99999,40,Male,Test,uncontacted`;

    setUploadFileName("Electoral_Roll_Sample_Batch.csv");
    setRawUploadFile(new File([sampleCsv], "Electoral_Roll_Sample_Batch.csv", { type: "text/csv" }));
    setCsvContent(sampleCsv);
    processUploadCsv(sampleCsv);
  };

  const handleConfirmBatchImport = async () => {
    if (!uploadParseResult || !uploadTargetClientId) {
      toastError("No Data", "Please select a candidate and upload a valid voter CSV.");
      return;
    }

    setIsImporting(true);
    try {
      // 1. Archive raw source file to voter-files/{client_id}/{filename} in Supabase Storage
      let fileAssetRecord;
      if (rawUploadFile || csvContent) {
        const fileToUpload = rawUploadFile || new Blob([csvContent], { type: "text/csv" });
        const storageRes = await storageService.uploadVoterFile(fileToUpload, {
          clientId: uploadTargetClientId,
          campaignId: "camp-1",
          uploadedBy: user?.id,
          customName: uploadFileName || "voter_batch.csv",
          metadata: {
            total_rows: uploadParseResult.totalRows,
            valid_rows: uploadParseResult.validRows.length,
          },
        });
        if (storageRes.success) {
          fileAssetRecord = storageRes.fileAsset;
        }
      }

      // 2. Index voters into tenant workspace
      const votersToImport = uploadParseResult.validRows.map((r) => ({
        voter_id_card: r.voter_id_card,
        name: r.name,
        mobile: r.mobile,
        age: r.age,
        gender: r.gender,
        address: r.address,
        contact_status: (r.contact_status || "uncontacted") as any,
        notes: r.notes,
      }));

      const summary = dbService.batchImportVoters(
        uploadTargetClientId,
        votersToImport,
        { campaignId: "camp-1" }
      );

      const invalidCount = uploadParseResult.invalidRows.length;
      const duplicateCount = uploadParseResult.duplicates;

      setImportSummary({
        total: uploadParseResult.totalRows,
        inserted: summary.inserted,
        duplicates: duplicateCount + summary.duplicates,
        invalid: invalidCount + summary.invalid,
        skipped: duplicateCount + invalidCount + summary.skipped,
      });

      success(
        "Voters Imported & Archived",
        `Successfully indexed ${summary.inserted} electors into tenant workspace and archived file (voter-files/${uploadTargetClientId}/).`
      );
      loadClients();
    } catch (err) {
      console.error("Batch import error:", err);
      toastError("Import Failed", "An error occurred during batch ingestion.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Odoo Control Panel */}
      <OdooControlPanel
        breadcrumb="System"
        title="Candidate / Client Master Management"
        subtitle="Provision isolated candidate workspaces, upload voter rolls, and manage branding posters"
        primaryAction={{
          label: "Create Candidate",
          onClick: handleOpenCreate,
          icon: <Plus className="w-4 h-4" />,
        }}
        secondaryActions={[
          {
            label: "Upload Voter List",
            onClick: () => handleOpenUploadModal(),
            icon: <FileSpreadsheet className="w-4 h-4" />,
          },
        ]}
        searchPlaceholder="Search candidate, organization, email, location..."
        searchValue={search}
        onSearchChange={setSearch}
        filterComponent={
          <div className="w-full sm:w-56">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 bg-white border border-[#DEE2E6] rounded-[4px] text-sm px-3 text-[#212529] focus:outline-none focus:border-[#714B67]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        }
      />

      {/* Candidate List Table */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="odoo-table">
            <thead>
              <tr>
                <th>Candidate Name & Org</th>
                <th>Campaign & Location</th>
                <th>Branding Poster</th>
                <th className="text-center">{t("activeVolunteers")}</th>
                <th className="text-center">{t("electorsCount")}</th>
                <th>Election Date</th>
                <th>{t("status")}</th>
                <th className="text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <button
                      onClick={() => setViewingClient(client)}
                      className="font-bold text-[#212529] hover:text-[#714B67] hover:underline text-left block"
                    >
                      {client.candidate_name}
                    </button>
                    <p className="text-xs text-[#6C757D]">
                      {client.name} • {client.email}
                    </p>
                  </td>
                  <td className="text-[14px]">
                    <p className="font-semibold text-[#714B67]">{client.campaign_name}</p>
                    <p className="text-xs text-[#6C757D]">
                      {client.election_type} • {client.location}
                    </p>
                  </td>
                  <td>
                    {client.poster_url ? (
                      <button
                        onClick={() => handleOpenPosterModal(client)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded bg-[#F1ECEF] text-[#714B67] border border-[#D9CAD5] hover:bg-[#E9DFE7]"
                        title="Edit Branding Poster"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-[#714B67]" />
                        <span>Poster Set</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenPosterModal(client)}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-white text-[#6C757D] border border-[#DEE2E6] hover:bg-[#F8F9FA]"
                        title="Upload Branding Poster"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload Poster</span>
                      </button>
                    )}
                  </td>
                  <td className="text-center text-[14px] font-bold">{client.volunteer_count || 0}</td>
                  <td className="text-center text-[14px] font-bold">{client.voter_count || 0}</td>
                  <td className="text-xs text-[#495057] font-mono">{client.election_date || "2026-12-12"}</td>
                  <td>
                    <Badge status={client.status} size="md" />
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setViewingClient(client)}
                        className="p-1.5 rounded hover:bg-[#F8F9FA] text-[#6C757D] hover:text-[#212529]"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenUploadModal(client)}
                        className="p-1.5 rounded hover:bg-[#E8F5E9] text-[#2E7D32]"
                        title="Upload Voter List CSV"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenResetModal(client)}
                        className="p-1.5 rounded hover:bg-[#FFF3E0] text-[#E65100]"
                        title="Reset Credentials / Password"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(client)}
                        className="p-1.5 rounded hover:bg-[#F8F9FA] text-[#6C757D] hover:text-[#212529]"
                        title="Edit Candidate"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setStatusDialogClient(client)}
                        className={`p-1.5 rounded hover:bg-[#F8F9FA] ${
                          client.status === "active" ? "text-[#2E7D32]" : "text-[#C62828]"
                        }`}
                        title={client.status === "active" ? "Deactivate" : "Activate"}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => switchRole("client_admin", client.id)}
                        className="p-1.5 rounded bg-[#F1ECEF] text-[#714B67] hover:bg-[#714B67] hover:text-white transition-colors"
                        title="Enter Candidate Workspace"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-sm text-[#6C757D]">
                    No candidate workspaces found matching search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. CREATE / EDIT CANDIDATE MODAL (Section 3) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? `Edit Candidate: ${editingClient.candidate_name}` : "Create New Candidate Account"}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveClient} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#212529] mb-1.5">
                Candidate Full Name *
              </label>
              <Input
                value={formData.candidate_name}
                onChange={(e) => setFormData({ ...formData, candidate_name: e.target.value })}
                placeholder="e.g. Rajesh Sharma"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#212529] mb-1.5">
                Campaign / Office Name *
              </label>
              <Input
                value={formData.campaign_name}
                onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                placeholder="e.g. Central Assembly Campaign 2026"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#212529] mb-1.5">
                Official Email / Login ID *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="rajesh.sharma@chunavsetu.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#212529] mb-1.5">
                Mobile Number *
              </label>
              <Input
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="+91 98201 12345"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#212529] mb-1.5">
                Election Type
              </label>
              <Select
                value={formData.election_type}
                onChange={(e) => setFormData({ ...formData, election_type: e.target.value })}
                options={[
                  { value: "Vidhan Sabha", label: "Vidhan Sabha (Assembly)" },
                  { value: "Lok Sabha", label: "Lok Sabha (Parliamentary)" },
                  { value: "Municipal Corporation", label: "Municipal Corporation (Nagar Nigam / Ward)" },
                  { value: "Panchayat", label: "Panchayat Election" },
                  { value: "Zilla Parishad", label: "Zilla Parishad" },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#212529] mb-1.5">
                Scheduled Election / Polling Date
              </label>
              <Input
                type="date"
                value={formData.election_date}
                onChange={(e) => setFormData({ ...formData, election_date: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#212529] mb-1.5">
                Location / Constituency Details
              </label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Lucknow Central (AC-174), Uttar Pradesh"
              />
            </div>

            {/* Campaign Branding Poster (Supabase Storage: campaign-files/{client_id}/posters/) */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#212529] mb-1.5">
                Campaign Branding Poster (Supabase Storage)
              </label>
              <div className="flex items-center gap-3 p-3 bg-[#FAF7F9] border border-[#DEE2E6] rounded-[4px]">
                <ImageIcon className="w-5 h-5 text-[#714B67] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#212529] truncate">
                    {provisionPosterFile
                      ? provisionPosterFile.name
                      : editingClient?.poster_url
                      ? "Poster configured in private storage"
                      : "No poster uploaded"}
                  </p>
                  <p className="text-[11px] text-[#6C757D]">
                    Stored in <code className="text-[#714B67]">campaign-files/&#123;client_id&#125;/posters/</code> (JPG, PNG, WebP &lt; 50MB)
                  </p>
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const validation = storageService.validateFile(file, [
                          "image/jpeg",
                          "image/png",
                          "image/webp",
                          "application/pdf",
                        ]);
                        if (!validation.valid) {
                          toastError("Invalid File", validation.error || "Please select a valid image or PDF.");
                          return;
                        }
                        setProvisionPosterFile(file);
                      }
                    }}
                    className="hidden"
                  />
                  <span className="px-3 py-1.5 bg-white border border-[#DEE2E6] hover:border-[#714B67] text-xs font-bold text-[#714B67] rounded inline-flex items-center gap-1.5 shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    {provisionPosterFile || editingClient?.poster_url ? "Replace File" : "Upload Poster"}
                  </span>
                </label>
              </div>
            </div>

            {!editingClient && (
              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1.5">
                  Initial Password
                </label>
                <Input
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Temporary Password"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#212529] mb-1.5">
                Account Status
              </label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Client["status"] })}
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive / Suspended" },
                ]}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#DEE2E6]">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              {t("cancel")}
            </Button>
            <Button variant="primary" type="submit">
              {editingClient ? "Save Changes" : "Provision Candidate"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. CANDIDATE PERSONAL BRANDING POSTER MODAL (Section 4 & 5) */}
      <Modal
        isOpen={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
        title={`Candidate Branding Poster: ${posterClient?.candidate_name || ""}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#6C757D]">
            This branding asset is tenant-isolated and will appear prominently at the top of the Candidate Dashboard, Volunteer Dashboard, and Polling Day module for this specific candidate.
          </p>

          {/* Direct File Upload to Supabase Storage */}
          <div className="p-4 bg-[#FAF7F9] border-2 border-dashed border-[#DEE2E6] hover:border-[#714B67] rounded-[4px] text-center space-y-2.5 transition-colors">
            <ImageIcon className="w-7 h-7 text-[#714B67] mx-auto" />
            <div>
              <p className="text-xs font-bold text-[#212529]">
                {posterFile ? `Selected: ${posterFile.name}` : "Upload Poster to Supabase Storage"}
              </p>
              <p className="text-[11px] text-[#6C757D] mt-0.5">
                Path: <code className="text-[#714B67]">campaign-files/{posterClient?.id || "{client_id}"}/posters/</code> • JPG, PNG, WebP (Max 50MB)
              </p>
            </div>
            <label className="inline-block cursor-pointer">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePosterFileChange}
                className="hidden"
              />
              <span className="px-3.5 py-1.5 bg-white border border-[#DEE2E6] hover:border-[#714B67] text-xs font-bold text-[#714B67] rounded inline-flex items-center gap-1.5 shadow-2xs">
                <Upload className="w-3.5 h-3.5" />
                Browse Computer
              </span>
            </label>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#DEE2E6]"></div>
            <span className="flex-shrink mx-3 text-[11px] font-bold text-[#6C757D] uppercase">Or Use Direct URL / Preset</span>
            <div className="flex-grow border-t border-[#DEE2E6]"></div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#212529] mb-1.5">
              Poster Image URL
            </label>
            <Input
              value={posterUrlInput}
              onChange={(e) => {
                setPosterFile(null);
                setPosterUrlInput(e.target.value);
              }}
              placeholder="https://example.com/candidate-poster.jpg or campaign-files/..."
            />
          </div>

          {/* Quick Preset Posters */}
          <div>
            <label className="block text-xs font-bold text-[#6C757D] mb-1">
              Standard Templates:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPosterFile(null);
                  setPosterUrlInput(
                    "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80"
                  );
                }}
                className="p-2 border border-[#DEE2E6] hover:border-[#714B67] rounded text-xs text-center font-medium bg-[#F8F9FA]"
              >
                Rally Banner
              </button>
              <button
                type="button"
                onClick={() => {
                  setPosterFile(null);
                  setPosterUrlInput(
                    "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=1200&q=80"
                  );
                }}
                className="p-2 border border-[#DEE2E6] hover:border-[#714B67] rounded text-xs text-center font-medium bg-[#F8F9FA]"
              >
                Civic Vikas
              </button>
              <button
                type="button"
                onClick={() => {
                  setPosterFile(null);
                  setPosterUrlInput(
                    "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80"
                  );
                }}
                className="p-2 border border-[#DEE2E6] hover:border-[#714B67] rounded text-xs text-center font-medium bg-[#F8F9FA]"
              >
                Parliamentary
              </button>
            </div>
          </div>

          {/* Live Preview */}
          {posterUrlInput && (
            <div className="border border-[#DEE2E6] rounded-[4px] p-2 bg-[#F8F9FA]">
              <p className="text-xs font-bold text-[#6C757D] mb-1.5 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-[#714B67]" />
                Live Banner Preview:
              </p>
              <div className="w-full h-36 bg-black/10 rounded overflow-hidden relative">
                <img
                  src={posterUrlInput}
                  alt="Poster Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "";
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-[#DEE2E6]">
            <Button variant="secondary" onClick={() => setIsPosterModalOpen(false)}>
              {t("cancel")}
            </Button>
            <Button variant="primary" onClick={handleSavePoster} disabled={isUploadingPoster}>
              {isUploadingPoster ? "Uploading to Storage..." : "Save Branding Poster"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* 3. VOTER LIST UPLOAD MODAL (Section 6) */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Super Admin: Ingest Voter Roll for Candidate"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="p-3 bg-[#F1ECEF] border border-[#D9CAD5] rounded-[4px] text-xs text-[#714B67]">
            <strong>Tenant Isolation Assurance:</strong> The voter records uploaded here will be strictly attached to the selected candidate workspace and will never cross tenant boundaries.
          </div>

          {/* Select Target Candidate */}
          <div>
            <label className="block text-xs font-bold text-[#212529] mb-1.5">
              Select Target Candidate *
            </label>
            <select
              value={uploadTargetClientId}
              onChange={(e) => setUploadTargetClientId(e.target.value)}
              className="w-full h-11 px-3 bg-white border border-[#DEE2E6] rounded-[4px] text-sm text-[#212529] focus:outline-none focus:border-[#714B67]"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.candidate_name} — {c.campaign_name} ({c.location})
                </option>
              ))}
            </select>
          </div>

          {/* File Upload / Sample */}
          {!importSummary ? (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-[#DEE2E6] hover:border-[#714B67] rounded-[4px] p-6 text-center bg-[#FAF7F9] transition-colors">
                <Upload className="w-8 h-8 text-[#714B67] mx-auto mb-2" />
                <p className="text-sm font-bold text-[#212529]">
                  {uploadFileName ? uploadFileName : "Select or Drop CSV / Excel Electoral File"}
                </p>
                <p className="text-xs text-[#6C757D] mt-1">
                  Required columns: Voter ID (EPIC), Full Name. Optional: Mobile, Age, Gender, Address.
                </p>

                <div className="mt-4 flex items-center justify-center gap-3">
                  <label className="cursor-pointer">
                    <Button variant="primary" size="sm" type="button">
                      Browse Computer
                    </Button>
                    <input
                      type="file"
                      accept=".csv, text/csv, .txt"
                      className="hidden"
                      onChange={handleCsvFileUpload}
                    />
                  </label>
                  <Button variant="secondary" size="sm" type="button" onClick={handleSampleUploadLoad}>
                    Load Sample Roll
                  </Button>
                </div>
              </div>

              {/* CSV Validation & Duplicate Preview */}
              {uploadParseResult && (
                <div className="border border-[#DEE2E6] rounded-[4px] p-4 bg-white space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Validation & Duplicate Check:</span>
                    <span className="text-[#2E7D32] flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {uploadParseResult.validRows.length} Valid Electors
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-[#F8F9FA] rounded border border-[#DEE2E6]">
                      <span className="text-[#6C757D]">Total Rows</span>
                      <p className="font-bold text-sm text-[#212529]">{uploadParseResult.totalRows}</p>
                    </div>
                    <div className="p-2 bg-[#FFEBEE] rounded border border-[#FFCDD2]">
                      <span className="text-[#C62828]">Duplicates Found</span>
                      <p className="font-bold text-sm text-[#C62828]">{uploadParseResult.duplicates}</p>
                    </div>
                    <div className="p-2 bg-[#FFF3E0] rounded border border-[#FFE0B2]">
                      <span className="text-[#E65100]">Invalid / Skipped</span>
                      <p className="font-bold text-sm text-[#E65100]">{uploadParseResult.invalidRows.length}</p>
                    </div>
                  </div>

                  {/* Sample rows table */}
                  <div className="max-h-40 overflow-y-auto border border-[#DEE2E6] rounded">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#F8F9FA] text-[#6C757D] font-bold border-b border-[#DEE2E6]">
                        <tr>
                          <th className="p-2">EPIC / ID</th>
                          <th className="p-2">Name</th>
                          <th className="p-2">Mobile</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DEE2E6]">
                        {uploadParseResult.validRows.slice(0, 5).map((row, idx) => (
                          <tr key={idx} className="hover:bg-[#FAF7F9]">
                            <td className="p-2 font-mono font-semibold">{row.voter_id_card}</td>
                            <td className="p-2 font-medium text-[#212529]">{row.name}</td>
                            <td className="p-2 text-[#6C757D]">{row.mobile || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Import Summary (Section 6 Requirement) */
            <div className="border border-[#C8E6C9] bg-[#FAFCFA] rounded-[4px] p-5 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#212529]">
                Voter Roll Successfully Indexed
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 bg-white rounded border border-[#DEE2E6]">
                  <span className="text-[#6C757D]">Total Rows</span>
                  <p className="font-bold text-base text-[#212529]">{importSummary.total}</p>
                </div>
                <div className="p-2 bg-white rounded border border-[#C8E6C9]">
                  <span className="text-[#2E7D32]">Imported</span>
                  <p className="font-bold text-base text-[#2E7D32]">{importSummary.inserted}</p>
                </div>
                <div className="p-2 bg-white rounded border border-[#FFCDD2]">
                  <span className="text-[#C62828]">Duplicates</span>
                  <p className="font-bold text-base text-[#C62828]">{importSummary.duplicates}</p>
                </div>
                <div className="p-2 bg-white rounded border border-[#FFE0B2]">
                  <span className="text-[#E65100]">Skipped/Invalid</span>
                  <p className="font-bold text-base text-[#E65100]">{importSummary.skipped}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-[#DEE2E6]">
            <Button variant="secondary" onClick={() => setIsUploadModalOpen(false)}>
              {importSummary ? "Close" : t("cancel")}
            </Button>
            {!importSummary && (
              <Button
                variant="primary"
                onClick={handleConfirmBatchImport}
                disabled={!uploadParseResult || uploadParseResult.validRows.length === 0 || isImporting}
              >
                {isImporting ? "Importing Electors..." : "Confirm & Import Voter List"}
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* 4. CANDIDATE PROFILE VIEW MODAL (Section 25) */}
      <Modal
        isOpen={!!viewingClient}
        onClose={() => setViewingClient(null)}
        title={`Candidate Workspace Profile: ${viewingClient?.candidate_name || ""}`}
        maxWidth="lg"
      >
        {viewingClient && (
          <div className="space-y-4">
            {/* Branding Banner Preview */}
            <div className="relative w-full h-36 bg-[#714B67] rounded-[4px] overflow-hidden flex items-center justify-center text-white">
              {viewingClient.poster_url ? (
                <img
                  src={viewingClient.poster_url}
                  alt={viewingClient.candidate_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4">
                  <h3 className="text-xl font-bold">{viewingClient.candidate_name}</h3>
                  <p className="text-xs text-white/80">{viewingClient.campaign_name}</p>
                </div>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 bg-[#F8F9FA] rounded border border-[#DEE2E6]">
                <span className="text-[#6C757D]">Indexed Electors</span>
                <p className="font-bold text-base text-[#212529]">{viewingClient.voter_count || 0}</p>
              </div>
              <div className="p-3 bg-[#F8F9FA] rounded border border-[#DEE2E6]">
                <span className="text-[#6C757D]">Active Cadre</span>
                <p className="font-bold text-base text-[#212529]">{viewingClient.volunteer_count || 0}</p>
              </div>
              <div className="p-3 bg-[#F8F9FA] rounded border border-[#DEE2E6]">
                <span className="text-[#6C757D]">Assigned Booths</span>
                <p className="font-bold text-base text-[#212529]">{viewingClient.booth_count || 0}</p>
              </div>
              <div className="p-3 bg-[#F8F9FA] rounded border border-[#DEE2E6]">
                <span className="text-[#6C757D]">Election Date</span>
                <p className="font-bold text-sm text-[#714B67] font-mono">
                  {viewingClient.election_date || "2026-12-12"}
                </p>
              </div>
            </div>

            {/* Candidate Details Grid */}
            <div className="border border-[#DEE2E6] rounded p-4 text-xs sm:text-sm space-y-2 bg-white">
              <div className="flex justify-between border-b border-[#F1F3F5] pb-2">
                <span className="text-[#6C757D]">Organization:</span>
                <span className="font-bold text-[#212529]">{viewingClient.name}</span>
              </div>
              <div className="flex justify-between border-b border-[#F1F3F5] pb-2">
                <span className="text-[#6C757D]">Election Type & AC:</span>
                <span className="font-bold text-[#212529]">{viewingClient.election_type} • {viewingClient.location}</span>
              </div>
              <div className="flex justify-between border-b border-[#F1F3F5] pb-2">
                <span className="text-[#6C757D]">Official Email:</span>
                <span className="font-bold font-mono text-[#212529]">{viewingClient.email}</span>
              </div>
              <div className="flex justify-between border-b border-[#F1F3F5] pb-2">
                <span className="text-[#6C757D]">Mobile Contact:</span>
                <span className="font-bold font-mono text-[#212529]">{viewingClient.mobile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6C757D]">Account Status:</span>
                <Badge status={viewingClient.status} size="sm" />
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#DEE2E6]">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={<ImageIcon className="w-4 h-4 text-[#714B67]" />}
                  onClick={() => {
                    setViewingClient(null);
                    handleOpenPosterModal(viewingClient);
                  }}
                >
                  Edit Poster
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={<KeyRound className="w-4 h-4 text-[#E65100]" />}
                  onClick={() => {
                    setViewingClient(null);
                    handleOpenResetModal(viewingClient);
                  }}
                >
                  Reset Password
                </Button>
              </div>

              <Button
                variant="primary"
                size="sm"
                leftIcon={<ArrowUpRight className="w-4 h-4" />}
                onClick={() => switchRole("client_admin", viewingClient.id)}
              >
                Login to Candidate Workspace
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 5. RESET CREDENTIALS MODAL */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title={`Reset Credentials: ${resetClient?.candidate_name || ""}`}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#6C757D]">
            Generate a new secure temporary password for this candidate account.
          </p>

          <div>
            <label className="block text-xs font-bold text-[#212529] mb-1.5">
              New Password
            </label>
            <Input
              value={newPasswordInput}
              onChange={(e) => setNewPasswordInput(e.target.value)}
              placeholder="Enter new password"
            />
          </div>

          {tempPasswordResult && (
            <div className="p-3 bg-[#E8F5E9] border border-[#C8E6C9] rounded text-xs text-[#2E7D32]">
              <strong>Success:</strong> Password updated to <code className="font-mono font-bold">{tempPasswordResult}</code>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-[#DEE2E6]">
            <Button variant="secondary" onClick={() => setIsResetModalOpen(false)}>
              {tempPasswordResult ? "Close" : t("cancel")}
            </Button>
            {!tempPasswordResult && (
              <Button variant="primary" onClick={handleSaveReset}>
                Save & Update Password
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Confirm Deactivation Dialog */}
      <ConfirmDialog
        isOpen={!!statusDialogClient}
        onClose={() => setStatusDialogClient(null)}
        onConfirm={handleToggleStatus}
        title={statusDialogClient?.status === "active" ? "Deactivate Candidate Workspace?" : "Activate Candidate Workspace?"}
        message={`Are you sure you want to change the status of ${statusDialogClient?.candidate_name}?`}
        confirmText={statusDialogClient?.status === "active" ? "Deactivate" : "Activate"}
        variant={statusDialogClient?.status === "active" ? "danger" : "primary"}
      />
    </div>
  );
}
