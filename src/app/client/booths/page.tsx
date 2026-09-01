"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/lib/context/toast-context";
import { Booth, Area, Volunteer } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { formatNumber } from "@/lib/utils";
import {
  Building2,
  Plus,
  Search,
  Users,
  UserCheck,
  CheckCircle2,
  MapPin,
  Edit2,
  Eye,
} from "lucide-react";

export default function BoothsPage() {
  const { client, user } = useAuth();
  const { success, error: toastError } = useToast();
  const clientId = client?.id || "client-1";

  const [booths, setBooths] = useState<Booth[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [search, setSearch] = useState("");

  // Modals
  const [isBoothModalOpen, setIsBoothModalOpen] = useState(false);
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [editingBooth, setEditingBooth] = useState<Booth | null>(null);
  const [viewingBooth, setViewingBooth] = useState<Booth | null>(null);

  // Form states
  const [boothForm, setBoothForm] = useState({
    booth_number: "",
    booth_name: "",
    area_id: "",
    location_address: "",
    target_voter_count: "1000",
  });

  const [areaForm, setAreaForm] = useState({
    name: "",
    ward_number: "",
    pincode: "",
    description: "",
  });

  const loadData = () => {
    const b = dbService.getBooths(clientId);
    const a = dbService.getAreas(clientId);
    const v = dbService.getVolunteers(clientId);
    setBooths(b);
    setAreas(a);
    setVolunteers(v);
  };

  useEffect(() => {
    loadData();
  }, [clientId]);

  const filteredBooths = booths.filter(
    (b) =>
      b.booth_number.toLowerCase().includes(search.toLowerCase()) ||
      b.booth_name.toLowerCase().includes(search.toLowerCase()) ||
      (b.area_name && b.area_name.toLowerCase().includes(search.toLowerCase())) ||
      (b.location_address && b.location_address.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenAddBooth = () => {
    setEditingBooth(null);
    setBoothForm({
      booth_number: `Booth ${booths.length + 101}`,
      booth_name: "",
      area_id: areas[0]?.id || "",
      location_address: "",
      target_voter_count: "1000",
    });
    setIsBoothModalOpen(true);
  };

  const handleOpenEditBooth = (booth: Booth) => {
    setEditingBooth(booth);
    setBoothForm({
      booth_number: booth.booth_number,
      booth_name: booth.booth_name,
      area_id: booth.area_id || "",
      location_address: booth.location_address || "",
      target_voter_count: String(booth.target_voter_count),
    });
    setIsBoothModalOpen(true);
  };

  const handleSaveBooth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!boothForm.booth_number || !boothForm.booth_name) {
      toastError("Validation Error", "Booth Number and Name are required.");
      return;
    }

    const selectedArea = areas.find((a) => a.id === boothForm.area_id);

    if (editingBooth) {
      dbService.updateBooth(clientId, editingBooth.id, {
        booth_number: boothForm.booth_number,
        booth_name: boothForm.booth_name,
        area_id: boothForm.area_id || undefined,
        area_name: selectedArea?.name,
        location_address: boothForm.location_address,
        target_voter_count: parseInt(boothForm.target_voter_count, 10) || 1000,
      });
      dbService.logAction(
        { id: user?.id, name: user?.full_name || "Admin" },
        "BOOTH_UPDATED",
        "Booth",
        editingBooth.id,
        { number: boothForm.booth_number },
        clientId
      );
      success("Booth Updated", `Updated ${boothForm.booth_number}`);
    } else {
      const created = dbService.createBooth({
        client_id: clientId,
        campaign_id: "camp-1",
        booth_number: boothForm.booth_number,
        booth_name: boothForm.booth_name,
        area_id: boothForm.area_id || undefined,
        area_name: selectedArea?.name,
        location_address: boothForm.location_address,
        target_voter_count: parseInt(boothForm.target_voter_count, 10) || 1000,
      });
      dbService.logAction(
        { id: user?.id, name: user?.full_name || "Admin" },
        "BOOTH_CREATED",
        "Booth",
        created.id,
        { number: created.booth_number },
        clientId
      );
      success("Booth Added", `Created ${created.booth_number}`);
    }

    setIsBoothModalOpen(false);
    loadData();
  };

  const handleSaveArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaForm.name) {
      toastError("Validation Error", "Area name is required.");
      return;
    }

    const created = dbService.createArea({
      client_id: clientId,
      campaign_id: "camp-1",
      name: areaForm.name,
      ward_number: areaForm.ward_number,
      pincode: areaForm.pincode,
      description: areaForm.description,
    });

    dbService.logAction(
      { id: user?.id, name: user?.full_name || "Admin" },
      "AREA_CREATED",
      "Area",
      created.id,
      { name: created.name },
      clientId
    );

    success("Area Added", `Added ${created.name}`);
    setIsAreaModalOpen(false);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
            Polling Booths & Wards
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Organize local polling stations, assign field volunteers, and track door coverage
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAreaModalOpen(true)}
          >
            Add Area / Ward
          </Button>
          <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenAddBooth}>
            Add Booth
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <Input
          placeholder="Search booth number, venue, area..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Booths Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBooths.map((booth) => (
          <Card key={booth.id} padding="md" className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-bold text-sm text-[#1F3A5F] px-2.5 py-0.5 rounded bg-[#EAEFF5] border border-[#DCE6F1]">
                  {booth.booth_number}
                </span>
                <span className="text-[11px] font-semibold text-[#64748B]">
                  {booth.area_name || "Unassigned Ward"}
                </span>
              </div>

              <h3 className="text-sm font-bold text-[#172033] leading-snug">
                {booth.booth_name}
              </h3>
              {booth.location_address && (
                <p className="text-xs text-[#64748B] mt-1 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#64748B]" />
                  <span>{booth.location_address}</span>
                </p>
              )}

              {/* Progress Bar */}
              <div className="mt-4 pt-3 border-t border-[#E5E2DC]">
                <div className="flex items-center justify-between text-xs text-[#64748B] mb-1">
                  <span>Contact Coverage:</span>
                  <span className="font-bold text-[#172033]">
                    {booth.progress_percentage}% ({booth.contacted_count || 0} / {booth.voter_count || 0} voters)
                  </span>
                </div>
                <div className="w-full h-2 bg-[#E5E2DC] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1F3A5F] rounded-full transition-all"
                    style={{ width: `${booth.progress_percentage}%` }}
                  />
                </div>
              </div>

              {/* Assigned Volunteers Badge */}
              <div className="mt-3 flex items-center justify-between text-xs text-[#64748B]">
                <span className="flex items-center gap-1.5 font-medium">
                  <UserCheck className="w-3.5 h-3.5 text-[#2F6B4F]" />
                  <span>{booth.assigned_volunteers_count || 0} Volunteers Assigned</span>
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E5E2DC] flex items-center justify-between">
              <button
                onClick={() => setViewingBooth(booth)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#1F3A5F] hover:underline"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Details</span>
              </button>

              <button
                onClick={() => handleOpenEditBooth(booth)}
                className="p-1 rounded hover:bg-[#F7F6F2] text-[#64748B] hover:text-[#172033]"
                title="Edit Booth"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add / Edit Booth Modal */}
      <Modal
        isOpen={isBoothModalOpen}
        onClose={() => setIsBoothModalOpen(false)}
        title={editingBooth ? "Edit Polling Booth" : "Add Polling Booth"}
        subtitle="Configure polling room, location, and area assignment"
        maxWidth="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsBoothModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveBooth}>
              {editingBooth ? "Save Changes" : "Save Booth"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveBooth} className="space-y-3">
          <Input
            label="Booth Number / ID"
            placeholder="e.g. Booth 105"
            value={boothForm.booth_number}
            onChange={(e) => setBoothForm({ ...boothForm, booth_number: e.target.value })}
            required
          />
          <Input
            label="Booth Name / Polling Station"
            placeholder="e.g. Primary School Room 2"
            value={boothForm.booth_name}
            onChange={(e) => setBoothForm({ ...boothForm, booth_name: e.target.value })}
            required
          />
          <Select
            label="Area / Ward"
            value={boothForm.area_id}
            onChange={(e) => setBoothForm({ ...boothForm, area_id: e.target.value })}
            options={areas.map((a) => ({ value: a.id, label: `${a.name} (${a.ward_number || ""})` }))}
          />
          <Input
            label="Location Address"
            placeholder="Street address or landmark"
            value={boothForm.location_address}
            onChange={(e) => setBoothForm({ ...boothForm, location_address: e.target.value })}
          />
          <Input
            label="Target Elector Count"
            type="number"
            value={boothForm.target_voter_count}
            onChange={(e) => setBoothForm({ ...boothForm, target_voter_count: e.target.value })}
          />
        </form>
      </Modal>

      {/* Add Area Modal */}
      <Modal
        isOpen={isAreaModalOpen}
        onClose={() => setIsAreaModalOpen(false)}
        title="Add Area / Municipal Ward"
        subtitle="Define geographical grouping for polling stations"
        maxWidth="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsAreaModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveArea}>
              Add Area
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveArea} className="space-y-3">
          <Input
            label="Area / Mohalla Name"
            placeholder="e.g. Civil Lines"
            value={areaForm.name}
            onChange={(e) => setAreaForm({ ...areaForm, name: e.target.value })}
            required
          />
          <Input
            label="Ward Number"
            placeholder="e.g. Ward 14"
            value={areaForm.ward_number}
            onChange={(e) => setAreaForm({ ...areaForm, ward_number: e.target.value })}
          />
          <Input
            label="Pincode"
            placeholder="e.g. 226001"
            value={areaForm.pincode}
            onChange={(e) => setAreaForm({ ...areaForm, pincode: e.target.value })}
          />
        </form>
      </Modal>

      {/* View Booth Detail Modal */}
      {viewingBooth && (
        <Modal
          isOpen={true}
          onClose={() => setViewingBooth(null)}
          title={`${viewingBooth.booth_number} - ${viewingBooth.booth_name}`}
          subtitle={`Area: ${viewingBooth.area_name || "Unassigned"}`}
          maxWidth="lg"
          footer={
            <Button size="sm" onClick={() => setViewingBooth(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-[#FAFAF8] border border-[#E5E2DC] rounded-lg">
                <p className="text-[11px] text-[#64748B]">ENROLLED VOTERS</p>
                <p className="text-lg font-bold text-[#172033] mt-0.5">{viewingBooth.voter_count || 0}</p>
              </div>
              <div className="p-3 bg-[#FAFAF8] border border-[#E5E2DC] rounded-lg">
                <p className="text-[11px] text-[#2F6B4F]">CONTACTED</p>
                <p className="text-lg font-bold text-[#2F6B4F] mt-0.5">{viewingBooth.contacted_count || 0}</p>
              </div>
              <div className="p-3 bg-[#FAFAF8] border border-[#E5E2DC] rounded-lg">
                <p className="text-[11px] text-[#1F3A5F]">COVERAGE</p>
                <p className="text-lg font-bold text-[#1F3A5F] mt-0.5">{viewingBooth.progress_percentage}%</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-[#172033] mb-2">Assigned Volunteers</h4>
              <div className="space-y-2">
                {viewingBooth.assigned_volunteers?.map((vol) => (
                  <div
                    key={vol.id}
                    className="p-2.5 bg-[#FAFAF8] border border-[#E5E2DC] rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#172033]">{vol.name}</p>
                      <p className="text-[#64748B]">{vol.mobile}</p>
                    </div>
                    <Badge status={vol.status} size="sm" />
                  </div>
                ))}
                {(!viewingBooth.assigned_volunteers || viewingBooth.assigned_volunteers.length === 0) && (
                  <p className="text-xs text-[#64748B] italic py-2">
                    No volunteers currently assigned to this booth.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
