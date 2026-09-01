"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/lib/context/toast-context";
import { Volunteer, Booth, Area } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDate } from "@/lib/utils";
import {
  UserCheck,
  Plus,
  Search,
  Building2,
  Edit2,
  Power,
  Phone,
  Mail,
  KeyRound,
  CheckSquare,
  Compass,
} from "lucide-react";

export default function VolunteersPage() {
  const { client, user } = useAuth();
  const { success, error: toastError } = useToast();
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
    success("Credentials Dispatched", `Temporary password sent via SMS to ${resetVol.mobile}.`);
    setResetVol(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
            Volunteer Force & Cadre
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Manage field canvassers, booth assignments, mobile app credentials, and tasks
          </p>
        </div>

        <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
          Add Field Volunteer
        </Button>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <Input
          placeholder="Search volunteer name, phone, booth..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Volunteer Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFAF8] text-[#64748B] font-semibold border-b border-[#E5E2DC] uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Volunteer</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Assigned Area</th>
                <th className="px-5 py-3">Assigned Booth</th>
                <th className="px-5 py-3 text-center">Tasks</th>
                <th className="px-5 py-3 text-center">Surveys Logged</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2DC] text-[#172033]">
              {filteredVolunteers.map((vol) => (
                <tr key={vol.id} className="hover:bg-[#F7F6F2]/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-bold text-[#172033]">{vol.name}</p>
                    <p className="text-[11px] text-[#64748B]">Joined: {formatDate(vol.joining_date)}</p>
                  </td>
                  <td className="px-5 py-4 text-[#64748B]">
                    <p className="font-mono text-[#172033] font-medium">{vol.mobile}</p>
                    {vol.email && <p className="text-[11px] text-[#64748B]">{vol.email}</p>}
                  </td>
                  <td className="px-5 py-4 font-medium">{vol.assigned_area_name || "Unassigned"}</td>
                  <td className="px-5 py-4 font-medium text-[#1F3A5F]">
                    {vol.assigned_booth_name || "Unassigned"}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="font-bold text-[#172033]">{vol.pending_tasks || 0}</span>
                    <span className="text-[#64748B] text-[11px]"> pending</span>
                  </td>
                  <td className="px-5 py-4 text-center font-bold text-[#2F6B4F]">
                    {vol.total_contacts || 0}
                  </td>
                  <td className="px-5 py-4">
                    <Badge status={vol.status} size="sm" />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setResetVol(vol)}
                        className="p-1.5 rounded hover:bg-[#F7F6F2] text-[#64748B] hover:text-[#172033]"
                        title="Reset Mobile App PIN / Password"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(vol)}
                        className="p-1.5 rounded hover:bg-[#F7F6F2] text-[#64748B] hover:text-[#172033]"
                        title="Edit Volunteer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setStatusVol(vol)}
                        className={`p-1.5 rounded hover:bg-[#F7F6F2] ${
                          vol.status === "active" ? "text-[#2F6B4F]" : "text-[#B94A48]"
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
                  <td colSpan={8} className="px-5 py-8 text-center text-xs text-[#64748B]">
                    No volunteers found. Click "Add Field Volunteer" to enroll canvassers.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Volunteer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVol ? "Edit Volunteer Profile" : "Enroll Field Volunteer"}
        subtitle="Provide contact details and assign responsibility for specific booths"
        maxWidth="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveVolunteer}>
              {editingVol ? "Save Changes" : "Create Account"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveVolunteer} className="space-y-3">
          <Input
            label="Volunteer Full Name"
            placeholder="e.g. Ramesh Kumar"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Mobile Number (Login ID)"
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
            <Select
              label="Assigned Ward / Area"
              value={formData.assigned_area_id}
              onChange={(e) => setFormData({ ...formData, assigned_area_id: e.target.value })}
              options={areas.map((a) => ({ value: a.id, label: a.name }))}
            />
            <Select
              label="Assigned Polling Booth"
              value={formData.assigned_booth_id}
              onChange={(e) => setFormData({ ...formData, assigned_booth_id: e.target.value })}
              options={booths.map((b) => ({ value: b.id, label: `${b.booth_number} - ${b.booth_name}` }))}
            />
          </div>

          <Select
            label="Account Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as Volunteer["status"] })}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive / In Training" },
            ]}
          />

          <Textarea
            label="Specialization / Notes"
            placeholder="e.g. Youth liaison, SHG coordinator, senior citizen assistance..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </form>
      </Modal>

      {/* Reset Credentials Confirmation */}
      {resetVol && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setResetVol(null)}
          onConfirm={handleResetPassword}
          title="Reset Volunteer Credentials"
          message={`Generate and send a temporary login passcode for ${resetVol.name} (${resetVol.mobile})?`}
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
