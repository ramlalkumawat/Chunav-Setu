"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/lib/context/toast-context";
import { useLanguage } from "@/lib/i18n";
import { Client } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { OdooControlPanel } from "@/components/ui/OdooControlPanel";
import { formatDate } from "@/lib/utils";
import {
  Plus,
  Edit2,
  Power,
  ArrowUpRight,
} from "lucide-react";

export default function AdminClientsPage() {
  const { user, switchRole } = useAuth();
  const { success, error: toastError } = useToast();
  const { t } = useLanguage();

  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Create/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    candidate_name: "",
    mobile: "",
    email: "",
    campaign_name: "",
    election_type: "Vidhan Sabha",
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
    setFormData({
      name: "",
      candidate_name: "",
      mobile: "",
      email: "",
      campaign_name: "",
      election_type: "Vidhan Sabha",
      location: "",
      status: "active",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      candidate_name: client.candidate_name,
      mobile: client.mobile,
      email: client.email,
      campaign_name: client.campaign_name,
      election_type: client.election_type,
      location: client.location,
      status: client.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.candidate_name || !formData.email) {
      toastError("Validation Error", "Please fill in all mandatory fields.");
      return;
    }

    if (editingClient) {
      dbService.updateClient(editingClient.id, formData);
      dbService.logAction(
        { id: user?.id, name: user?.full_name || "Super Admin" },
        "CLIENT_UPDATED",
        "Client",
        editingClient.id,
        { candidate: formData.candidate_name },
        editingClient.id
      );
      success("Client Updated", `Updated details for ${formData.candidate_name}`);
    } else {
      const created = dbService.createClient(formData);
      dbService.logAction(
        { id: user?.id, name: user?.full_name || "Super Admin" },
        "CLIENT_CREATED",
        "Client",
        created.id,
        { candidate: formData.candidate_name, election: formData.election_type },
        created.id
      );
      success("Tenant Created", `Successfully provisioned ${formData.name}`);
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

    success("Status Updated", `Client marked as ${newStatus}`);
    setStatusDialogClient(null);
    loadClients();
  };

  return (
    <div className="space-y-4">
      {/* Odoo Control Panel */}
      <OdooControlPanel
        breadcrumb="System"
        title={t("clientsTitle")}
        subtitle={t("clientsSubtitle")}
        primaryAction={{
          label: "Provision Client",
          onClick: handleOpenCreate,
          icon: <Plus className="w-4 h-4" />,
        }}
        searchPlaceholder="Search client, candidate, constituency..."
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

      {/* Readable Odoo Table */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="odoo-table">
            <thead>
              <tr>
                <th>Tenant Organization</th>
                <th>Candidate Full Name</th>
                <th>Campaign & Location</th>
                <th className="text-center">{t("activeVolunteers")}</th>
                <th className="text-center">{t("electorsCount")}</th>
                <th>{t("status")}</th>
                <th>Created</th>
                <th className="text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <p className="font-bold text-[#212529]">{client.name}</p>
                    <p className="text-xs text-[#6C757D]">{client.email} • {client.mobile}</p>
                  </td>
                  <td className="text-[14px] font-semibold text-[#212529]">{client.candidate_name}</td>
                  <td className="text-[14px]">
                    <p className="font-semibold text-[#714B67]">{client.campaign_name}</p>
                    <p className="text-xs text-[#6C757D]">
                      {client.election_type} • {client.location}
                    </p>
                  </td>
                  <td className="text-center text-[14px] font-bold">{client.volunteer_count || 0}</td>
                  <td className="text-center text-[14px] font-bold">{client.voter_count || 0}</td>
                  <td>
                    <Badge status={client.status} size="md" />
                  </td>
                  <td className="text-xs text-[#6C757D] font-mono">{formatDate(client.created_at)}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => switchRole("client_admin", client.id)}
                        className="p-1.5 rounded hover:bg-[#F1ECEF] text-[#714B67]"
                        title="Enter Tenant Portal"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(client)}
                        className="p-1.5 rounded hover:bg-[#F8F9FA] text-[#6C757D] hover:text-[#212529]"
                        title="Edit Client"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setStatusDialogClient(client)}
                        className={`p-1.5 rounded hover:bg-[#F8F9FA] ${
                          client.status === "active" ? "text-[#2E7D32]" : "text-[#C62828]"
                        }`}
                        title={client.status === "active" ? "Deactivate Client" : "Activate Client"}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-sm text-[#6C757D]">
                    No client instances found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Client Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? `Edit Client: ${editingClient.name}` : "Provision Candidate Account"}
        subtitle="Multi-Tenant Database Configuration Sheet"
        maxWidth="lg"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setIsModalOpen(false)}>
              {t("discard")}
            </Button>
            <Button size="md" variant="primary" onClick={handleSaveClient}>
              {editingClient ? t("saveChanges") : "Provision Instance"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveClient} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Organization / Committee Name"
              placeholder="Sharma Campaign HQ"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Candidate Full Name"
              placeholder="Rajesh Sharma"
              value={formData.candidate_name}
              onChange={(e) => setFormData({ ...formData, candidate_name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Contact Mobile"
              placeholder="+91 98201 12345"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              required
            />
            <Input
              label="Admin Login Email"
              type="email"
              placeholder="candidate@chunavsetu.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <Input
            label="Campaign Title"
            placeholder="Central Assembly Campaign 2026"
            value={formData.campaign_name}
            onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Election Type"
              value={formData.election_type}
              onChange={(e) => setFormData({ ...formData, election_type: e.target.value })}
              options={[
                { value: "Vidhan Sabha", label: "Vidhan Sabha (Assembly)" },
                { value: "Lok Sabha", label: "Lok Sabha (Parliament)" },
                { value: "Municipal Corporation", label: "Municipal Corporation" },
                { value: "Panchayat", label: "Panchayat / Zilla Parishad" },
              ]}
            />
            <Input
              label="Constituency / Location"
              placeholder="e.g. Lucknow Central (AC-174)"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>

          <Select
            label="Account Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as Client["status"] })}
            options={[
              { value: "active", label: t("active") },
              { value: "inactive", label: t("inactive") },
            ]}
          />
        </form>
      </Modal>

      {/* Confirm Deactivation Dialog */}
      {statusDialogClient && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setStatusDialogClient(null)}
          onConfirm={handleToggleStatus}
          title={statusDialogClient.status === "active" ? "Deactivate Client" : "Activate Client"}
          message={`Are you sure you want to ${
            statusDialogClient.status === "active" ? "deactivate" : "activate"
          } "${statusDialogClient.name}" (${statusDialogClient.candidate_name})?`}
          confirmText={statusDialogClient.status === "active" ? "Deactivate" : "Activate"}
          variant={statusDialogClient.status === "active" ? "danger" : "primary"}
        />
      )}
    </div>
  );
}
