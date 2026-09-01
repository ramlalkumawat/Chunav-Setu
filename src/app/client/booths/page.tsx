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
import { OdooControlPanel } from "@/components/ui/OdooControlPanel";
import {
  Building,
  Plus,
  Search,
  UserCheck,
  MapPin,
  Edit2,
  Eye,
  Map,
} from "lucide-react";

export default function BoothsPage() {
  const { client, user } = useAuth();
  const { success, error: toastError } = useToast();
  const clientId = client?.id || "client-1";

  const [booths, setBooths] = useState<Booth[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

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
      success("Booth Updated", `Saved changes for ${boothForm.booth_number}`);
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
    <div className="space-y-3">
      {/* Odoo Control Panel */}
      <OdooControlPanel
        breadcrumb="Campaign"
        title="Polling Booths & Wards"
        subtitle="Manage polling stations, volunteer allocations, and turnout targets"
        primaryAction={{
          label: "Add Booth",
          onClick: handleOpenAddBooth,
          icon: <Plus className="w-3.5 h-3.5" />,
        }}
        secondaryActions={[
          {
            label: "Add Ward / Area",
            onClick: () => setIsAreaModalOpen(true),
            icon: <Plus className="w-3.5 h-3.5 text-[#6C757D]" />,
          },
        ]}
        searchPlaceholder="Search booth number, station, ward..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      {/* Dense Odoo Table for Polling Booths */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="odoo-table">
            <thead>
              <tr>
                <th>Booth ID</th>
                <th>Polling Station Name</th>
                <th>Ward / Locality</th>
                <th>Electors Enrolled</th>
                <th>Canvassed (%)</th>
                <th>Staff Assigned</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooths.map((booth) => (
                <tr key={booth.id}>
                  <td className="font-mono text-xs font-semibold text-[#714B67]">
                    {booth.booth_number}
                  </td>
                  <td>
                    <p className="font-semibold text-[#212529]">{booth.booth_name}</p>
                    {booth.location_address && (
                      <p className="text-[11px] text-[#6C757D] truncate max-w-xs">{booth.location_address}</p>
                    )}
                  </td>
                  <td className="text-xs text-[#495057]">
                    {booth.area_name || <span className="text-[#ADB5BD]">Unassigned</span>}
                  </td>
                  <td className="text-xs font-semibold text-[#212529]">
                    {booth.voter_count || 0}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-[#E9ECEF] rounded-[2px] overflow-hidden">
                        <div
                          className="h-full bg-[#714B67] rounded-[2px]"
                          style={{ width: `${booth.progress_percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-[#212529]">
                        {booth.progress_percentage}%
                      </span>
                    </div>
                  </td>
                  <td className="text-xs text-[#495057]">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <UserCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
                      {booth.assigned_volunteers_count || 0}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewingBooth(booth)}
                        className="p-1 rounded hover:bg-[#F8F9FA] text-[#6C757D] hover:text-[#212529]"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditBooth(booth)}
                        className="p-1 rounded hover:bg-[#F8F9FA] text-[#6C757D] hover:text-[#212529]"
                        title="Edit Booth"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBooths.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-xs text-[#6C757D]">
                    No polling booths found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Booth Modal */}
      <Modal
        isOpen={isBoothModalOpen}
        onClose={() => setIsBoothModalOpen(false)}
        title={editingBooth ? `Edit Polling Station: ${editingBooth.booth_number}` : "New Polling Booth"}
        subtitle="Campaign Polling Station Setup"
        maxWidth="md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsBoothModalOpen(false)}>
              Discard
            </Button>
            <Button size="sm" variant="primary" onClick={handleSaveBooth}>
              {editingBooth ? "Save Changes" : "Create Booth"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveBooth} className="space-y-3">
          <Input
            label="Booth Number / Identifier"
            placeholder="e.g. Booth 105"
            value={boothForm.booth_number}
            onChange={(e) => setBoothForm({ ...boothForm, booth_number: e.target.value })}
            required
          />
          <Input
            label="Station Venue / Building Name"
            placeholder="e.g. Govt Primary School Room 2"
            value={boothForm.booth_name}
            onChange={(e) => setBoothForm({ ...boothForm, booth_name: e.target.value })}
            required
          />
          <Select
            label="Assigned Ward / Locality"
            value={boothForm.area_id}
            onChange={(e) => setBoothForm({ ...boothForm, area_id: e.target.value })}
            options={areas.map((a) => ({ value: a.id, label: `${a.name} (${a.ward_number || ""})` }))}
          />
          <Input
            label="Location Address"
            placeholder="Street address or landmark..."
            value={boothForm.location_address}
            onChange={(e) => setBoothForm({ ...boothForm, location_address: e.target.value })}
          />
          <Input
            label="Target Elector Quota"
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
        title="Add Ward / Sector"
        subtitle="Define geographical grouping"
        maxWidth="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsAreaModalOpen(false)}>
              Discard
            </Button>
            <Button size="sm" variant="primary" onClick={handleSaveArea}>
              Save Area
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveArea} className="space-y-3">
          <Input
            label="Ward / Area Name"
            placeholder="e.g. Civil Lines North"
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

      {/* View Booth Modal */}
      {viewingBooth && (
        <Modal
          isOpen={true}
          onClose={() => setViewingBooth(null)}
          title={`${viewingBooth.booth_number} — ${viewingBooth.booth_name}`}
          subtitle={`Ward: ${viewingBooth.area_name || "Unassigned"}`}
          maxWidth="md"
          footer={
            <Button size="sm" variant="secondary" onClick={() => setViewingBooth(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[3px]">
                <p className="text-[11px] text-[#6C757D]">Enrolled Voters</p>
                <p className="text-base font-bold text-[#212529] mt-0.5">{viewingBooth.voter_count || 0}</p>
              </div>
              <div className="p-2.5 bg-[#E8F5E9] border border-[#C8E6C9] rounded-[3px]">
                <p className="text-[11px] text-[#2E7D32]">Contacted</p>
                <p className="text-base font-bold text-[#2E7D32] mt-0.5">{viewingBooth.contacted_count || 0}</p>
              </div>
              <div className="p-2.5 bg-[#F1ECEF] border border-[#D9CAD5] rounded-[3px]">
                <p className="text-[11px] text-[#714B67]">Coverage</p>
                <p className="text-base font-bold text-[#714B67] mt-0.5">{viewingBooth.progress_percentage}%</p>
              </div>
            </div>

            <div className="pt-2">
              <h4 className="font-semibold text-[#212529] mb-1.5 text-xs">Assigned Field Volunteers</h4>
              <div className="space-y-1.5">
                {viewingBooth.assigned_volunteers?.map((vol) => (
                  <div
                    key={vol.id}
                    className="p-2 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[3px] flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-[#212529]">{vol.name}</p>
                      <p className="text-[#6C757D] font-mono text-[11px]">{vol.mobile}</p>
                    </div>
                    <Badge status={vol.status} size="sm" />
                  </div>
                ))}
                {(!viewingBooth.assigned_volunteers || viewingBooth.assigned_volunteers.length === 0) && (
                  <p className="text-xs text-[#6C757D] italic py-2">
                    No field volunteers currently assigned to this booth.
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
