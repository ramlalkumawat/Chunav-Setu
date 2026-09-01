"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/lib/context/toast-context";
import { Voter, Booth, Area } from "@/lib/types";
import { exportToCsv } from "@/lib/utils/csv-parser";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { OdooControlPanel } from "@/components/ui/OdooControlPanel";
import { formatDate } from "@/lib/utils";
import {
  Plus,
  Search,
  FileSpreadsheet,
  Download,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Phone,
  CheckSquare,
  Square,
  ChevronDown,
  X,
  UserCheck,
} from "lucide-react";

export default function VotersPage() {
  const { client, user } = useAuth();
  const { success, error: toastError } = useToast();
  const clientId = client?.id || "client-1";

  // Data state
  const [voters, setVoters] = useState<Voter[]>([]);
  const [booths, setBooths] = useState<Booth[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Selection state for Bulk Actions
  const [selectedVoterIds, setSelectedVoterIds] = useState<string[]>([]);
  const [bulkStatusModal, setBulkStatusModal] = useState(false);
  const [selectedBulkStatus, setSelectedBulkStatus] = useState<Voter["contact_status"]>("favorable");

  // Filter params
  const [search, setSearch] = useState("");
  const [boothFilter, setBoothFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVoter, setEditingVoter] = useState<Voter | null>(null);
  const [viewingVoter, setViewingVoter] = useState<Voter | null>(null);
  const [deletingVoter, setDeletingVoter] = useState<Voter | null>(null);

  // Form inputs
  const [formData, setFormData] = useState({
    voter_id_card: "",
    name: "",
    mobile: "",
    age: "" as string | number,
    gender: "Male" as Voter["gender"],
    area_id: "",
    booth_id: "",
    address: "",
    contact_status: "uncontacted" as Voter["contact_status"],
    notes: "",
  });

  const loadData = useCallback(() => {
    const boothList = dbService.getBooths(clientId);
    const areaList = dbService.getAreas(clientId);
    setBooths(boothList);
    setAreas(areaList);

    const result = dbService.getVoters(clientId, {
      search,
      boothId: boothFilter,
      areaId: areaFilter,
      contactStatus: statusFilter,
      gender: genderFilter,
      page: currentPage,
      pageSize,
    });

    setVoters(result.data);
    setTotalRecords(result.total);
    setTotalPages(result.totalPages);
    setSelectedVoterIds([]);
  }, [clientId, search, boothFilter, areaFilter, statusFilter, genderFilter, currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Selection toggle
  const toggleSelectAll = () => {
    if (selectedVoterIds.length === voters.length) {
      setSelectedVoterIds([]);
    } else {
      setSelectedVoterIds(voters.map((v) => v.id));
    }
  };

  const toggleSelectVoter = (id: string) => {
    if (selectedVoterIds.includes(id)) {
      setSelectedVoterIds(selectedVoterIds.filter((item) => item !== id));
    } else {
      setSelectedVoterIds([...selectedVoterIds, id]);
    }
  };

  const handleBulkStatusChange = () => {
    selectedVoterIds.forEach((id) => {
      dbService.updateVoter(clientId, id, { contact_status: selectedBulkStatus });
    });
    success("Bulk Update Applied", `Updated status to "${selectedBulkStatus}" for ${selectedVoterIds.length} voters.`);
    setBulkStatusModal(false);
    setSelectedVoterIds([]);
    loadData();
  };

  const handleOpenAdd = () => {
    setEditingVoter(null);
    setFormData({
      voter_id_card: "",
      name: "",
      mobile: "",
      age: "",
      gender: "Male",
      area_id: areas[0]?.id || "",
      booth_id: booths[0]?.id || "",
      address: "",
      contact_status: "uncontacted",
      notes: "",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (v: Voter) => {
    setEditingVoter(v);
    setFormData({
      voter_id_card: v.voter_id_card,
      name: v.name,
      mobile: v.mobile || "",
      age: v.age || "",
      gender: v.gender || "Male",
      area_id: v.area_id || "",
      booth_id: v.booth_id || "",
      address: v.address || "",
      contact_status: v.contact_status,
      notes: v.notes || "",
    });
    setIsFormOpen(true);
  };

  const handleSaveVoter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.voter_id_card.trim() || !formData.name.trim()) {
      toastError("Validation Error", "Voter ID (EPIC) and Full Name are mandatory.");
      return;
    }

    const ageNum = formData.age ? parseInt(String(formData.age), 10) : undefined;
    const selectedBooth = booths.find((b) => b.id === formData.booth_id);
    const selectedArea = areas.find((a) => a.id === formData.area_id);

    if (editingVoter) {
      dbService.updateVoter(clientId, editingVoter.id, {
        ...formData,
        age: isNaN(ageNum as number) ? undefined : ageNum,
        booth_name: selectedBooth?.booth_name,
        booth_number: selectedBooth?.booth_number,
        area_name: selectedArea?.name,
      });
      dbService.logAction(
        { id: user?.id, name: user?.full_name || "Admin" },
        "VOTER_UPDATED",
        "Voter",
        editingVoter.id,
        { card: formData.voter_id_card, name: formData.name },
        clientId
      );
      success("Record Updated", `Changes saved for ${formData.name}`);
    } else {
      const created = dbService.createVoter({
        client_id: clientId,
        campaign_id: selectedBooth?.campaign_id || "camp-1",
        voter_id_card: formData.voter_id_card.trim().toUpperCase(),
        name: formData.name.trim(),
        mobile: formData.mobile.trim() || undefined,
        age: isNaN(ageNum as number) ? undefined : ageNum,
        gender: formData.gender,
        area_id: formData.area_id || undefined,
        area_name: selectedArea?.name,
        booth_id: formData.booth_id || undefined,
        booth_name: selectedBooth?.booth_name,
        booth_number: selectedBooth?.booth_number,
        address: formData.address.trim() || undefined,
        contact_status: formData.contact_status,
        follow_up_status: "none",
        notes: formData.notes.trim() || undefined,
      });
      dbService.logAction(
        { id: user?.id, name: user?.full_name || "Admin" },
        "VOTER_CREATED",
        "Voter",
        created.id,
        { card: created.voter_id_card, name: created.name },
        clientId
      );
      success("Voter Enrolled", `Added ${created.name} to directory.`);
    }

    setIsFormOpen(false);
    loadData();
  };

  const handleDeleteVoter = () => {
    if (!deletingVoter) return;
    dbService.deleteVoter(clientId, deletingVoter.id);
    dbService.logAction(
      { id: user?.id, name: user?.full_name || "Admin" },
      "VOTER_DELETED",
      "Voter",
      deletingVoter.id,
      { card: deletingVoter.voter_id_card, name: deletingVoter.name },
      clientId
    );
    success("Record Deleted", `Removed ${deletingVoter.name} from directory.`);
    setDeletingVoter(null);
    loadData();
  };

  const handleExportCsv = () => {
    const allClientVoters = dbService.getVoters(clientId, { pageSize: 10000 }).data;
    const headers = [
      "Voter ID / EPIC",
      "Full Name",
      "Mobile",
      "Age",
      "Gender",
      "Booth Number",
      "Booth Name",
      "Area / Ward",
      "Address",
      "Contact Status",
      "Follow-up Status",
      "Notes",
    ];

    const rows = allClientVoters.map((v) => [
      v.voter_id_card,
      v.name,
      v.mobile || "",
      v.age || "",
      v.gender || "",
      v.booth_number || "",
      v.booth_name || "",
      v.area_name || "",
      v.address || "",
      v.contact_status,
      v.follow_up_status,
      v.notes || "",
    ]);

    exportToCsv(`Voters_${client?.candidate_name || "Campaign"}_${new Date().toISOString().split("T")[0]}`, headers, rows);
    success("Export Complete", "CSV export downloaded successfully.");
  };

  return (
    <div className="space-y-3">
      {/* Odoo ERP Control Panel */}
      <OdooControlPanel
        breadcrumb="Campaign"
        title="Voter Directory"
        subtitle="Manage and canvass registered electors across polling stations"
        primaryAction={{
          label: "Add Voter",
          onClick: handleOpenAdd,
          icon: <Plus className="w-3.5 h-3.5" />,
        }}
        secondaryActions={[
          {
            label: "Import CSV",
            href: "/client/voters/import",
            icon: <FileSpreadsheet className="w-3.5 h-3.5 text-[#6C757D]" />,
          },
          {
            label: "Export CSV",
            onClick: handleExportCsv,
            icon: <Download className="w-3.5 h-3.5 text-[#6C757D]" />,
          },
        ]}
        searchPlaceholder="Search name, EPIC, mobile..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        pagination={{
          currentPage,
          totalPages,
          totalRecords,
          pageSize,
          onPageChange: (p) => setCurrentPage(p),
        }}
        filterComponent={
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <select
              value={boothFilter}
              onChange={(e) => {
                setBoothFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8 bg-white border border-[#DEE2E6] rounded-[3px] text-xs px-2 text-[#212529] focus:outline-none focus:border-[#714B67]"
            >
              <option value="all">All Polling Booths</option>
              {booths.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.booth_number} - {b.booth_name}
                </option>
              ))}
            </select>

            <select
              value={areaFilter}
              onChange={(e) => {
                setAreaFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8 bg-white border border-[#DEE2E6] rounded-[3px] text-xs px-2 text-[#212529] focus:outline-none focus:border-[#714B67]"
            >
              <option value="all">All Wards / Areas</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8 bg-white border border-[#DEE2E6] rounded-[3px] text-xs px-2 text-[#212529] focus:outline-none focus:border-[#714B67]"
            >
              <option value="all">All Contact Statuses</option>
              <option value="uncontacted">Uncontacted</option>
              <option value="favorable">Favorable / Supporter</option>
              <option value="undecided">Undecided</option>
              <option value="unfavorable">Unfavorable</option>
              <option value="contacted">Contacted</option>
              <option value="not_available">Door Locked / Not Available</option>
            </select>

            <select
              value={genderFilter}
              onChange={(e) => {
                setGenderFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8 bg-white border border-[#DEE2E6] rounded-[3px] text-xs px-2 text-[#212529] focus:outline-none focus:border-[#714B67]"
            >
              <option value="all">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        }
      />

      {/* Bulk Action Bar (When rows are selected) */}
      {selectedVoterIds.length > 0 && (
        <div className="bg-[#F1ECEF] border border-[#D9CAD5] rounded-[4px] px-3.5 py-2 flex items-center justify-between text-xs animate-in fade-in duration-100">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#714B67]">
              {selectedVoterIds.length} records selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setBulkStatusModal(true)}
              leftIcon={<UserCheck className="w-3.5 h-3.5 text-[#714B67]" />}
            >
              Set Status
            </Button>
            <button
              onClick={() => setSelectedVoterIds([])}
              className="text-[#6C757D] hover:text-[#212529] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Dense Professional Odoo-style Data Table */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="odoo-table">
            <thead>
              <tr>
                <th className="w-9 text-center">
                  <button
                    onClick={toggleSelectAll}
                    className="text-[#6C757D] hover:text-[#212529] inline-flex items-center"
                  >
                    {selectedVoterIds.length === voters.length && voters.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-[#714B67]" />
                    ) : (
                      <Square className="w-4 h-4 text-[#CED4DA]" />
                    )}
                  </button>
                </th>
                <th>EPIC Number</th>
                <th>Voter Name</th>
                <th>Contact</th>
                <th>Demographics</th>
                <th>Booth & Ward</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {voters.map((voter) => {
                const isSelected = selectedVoterIds.includes(voter.id);
                return (
                  <tr key={voter.id} className={isSelected ? "selected" : ""}>
                    <td className="text-center">
                      <button
                        onClick={() => toggleSelectVoter(voter.id)}
                        className="text-[#6C757D] hover:text-[#212529] inline-flex items-center"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#714B67]" />
                        ) : (
                          <Square className="w-4 h-4 text-[#CED4DA]" />
                        )}
                      </button>
                    </td>
                    <td className="font-mono text-xs font-semibold text-[#714B67]">
                      {voter.voter_id_card}
                    </td>
                    <td>
                      <p className="font-semibold text-[#212529] leading-tight">{voter.name}</p>
                      {voter.address && (
                        <p className="text-[11px] text-[#6C757D] truncate max-w-xs">{voter.address}</p>
                      )}
                    </td>
                    <td className="text-xs text-[#495057]">
                      {voter.mobile ? (
                        <span className="font-mono">{voter.mobile}</span>
                      ) : (
                        <span className="text-[#ADB5BD]">—</span>
                      )}
                    </td>
                    <td className="text-xs text-[#495057]">
                      {voter.age ? `${voter.age} yrs` : "—"} • {voter.gender || "—"}
                    </td>
                    <td className="text-xs">
                      <p className="font-medium text-[#212529]">
                        {voter.booth_number ? `Booth ${voter.booth_number}` : "Unassigned"}
                      </p>
                      <p className="text-[11px] text-[#6C757D]">{voter.area_name || "—"}</p>
                    </td>
                    <td>
                      <Badge status={voter.contact_status} size="sm" />
                      {voter.follow_up_status === "pending" && (
                        <span className="ml-1 text-[10px] text-[#E65100] font-semibold">
                          • Follow-up
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingVoter(voter)}
                          className="p-1 rounded hover:bg-[#F8F9FA] text-[#6C757D] hover:text-[#212529]"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(voter)}
                          className="p-1 rounded hover:bg-[#F8F9FA] text-[#6C757D] hover:text-[#212529]"
                          title="Edit Record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingVoter(voter)}
                          className="p-1 rounded hover:bg-[#FFEBEE] text-[#C62828]"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {voters.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-xs text-[#6C757D]">
                    No elector records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pager bar */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          pageSize={pageSize}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </div>

      {/* Add / Edit Form Modal (Odoo ERP Form Sheet Style) */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingVoter ? `Edit Elector: ${editingVoter.name}` : "New Elector Record"}
        subtitle="Campaign Voter Management Sheet"
        maxWidth="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsFormOpen(false)}>
              Discard
            </Button>
            <Button size="sm" variant="primary" onClick={handleSaveVoter}>
              {editingVoter ? "Save Changes" : "Save Record"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveVoter} className="space-y-3">
          {/* Section 1: Identification & Demographics */}
          <div className="p-3 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[3px] space-y-2.5">
            <p className="text-[11px] font-semibold text-[#6C757D] uppercase tracking-wider">
              Identity & Contact
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Input
                label="Voter ID / EPIC Number"
                placeholder="e.g. DL/04/023/100429"
                value={formData.voter_id_card}
                onChange={(e) => setFormData({ ...formData, voter_id_card: e.target.value.toUpperCase() })}
                required
              />
              <Input
                label="Full Name"
                placeholder="Voter Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <Input
                label="Mobile"
                placeholder="+91 98000 00000"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              />
              <Input
                label="Age"
                type="number"
                placeholder="Age"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
              <Select
                label="Gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as Voter["gender"] })}
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "Other", label: "Other" },
                ]}
              />
            </div>
          </div>

          {/* Section 2: Polling Booth Assignment */}
          <div className="p-3 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[3px] space-y-2.5">
            <p className="text-[11px] font-semibold text-[#6C757D] uppercase tracking-wider">
              Polling Station & Locality
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Select
                label="Ward / Area"
                value={formData.area_id}
                onChange={(e) => setFormData({ ...formData, area_id: e.target.value })}
                options={areas.map((a) => ({ value: a.id, label: a.name }))}
              />
              <Select
                label="Polling Booth"
                value={formData.booth_id}
                onChange={(e) => setFormData({ ...formData, booth_id: e.target.value })}
                options={booths.map((b) => ({ value: b.id, label: `${b.booth_number} - ${b.booth_name}` }))}
              />
            </div>
            <Input
              label="House No / Street / Colony Address"
              placeholder="Address details..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          {/* Section 3: Status & Field Notes */}
          <div className="p-3 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[3px] space-y-2.5">
            <p className="text-[11px] font-semibold text-[#6C757D] uppercase tracking-wider">
              Canvassing & Field Outreach
            </p>
            <Select
              label="Contact Status"
              value={formData.contact_status}
              onChange={(e) => setFormData({ ...formData, contact_status: e.target.value as Voter["contact_status"] })}
              options={[
                { value: "uncontacted", label: "Uncontacted" },
                { value: "favorable", label: "Favorable / Supporter" },
                { value: "undecided", label: "Undecided" },
                { value: "unfavorable", label: "Unfavorable" },
                { value: "contacted", label: "Contacted" },
                { value: "not_available", label: "Not Available / Door Locked" },
              ]}
            />
            <Textarea
              label="Canvassing Notes & Feedback"
              placeholder="Local demands, grievances, party sentiment..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      {viewingVoter && (
        <Modal
          isOpen={true}
          onClose={() => setViewingVoter(null)}
          title={viewingVoter.name}
          subtitle={`EPIC: ${viewingVoter.voter_id_card}`}
          maxWidth="md"
          footer={
            <Button size="sm" variant="secondary" onClick={() => setViewingVoter(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="p-2.5 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[3px] flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-[#212529]">{viewingVoter.name}</p>
                <p className="font-mono text-[#6C757D] text-[11px]">{viewingVoter.voter_id_card}</p>
              </div>
              <Badge status={viewingVoter.contact_status} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-white border border-[#DEE2E6] rounded-[3px]">
                <span className="text-[#6C757D] text-[11px]">Mobile:</span>
                <p className="font-semibold text-[#212529] font-mono mt-0.5">
                  {viewingVoter.mobile || "Not available"}
                </p>
              </div>
              <div className="p-2 bg-white border border-[#DEE2E6] rounded-[3px]">
                <span className="text-[#6C757D] text-[11px]">Demographics:</span>
                <p className="font-semibold text-[#212529] mt-0.5">
                  {viewingVoter.age || "—"} yrs • {viewingVoter.gender || "—"}
                </p>
              </div>
              <div className="p-2 bg-white border border-[#DEE2E6] rounded-[3px]">
                <span className="text-[#6C757D] text-[11px]">Polling Booth:</span>
                <p className="font-semibold text-[#212529] mt-0.5">
                  {viewingVoter.booth_number} - {viewingVoter.booth_name}
                </p>
              </div>
              <div className="p-2 bg-white border border-[#DEE2E6] rounded-[3px]">
                <span className="text-[#6C757D] text-[11px]">Area / Ward:</span>
                <p className="font-semibold text-[#212529] mt-0.5">
                  {viewingVoter.area_name || "—"}
                </p>
              </div>
            </div>

            {viewingVoter.address && (
              <div className="p-2 bg-white border border-[#DEE2E6] rounded-[3px]">
                <span className="text-[#6C757D] text-[11px]">Address:</span>
                <p className="text-[#212529] mt-0.5">{viewingVoter.address}</p>
              </div>
            )}

            {viewingVoter.notes && (
              <div className="p-2 bg-[#FFF3E0] border border-[#FFE0B2] rounded-[3px]">
                <span className="font-semibold text-[#E65100] text-[11px]">Canvassing Notes:</span>
                <p className="text-[#212529] mt-0.5 italic text-xs">"{viewingVoter.notes}"</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Bulk Status Change Modal */}
      <Modal
        isOpen={bulkStatusModal}
        onClose={() => setBulkStatusModal(false)}
        title="Update Contact Status"
        subtitle={`Apply to ${selectedVoterIds.length} selected voter records`}
        maxWidth="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setBulkStatusModal(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" onClick={handleBulkStatusChange}>
              Apply Status
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <Select
            label="Target Contact Status"
            value={selectedBulkStatus}
            onChange={(e) => setSelectedBulkStatus(e.target.value as Voter["contact_status"])}
            options={[
              { value: "favorable", label: "Favorable / Supporter" },
              { value: "undecided", label: "Undecided" },
              { value: "unfavorable", label: "Unfavorable" },
              { value: "contacted", label: "Contacted" },
              { value: "uncontacted", label: "Uncontacted" },
              { value: "not_available", label: "Not Available / Door Locked" },
            ]}
          />
          <p className="text-[11px] text-[#6C757D]">
            This will update the contact status for all {selectedVoterIds.length} currently selected records in the campaign database.
          </p>
        </div>
      </Modal>

      {/* Delete Voter Confirm Dialog */}
      {deletingVoter && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeletingVoter(null)}
          onConfirm={handleDeleteVoter}
          title="Delete Voter Record"
          message={`Are you sure you want to remove ${deletingVoter.name} (${deletingVoter.voter_id_card}) from the campaign database?`}
          confirmText="Delete Record"
          variant="danger"
        />
      )}
    </div>
  );
}
