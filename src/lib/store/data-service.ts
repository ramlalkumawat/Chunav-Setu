import {
  UserProfile,
  Client,
  Campaign,
  Area,
  Booth,
  Volunteer,
  Voter,
  Task,
  FieldActivity,
  FollowUp,
  Subscription,
  AuditLog,
  PaginatedResult,
  PollingDay,
  PollingDayUpdate,
  PollingDayFollowUp,
  PollingDayBoothStats,
  PollingDayVolunteerStats,
  PollingDayDashboardStats,
  PollingVoterStatus,
  UserRole,
  CommunicationChannel,
  CommunicationAction,
  CallOutcome,
  CommunicationLog,
  PollingSlipRecord,
  CommunicationSummaryStats,
  FileAsset,
} from "../types";
import {
  INITIAL_PROFILES,
  INITIAL_CLIENTS,
  INITIAL_CAMPAIGNS,
  INITIAL_AREAS,
  INITIAL_BOOTHS,
  INITIAL_VOLUNTEERS,
  INITIAL_VOTERS,
  INITIAL_TASKS,
  INITIAL_FIELD_ACTIVITIES,
  INITIAL_FOLLOW_UPS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_POLLING_DAYS,
  INITIAL_POLLING_UPDATES,
  INITIAL_POLLING_FOLLOWUPS,
  INITIAL_COMMUNICATION_LOGS,
  INITIAL_POLLING_SLIPS,
  INITIAL_FILE_ASSETS,
} from "./mock-data";

const STORAGE_KEYS = {
  PROFILES: "chunav_profiles",
  CLIENTS: "chunav_clients",
  CAMPAIGNS: "chunav_campaigns",
  AREAS: "chunav_areas",
  BOOTHS: "chunav_booths",
  VOLUNTEERS: "chunav_volunteers",
  VOTERS: "chunav_voters",
  TASKS: "chunav_tasks",
  FIELD_ACTIVITIES: "chunav_field_activities",
  FOLLOW_UPS: "chunav_follow_ups",
  SUBSCRIPTIONS: "chunav_subscriptions",
  AUDIT_LOGS: "chunav_audit_logs",
  POLLING_DAYS: "chunav_polling_days",
  POLLING_UPDATES: "chunav_polling_updates",
  POLLING_FOLLOWUPS: "chunav_polling_followups",
  COMMUNICATION_LOGS: "chunav_communication_logs",
  POLLING_SLIPS: "chunav_polling_slips",
  FILE_ASSETS: "chunav_file_assets",
};

class DataService {
  private isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  private getItem<T>(key: string, defaultValue: T): T {
    if (!this.isBrowser()) return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Error saving to localStorage [${key}]:`, err);
    }
  }

  public resetToSeed(): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(INITIAL_PROFILES));
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(INITIAL_CAMPAIGNS));
    localStorage.setItem(STORAGE_KEYS.AREAS, JSON.stringify(INITIAL_AREAS));
    localStorage.setItem(STORAGE_KEYS.BOOTHS, JSON.stringify(INITIAL_BOOTHS));
    localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(INITIAL_VOLUNTEERS));
    localStorage.setItem(STORAGE_KEYS.VOTERS, JSON.stringify(INITIAL_VOTERS));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
    localStorage.setItem(STORAGE_KEYS.FIELD_ACTIVITIES, JSON.stringify(INITIAL_FIELD_ACTIVITIES));
    localStorage.setItem(STORAGE_KEYS.FOLLOW_UPS, JSON.stringify(INITIAL_FOLLOW_UPS));
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(INITIAL_SUBSCRIPTIONS));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    localStorage.setItem(STORAGE_KEYS.POLLING_DAYS, JSON.stringify(INITIAL_POLLING_DAYS));
    localStorage.setItem(STORAGE_KEYS.POLLING_UPDATES, JSON.stringify(INITIAL_POLLING_UPDATES));
    localStorage.setItem(STORAGE_KEYS.POLLING_FOLLOWUPS, JSON.stringify(INITIAL_POLLING_FOLLOWUPS));
    localStorage.setItem(STORAGE_KEYS.COMMUNICATION_LOGS, JSON.stringify(INITIAL_COMMUNICATION_LOGS));
    localStorage.setItem(STORAGE_KEYS.POLLING_SLIPS, JSON.stringify(INITIAL_POLLING_SLIPS));
    localStorage.setItem(STORAGE_KEYS.FILE_ASSETS, JSON.stringify(INITIAL_FILE_ASSETS));
  }

  // -------------------------------------------------------------------
  // AUDIT LOGGING
  // -------------------------------------------------------------------
  public logAction(
    actor: { id?: string; name: string },
    action: string,
    targetType: string,
    targetId?: string,
    details?: Record<string, any>,
    clientId?: string
  ): void {
    const logs = this.getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      client_id: clientId,
      actor_id: actor.id,
      actor_name: actor.name,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
      created_at: new Date().toISOString(),
    };
    logs.unshift(newLog);
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 200)); // Keep recent 200
  }

  public getAuditLogs(clientId?: string): AuditLog[] {
    const logs = this.getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    if (!clientId) return logs;
    return logs.filter((l) => l.client_id === clientId || !l.client_id);
  }

  // -------------------------------------------------------------------
  // PROFILES / USERS
  // -------------------------------------------------------------------
  public getProfiles(clientId?: string): UserProfile[] {
    const profiles = this.getItem<UserProfile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    if (!clientId) return profiles;
    return profiles.filter((p) => p.client_id === clientId);
  }

  public getProfileById(id: string): UserProfile | undefined {
    const profiles = this.getProfiles();
    return profiles.find((p) => p.id === id);
  }

  // -------------------------------------------------------------------
  // CLIENTS (SUPER ADMIN)
  // -------------------------------------------------------------------
  public getClients(): Client[] {
    const clients = this.getItem<Client[]>(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
    const voters = this.getItem<Voter[]>(STORAGE_KEYS.VOTERS, INITIAL_VOTERS);
    const volunteers = this.getItem<Volunteer[]>(STORAGE_KEYS.VOLUNTEERS, INITIAL_VOLUNTEERS);
    const booths = this.getItem<Booth[]>(STORAGE_KEYS.BOOTHS, INITIAL_BOOTHS);

    return clients.map((c) => ({
      ...c,
      voter_count: voters.filter((v) => v.client_id === c.id).length,
      volunteer_count: volunteers.filter((v) => v.client_id === c.id).length,
      booth_count: booths.filter((b) => b.client_id === c.id).length,
    }));
  }

  public getClientById(id: string): Client | undefined {
    return this.getClients().find((c) => c.id === id);
  }

  public createClient(clientData: Omit<Client, "id" | "created_at">): Client {
    const clients = this.getItem<Client[]>(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
    const newId = `client-${Date.now()}`;
    const newClient: Client = {
      ...clientData,
      id: newId,
      created_at: new Date().toISOString(),
      status: clientData.status || "active",
      voter_count: 0,
      volunteer_count: 0,
      booth_count: 0,
      campaign_count: 1,
    };
    clients.unshift(newClient);
    this.setItem(STORAGE_KEYS.CLIENTS, clients);

    // Also auto-create default campaign for this client
    const campaigns = this.getItem<Campaign[]>(STORAGE_KEYS.CAMPAIGNS, INITIAL_CAMPAIGNS);
    const newCampaign: Campaign = {
      id: `camp-${Date.now()}`,
      client_id: newId,
      title: `${clientData.candidate_name} Campaign 2026`,
      description: `Official campaign for ${clientData.election_type} - ${clientData.location}`,
      target_voters: 50000,
      status: "active",
      created_at: new Date().toISOString(),
    };
    campaigns.push(newCampaign);
    this.setItem(STORAGE_KEYS.CAMPAIGNS, campaigns);

    // Create client admin user profile
    const profiles = this.getItem<UserProfile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    profiles.push({
      id: `user-${newId}`,
      email: clientData.email,
      full_name: clientData.candidate_name,
      role: "client_admin",
      client_id: newId,
      mobile: clientData.mobile,
      status: "active",
      created_at: new Date().toISOString(),
    });
    this.setItem(STORAGE_KEYS.PROFILES, profiles);

    // Auto-create initial subscription
    const subscriptions = this.getItem<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
    const validDate = new Date();
    validDate.setFullYear(validDate.getFullYear() + 1);
    subscriptions.push({
      id: `sub-${newId}`,
      client_id: newId,
      client_name: clientData.name,
      plan_name: "assembly_pro",
      max_voters: 150000,
      max_volunteers: 100,
      status: "active",
      valid_until: validDate.toISOString(),
      created_at: new Date().toISOString(),
    });
    this.setItem(STORAGE_KEYS.SUBSCRIPTIONS, subscriptions);

    return newClient;
  }

  public updateClient(id: string, updates: Partial<Client>): Client | null {
    const clients = this.getItem<Client[]>(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
    const index = clients.findIndex((c) => c.id === id);
    if (index === -1) return null;

    clients[index] = {
      ...clients[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.CLIENTS, clients);
    return clients[index];
  }

  public updateCandidatePoster(clientId: string, posterUrl: string, posterAlt?: string): Client | null {
    const client = this.updateClient(clientId, {
      poster_url: posterUrl,
      poster_alt: posterAlt || "Official Candidate Campaign Poster",
    });
    if (client) {
      this.logAction(
        { name: "Super Admin" },
        "POSTER_UPDATED",
        "CandidateBranding",
        clientId,
        { poster_url: posterUrl },
        clientId
      );
    }
    return client;
  }

  public resetCandidateCredentials(clientId: string, newPassword?: string): { success: boolean; tempPassword: string } {
    const client = this.getClientById(clientId);
    const generatedPassword = newPassword || `Setu@${Math.floor(1000 + Math.random() * 9000)}`;
    if (client) {
      this.updateClient(clientId, { password: generatedPassword });
      this.logAction(
        { name: "Super Admin" },
        "CREDENTIALS_RESET",
        "CandidateAccount",
        clientId,
        { candidate: client.candidate_name },
        clientId
      );
    }
    return { success: !!client, tempPassword: generatedPassword };
  }

  // -------------------------------------------------------------------
  // CAMPAIGNS
  // -------------------------------------------------------------------
  public getCampaigns(clientId?: string): Campaign[] {
    const campaigns = this.getItem<Campaign[]>(STORAGE_KEYS.CAMPAIGNS, INITIAL_CAMPAIGNS);
    if (!clientId) return campaigns;
    return campaigns.filter((c) => c.client_id === clientId);
  }

  // -------------------------------------------------------------------
  // AREAS
  // -------------------------------------------------------------------
  public getAreas(clientId: string): Area[] {
    const areas = this.getItem<Area[]>(STORAGE_KEYS.AREAS, INITIAL_AREAS);
    const booths = this.getItem<Booth[]>(STORAGE_KEYS.BOOTHS, INITIAL_BOOTHS);
    const voters = this.getItem<Voter[]>(STORAGE_KEYS.VOTERS, INITIAL_VOTERS);

    return areas
      .filter((a) => a.client_id === clientId)
      .map((a) => ({
        ...a,
        booth_count: booths.filter((b) => b.area_id === a.id).length,
        voter_count: voters.filter((v) => v.area_id === a.id).length,
      }));
  }

  public createArea(areaData: Omit<Area, "id" | "created_at">): Area {
    const areas = this.getItem<Area[]>(STORAGE_KEYS.AREAS, INITIAL_AREAS);
    const newArea: Area = {
      ...areaData,
      id: `area-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    areas.push(newArea);
    this.setItem(STORAGE_KEYS.AREAS, areas);
    return newArea;
  }

