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
    const existingVoters = this.getItem<Voter[]>(STORAGE_KEYS.VOTERS, INITIAL_VOTERS);
    const existingCardSet = new Set(
      existingVoters.filter((v) => v.client_id === clientId).map((v) => v.voter_id_card.trim().toUpperCase())
    );

    let inserted = 0;
    let skipped = 0;

    const newVotersToAdd: Voter[] = [];

    votersList.forEach((v) => {
      const card = v.voter_id_card ? v.voter_id_card.trim().toUpperCase() : "";
      if (!card || existingCardSet.has(card)) {
        skipped++;
        return;
      }

      existingCardSet.add(card);
      newVotersToAdd.push({
        ...v,
        id: `voter-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        client_id: clientId,
        campaign_id: campaignId,
        voter_id_card: card,
        contact_status: v.contact_status || "uncontacted",
        follow_up_status: v.follow_up_status || "none",
        created_at: new Date().toISOString(),
      });
      inserted++;
    });

    if (newVotersToAdd.length > 0) {
      this.setItem(STORAGE_KEYS.VOTERS, [...newVotersToAdd, ...existingVoters]);
    }

    return { inserted, skipped };
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
    const activities = this.getItem<FieldActivity[]>(STORAGE_KEYS.FIELD_ACTIVITIES, INITIAL_FIELD_ACTIVITIES);

    return {
      totalClients: clients.length,
      activeClients: clients.filter((c) => c.status === "active").length,
      activeCampaigns: campaigns.filter((c) => c.status === "active").length,
      totalVolunteers: volunteers.length,
      totalVoters: voters.length,
      totalActivities: activities.length,
      clientsList: clients,
      recentLogs: this.getAuditLogs().slice(0, 8),
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
}

export const dbService = new DataService();
