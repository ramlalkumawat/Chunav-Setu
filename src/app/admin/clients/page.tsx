"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/lib/context/toast-context";
import { Client } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDate } from "@/lib/utils";
import {
  Plus,
  Search,
  Building2,
  Edit2,
  Power,
  ArrowUpRight,
  UserCheck,
  Users,
  Eye,
} from "lucide-react";

export default function AdminClientsPage() {
  const { user, switchRole } = useAuth();
  const { success, error: toastError } = useToast();

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
            Client & Tenant Management
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Create, configure, and isolate election campaigns across candidates
          </p>
        </div>

        <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenCreate}>
          Provision New Client
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by client, candidate, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "all", label: "All Statuses" },
              { value: "active", label: "Active Only" },
              { value: "inactive", label: "Inactive Only" },
            ]}
          />
        </div>
      </div>

      {/* Clients Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFAF8] text-[#64748B] font-semibold border-b border-[#E5E2DC] uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Client Name</th>
                <th className="px-5 py-3">Candidate</th>
                <th className="px-5 py-3">Campaign Details</th>
                <th className="px-5 py-3 text-center">Volunteers</th>
                <th className="px-5 py-3 text-center">Voters</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2DC] text-[#172033]">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-[#F7F6F2]/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-bold text-[#172033]">{client.name}</p>
                    <p className="text-[11px] text-[#64748B]">{client.email}</p>
                    <p className="text-[11px] text-[#64748B]">{client.mobile}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#172033]">{client.candidate_name}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#1F3A5F]">{client.campaign_name}</p>
                    <p className="text-[11px] text-[#64748B]">
                      {client.election_type} • {client.location}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-center font-bold">{client.volunteer_count || 0}</td>
                  <td className="px-5 py-4 text-center font-bold">{client.voter_count || 0}</td>
                  <td className="px-5 py-4">
                    <Badge status={client.status} size="sm" />
                  </td>
                  <td className="px-5 py-4 text-[#64748B]">{formatDate(client.created_at)}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => switchRole("client_admin", client.id)}
                        className="p-1.5 rounded hover:bg-[#EAEFF5] text-[#1F3A5F]"
                        title="Enter Client Dashboard"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(client)}
                        className="p-1.5 rounded hover:bg-[#F7F6F2] text-[#64748B] hover:text-[#172033]"
                        title="Edit Client"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setStatusDialogClient(client)}
                        className={`p-1.5 rounded hover:bg-[#F7F6F2] ${
                          client.status === "active" ? "text-[#2F6B4F]" : "text-[#B94A48]"
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
                  <td colSpan={8} className="px-5 py-8 text-center text-xs text-[#64748B]">
                    No clients found matching the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create / Edit Client Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? "Edit Client Campaign" : "Provision New Client"}
        subtitle="Configure candidate campaign details and tenant settings"
        maxWidth="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveClient}>
              {editingClient ? "Save Changes" : "Provision Client"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveClient} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Client / Committee Name"
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
            label="Campaign Name"
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
                { value: "Municipal Corporation", label: "Municipal Corporation (Nagar Nigam)" },
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
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive / Suspended" },
            ]}
          />
        </form>
      </Modal>

      {/* Confirm Deactivation / Activation Dialog */}
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