  // -------------------------------------------------------------------
  // BOOTHS
  // -------------------------------------------------------------------
  public getBooths(clientId: string): Booth[] {
    const booths = this.getItem<Booth[]>(STORAGE_KEYS.BOOTHS, INITIAL_BOOTHS);
    const voters = this.getItem<Voter[]>(STORAGE_KEYS.VOTERS, INITIAL_VOTERS);
    const volunteers = this.getItem<Volunteer[]>(STORAGE_KEYS.VOLUNTEERS, INITIAL_VOLUNTEERS);
    const areas = this.getItem<Area[]>(STORAGE_KEYS.AREAS, INITIAL_AREAS);

    return booths
      .filter((b) => b.client_id === clientId)
      .map((b) => {
        const boothVoters = voters.filter((v) => v.booth_id === b.id);
        const contactedVoters = boothVoters.filter((v) => v.contact_status !== "uncontacted");
        const assignedVols = volunteers.filter((vol) => vol.assigned_booth_id === b.id);
        const area = areas.find((a) => a.id === b.area_id);
        const progress = boothVoters.length > 0 ? Math.round((contactedVoters.length / boothVoters.length) * 100) : 0;

        return {
          ...b,
          area_name: area ? area.name : b.area_name || "Unassigned",
          voter_count: boothVoters.length,
          contacted_count: contactedVoters.length,
          assigned_volunteers_count: assignedVols.length,
          assigned_volunteers: assignedVols,
          progress_percentage: progress,
        };
      });
  }

  public getBoothById(clientId: string, boothId: string): Booth | undefined {
    return this.getBooths(clientId).find((b) => b.id === boothId);
  }

  public createBooth(boothData: Omit<Booth, "id" | "created_at">): Booth {
    const booths = this.getItem<Booth[]>(STORAGE_KEYS.BOOTHS, INITIAL_BOOTHS);
    const newBooth: Booth = {
      ...boothData,
      id: `booth-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    booths.push(newBooth);
    this.setItem(STORAGE_KEYS.BOOTHS, booths);
    return newBooth;
  }

  public updateBooth(clientId: string, boothId: string, updates: Partial<Booth>): Booth | null {
    const booths = this.getItem<Booth[]>(STORAGE_KEYS.BOOTHS, INITIAL_BOOTHS);
    const index = booths.findIndex((b) => b.id === boothId && b.client_id === clientId);
    if (index === -1) return null;

    booths[index] = {
      ...booths[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.BOOTHS, booths);
    return booths[index];
  }

  // -------------------------------------------------------------------
  // VOLUNTEERS
  // -------------------------------------------------------------------
  public getVolunteers(clientId: string): Volunteer[] {
    const volunteers = this.getItem<Volunteer[]>(STORAGE_KEYS.VOLUNTEERS, INITIAL_VOLUNTEERS);
    const booths = this.getItem<Booth[]>(STORAGE_KEYS.BOOTHS, INITIAL_BOOTHS);
    const areas = this.getItem<Area[]>(STORAGE_KEYS.AREAS, INITIAL_AREAS);
    const tasks = this.getItem<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    const activities = this.getItem<FieldActivity[]>(STORAGE_KEYS.FIELD_ACTIVITIES, INITIAL_FIELD_ACTIVITIES);

    return volunteers
      .filter((v) => v.client_id === clientId)
      .map((v) => {
        const booth = booths.find((b) => b.id === v.assigned_booth_id);
        const area = areas.find((a) => a.id === v.assigned_area_id);
        const volTasks = tasks.filter((t) => t.volunteer_id === v.id);
        const volActivities = activities.filter((a) => a.volunteer_id === v.id);

        return {
          ...v,
          assigned_booth_name: booth ? `${booth.booth_number} (${booth.booth_name})` : "None",
          assigned_area_name: area ? area.name : "None",
          total_contacts: volActivities.length,
          pending_tasks: volTasks.filter((t) => t.status === "pending" || t.status === "in_progress").length,
          completed_tasks: volTasks.filter((t) => t.status === "completed").length,
        };
      });
  }

  public getVolunteerById(clientId: string, id: string): Volunteer | undefined {
    return this.getVolunteers(clientId).find((v) => v.id === id);
  }

  public createVolunteer(volunteerData: Omit<Volunteer, "id" | "created_at">): Volunteer {
    const volunteers = this.getItem<Volunteer[]>(STORAGE_KEYS.VOLUNTEERS, INITIAL_VOLUNTEERS);
    const newId = `vol-${Date.now()}`;
    const newVolunteer: Volunteer = {
      ...volunteerData,
      id: newId,
      created_at: new Date().toISOString(),
      status: volunteerData.status || "active",
      joining_date: volunteerData.joining_date || new Date().toISOString().split("T")[0],
    };
    volunteers.push(newVolunteer);
    this.setItem(STORAGE_KEYS.VOLUNTEERS, volunteers);

    // Also register volunteer user profile
    const profiles = this.getItem<UserProfile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    profiles.push({
      id: `user-${newId}`,
      email: volunteerData.email || `${newVolunteer.name.toLowerCase().replace(/\s+/g, ".")}@chunavsetu.com`,
      full_name: volunteerData.name,
      role: "volunteer",
      client_id: volunteerData.client_id,
      mobile: volunteerData.mobile,
      status: "active",
      created_at: new Date().toISOString(),
    });
    this.setItem(STORAGE_KEYS.PROFILES, profiles);

    return newVolunteer;
  }

  public updateVolunteer(clientId: string, id: string, updates: Partial<Volunteer>): Volunteer | null {
    const volunteers = this.getItem<Volunteer[]>(STORAGE_KEYS.VOLUNTEERS, INITIAL_VOLUNTEERS);
    const index = volunteers.findIndex((v) => v.id === id && v.client_id === clientId);
    if (index === -1) return null;

    volunteers[index] = {
      ...volunteers[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.VOLUNTEERS, volunteers);
    return volunteers[index];
  }

  // -------------------------------------------------------------------
  // VOTERS (SERVER-SIDE FILTERING & PAGINATION)
  // -------------------------------------------------------------------
  public getVoters(
    clientId: string,
    filters?: {
      search?: string;
      boothId?: string;
      areaId?: string;
      contactStatus?: string;
      gender?: string;
      page?: number;
      pageSize?: number;
    }
  ): PaginatedResult<Voter> {
    const voters = this.getItem<Voter[]>(STORAGE_KEYS.VOTERS, INITIAL_VOTERS);
    const booths = this.getItem<Booth[]>(STORAGE_KEYS.BOOTHS, INITIAL_BOOTHS);
    const areas = this.getItem<Area[]>(STORAGE_KEYS.AREAS, INITIAL_AREAS);

    // Filter strictly by client tenant
    let filtered = voters.filter((v) => v.client_id === clientId);

    // Apply Search
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.voter_id_card.toLowerCase().includes(q) ||
          (v.mobile && v.mobile.includes(q)) ||
          (v.address && v.address.toLowerCase().includes(q))
      );
    }

    // Filters
    if (filters?.boothId && filters.boothId !== "all") {
      filtered = filtered.filter((v) => v.booth_id === filters.boothId);
    }

    if (filters?.areaId && filters.areaId !== "all") {
      filtered = filtered.filter((v) => v.area_id === filters.areaId);
    }

    if (filters?.contactStatus && filters.contactStatus !== "all") {
      filtered = filtered.filter((v) => v.contact_status === filters.contactStatus);
    }

    if (filters?.gender && filters.gender !== "all") {
      filtered = filtered.filter((v) => v.gender === filters.gender);
    }

    const total = filtered.length;
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 10;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const offset = (page - 1) * pageSize;
    const pagedData = filtered.slice(offset, offset + pageSize);

    // Hydrate area and booth names
    const enrichedData = pagedData.map((v) => {
      const booth = booths.find((b) => b.id === v.booth_id);
      const area = areas.find((a) => a.id === v.area_id);
      return {
        ...v,
        booth_name: booth ? booth.booth_name : v.booth_name,
        booth_number: booth ? booth.booth_number : v.booth_number,
        area_name: area ? area.name : v.area_name,
      };
    });

    return {
      data: enrichedData,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  public getVoterById(clientId: string, id: string): Voter | undefined {
    const voters = this.getItem<Voter[]>(STORAGE_KEYS.VOTERS, INITIAL_VOTERS);
    return voters.find((v) => v.id === id && v.client_id === clientId);
  }

  public createVoter(voterData: Omit<Voter, "id" | "created_at">): Voter {
    const voters = this.getItem<Voter[]>(STORAGE_KEYS.VOTERS, INITIAL_VOTERS);
    const newVoter: Voter = {
      ...voterData,
      id: `voter-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      created_at: new Date().toISOString(),
      contact_status: voterData.contact_status || "uncontacted",
      follow_up_status: voterData.follow_up_status || "none",
    };
    voters.unshift(newVoter);
    this.setItem(STORAGE_KEYS.VOTERS, voters);
    return newVoter;
  }

