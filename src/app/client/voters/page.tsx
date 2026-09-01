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
  MapPin,
  CheckCircle2,
  Calendar,
  X,
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

  // Filter params
  const [search, setSearch] = useState("");
  const [boothFilter, setBoothFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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
  }, [clientId, search, boothFilter, areaFilter, statusFilter, genderFilter, currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      success("Voter Updated", `Changes saved for ${formData.name}`);
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
      success("Voter Enrolled", `Added ${created.name} to campaign records.`);
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
    success("Voter Record Deleted", `Removed ${deletingVoter.name} from database.`);
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

    exportToCsv(`Voters_List_${client?.candidate_name || "Campaign"}_${new Date().toISOString().split("T")[0]}`, headers, rows);
    success("Export Completed", "CSV file generated and downloaded.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
            Voter Directory
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Search, filter, canvass, and manage registered electors across booths
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExportCsv}
          >
            Export CSV
          </Button>
          <Link href="/client/voters/import">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FileSpreadsheet className="w-4 h-4" />}
            >
              Batch CSV Import
            </Button>
          </Link>
          <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
            Add Voter
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card padding="sm" className="bg-[#FAFAF8]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          <Input
            placeholder="Search name, EPIC, phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            leftIcon={<Search className="w-4 h-4" />}
          />

          <Select
            value={boothFilter}
            onChange={(e) => {
              setBoothFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: "all", label: "All Polling Booths" },
              ...booths.map((b) => ({ value: b.id, label: `${b.booth_number} - ${b.booth_name}` })),
            ]}
          />

          <Select
            value={areaFilter}
            onChange={(e) => {
              setAreaFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: "all", label: "All Areas / Wards" },
              ...areas.map((a) => ({ value: a.id, label: `${a.name} (${a.ward_number || ""})` })),
            ]}
          />

          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: "all", label: "All Contact Statuses" },
              { value: "uncontacted", label: "Uncontacted" },
              { value: "favorable", label: "Favorable / Supporter" },
              { value: "undecided", label: "Undecided" },
              { value: "unfavorable", label: "Unfavorable" },
              { value: "contacted", label: "Contacted" },
              { value: "not_available", label: "Not Available / Door Locked" },
            ]}
          />

          <Select
            value={genderFilter}
            onChange={(e) => {
              setGenderFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: "all", label: "All Genders" },
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" },
              { value: "Other", label: "Other" },
            ]}
          />
        </div>
      </Card>

      {/* Voters Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFAF8] text-[#64748B] font-semibold border-b border-[#E5E2DC] uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Voter ID / EPIC</th>
                <th className="px-5 py-3">Full Name</th>
                <th className="px-5 py-3">Contact Details</th>
                <th className="px-5 py-3">Age / Sex</th>
                <th className="px-5 py-3">Booth & Area</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2DC] text-[#172033]">
              {voters.map((voter) => (
                <tr key={voter.id} className="hover:bg-[#F7F6F2]/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-[#1F3A5F]">
                    {voter.voter_id_card}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-[#172033]">{voter.name}</p>
                    {voter.address && (
                      <p className="text-[11px] text-[#64748B] truncate max-w-xs">{voter.address}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-[#64748B]">
                    {voter.mobile ? (
                      <span className="flex items-center gap-1 font-mono text-[#172033]">
                        <Phone className="w-3 h-3 text-[#64748B]" />
                        {voter.mobile}
                      </span>
                    ) : (
                      "No mobile"
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {voter.age ? `${voter.age} yrs` : "—"} • {voter.gender || "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-[#172033]">
                      {voter.booth_number || "Unassigned"}
                    </p>
                    <p className="text-[11px] text-[#64748B]">{voter.area_name}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge status={voter.contact_status} size="sm" />
                    {voter.follow_up_status === "pending" && (
                      <span className="ml-1 text-[10px] text-[#B7791F] font-semibold">
                        • Follow-up
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewingVoter(voter)}
                        className="p-1.5 rounded hover:bg-[#F7F6F2] text-[#64748B] hover:text-[#172033]"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(voter)}
                        className="p-1.5 rounded hover:bg-[#F7F6F2] text-[#64748B] hover:text-[#172033]"
                        title="Edit Voter"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingVoter(voter)}
                        className="p-1.5 rounded hover:bg-[#FDF2F2] text-[#B94A48]"
                        title="Delete Voter"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {voters.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-xs text-[#64748B]">
                    No voter records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          pageSize={pageSize}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </Card>

      {/* Add / Edit Voter Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingVoter ? "Edit Elector Details" : "Enroll New Voter"}
        subtitle="Manage official voter directory credentials and polling booth assignment"
        maxWidth="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveVoter}>
              {editingVoter ? "Save Changes" : "Save Voter"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveVoter} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Voter ID / EPIC Number"
              placeholder="e.g. UP/48/281/001499"
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Mobile Number"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Area / Ward"
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
            label="Address / House No / Locality"
            placeholder="H.No 45, Street name, Colony"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

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
              { value: "not_available", label: "Not Available" },
            ]}
          />

          <Textarea
            label="Canvassing Notes & Grievances"
            placeholder="Key voter concerns, local demands, influence level..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </form>
      </Modal>

      {/* View Voter Profile Drawer / Modal */}
      {viewingVoter && (
        <Modal
          isOpen={true}
          onClose={() => setViewingVoter(null)}
          title="Elector Profile Details"
          subtitle={`Voter Record: ${viewingVoter.voter_id_card}`}
          maxWidth="md"
          footer={
            <Button size="sm" onClick={() => setViewingVoter(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-[#FAFAF8] border border-[#E5E2DC] rounded-lg flex items-center justify-between">
              <div>
                <p className="font-bold text-base text-[#172033]">{viewingVoter.name}</p>
                <p className="text-[#64748B] font-mono mt-0.5">{viewingVoter.voter_id_card}</p>
              </div>
              <Badge status={viewingVoter.contact_status} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-white border border-[#E5E2DC] rounded-lg">
                <span className="text-[#64748B]">Mobile:</span>
                <p className="font-semibold text-[#172033] font-mono mt-0.5">
                  {viewingVoter.mobile || "Not available"}
                </p>
              </div>
              <div className="p-2.5 bg-white border border-[#E5E2DC] rounded-lg">
                <span className="text-[#64748B]">Age & Gender:</span>
                <p className="font-semibold text-[#172033] mt-0.5">
                  {viewingVoter.age || "—"} yrs • {viewingVoter.gender || "—"}
                </p>
              </div>
              <div className="p-2.5 bg-white border border-[#E5E2DC] rounded-lg">
                <span className="text-[#64748B]">Booth:</span>
                <p className="font-semibold text-[#172033] mt-0.5">
                  {viewingVoter.booth_number} - {viewingVoter.booth_name}
                </p>
              </div>
              <div className="p-2.5 bg-white border border-[#E5E2DC] rounded-lg">
                <span className="text-[#64748B]">Ward / Area:</span>
                <p className="font-semibold text-[#172033] mt-0.5">
                  {viewingVoter.area_name || "—"}
                </p>
              </div>
            </div>

            {viewingVoter.address && (
              <div className="p-2.5 bg-white border border-[#E5E2DC] rounded-lg">
                <span className="text-[#64748B]">Locality / Address:</span>
                <p className="text-[#172033] mt-0.5">{viewingVoter.address}</p>
              </div>
            )}

            {viewingVoter.notes && (
              <div className="p-2.5 bg-[#FEF7EC] border border-[#FBE3B8] rounded-lg">
                <span className="font-semibold text-[#B7791F]">Field Survey Notes:</span>
                <p className="text-[#172033] mt-1 italic">"{viewingVoter.notes}"</p>
              </div>
            )}

            {viewingVoter.last_contacted_by && (
              <div className="pt-2 border-t border-[#E5E2DC] flex items-center justify-between text-[11px] text-[#64748B]">
                <span>Last canvassed by: <strong>{viewingVoter.last_contacted_by}</strong></span>
                <span>{formatDate(viewingVoter.last_contacted_at)}</span>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Voter Confirm Dialog */}
      {deletingVoter && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeletingVoter(null)}
          onConfirm={handleDeleteVoter}
          title="Delete Voter Record"
          message={`Are you sure you want to remove ${deletingVoter.name} (${deletingVoter.voter_id_card}) from the campaign database? This action cannot be undone.`}
          confirmText="Delete Record"
          variant="danger"
        />
      )}
    </div>
  );
}
