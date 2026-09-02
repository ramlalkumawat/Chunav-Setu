"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/lib/context/toast-context";
import { useLanguage } from "@/lib/i18n";
import { Volunteer, Booth, Area } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { OdooControlPanel } from "@/components/ui/OdooControlPanel";
import { formatDate } from "@/lib/utils";
import {
  Plus,
  Edit2,
  Power,
  KeyRound,
} from "lucide-react";

export default function VolunteersPage() {
  const { client, user } = useAuth();
  const { success, error: toastError } = useToast();
  const { t } = useLanguage();
  const clientId = client?.id || "client-1";

  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [booths, setBooths] = useState<Booth[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [search, setSearch] = useState("");

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVol, setEditingVol] = useState<Volunteer | null>(null);
  const [resetVol, setResetVol] = useState<Volunteer | null>(null);
  const [statusVol, setStatusVol] = useState<Volunteer | null>(null);

  // Form inputs
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    assigned_booth_id: "",
    assigned_area_id: "",
    status: "active" as Volunteer["status"],
    joining_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const loadData = () => {
    setVolunteers(dbService.getVolunteers(clientId));
    setBooths(dbService.getBooths(clientId));
    setAreas(dbService.getAreas(clientId));
  };

  useEffect(() => {
    loadData();
  }, [clientId]);

  const filteredVolunteers = volunteers.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.mobile.includes(search) ||
      (v.email && v.email.toLowerCase().includes(search.toLowerCase())) ||
      (v.assigned_booth_name && v.assigned_booth_name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setEditingVol(null);
    setFormData({
      name: "",
      mobile: "",
      email: "",
      assigned_booth_id: booths[0]?.id || "",
      assigned_area_id: areas[0]?.id || "",
      status: "active",
      joining_date: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: Volunteer) => {
    setEditingVol(v);
    setFormData({
      name: v.name,
      mobile: v.mobile,
      email: v.email || "",
      assigned_booth_id: v.assigned_booth_id || "",
      assigned_area_id: v.assigned_area_id || "",
      status: v.status,
      joining_date: v.joining_date,
      notes: v.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleSaveVolunteer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.mobile.trim()) {
      toastError("Validation Error", "Volunteer Name and Mobile are mandatory.");
      return;
    }

    const selectedBooth = booths.find((b) => b.id === formData.assigned_booth_id);
    const selectedArea = areas.find((a) => a.id === formData.assigned_area_id);

    if (editingVol) {
      dbService.updateVolunteer(clientId, editingVol.id, {
        ...formData,
        assigned_booth_name: selectedBooth ? `${selectedBooth.booth_number} (${selectedBooth.booth_name})` : undefined,
        assigned_area_name: selectedArea?.name,
      });
      dbService.logAction(
        { id: user?.id, name: user?.full_name || "Admin" },
        "VOLUNTEER_UPDATED",
        "Volunteer",
        editingVol.id,
        { name: formData.name },
        clientId
      );
      success("Volunteer Updated", `Saved updates for ${formData.name}`);
    } else {
      const created = dbService.createVolunteer({
        client_id: clientId,
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email.trim() || undefined,
        assigned_booth_id: formData.assigned_booth_id || undefined,
        assigned_booth_name: selectedBooth ? `${selectedBooth.booth_number} (${selectedBooth.booth_name})` : undefined,
        assigned_area_id: formData.assigned_area_id || undefined,
        assigned_area_name: selectedArea?.name,
        status: formData.status,
        joining_date: formData.joining_date,
        notes: formData.notes.trim() || undefined,
      });
      dbService.logAction(
        { id: user?.id, name: user?.full_name || "Admin" },
        "VOLUNTEER_CREATED",
        "Volunteer",
        created.id,
        { name: created.name },
        clientId
      );
      success("Volunteer Enrolled", `Created worker account for ${created.name}`);
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleToggleStatus = () => {
    if (!statusVol) return;
    const newStatus = statusVol.status === "active" ? "inactive" : "active";
    dbService.updateVolunteer(clientId, statusVol.id, { status: newStatus });
    dbService.logAction(
      { id: user?.id, name: user?.full_name || "Admin" },
      newStatus === "active" ? "VOLUNTEER_ACTIVATED" : "VOLUNTEER_DEACTIVATED",
      "Volunteer",
      statusVol.id,
      { name: statusVol.name, status: newStatus },
      clientId
    );
    success("Status Updated", `Volunteer set to ${newStatus}`);
    setStatusVol(null);
    loadData();
  };

  const handleResetPassword = () => {
    if (!resetVol) return;
    success("Credentials Sent", `Temporary password sent via SMS to ${resetVol.mobile}.`);
    setResetVol(null);
  };

  return (
    <div className="space-y-4">
      {/* Odoo Control Panel */}
      <OdooControlPanel
        breadcrumb={t("navCampaigns")}
        title={t("volunteersTitle")}
        subtitle={t("volunteersSubtitle")}
        primaryAction={{
          label: t("addVolunteer"),
          onClick: handleOpenAdd,
          icon: <Plus className="w-4 h-4" />,
        }}
        searchPlaceholder="Search volunteer name, phone, booth..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      {/* Readable Odoo Table */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="odoo-table">
            <thead>
              <tr>
                <th>{t("volunteerName")}</th>
                <th>{t("mobileNumber")}</th>
                <th>{t("wardLocality")}</th>
                <th>{t("assignedBooth")}</th>
                <th className="text-center">{t("pendingTasks")}</th>
                <th className="text-center">{t("surveysDone")}</th>
                <th>{t("status")}</th>
                <th className="text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredVolunteers.map((vol) => (
                <tr key={vol.id}>
                  <td>
                    <p className="font-bold text-[#212529]">{vol.name}</p>
                    <p className="text-[12px] text-[#6C757D]">Joined: {formatDate(vol.joining_date)}</p>
                  </td>
                  <td className="text-[14px]">
                    <p className="font-mono text-[#212529] font-semibold">{vol.mobile}</p>
                    {vol.email && <p className="text-[12px] text-[#6C757D]">{vol.email}</p>}
                  </td>
                  <td className="text-[14px] text-[#495057]">{vol.assigned_area_name || "—"}</td>
                  <td className="text-[14px] font-semibold text-[#714B67]">
                    {vol.assigned_booth_name || "Unassigned"}
                  </td>
                  <td className="text-center text-[14px]">
                    <span className="font-bold text-[#212529]">{vol.pending_tasks || 0}</span>
                  </td>
                  <td className="text-center text-[14px] font-bold text-[#2E7D32]">
                    {vol.total_contacts || 0}
                  </td>
                  <td>
                    <Badge status={vol.status} size="md" />
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setResetVol(vol)}
                        className="p-1.5 rounded hover:bg-[#F8F9FA] text-[#6C757D] hover:text-[#212529]"
                        title="Reset Mobile App Credentials"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(vol)}
                        className="p-1.5 rounded hover:bg-[#F8F9FA] text-[#6C757D] hover:text-[#212529]"
                        title="Edit Volunteer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setStatusVol(vol)}
                        className={`p-1.5 rounded hover:bg-[#F8F9FA] ${
                          vol.status === "active" ? "text-[#2E7D32]" : "text-[#C62828]"
                        }`}
                        title={vol.status === "active" ? "Deactivate Volunteer" : "Activate"}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredVolunteers.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-sm text-[#6C757D]">
                    No volunteers found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Volunteer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVol ? `${t("edit")} ${editingVol.name}` : t("addVolunteer")}
        subtitle="Campaign Cadre Configuration Sheet"
        maxWidth="md"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setIsModalOpen(false)}>
              {t("discard")}
            </Button>
            <Button size="md" variant="primary" onClick={handleSaveVolunteer}>
              {editingVol ? t("saveChanges") : t("save")}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveVolunteer} className="space-y-4">
          <Input
            label={t("volunteerName")}
            placeholder="e.g. Ramesh Kumar"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={t("mobileNumber")}
              placeholder="+91 99000 00000"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              required
            />
            <Input
              label="Email (Optional)"
              type="email"
              placeholder="volunteer@domain.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="App Login ID / Username"
              placeholder="e.g. amit_vol_101"
              value={(formData as any).username || ""}
              onChange={(e) => setFormData({ ...formData, username: e.target.value } as any)}
            />
            <Input
              label="Initial Password / PIN"
              placeholder="e.g. Setu@2026"
              value={(formData as any).password || ""}
              onChange={(e) => setFormData({ ...formData, password: e.target.value } as any)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label={t("wardLocality")}
              value={formData.assigned_area_id}
              onChange={(e) => setFormData({ ...formData, assigned_area_id: e.target.value })}
              options={areas.map((a) => ({ value: a.id, label: a.name }))}
            />
            <Select
              label={t("assignedBooth")}
              value={formData.assigned_booth_id}
              onChange={(e) => setFormData({ ...formData, assigned_booth_id: e.target.value })}
              options={booths.map((b) => ({ value: b.id, label: `${b.booth_number} - ${b.booth_name}` }))}
            />
          </div>

          <Select
            label={t("status")}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as Volunteer["status"] })}
            options={[
              { value: "active", label: t("active") },
              { value: "inactive", label: t("inactive") },
            ]}
          />

          <Textarea
            label="Notes / Special Responsibilities"
            placeholder="e.g. Youth wing leader, SHG coordinator, senior citizen transport..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </form>
      </Modal>

      {/* Reset Password Confirmation */}
      {resetVol && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setResetVol(null)}
          onConfirm={handleResetPassword}
          title="Reset Volunteer Credentials"
          message={`Generate and send a temporary login PIN for ${resetVol.name} (${resetVol.mobile})?`}
          confirmText="Send Password Reset"
          variant="primary"
        />
      )}

      {/* Status Toggle Confirmation */}
      {statusVol && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setStatusVol(null)}
          onConfirm={handleToggleStatus}
          title={statusVol.status === "active" ? "Deactivate Volunteer" : "Activate Volunteer"}
          message={`Are you sure you want to ${
            statusVol.status === "active" ? "deactivate" : "activate"
          } ${statusVol.name}?`}
          confirmText={statusVol.status === "active" ? "Deactivate" : "Activate"}
          variant={statusVol.status === "active" ? "danger" : "primary"}
        />
      )}
    </div>
  );
}