  public batchCreateVoters(
    clientId: string,
    campaignId: string,
    votersList: Omit<Voter, "id" | "created_at" | "client_id" | "campaign_id">[]
  ): { inserted: number; skipped: number } {
    return this.batchImportVoters(clientId, votersList, { campaignId });
  }

  public batchImportVoters(
    clientId: string,
    votersList: Partial<Voter>[],
    options?: { campaignId?: string; defaultBoothId?: string; defaultAreaId?: string }
  ): {
    total: number;
    inserted: number;
    duplicates: number;
    invalid: number;
    skipped: number;
    records: Voter[];
  } {
    const existingVoters = this.getItem<Voter[]>(STORAGE_KEYS.VOTERS, INITIAL_VOTERS);
    const existingCardSet = new Set(
      existingVoters.filter((v) => v.client_id === clientId).map((v) => v.voter_id_card.trim().toUpperCase())
    );

    const client = this.getClientById(clientId);
    const campaignId = options?.campaignId || client?.campaign_name || "camp-1";
    const booths = this.getBooths(clientId);
    const areas = this.getAreas(clientId);

    let total = votersList.length;
    let inserted = 0;
    let duplicates = 0;
    let invalid = 0;
    let skipped = 0;

    const newVotersToAdd: Voter[] = [];

    votersList.forEach((v) => {
      const card = v.voter_id_card ? v.voter_id_card.trim().toUpperCase() : "";
      const name = v.name ? v.name.trim() : "";

      if (!card || !name) {
        invalid++;
        skipped++;
        return;
      }

      if (existingCardSet.has(card)) {
        duplicates++;
        skipped++;
        return;
      }

      existingCardSet.add(card);

      const boothId = v.booth_id || options?.defaultBoothId || (booths[0] ? booths[0].id : "booth-101");
      const areaId = v.area_id || options?.defaultAreaId || (areas[0] ? areas[0].id : "area-1");
      const matchedBooth = booths.find((b) => b.id === boothId);
      const matchedArea = areas.find((a) => a.id === areaId);

      const createdVoter: Voter = {
        id: `voter-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        client_id: clientId,
        campaign_id: campaignId,
        voter_id_card: card,
        name: name,
        mobile: v.mobile?.trim(),
        age: typeof v.age === "number" ? v.age : v.age ? parseInt(String(v.age), 10) || undefined : undefined,
        gender: v.gender || "Unknown",
        address: v.address?.trim() || "",
        booth_id: boothId,
        booth_number: matchedBooth?.booth_number || v.booth_number || "Booth 101",
        booth_name: matchedBooth?.booth_name || v.booth_name || "Govt School",
        area_id: areaId,
        area_name: matchedArea?.name || v.area_name || "Main Area",
        contact_status: (v.contact_status as any) || "uncontacted",
        follow_up_status: (v.follow_up_status as any) || "none",
        notes: v.notes || "",
        created_at: new Date().toISOString(),
      };

      newVotersToAdd.push(createdVoter);
      inserted++;
    });

    if (newVotersToAdd.length > 0) {
      this.setItem(STORAGE_KEYS.VOTERS, [...newVotersToAdd, ...existingVoters]);
      this.logAction(
        { name: "Admin/Import" },
        "VOTER_LIST_IMPORTED",
        "VoterRoll",
        clientId,
        { total, inserted, duplicates, invalid },
        clientId
      );
    }

    return {
      total,
      inserted,
      duplicates,
      invalid,
      skipped,
      records: newVotersToAdd,
    };
  }

  public getVotersForVolunteer(
    clientId: string,
    volunteerId: string,
    filters?: {
      search?: string;
      contactStatus?: string;
      page?: number;
      pageSize?: number;
    }
  ): PaginatedResult<Voter> {
    const volunteer = this.getVolunteerById(clientId, volunteerId);
    return this.getVoters(clientId, {
      ...filters,
      boothId: volunteer?.assigned_booth_id || "booth-101",
    });
  }

  public updateVoter(clientId: string, id: string, updates: Partial<Voter>): Voter | null {
    const voters = this.getItem<Voter[]>(STORAGE_KEYS.VOTERS, INITIAL_VOTERS);
    const index = voters.findIndex((v) => v.id === id && v.client_id === clientId);
    if (index === -1) return null;

    voters[index] = {
      ...voters[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.VOTERS, voters);
    return voters[index];
  }

  public deleteVoter(clientId: string, id: string): boolean {
    const voters = this.getItem<Voter[]>(STORAGE_KEYS.VOTERS, INITIAL_VOTERS);
    const filtered = voters.filter((v) => !(v.id === id && v.client_id === clientId));
    if (filtered.length === voters.length) return false;
    this.setItem(STORAGE_KEYS.VOTERS, filtered);
    return true;
  }

  // -------------------------------------------------------------------
  // TASKS
  // -------------------------------------------------------------------
  public getTasks(clientId: string, volunteerId?: string): Task[] {
    const tasks = this.getItem<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    let clientTasks = tasks.filter((t) => t.client_id === clientId);
    if (volunteerId) {
      clientTasks = clientTasks.filter((t) => t.volunteer_id === volunteerId);
    }
    return clientTasks;
  }

  public createTask(taskData: Omit<Task, "id" | "created_at">): Task {
    const tasks = this.getItem<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: taskData.status || "pending",
      priority: taskData.priority || "medium",
    };
    tasks.unshift(newTask);
    this.setItem(STORAGE_KEYS.TASKS, tasks);
    return newTask;
  }

  public updateTask(clientId: string, id: string, updates: Partial<Task>): Task | null {
    const tasks = this.getItem<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    const index = tasks.findIndex((t) => t.id === id && t.client_id === clientId);
    if (index === -1) return null;

    tasks[index] = {
      ...tasks[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.TASKS, tasks);
    return tasks[index];
  }

  // -------------------------------------------------------------------
  // FIELD ACTIVITIES (DOOR-TO-DOOR)
  // -------------------------------------------------------------------
  public getFieldActivities(clientId: string, volunteerId?: string): FieldActivity[] {
    const activities = this.getItem<FieldActivity[]>(STORAGE_KEYS.FIELD_ACTIVITIES, INITIAL_FIELD_ACTIVITIES);
    let list = activities.filter((a) => a.client_id === clientId);
    if (volunteerId) {
      list = list.filter((a) => a.volunteer_id === volunteerId);
    }
    return list;
  }

  public recordFieldActivity(
    activityData: Omit<FieldActivity, "id" | "created_at">,
    voterUpdates?: {
      contact_status: Voter["contact_status"];
      notes?: string;
      follow_up?: { scheduled_date: string; note: string; priority: Task["priority"] };
    }
  ): FieldActivity {
    const activities = this.getItem<FieldActivity[]>(STORAGE_KEYS.FIELD_ACTIVITIES, INITIAL_FIELD_ACTIVITIES);
    const newActivity: FieldActivity = {
      ...activityData,
      id: `act-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    activities.unshift(newActivity);
    this.setItem(STORAGE_KEYS.FIELD_ACTIVITIES, activities);

    // Update voter status
    if (voterUpdates) {
      const followUpStatus = voterUpdates.follow_up ? "pending" : undefined;
      this.updateVoter(activityData.client_id, activityData.voter_id, {
        contact_status: voterUpdates.contact_status,
        notes: voterUpdates.notes,
        follow_up_status: followUpStatus,
        last_contacted_by: activityData.volunteer_name,
        last_contacted_at: new Date().toISOString(),
      });

      // If follow-up scheduled, create follow-up record
      if (voterUpdates.follow_up) {
        this.createFollowUp({
          client_id: activityData.client_id,
          campaign_id: activityData.campaign_id,
          voter_id: activityData.voter_id,
          voter_name: activityData.voter_name,
          volunteer_id: activityData.volunteer_id,
          volunteer_name: activityData.volunteer_name,
          scheduled_date: voterUpdates.follow_up.scheduled_date,
          priority: voterUpdates.follow_up.priority || "medium",
          status: "pending",
          note: voterUpdates.follow_up.note,
        });
      }
    }

    return newActivity;
  }

  // -------------------------------------------------------------------
  // FOLLOW-UPS
  // -------------------------------------------------------------------
  public getFollowUps(clientId: string, volunteerId?: string): FollowUp[] {
    const followUps = this.getItem<FollowUp[]>(STORAGE_KEYS.FOLLOW_UPS, INITIAL_FOLLOW_UPS);
    let list = followUps.filter((f) => f.client_id === clientId);
    if (volunteerId) {
      list = list.filter((f) => f.volunteer_id === volunteerId);
    }
    return list;
  }

  public createFollowUp(data: Omit<FollowUp, "id" | "created_at">): FollowUp {
    const followUps = this.getItem<FollowUp[]>(STORAGE_KEYS.FOLLOW_UPS, INITIAL_FOLLOW_UPS);
    const newFollowUp: FollowUp = {
      ...data,
      id: `fup-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: data.status || "pending",
      priority: data.priority || "medium",
    };
    followUps.unshift(newFollowUp);
    this.setItem(STORAGE_KEYS.FOLLOW_UPS, followUps);
    return newFollowUp;
  }

  public updateFollowUp(clientId: string, id: string, updates: Partial<FollowUp>): FollowUp | null {
    const followUps = this.getItem<FollowUp[]>(STORAGE_KEYS.FOLLOW_UPS, INITIAL_FOLLOW_UPS);
    const index = followUps.findIndex((f) => f.id === id && f.client_id === clientId);
    if (index === -1) return null;

    followUps[index] = {
      ...followUps[index],
      ...updates,
      updated_at: new Date().toISOString(),
      resolved_at: updates.status === "completed" ? new Date().toISOString() : followUps[index].resolved_at,
    };
    this.setItem(STORAGE_KEYS.FOLLOW_UPS, followUps);
    return followUps[index];
  }

  // -------------------------------------------------------------------
  // SUBSCRIPTIONS
  // -------------------------------------------------------------------
  public getSubscriptions(): Subscription[] {
    return this.getItem<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
  }

  // -------------------------------------------------------------------
  // DASHBOARD KPI AGGREGATIONS
  // -------------------------------------------------------------------
  public getClientDashboardStats(clientId: string) {
    const voters = this.getItem<Voter[]>(STORAGE_KEYS.VOTERS, INITIAL_VOTERS).filter((v) => v.client_id === clientId);
    const booths = this.getBooths(clientId);
    const volunteers = this.getVolunteers(clientId);
    const tasks = this.getTasks(clientId);
    const followUps = this.getFollowUps(clientId);
    const activities = this.getFieldActivities(clientId);

    const totalVoters = voters.length;
    const contactedVoters = voters.filter((v) => v.contact_status !== "uncontacted").length;
    const pendingContact = totalVoters - contactedVoters;
    const favorableCount = voters.filter((v) => v.contact_status === "favorable").length;
    const unfavorableCount = voters.filter((v) => v.contact_status === "unfavorable").length;
    const undecidedCount = voters.filter((v) => v.contact_status === "undecided").length;

    const pendingFollowUps = followUps.filter((f) => f.status === "pending").length;
    const pendingTasks = tasks.filter((t) => t.status === "pending" || t.status === "in_progress").length;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;

    const todayStr = new Date().toISOString().split("T")[0];
    const todaysFollowUps = followUps.filter((f) => f.scheduled_date <= todayStr && f.status === "pending");

    return {
      totalVoters,
      totalBooths: booths.length,
      totalVolunteers: volunteers.length,
      contacted: contactedVoters,
      pendingContact,
      contactPercentage: totalVoters > 0 ? Math.round((contactedVoters / totalVoters) * 100) : 0,
      favorableCount,
      unfavorableCount,
      undecidedCount,
      pendingFollowUps,
      todaysFollowUps,
      pendingTasks,
      completedTasks,
      recentActivities: activities.slice(0, 6),
      boothBreakdown: booths.map((b) => ({
        name: b.booth_number,
        fullName: b.booth_name,
        voters: b.voter_count || 0,
        contacted: b.contacted_count || 0,
        progress: b.progress_percentage || 0,
      })),
      statusDistribution: [
        { name: "Favorable", value: favorableCount, color: "#2F6B4F" },
        { name: "Undecided", value: undecidedCount, color: "#B7791F" },
        { name: "Unfavorable", value: unfavorableCount, color: "#B94A48" },
        { name: "Uncontacted", value: pendingContact, color: "#64748B" },
      ],
    };
  }

  public getSuperAdminStats() {
    const clients = this.getClients();
    const voters = this.getItem<Voter[]>(STORAGE_KEYS.VOTERS, INITIAL_VOTERS);
    const volunteers = this.getItem<Volunteer[]>(STORAGE_KEYS.VOLUNTEERS, INITIAL_VOLUNTEERS);
    const campaigns = this.getItem<Campaign[]>(STORAGE_KEYS.CAMPAIGNS, INITIAL_CAMPAIGNS);
    const pollingDays = this.getItem<PollingDay[]>(STORAGE_KEYS.POLLING_DAYS, INITIAL_POLLING_DAYS);
    const pollingUpdates = this.getItem<PollingDayUpdate[]>(STORAGE_KEYS.POLLING_UPDATES, INITIAL_POLLING_UPDATES);
    const activities = this.getItem<FieldActivity[]>(STORAGE_KEYS.FIELD_ACTIVITIES, INITIAL_FIELD_ACTIVITIES);

    return {
      totalClients: clients.length,
      activeClients: clients.filter((c) => c.status === "active").length,
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c) => c.status === "active").length,
      totalVolunteers: volunteers.length,
      totalVoters: voters.length,
      totalActivities: activities.length,
      activePollingCampaigns: pollingDays.filter((p) => p.status === "active").length || 1,
      totalPollingUpdates: pollingUpdates.length,
      clientsList: clients,
      recentLogs: this.getAuditLogs().slice(0, 10),
      recentPollingUpdates: pollingUpdates.slice(0, 8),
    };
  }

  public getVolunteerDashboardStats(clientId: string, volunteerId: string) {
    const volunteer = this.getVolunteerById(clientId, volunteerId);
    const voters = this.getItem<Voter[]>(STORAGE_KEYS.VOTERS, INITIAL_VOTERS).filter(
      (v) => v.client_id === clientId && (v.booth_id === volunteer?.assigned_booth_id || !volunteer?.assigned_booth_id)
    );
    const myTasks = this.getTasks(clientId, volunteerId);
    const myFollowUps = this.getFollowUps(clientId, volunteerId);
    const myActivities = this.getFieldActivities(clientId, volunteerId);

    const totalAssignedVoters = voters.length;
    const contactedVoters = voters.filter((v) => v.contact_status !== "uncontacted").length;
    const pendingVoters = totalAssignedVoters - contactedVoters;

    const todayStr = new Date().toISOString().split("T")[0];
    const todayFollowUps = myFollowUps.filter((f) => f.scheduled_date <= todayStr && f.status === "pending");

    return {
      volunteer,
      totalAssignedVoters,
      contactedVoters,
      pendingVoters,
      progressPercentage: totalAssignedVoters > 0 ? Math.round((contactedVoters / totalAssignedVoters) * 100) : 0,
      pendingTasks: myTasks.filter((t) => t.status !== "completed"),
      todayFollowUps,
      recentActivities: myActivities.slice(0, 5),
    };
  }

  // -------------------------------------------------------------------
  // POLLING DAY (मतदान दिवस) MODULE METHODS
  // -------------------------------------------------------------------
  public getPollingDay(clientId: string): PollingDay | null {
    const days = this.getItem<PollingDay[]>(STORAGE_KEYS.POLLING_DAYS, INITIAL_POLLING_DAYS);
    return days.find((d) => d.client_id === clientId) || null;
  }

  public configurePollingDay(clientId: string, data: Partial<PollingDay>): PollingDay {
    const days = this.getItem<PollingDay[]>(STORAGE_KEYS.POLLING_DAYS, INITIAL_POLLING_DAYS);
    const index = days.findIndex((d) => d.client_id === clientId);

    const now = new Date().toISOString();
    let configured: PollingDay;

    if (index !== -1) {
      days[index] = {
        ...days[index],
        ...data,
        updated_at: now,
      };
      configured = days[index];
    } else {
      configured = {
        id: `pd-${clientId}-${Date.now()}`,
        client_id: clientId,
        campaign_id: data.campaign_id || "campaign-1",
        title: data.title || "General Election Polling Day",
        polling_date: data.polling_date || "12 December 2026",
        start_time: data.start_time || "07:00 AM",
        end_time: data.end_time || "06:00 PM",
        status: data.status || "active",
        total_target_voters: data.total_target_voters || 12450,
        created_at: now,
        updated_at: now,
      };
      days.push(configured);
    }

    this.setItem(STORAGE_KEYS.POLLING_DAYS, days);
    return configured;
  }

  public lockPollingDay(clientId: string): boolean {
    const days = this.getItem<PollingDay[]>(STORAGE_KEYS.POLLING_DAYS, INITIAL_POLLING_DAYS);
    const index = days.findIndex((d) => d.client_id === clientId);
    if (index === -1) return false;
    days[index].status = "completed";
    days[index].updated_at = new Date().toISOString();
    this.setItem(STORAGE_KEYS.POLLING_DAYS, days);
    return true;
  }

  public getPollingDayDashboardStats(clientId: string): PollingDayDashboardStats {
    const pollingDay = this.getPollingDay(clientId);
    const voters = this.getItem<Voter[]>(STORAGE_KEYS.VOTERS, INITIAL_VOTERS).filter((v) => v.client_id === clientId);
    const updates = this.getItem<PollingDayUpdate[]>(STORAGE_KEYS.POLLING_UPDATES, INITIAL_POLLING_UPDATES).filter(
      (u) => u.client_id === clientId
    );
    const followUps = this.getItem<PollingDayFollowUp[]>(STORAGE_KEYS.POLLING_FOLLOWUPS, INITIAL_POLLING_FOLLOWUPS).filter(
      (f) => f.client_id === clientId
    );

    const totalVoters = voters.length || pollingDay?.total_target_voters || 12450;
    
    // Normalize status: treat 'VOTE_CAST' and legacy 'VOTING_REPORTED' as vote cast
    const voteCastCount = updates.filter((u) => u.status === "VOTE_CAST" || u.status === "VOTING_REPORTED").length;
    const notReportedCount = updates.filter((u) => u.status === "NOT_REPORTED").length;
    const pendingUpdates = updates.filter((u) => u.status === "PENDING").length;
    
    // Status reported in total
    const statusReported = updates.length;
    // Unchecked / Pending voters = total minus vote cast
    const pendingVoters = Math.max(0, totalVoters - voteCastCount - notReportedCount);
    const followUpsCount = followUps.filter((f) => f.status === "pending").length;
    const turnoutPercentage = totalVoters > 0 ? Math.round((voteCastCount / totalVoters) * 100) : 0;

    // Hourly Breakdown (8 AM - 5 PM)
    const hours = [
      { hour: "08", label: "8 AM", count: Math.round(voteCastCount * 0.08) || 35 },
      { hour: "09", label: "9 AM", count: Math.round(voteCastCount * 0.12) || 62 },
      { hour: "10", label: "10 AM", count: Math.round(voteCastCount * 0.16) || 85 },
      { hour: "11", label: "11 AM", count: Math.round(voteCastCount * 0.18) || 110 },
      { hour: "12", label: "12 PM", count: Math.round(voteCastCount * 0.14) || 75 },
      { hour: "13", label: "1 PM", count: Math.round(voteCastCount * 0.08) || 45 },
      { hour: "14", label: "2 PM", count: Math.round(voteCastCount * 0.07) || 40 },
      { hour: "15", label: "3 PM", count: Math.round(voteCastCount * 0.06) || 38 },
      { hour: "16", label: "4 PM", count: Math.round(voteCastCount * 0.07) || 42 },
      { hour: "17", label: "5 PM", count: Math.round(voteCastCount * 0.04) || 20 },
    ];

    const boothStats = this.getPollingDayBoothStats(clientId);
    const volunteerStats = this.getPollingDayVolunteerStats(clientId);

    return {
      pollingDay,
      totalVoters,
      voteCastCount,
      statusReported,
      votingActivityReported: voteCastCount,
      pendingVoters,
      notReportedCount,
      followUpsCount,
      turnoutPercentage,
      hourlyActivity: hours,
      recentUpdates: updates.slice(0, 15),
      boothStats,
      volunteerStats,
    };
  }

  public getPollingDayBoothStats(
    clientId: string,
    filters?: { search?: string; boothId?: string; areaId?: string }
  ): PollingDayBoothStats[] {
    const booths = this.getBooths(clientId);
    const voters = this.getItem<Voter[]>(STORAGE_KEYS.VOTERS, INITIAL_VOTERS).filter((v) => v.client_id === clientId);
    const updates = this.getItem<PollingDayUpdate[]>(STORAGE_KEYS.POLLING_UPDATES, INITIAL_POLLING_UPDATES).filter(
      (u) => u.client_id === clientId
    );
    const followUps = this.getItem<PollingDayFollowUp[]>(STORAGE_KEYS.POLLING_FOLLOWUPS, INITIAL_POLLING_FOLLOWUPS).filter(
      (f) => f.client_id === clientId
    );

    let list: PollingDayBoothStats[] = booths.map((b) => {
      const boothVoters = voters.filter((v) => v.booth_id === b.id);
      const boothUpdates = updates.filter((u) => u.booth_id === b.id);
      const boothFollowUps = followUps.filter((f) => f.booth_id === b.id && f.status === "pending");

      const total = boothVoters.length || b.voter_count || 850;
      const reported = boothUpdates.length;
      const voteCast = boothUpdates.filter((u) => u.status === "VOTE_CAST" || u.status === "VOTING_REPORTED").length;
      const notReported = boothUpdates.filter((u) => u.status === "NOT_REPORTED").length;
      const pending = Math.max(0, total - voteCast - notReported);
      const progress = total > 0 ? Math.round((voteCast / total) * 100) : 0;

      return {
        booth_id: b.id,
        booth_number: b.booth_number,
        booth_name: b.booth_name,
        area_name: b.area_name || "General Ward",
        total_voters: total,
        reported_count: reported,
        vote_cast_count: voteCast,
        voting_reported_count: voteCast,
        pending_count: pending,
        not_reported_count: notReported,
        follow_up_count: boothFollowUps.length,
        progress_percentage: progress,
        assigned_volunteers_count: b.assigned_volunteers_count || 1,
      };
    });

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.booth_number.toLowerCase().includes(q) ||
          b.booth_name.toLowerCase().includes(q) ||
          b.area_name.toLowerCase().includes(q)
      );
    }

    if (filters?.boothId && filters.boothId !== "all") {
      list = list.filter((b) => b.booth_id === filters.boothId);
    }

    if (filters?.areaId && filters.areaId !== "all") {
      list = list.filter((b) => b.area_name === filters.areaId);
    }

    return list;
  }

  public getPollingDayVolunteerStats(clientId: string): PollingDayVolunteerStats[] {
    const volunteers = this.getVolunteers(clientId);
    const updates = this.getItem<PollingDayUpdate[]>(STORAGE_KEYS.POLLING_UPDATES, INITIAL_POLLING_UPDATES).filter(
      (u) => u.client_id === clientId
    );
    const followUps = this.getItem<PollingDayFollowUp[]>(STORAGE_KEYS.POLLING_FOLLOWUPS, INITIAL_POLLING_FOLLOWUPS).filter(
      (f) => f.client_id === clientId
    );

    return volunteers.map((v) => {
      const volUpdates = updates.filter((u) => u.volunteer_id === v.id || u.volunteer_name === v.name);
      const voteCastUpdates = volUpdates.filter((u) => u.status === "VOTE_CAST" || u.status === "VOTING_REPORTED").length;
      const pendingUpdates = volUpdates.filter((u) => u.status === "PENDING").length;
      const volFollowUps = followUps.filter((f) => (f.volunteer_id === v.id || f.volunteer_name === v.name) && f.status === "pending");
      const lastUpdate = volUpdates.length > 0 ? volUpdates[0].created_at : undefined;

      return {
        volunteer_id: v.id,
        name: v.name,
        mobile: v.mobile,
        assigned_booth_id: v.assigned_booth_id || "booth-1",
        assigned_booth_name: v.assigned_booth_name || "Booth 101",
        assigned_area_name: v.assigned_area_name || "Shastri Nagar",
        updates_today: volUpdates.length,
        vote_cast_updates: voteCastUpdates,
        pending_updates: pendingUpdates,
        last_update_time: lastUpdate,
        pending_followups: volFollowUps.length,
        is_active: v.status === "active",
      };
    });
  }

  public getPollingDayVoters(
    clientId: string,
    volunteerId?: string,
    filters?: {
      search?: string;
      status?: string;
      boothId?: string;
      page?: number;
      pageSize?: number;
    }
  ): PaginatedResult<any> {
    const voters = this.getItem<Voter[]>(STORAGE_KEYS.VOTERS, INITIAL_VOTERS).filter((v) => v.client_id === clientId);
    const updates = this.getItem<PollingDayUpdate[]>(STORAGE_KEYS.POLLING_UPDATES, INITIAL_POLLING_UPDATES).filter(
      (u) => u.client_id === clientId
    );
    const booths = this.getBooths(clientId);
    const volunteer = volunteerId ? this.getVolunteerById(clientId, volunteerId) : undefined;

    let list = voters;

    // Strict Volunteer Scoping: If volunteer context, ONLY show voters for their assigned booth
    if (volunteer && volunteer.assigned_booth_id) {
      list = list.filter((v) => v.booth_id === volunteer.assigned_booth_id);
    } else if (filters?.boothId && filters.boothId !== "all") {
      list = list.filter((v) => v.booth_id === filters.boothId);
    }

    // Attach latest polling day status
    const updateMap = new Map<string, PollingDayUpdate>();
    updates.forEach((u) => updateMap.set(u.voter_id, u));

    let enriched = list.map((v) => {
      const u = updateMap.get(v.id);
      const booth = booths.find((b) => b.id === v.booth_id);
      let effectiveStatus = (u?.status || "PENDING") as PollingVoterStatus;
      if (effectiveStatus === "VOTING_REPORTED") effectiveStatus = "VOTE_CAST";

      return {
        ...v,
        booth_number: booth?.booth_number || v.booth_number || "Booth 101",
        booth_name: booth?.booth_name || v.booth_name || "Primary School",
        area_name: booth?.area_name || v.area_name || "General Area",
        polling_status: effectiveStatus,
        last_polling_update_time: u?.created_at,
        last_polling_note: u?.note,
        updated_by: u?.updated_by,
        updated_by_role: u?.updated_by_role,
      };
    });

    // Search filter
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      enriched = enriched.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.voter_id_card.toLowerCase().includes(q) ||
          (v.mobile && v.mobile.includes(q)) ||
          (v.address && v.address.toLowerCase().includes(q)) ||
          (v.booth_number && v.booth_number.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (filters?.status && filters.status !== "ALL") {
      enriched = enriched.filter((v) => v.polling_status === filters.status);
    }

    const total = enriched.length;
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const offset = (page - 1) * pageSize;
    const pagedData = enriched.slice(offset, offset + pageSize);

    return {
      data: pagedData,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  public updatePollingVoterStatus(
    clientId: string,
    voterId: string,
    status: PollingVoterStatus,
    volunteerId?: string,
    note?: string,
    updaterRole: string = "volunteer"
  ): PollingDayUpdate {
    const updates = this.getItem<PollingDayUpdate[]>(STORAGE_KEYS.POLLING_UPDATES, INITIAL_POLLING_UPDATES);
    const voters = this.getItem<Voter[]>(STORAGE_KEYS.VOTERS, INITIAL_VOTERS);
    const booths = this.getBooths(clientId);
    const volunteer = volunteerId ? this.getVolunteerById(clientId, volunteerId) : undefined;
    const voter = voters.find((v) => v.id === voterId && v.client_id === clientId);

    const booth = booths.find((b) => b.id === (voter?.booth_id || volunteer?.assigned_booth_id));

    const existingIndex = updates.findIndex((u) => u.voter_id === voterId && u.client_id === clientId);
    const previousStatus = existingIndex !== -1 ? updates[existingIndex].status : "PENDING";
    const now = new Date().toISOString();

    const record: PollingDayUpdate = {
      id: existingIndex !== -1 ? updates[existingIndex].id : `pdu-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      client_id: clientId,
      campaign_id: voter?.campaign_id || "camp-1",
      polling_day_id: `pd-${clientId}`,
      voter_id: voterId,
      voter_name: voter?.name || "Voter",
      voter_id_card: voter?.voter_id_card || "VOT1000",
      booth_id: booth?.id || "booth-1",
      booth_number: booth?.booth_number || "Booth 101",
      booth_name: booth?.booth_name || "Govt School",
      area_name: booth?.area_name || "General Ward",
      volunteer_id: volunteer?.id,
      volunteer_name: volunteer?.name || "Candidate/Staff",
      status,
      previous_status: previousStatus,
      note,
      updated_by: volunteer?.name || "Candidate/Admin",
      updated_by_role: updaterRole,
      created_at: now,
      updated_at: now,
    };

    if (existingIndex !== -1) {
      updates[existingIndex] = record;
    } else {
      updates.unshift(record);
    }

    this.setItem(STORAGE_KEYS.POLLING_UPDATES, updates);

    // Audit log
    this.logAction(
      { name: volunteer?.name || "Candidate/Admin" },
      "POLLING_STATUS_UPDATED",
      "PollingDayVoter",
      voterId,
      { voter_name: voter?.name, card: voter?.voter_id_card, status, previousStatus },
      clientId
    );

    return record;
  }

  public undoPollingVoterStatus(
    clientId: string,
    voterId: string,
    volunteerId?: string
  ): boolean {
    const updates = this.getItem<PollingDayUpdate[]>(STORAGE_KEYS.POLLING_UPDATES, INITIAL_POLLING_UPDATES);
    const index = updates.findIndex((u) => u.voter_id === voterId && u.client_id === clientId);
    if (index === -1) return false;

    const previousStatus = updates[index].previous_status || "PENDING";
    updates[index].status = previousStatus;
    updates[index].updated_at = new Date().toISOString();
    this.setItem(STORAGE_KEYS.POLLING_UPDATES, updates);

    this.logAction(
      { name: volunteerId || "User" },
      "POLLING_STATUS_UNDONE",
      "PollingDayVoter",
      voterId,
      { status: previousStatus },
      clientId
    );
    return true;
  }

  public createPollingFollowUp(
    clientId: string,
    data: Omit<PollingDayFollowUp, "id" | "created_at" | "status">
  ): PollingDayFollowUp {
    const followUps = this.getItem<PollingDayFollowUp[]>(STORAGE_KEYS.POLLING_FOLLOWUPS, INITIAL_POLLING_FOLLOWUPS);
    const newFollowUp: PollingDayFollowUp = {
      ...data,
      id: `pdf-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    followUps.unshift(newFollowUp);
    this.setItem(STORAGE_KEYS.POLLING_FOLLOWUPS, followUps);

    // Also update the voter status
    this.updatePollingVoterStatus(
      clientId,
      data.voter_id,
      "FOLLOW_UP_REQUIRED",
      data.volunteer_id,
      `${data.reason}: ${data.note || ""}`
    );

    return newFollowUp;
  }

  public resolvePollingFollowUp(clientId: string, followUpId: string): PollingDayFollowUp | null {
    const followUps = this.getItem<PollingDayFollowUp[]>(STORAGE_KEYS.POLLING_FOLLOWUPS, INITIAL_POLLING_FOLLOWUPS);
    const index = followUps.findIndex((f) => f.id === followUpId && f.client_id === clientId);
    if (index === -1) return null;

    followUps[index].status = "completed";
    followUps[index].completed_at = new Date().toISOString();
    this.setItem(STORAGE_KEYS.POLLING_FOLLOWUPS, followUps);
    return followUps[index];
  }

  public getPollingDayFollowUps(clientId: string, volunteerId?: string): PollingDayFollowUp[] {
    const followUps = this.getItem<PollingDayFollowUp[]>(STORAGE_KEYS.POLLING_FOLLOWUPS, INITIAL_POLLING_FOLLOWUPS);
    let list = followUps.filter((f) => f.client_id === clientId);
    if (volunteerId) {
      list = list.filter((f) => f.volunteer_id === volunteerId);
    }
    return list;
  }

  public getPollingDayActivities(clientId: string, limit: number = 20): PollingDayUpdate[] {
    const updates = this.getItem<PollingDayUpdate[]>(STORAGE_KEYS.POLLING_UPDATES, INITIAL_POLLING_UPDATES);
    return updates.filter((u) => u.client_id === clientId).slice(0, limit);
  }

  // ===================================================================
  // 15. COMMUNICATION (संचार) & POLLING SERVICES MODULE
  // ===================================================================

  public getCommunicationLogs(
    clientId: string,
    options?: {
      voterId?: string;
      channel?: CommunicationChannel | "ALL";
      action?: CommunicationAction | "ALL";
      status?: string;
      volunteerId?: string;
      search?: string;
      page?: number;
      pageSize?: number;
    }
  ): PaginatedResult<CommunicationLog> {
    const logs = this.getItem<CommunicationLog[]>(STORAGE_KEYS.COMMUNICATION_LOGS, INITIAL_COMMUNICATION_LOGS);
    let filtered = logs.filter((l) => l.client_id === clientId);

    if (options?.voterId) {
      filtered = filtered.filter((l) => l.voter_id === options.voterId);
    }
    if (options?.channel && options.channel !== "ALL") {
      filtered = filtered.filter((l) => l.channel === options.channel);
    }
    if (options?.action && options.action !== "ALL") {
      filtered = filtered.filter((l) => l.action === options.action);
    }
    if (options?.status && options.status !== "ALL") {
      filtered = filtered.filter((l) => l.status === options.status);
    }
    if (options?.volunteerId) {
      // Scoped volunteer logs
      const volunteer = this.getVolunteerById(clientId, options.volunteerId);
      if (volunteer && volunteer.assigned_booth_id) {
        filtered = filtered.filter(
          (l) => l.user_id === volunteer.user_id || l.booth_id === volunteer.assigned_booth_id
        );
      }
    }
    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      filtered = filtered.filter(
        (l) =>
          l.voter_name.toLowerCase().includes(q) ||
          l.voter_card.toLowerCase().includes(q) ||
          (l.voter_mobile && l.voter_mobile.includes(q)) ||
          l.actor_name.toLowerCase().includes(q) ||
          (l.note && l.note.toLowerCase().includes(q))
      );
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const page = options?.page || 1;
    const pageSize = options?.pageSize || 20;
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const data = filtered.slice(startIndex, startIndex + pageSize);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  public logCommunication(
    clientId: string,
    data: Omit<CommunicationLog, "id" | "created_at">
  ): CommunicationLog {
    const logs = this.getItem<CommunicationLog[]>(STORAGE_KEYS.COMMUNICATION_LOGS, INITIAL_COMMUNICATION_LOGS);
    const newLog: CommunicationLog = {
      ...data,
      id: `comm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      created_at: new Date().toISOString(),
    };
    logs.unshift(newLog);
    this.setItem(STORAGE_KEYS.COMMUNICATION_LOGS, logs);

    this.logAction(
      { id: data.user_id, name: data.actor_name },
      data.action,
      "Communication",
      data.voter_id,
      { channel: data.channel, status: data.status, voter: data.voter_name },
      clientId
    );

    return newLog;
  }

  public recordCallResult(
    clientId: string,
    data: {
      voterId: string;
      userId?: string;
      userRole: UserRole;
      actorName: string;
      callStatus: CallOutcome;
      note?: string;
      scheduleFollowUp?: boolean;
      followUpDate?: string;
    }
  ): CommunicationLog | null {
    const voter = this.getVoterById(clientId, data.voterId);
    if (!voter) return null;

    const action: CommunicationAction =
      data.callStatus === "Connected" ? "CALL_CONNECTED" : "CALL_ATTEMPTED";

    // 1. Log communication
    const log = this.logCommunication(clientId, {
      client_id: clientId,
      campaign_id: voter.campaign_id,
      voter_id: voter.id,
      voter_name: voter.name,
      voter_card: voter.voter_id_card,
      voter_mobile: voter.mobile,
      booth_id: voter.booth_id,
      booth_number: voter.booth_number,
      booth_name: voter.booth_name,
      area_name: voter.area_name,
      user_id: data.userId,
      user_role: data.userRole,
      actor_name: data.actorName,
      channel: "CALL",
      action,
      status: data.callStatus,
      note: data.note,
    });

    // 2. Update voter contact & telemetry
    const nowIso = new Date().toISOString();
    const voterUpdates: Partial<Voter> = {
      last_called_at: nowIso,
      last_call_status: data.callStatus,
      last_contacted_by: data.actorName,
      last_contacted_at: nowIso,
    };

    if (data.callStatus === "Connected" && voter.contact_status === "uncontacted") {
      voterUpdates.contact_status = "contacted";
    }

    if (data.callStatus === "Follow-up Required" || data.scheduleFollowUp) {
      voterUpdates.follow_up_status = "pending";
    }

    this.updateVoter(clientId, voter.id, voterUpdates);

    return log;
  }

  public recordWhatsAppOpen(
    clientId: string,
    data: {
      voterId: string;
      userId?: string;
      userRole: UserRole;
      actorName: string;
      messageText?: string;
    }
  ): CommunicationLog | null {
    const voter = this.getVoterById(clientId, data.voterId);
    if (!voter) return null;

    const log = this.logCommunication(clientId, {
      client_id: clientId,
      campaign_id: voter.campaign_id,
      voter_id: voter.id,
      voter_name: voter.name,
      voter_card: voter.voter_id_card,
      voter_mobile: voter.mobile,
      booth_id: voter.booth_id,
      booth_number: voter.booth_number,
      booth_name: voter.booth_name,
      area_name: voter.area_name,
      user_id: data.userId,
      user_role: data.userRole,
      actor_name: data.actorName,
      channel: "WHATSAPP",
      action: "WHATSAPP_OPENED",
      status: "Opened",
      note: data.messageText || "Informational message dispatched via WhatsApp.",
    });

    const nowIso = new Date().toISOString();
    this.updateVoter(clientId, voter.id, {
      last_whatsapp_at: nowIso,
      last_contacted_by: data.actorName,
      last_contacted_at: nowIso,
    });

    return log;
  }

  public recordPollingSlipGenerated(
    clientId: string,
    data: {
      voterId: string;
      userId?: string;
      userRole: UserRole;
      actorName: string;
      sharedViaWhatsApp?: boolean;
    }
  ): { log: CommunicationLog; slip: PollingSlipRecord } | null {
    const voter = this.getVoterById(clientId, data.voterId);
    if (!voter) return null;

    const client = this.getClientById(clientId);
    const electionDate = client?.election_date || "12 December 2026";
    const slipNumber = `PS-${voter.booth_number?.replace(/\D/g, "") || "00"}-${voter.voter_id_card.slice(-6)}`;

    // 1. Store Polling Slip Record
    const slips = this.getItem<PollingSlipRecord[]>(STORAGE_KEYS.POLLING_SLIPS, INITIAL_POLLING_SLIPS);
    const newSlip: PollingSlipRecord = {
      id: `slip-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      client_id: clientId,
      campaign_id: voter.campaign_id,
      voter_id: voter.id,
      voter_name: voter.name,
      voter_card: voter.voter_id_card,
      booth_number: voter.booth_number || "Booth 101",
      booth_name: voter.booth_name || "Govt Inter College",
      polling_date: electionDate,
      polling_time: "07:00 AM - 06:00 PM",
      slip_number: slipNumber,
      created_by: data.actorName,
      created_at: new Date().toISOString(),
      shared_via_whatsapp: !!data.sharedViaWhatsApp,
    };
    slips.unshift(newSlip);
    this.setItem(STORAGE_KEYS.POLLING_SLIPS, slips);

    // 2. Communication Log
    const action: CommunicationAction = data.sharedViaWhatsApp
      ? "POLLING_SLIP_SHARED"
      : "POLLING_SLIP_GENERATED";
    const status = data.sharedViaWhatsApp ? "Slip Shared" : "Slip Generated";

    const log = this.logCommunication(clientId, {
      client_id: clientId,
      campaign_id: voter.campaign_id,
      voter_id: voter.id,
      voter_name: voter.name,
      voter_card: voter.voter_id_card,
      voter_mobile: voter.mobile,
      booth_id: voter.booth_id,
      booth_number: voter.booth_number,
      booth_name: voter.booth_name,
      area_name: voter.area_name,
      user_id: data.userId,
      user_role: data.userRole,
      actor_name: data.actorName,
      channel: "POLLING_SLIP",
      action,
      status,
      note: data.sharedViaWhatsApp
        ? `Slip ${slipNumber} shared on WhatsApp`
        : `Slip ${slipNumber} generated and ready for print/download`,
    });

    const nowIso = new Date().toISOString();
    this.updateVoter(clientId, voter.id, {
      last_slip_generated_at: nowIso,
    });

    return { log, slip: newSlip };
  }

  public getCommunicationSummary(
    clientId: string,
    volunteerId?: string
  ): CommunicationSummaryStats {
    const logs = this.getItem<CommunicationLog[]>(STORAGE_KEYS.COMMUNICATION_LOGS, INITIAL_COMMUNICATION_LOGS)
      .filter((l) => l.client_id === clientId);
    const voters = this.getVoters(clientId, { pageSize: 5000 }).data;

    let scopedLogs = logs;
    let scopedVoters = voters;

    if (volunteerId) {
      const vol = this.getVolunteerById(clientId, volunteerId);
      if (vol && vol.assigned_booth_id) {
        scopedVoters = voters.filter((v) => v.booth_id === vol.assigned_booth_id);
        scopedLogs = logs.filter(
          (l) => l.user_id === vol.user_id || l.booth_id === vol.assigned_booth_id
        );
      }
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const todayLogs = scopedLogs.filter((l) => l.created_at.startsWith(todayStr) || true); // Include realistic demo activity

    const todaysCalls = todayLogs.filter((l) => l.channel === "CALL").length;
    const connectedCalls = todayLogs.filter(
      (l) => l.channel === "CALL" && l.status === "Connected"
    ).length;
    const whatsAppActivity = todayLogs.filter((l) => l.channel === "WHATSAPP").length;
    const pollingSlipsGenerated = todayLogs.filter((l) => l.channel === "POLLING_SLIP").length;

    const followUps = this.getFollowUps(clientId).filter(
      (f) => f.status === "pending" && (!volunteerId || f.volunteer_id === volunteerId)
    );

    const contactablePhoneVoters = scopedVoters.filter((v) => !!v.mobile && !v.opt_out).length;
    const optedOutCount = scopedVoters.filter((v) => v.opt_out).length;

    return {
      todaysCalls,
      connectedCalls,
      whatsAppActivity,
      pollingSlipsGenerated,
      pendingFollowUps: followUps.length,
      totalVoters: scopedVoters.length,
      contactablePhoneVoters,
      optedOutCount,
      channelBreakdown: {
        calls: scopedLogs.filter((l) => l.channel === "CALL").length,
        whatsapp: scopedLogs.filter((l) => l.channel === "WHATSAPP").length,
        slips: scopedLogs.filter((l) => l.channel === "POLLING_SLIP").length,
      },
      recentLogs: scopedLogs.slice(0, 10),
    };
  }

  public getCallingList(
    clientId: string,
    volunteerId?: string,
    options?: {
      search?: string;
      boothId?: string;
      callStatus?: string;
      page?: number;
      pageSize?: number;
    }
  ): PaginatedResult<Voter> {
    const voters = this.getItem<Voter[]>(STORAGE_KEYS.VOTERS, INITIAL_VOTERS)
      .filter((v) => v.client_id === clientId);

    let filtered = voters;

    // Scope for volunteer if present
    if (volunteerId) {
      const vol = this.getVolunteerById(clientId, volunteerId);
      if (vol && vol.assigned_booth_id) {
        filtered = filtered.filter((v) => v.booth_id === vol.assigned_booth_id);
      }
    }

    if (options?.boothId && options.boothId !== "all") {
      filtered = filtered.filter((v) => v.booth_id === options.boothId);
    }

    if (options?.callStatus && options.callStatus !== "all") {
      if (options.callStatus === "Not Called") {
        filtered = filtered.filter((v) => !v.last_called_at);
      } else {
        filtered = filtered.filter((v) => v.last_call_status === options.callStatus);
      }
    }

    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      filtered = filtered.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.voter_id_card.toLowerCase().includes(q) ||
          (v.mobile && v.mobile.includes(q)) ||
          (v.booth_number && v.booth_number.toLowerCase().includes(q)) ||
          (v.area_name && v.area_name.toLowerCase().includes(q))
      );
    }

    const page = options?.page || 1;
    const pageSize = options?.pageSize || 15;
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const data = filtered.slice(startIndex, startIndex + pageSize);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  public getWhatsAppList(
    clientId: string,
    volunteerId?: string,
    options?: {
      search?: string;
      boothId?: string;
      page?: number;
      pageSize?: number;
    }
  ): PaginatedResult<Voter> {
    return this.getCallingList(clientId, volunteerId, options);
  }

  public getPollingSlipVoters(
    clientId: string,
    volunteerId?: string,
    options?: {
      search?: string;
      boothId?: string;
      page?: number;
      pageSize?: number;
    }
  ): PaginatedResult<Voter> {
    return this.getCallingList(clientId, volunteerId, options);
  }

  public updateVoterCommunicationPreferences(
    clientId: string,
    voterId: string,
    prefs: {
      whatsapp_allowed?: boolean;
      calling_allowed?: boolean;
      opt_out?: boolean;
    }
  ): Voter | null {
    const voter = this.updateVoter(clientId, voterId, prefs);
    if (voter) {
      this.logAction(
        { name: "System" },
        "COMMUNICATION_PREFERENCES_UPDATED",
        "Voter",
        voterId,
        prefs,
        clientId
      );
    }
    return voter;
  }

  public batchGeneratePollingSlips(
    clientId: string,
    voterIds: string[],
    actor: { userId?: string; userRole: UserRole; actorName: string }
  ): PollingSlipRecord[] {
    const generated: PollingSlipRecord[] = [];
    voterIds.forEach((voterId) => {
      const res = this.recordPollingSlipGenerated(clientId, {
        voterId,
        userId: actor.userId,
        userRole: actor.userRole,
        actorName: actor.actorName,
        sharedViaWhatsApp: false,
      });
      if (res?.slip) {
        generated.push(res.slip);
      }
    });
    return generated;
  }

  // -------------------------------------------------------------------
  // FILE ASSETS & SUPABASE STORAGE INTEGRATION
  // -------------------------------------------------------------------
  public getFileAssets(
    clientId: string,
    filters?: { module?: string; entityType?: string; status?: string }
  ): FileAsset[] {
    const assets = this.getItem<FileAsset[]>(STORAGE_KEYS.FILE_ASSETS, INITIAL_FILE_ASSETS);
    return assets.filter((a) => {
      if (a.client_id !== clientId) return false;
      if (filters?.module && a.module !== filters.module) return false;
      if (filters?.entityType && a.entity_type !== filters.entityType) return false;
      if (filters?.status && a.status !== filters.status) return false;
      return true;
    });
  }

  public getFileAssetById(clientId: string, id: string): FileAsset | null {
    const assets = this.getItem<FileAsset[]>(STORAGE_KEYS.FILE_ASSETS, INITIAL_FILE_ASSETS);
    return assets.find((a) => a.id === id && a.client_id === clientId) || null;
  }

  public createFileAsset(
    clientId: string,
    asset: Omit<FileAsset, "id" | "client_id" | "created_at" | "updated_at"> & { client_id?: string }
  ): FileAsset {
    const assets = this.getItem<FileAsset[]>(STORAGE_KEYS.FILE_ASSETS, INITIAL_FILE_ASSETS);
    const newAsset: FileAsset = {
      ...asset,
      id: `asset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      client_id: clientId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    assets.unshift(newAsset);
    this.setItem(STORAGE_KEYS.FILE_ASSETS, assets);

    this.logAction(
      { id: asset.uploaded_by, name: "Storage Service" },
      "FILE_ASSET_CREATED",
      "FileAsset",
      newAsset.id,
      {
        fileName: newAsset.file_name,
        module: newAsset.module,
        storagePath: newAsset.storage_path,
        fileSize: newAsset.file_size,
      },
      clientId
    );

    return newAsset;
  }

  public updateFileAsset(
    clientId: string,
    id: string,
    updates: Partial<FileAsset>
  ): FileAsset | null {
    const assets = this.getItem<FileAsset[]>(STORAGE_KEYS.FILE_ASSETS, INITIAL_FILE_ASSETS);
    const index = assets.findIndex((a) => a.id === id && a.client_id === clientId);
    if (index === -1) return null;

    assets[index] = {
      ...assets[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.FILE_ASSETS, assets);
    return assets[index];
  }

  public deleteFileAsset(clientId: string, id: string): boolean {
    const assets = this.getItem<FileAsset[]>(STORAGE_KEYS.FILE_ASSETS, INITIAL_FILE_ASSETS);
    const asset = assets.find((a) => a.id === id && a.client_id === clientId);
    if (!asset) return false;

    // Soft delete / mark inactive
    asset.status = "deleted";
    asset.updated_at = new Date().toISOString();
    this.setItem(STORAGE_KEYS.FILE_ASSETS, assets);

    this.logAction(
      { name: "Storage Service" },
      "FILE_ASSET_DELETED",
      "FileAsset",
      id,
      { fileName: asset.file_name, storagePath: asset.storage_path },
      clientId
    );

    return true;
  }

  public getActiveCandidatePosterAsset(clientId: string): FileAsset | null {
    const assets = this.getFileAssets(clientId, {
      module: "branding",
      entityType: "client_poster",
      status: "active",
    });
    return assets.length > 0 ? assets[0] : null;
  }

  public setCandidatePosterAsset(
    clientId: string,
    assetData: {
      fileName: string;
      fileSize: number;
      mimeType: string;
      storagePath: string;
      uploadedBy?: string;
      altText?: string;
    }
  ): { client: Client | null; fileAsset: FileAsset } {
    // 1. Mark previous active posters for this client as inactive
    const existingAssets = this.getFileAssets(clientId, {
      module: "branding",
      entityType: "client_poster",
      status: "active",
    });
    existingAssets.forEach((prev) => {
      this.updateFileAsset(clientId, prev.id, { status: "inactive" });
    });

    // 2. Create new active file asset
    const ext = assetData.fileName.split(".").pop() || "jpg";
    const fileAsset = this.createFileAsset(clientId, {
      module: "branding",
      entity_type: "client_poster",
      entity_id: clientId,
      file_name: assetData.fileName,
      file_extension: ext,
      mime_type: assetData.mimeType,
      storage_provider: "supabase_storage",
      storage_path: assetData.storagePath,
      file_size: assetData.fileSize,
      status: "active",
      uploaded_by: assetData.uploadedBy,
      metadata: {
        category: "posters",
        alt_text: assetData.altText || "Official Candidate Campaign Poster",
      },
    });

    // 3. Update client poster_url
    const client = this.updateCandidatePoster(
      clientId,
      assetData.storagePath,
      assetData.altText
    );

    return { client, fileAsset };
  }
}

export const dbService = new DataService();


