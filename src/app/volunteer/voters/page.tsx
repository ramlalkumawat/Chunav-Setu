"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { Voter } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Users,
  Search,
  Phone,
  MapPin,
  PlusCircle,
  CheckCircle2,
  Filter,
} from "lucide-react";

export default function VolunteerVotersPage() {
  const router = useRouter();
  const { client, volunteer } = useAuth();
  const clientId = client?.id || "client-1";

  const [voters, setVoters] = useState<Voter[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    // Only fetch voters within client tenant and preferably in volunteer's assigned booth
    const all = dbService.getVoters(clientId, { pageSize: 500 }).data;
    setVoters(all);
  }, [clientId]);

  const filteredVoters = voters.filter((v) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "uncontacted" ? v.contact_status === "uncontacted" : v.contact_status !== "uncontacted");

    const matchesSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.voter_id_card.toLowerCase().includes(search.toLowerCase()) ||
      (v.mobile && v.mobile.includes(search)) ||
      (v.address && v.address.toLowerCase().includes(search.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-[#172033]">Assigned Voter List</h1>
        <p className="text-xs text-[#64748B]">
          {volunteer?.assigned_booth_name || "Booth 101"} • Tap any voter to record survey
        </p>
      </div>

      {/* Search and Status Pills */}
      <div className="space-y-2">
        <Input
          placeholder="Search voter name, EPIC, mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
              statusFilter === "all"
                ? "bg-[#1F3A5F] text-white font-bold"
                : "bg-white border border-[#E5E2DC] text-[#64748B]"
            }`}
          >
            All Voters ({voters.length})
          </button>
          <button
            onClick={() => setStatusFilter("uncontacted")}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
              statusFilter === "uncontacted"
                ? "bg-[#1F3A5F] text-white font-bold"
                : "bg-white border border-[#E5E2DC] text-[#64748B]"
            }`}
          >
            Uncontacted ({voters.filter((v) => v.contact_status === "uncontacted").length})
          </button>
          <button
            onClick={() => setStatusFilter("contacted")}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
              statusFilter === "contacted"
                ? "bg-[#1F3A5F] text-white font-bold"
                : "bg-white border border-[#E5E2DC] text-[#64748B]"
            }`}
          >
            Contacted ({voters.filter((v) => v.contact_status !== "uncontacted").length})
          </button>
        </div>
      </div>

      {/* Voters List */}
      <div className="space-y-2.5">
        {filteredVoters.map((voter) => (
          <div
            key={voter.id}
            onClick={() => router.push(`/volunteer/survey?voterId=${voter.id}`)}
            className="p-3 bg-white border border-[#E5E2DC] hover:border-[#1F3A5F] rounded-xl shadow-card active:scale-[0.99] transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[#172033] truncate">
                    {voter.name}
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FAFAF8] text-[#64748B] border border-[#E5E2DC]">
                    {voter.voter_id_card}
                  </span>
                </div>

                <p className="text-xs text-[#64748B] mt-1">
                  {voter.age ? `${voter.age} yrs` : ""} • {voter.gender || ""} • {voter.booth_number}
                </p>

                {voter.address && (
                  <p className="text-[11px] text-[#64748B] mt-0.5 truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span>{voter.address}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <Badge status={voter.contact_status} size="sm" />
                <span className="text-[10px] text-[#1F3A5F] font-bold flex items-center gap-1">
                  <PlusCircle className="w-3 h-3" />
                  <span>Survey</span>
                </span>
              </div>
            </div>
          </div>
        ))}

        {filteredVoters.length === 0 && (
          <Card padding="lg" className="text-center py-10">
            <Users className="w-8 h-8 text-[#64748B] mx-auto mb-2 opacity-50" />
            <p className="text-xs font-semibold text-[#172033]">No voters matching filters</p>
          </Card>
        )}
      </div>
    </div>
  );
}
