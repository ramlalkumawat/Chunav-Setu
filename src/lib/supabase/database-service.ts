import { createServerSupabaseClient } from "./server";
import { createAdminClient } from "./admin";
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
  PollingDayDashboardStats,
  CommunicationLog,
  PollingSlipRecord,
  FileAsset,
} from "../types";

/**
 * Real Supabase PostgreSQL Database Service
 * All methods query Supabase with RLS or server-side tenant validation.
 */
class DatabaseService {
  private getClient() {
    return createServerSupabaseClient();
  }

  private getAdminClient() {
    return createAdminClient();
  }

  // -------------------------------------------------------------------
  // AUDIT LOGS
  // -------------------------------------------------------------------
  public async logAuditEvent(
    actor: { id?: string; name: string },
    action: string,
    targetType: string,
    targetId?: string,
    details?: Record<string, any>,
    clientId?: string
  ): Promise<void> {
    try {
      const supabase = this.getClient();
      await supabase.from("audit_logs").insert({
        actor_id: actor.id || null,
        actor_name: actor.name,
        action,
        target_type: targetType,
        target_id: targetId || null,
        details: details || null,
        client_id: clientId || null,
      });
    } catch (err) {
      console.error("Failed to log audit event:", err);
    }
  }

  public async getAuditLogs(clientId?: string): Promise<AuditLog[]> {
    const supabase = this.getClient();
    let query = supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(100);
    if (clientId) {
      query = query.eq("client_id", clientId);
    }
    const { data, error } = await query;
    if (error) {
      console.error("Error fetching audit logs:", error);
      return [];
    }
    return (data || []) as AuditLog[];
  }

  // -------------------------------------------------------------------
  // PROFILES & USERS
  // -------------------------------------------------------------------
  public async getProfileById(userId: string): Promise<UserProfile | null> {
    const supabase = this.getClient();
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (error || !data) return null;
    return data as UserProfile;
  }

  public async getProfileByUsername(username: string): Promise<UserProfile | null> {
    const supabase = this.getAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .ilike("username", username.trim())
      .single();
    if (error || !data) return null;
    return data as UserProfile;
  }

  public async getProfileByEmail(email: string): Promise<UserProfile | null> {
    const supabase = this.getAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .single();
    if (error || !data) return null;
    return data as UserProfile;
  }

  // -------------------------------------------------------------------
  // CLIENTS / TENANTS (SUPER ADMIN)
  // -------------------------------------------------------------------
  public async getClients(): Promise<Client[]> {
    const supabase = this.getClient();
    const { data: clients, error: clientErr } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (clientErr || !clients) {
      console.error("Error fetching clients:", clientErr);
      return [];
    }

    // Fetch aggregate tenant counts
    const { data: voters } = await supabase.from("voters").select("client_id");
    const { data: volunteers } = await supabase.from("volunteers").select("client_id");
    const { data: booths } = await supabase.from("booths").select("client_id");

    return clients.map((c) => ({
      ...c,
      voter_count: (voters || []).filter((v) => v.client_id === c.id).length,
      volunteer_count: (volunteers || []).filter((vol) => vol.client_id === c.id).length,
      booth_count: (booths || []).filter((b) => b.client_id === c.id).length,
      campaign_count: 1,
    }));
  }

  public async getClientById(id: string): Promise<Client | null> {
    const supabase = this.getClient();
    const { data, error } = await supabase.from("clients").select("*").eq("id", id).single();
    if (error || !data) return null;
    return data as Client;
  }

  public async createCandidateClient(
    clientData: Omit<Client, "id" | "created_at">,
    initialPassword?: string
  ): Promise<{ client: Client | null; tempPassword?: string; error?: string }> {
    const admin = this.getAdminClient();
    const email = clientData.email.trim().toLowerCase();
    const username = clientData.username?.trim().toLowerCase() || email.split("@")[0];
    const password = initialPassword || `Setu@${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      // 1. Insert Client record
      const { data: newClient, error: clientErr } = await admin
        .from("clients")
        .insert({
          name: clientData.name,
          candidate_name: clientData.candidate_name,
          mobile: clientData.mobile,
          email,
          username,
          campaign_name: clientData.campaign_name,
          election_type: clientData.election_type,
          location: clientData.location,
          status: clientData.status || "active",
          poster_url: clientData.poster_url || null,
          poster_alt: clientData.poster_alt || null,
        })
        .select()
        .single();

      if (clientErr || !newClient) {
        return { client: null, error: clientErr?.message || "Failed to create client record." };
      }

      // 2. Create Supabase Auth user for Candidate
      const { data: authUser, error: authErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: clientData.candidate_name,
          role: "client_admin",
          client_id: newClient.id,
          username,
        },
      });

      if (authErr && !authUser?.user) {
        console.warn("Auth user creation warning (might already exist):", authErr);
      }

      const userId = authUser?.user?.id;

      // 3. Insert Profile
      if (userId) {
        await admin.from("profiles").upsert({
          id: userId,
          email,
          username,
          full_name: clientData.candidate_name,
          role: "client_admin",
          client_id: newClient.id,
          mobile: clientData.mobile,
          status: "active",
        });
      }

      // 4. Create default Campaign
      await admin.from("campaigns").insert({
        client_id: newClient.id,
        title: `${clientData.candidate_name} Campaign 2026`,
        description: `Official campaign for ${clientData.election_type} - ${clientData.location}`,
        target_voters: 50000,
        status: "active",
      });

      // 5. Create default Subscription
      const validUntil = new Date();
      validUntil.setFullYear(validUntil.getFullYear() + 1);
      await admin.from("subscriptions").insert({
        client_id: newClient.id,
        plan_name: "assembly_pro",
        max_voters: 150000,
        max_volunteers: 100,
        status: "active",
        valid_until: validUntil.toISOString(),
      });

      return { client: newClient as Client, tempPassword: password };
    } catch (err: any) {
      console.error("createCandidateClient error:", err);
      return { client: null, error: err.message || "Failed to provision candidate tenant." };
    }
  }

  public async updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from("clients")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      console.error("Error updating client:", error);
      return null;
    }
    return data as Client;
  }

  public async resetCandidatePassword(
    clientId: string,
    newPassword?: string
  ): Promise<{ success: boolean; tempPassword?: string; error?: string }> {
    const admin = this.getAdminClient();
    const client = await this.getClientById(clientId);
    if (!client) return { success: false, error: "Client not found." };

    const generatedPassword = newPassword || `Setu@${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const { data: profiles } = await admin
        .from("profiles")
        .select("id, email")
        .eq("client_id", clientId)
        .eq("role", "client_admin");

      if (profiles && profiles.length > 0) {
        for (const p of profiles) {
          await admin.auth.admin.updateUserById(p.id, { password: generatedPassword });
        }
      }

      return { success: true, tempPassword: generatedPassword };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to reset password." };
    }
  }

  // -------------------------------------------------------------------
  // CAMPAIGNS
  // -------------------------------------------------------------------
  public async getCampaigns(clientId?: string): Promise<Campaign[]> {
    const supabase = this.getClient();
    let query = supabase.from("campaigns").select("*").order("created_at", { ascending: false });
    if (clientId) {
      query = query.eq("client_id", clientId);
    }
    const { data, error } = await query;
    if (error) {
      console.error("Error fetching campaigns:", error);
      return [];
    }
    return (data || []) as Campaign[];
  }

  // -------------------------------------------------------------------
  // BOOTHS
  // -------------------------------------------------------------------
  public async getBooths(clientId: string, campaignId?: string): Promise<Booth[]> {
    const supabase = this.getClient();
    let query = supabase.from("booths").select("*").eq("client_id", clientId).order("booth_number", { ascending: true });
    if (campaignId) {
      query = query.eq("campaign_id", campaignId);
    }
    const { data, error } = await query;
    if (error) {
      console.error("Error fetching booths:", error);
      return [];
    }
    return (data || []) as Booth[];
  }

  public async createBooth(data: Omit<Booth, "id" | "created_at">): Promise<Booth | null> {
    const supabase = this.getClient();
    const { data: newBooth, error } = await supabase.from("booths").insert(data).select().single();
    if (error) {
      console.error("Error creating booth:", error);
      return null;
    }
    return newBooth as Booth;
  }

  public async updateBooth(clientId: string, id: string, updates: Partial<Booth>): Promise<Booth | null> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from("booths")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("client_id", clientId)
      .select()
      .single();

    if (error) return null;
    return data as Booth;
  }

  public async deleteBooth(clientId: string, id: string): Promise<boolean> {
    const supabase = this.getClient();
    const { error } = await supabase.from("booths").delete().eq("id", id).eq("client_id", clientId);
    return !error;
  }

  // -------------------------------------------------------------------
  // VOLUNTEERS
  // -------------------------------------------------------------------
  public async getVolunteers(clientId: string): Promise<Volunteer[]> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from("volunteers")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching volunteers:", error);
      return [];
    }
    return (data || []) as Volunteer[];
  }

  public async createVolunteerUser(
    candidateClientId: string,
    volunteerData: {
      name: string;
      mobile: string;
      email?: string;
      username?: string;
      password?: string;
      assigned_booth_id?: string;
      assigned_area_id?: string;
      notes?: string;
    }
  ): Promise<{ volunteer: Volunteer | null; tempPassword?: string; error?: string }> {
    const admin = this.getAdminClient();
    const normalizedEmail = volunteerData.email
      ? volunteerData.email.trim().toLowerCase()
      : `vol_${Date.now()}@chunavsetu.internal`;
    const username = volunteerData.username?.trim().toLowerCase() || normalizedEmail.split("@")[0];
    const password = volunteerData.password || `Vol@${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      // 1. Create Supabase Auth User
      const { data: authUser, error: authErr } = await admin.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: volunteerData.name,
          role: "volunteer",
          client_id: candidateClientId,
          username,
        },
      });

      const userId = authUser?.user?.id;

      // 2. Create Profile
      if (userId) {
        await admin.from("profiles").upsert({
          id: userId,
          email: normalizedEmail,
          username,
          full_name: volunteerData.name,
          role: "volunteer",
          client_id: candidateClientId,
          mobile: volunteerData.mobile,
          status: "active",
        });
      }

      // 3. Create Volunteer record
      const { data: newVolunteer, error: volErr } = await admin
        .from("volunteers")
        .insert({
          client_id: candidateClientId,
          user_id: userId || null,
          name: volunteerData.name,
          mobile: volunteerData.mobile,
          email: volunteerData.email || null,
          assigned_booth_id: volunteerData.assigned_booth_id || null,
          assigned_area_id: volunteerData.assigned_area_id || null,
          status: "active",
          notes: volunteerData.notes || null,
        })
        .select()
        .single();

      if (volErr || !newVolunteer) {
        return { volunteer: null, error: volErr?.message || "Failed to create volunteer record." };
      }

      return { volunteer: newVolunteer as Volunteer, tempPassword: password };
    } catch (err: any) {
      return { volunteer: null, error: err.message || "Failed to create volunteer." };
    }
  }

  public async updateVolunteer(
    clientId: string,
    id: string,
    updates: Partial<Volunteer>
  ): Promise<Volunteer | null> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from("volunteers")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("client_id", clientId)
      .select()
      .single();

    if (error) return null;
    return data as Volunteer;
  }

  public async deleteVolunteer(clientId: string, id: string): Promise<boolean> {
    const supabase = this.getClient();
    const { error } = await supabase.from("volunteers").delete().eq("id", id).eq("client_id", clientId);
    return !error;
  }

  // -------------------------------------------------------------------
  // VOTERS
  // -------------------------------------------------------------------
  public async getVoters(
    clientId: string,
    options: {
      search?: string;
      boothId?: string;
      areaId?: string;
      contactStatus?: string;
      gender?: string;
      followUpStatus?: string;
      page?: number;
      pageSize?: number;
    } = {}
  ): Promise<PaginatedResult<Voter>> {
    const supabase = this.getClient();
    const page = Math.max(1, options.page || 1);
    const pageSize = Math.min(100, Math.max(1, options.pageSize || 20));
    const offset = (page - 1) * pageSize;

    let countQuery = supabase
      .from("voters")
      .select("id", { count: "exact", head: true })
      .eq("client_id", clientId);

    let query = supabase
      .from("voters")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (options.boothId) {
      countQuery = countQuery.eq("booth_id", options.boothId);
      query = query.eq("booth_id", options.boothId);
    }
    if (options.areaId) {
      countQuery = countQuery.eq("area_id", options.areaId);
      query = query.eq("area_id", options.areaId);
    }
    if (options.contactStatus && options.contactStatus !== "all") {
      countQuery = countQuery.eq("contact_status", options.contactStatus);
      query = query.eq("contact_status", options.contactStatus);
    }
    if (options.gender && options.gender !== "all") {
      countQuery = countQuery.eq("gender", options.gender);
      query = query.eq("gender", options.gender);
    }
    if (options.followUpStatus && options.followUpStatus !== "all") {
      countQuery = countQuery.eq("follow_up_status", options.followUpStatus);
      query = query.eq("follow_up_status", options.followUpStatus);
    }
    if (options.search) {
      const s = `%${options.search.trim()}%`;
      countQuery = countQuery.or(`name.ilike.${s},voter_id_card.ilike.${s},mobile.ilike.${s}`);
      query = query.or(`name.ilike.${s},voter_id_card.ilike.${s},mobile.ilike.${s}`);
    }

    const { count, error: countErr } = await countQuery;
    const { data, error } = await query;

    if (error) {
      console.error("Error fetching voters:", error);
      return { data: [], total: 0, page, pageSize, totalPages: 0 };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);

    return {
      data: (data || []) as Voter[],
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  public async getVoterById(clientId: string, id: string): Promise<Voter | null> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from("voters")
      .select("*")
      .eq("id", id)
      .eq("client_id", clientId)
      .single();

    if (error || !data) return null;
    return data as Voter;
  }

  public async createVoter(data: Omit<Voter, "id" | "created_at">): Promise<Voter | null> {
    const supabase = this.getClient();
    const { data: newVoter, error } = await supabase.from("voters").insert(data).select().single();
    if (error) {
      console.error("Error creating voter:", error);
      return null;
    }
    return newVoter as Voter;
  }

  public async updateVoter(
    clientId: string,
    id: string,
    updates: Partial<Voter>
  ): Promise<Voter | null> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from("voters")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("client_id", clientId)
      .select()
      .single();

    if (error) {
      console.error("Error updating voter:", error);
      return null;
    }
    return data as Voter;
  }

  public async deleteVoter(clientId: string, id: string): Promise<boolean> {
    const supabase = this.getClient();
    const { error } = await supabase.from("voters").delete().eq("id", id).eq("client_id", clientId);
    return !error;
  }

  public async bulkInsertVoters(
    clientId: string,
    voters: Array<Omit<Voter, "id" | "created_at">>
  ): Promise<{ inserted: number; errors: number }> {
    const supabase = this.getClient();
    const batchSize = 250;
    let inserted = 0;
    let errors = 0;

    for (let i = 0; i < voters.length; i += batchSize) {
      const batch = voters.slice(i, i + batchSize).map((v) => ({ ...v, client_id: clientId }));
      const { data, error } = await supabase.from("voters").insert(batch).select("id");
      if (error) {
        console.error("Batch insert error:", error);
        errors += batch.length;
      } else {
        inserted += data?.length || 0;
      }
    }

    return { inserted, errors };
  }

  // -------------------------------------------------------------------
  // TASKS
  // -------------------------------------------------------------------
  public async getTasks(
    clientId: string,
    options: { volunteerId?: string; status?: string; boothId?: string } = {}
  ): Promise<Task[]> {
    const supabase = this.getClient();
    let query = supabase.from("tasks").select("*").eq("client_id", clientId).order("created_at", { ascending: false });

    if (options.volunteerId) query = query.eq("volunteer_id", options.volunteerId);
    if (options.status && options.status !== "all") query = query.eq("status", options.status);
    if (options.boothId) query = query.eq("booth_id", options.boothId);

    const { data, error } = await query;
    if (error) return [];
    return (data || []) as Task[];
  }

  public async createTask(data: Omit<Task, "id" | "created_at">): Promise<Task | null> {
    const supabase = this.getClient();
    const { data: newTask, error } = await supabase.from("tasks").insert(data).select().single();
    if (error) return null;
    return newTask as Task;
  }

  public async updateTask(clientId: string, id: string, updates: Partial<Task>): Promise<Task | null> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from("tasks")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("client_id", clientId)
      .select()
      .single();

    if (error) return null;
    return data as Task;
  }

  public async deleteTask(clientId: string, id: string): Promise<boolean> {
    const supabase = this.getClient();
    const { error } = await supabase.from("tasks").delete().eq("id", id).eq("client_id", clientId);
    return !error;
  }

  // -------------------------------------------------------------------
  // FIELD ACTIVITIES & FOLLOW UPS
  // -------------------------------------------------------------------
  public async getFieldActivities(clientId: string, options: { volunteerId?: string } = {}): Promise<FieldActivity[]> {
    const supabase = this.getClient();
    let query = supabase.from("field_activities").select("*").eq("client_id", clientId).order("created_at", { ascending: false });
    if (options.volunteerId) query = query.eq("volunteer_id", options.volunteerId);

    const { data, error } = await query;
    if (error) return [];
    return (data || []) as FieldActivity[];
  }

  public async createFieldActivity(data: Omit<FieldActivity, "id" | "created_at">): Promise<FieldActivity | null> {
    const supabase = this.getClient();
    const { data: newAct, error } = await supabase.from("field_activities").insert(data).select().single();
    if (error) return null;
    return newAct as FieldActivity;
  }

  public async getFollowUps(clientId: string, options: { status?: string } = {}): Promise<FollowUp[]> {
    const supabase = this.getClient();
    let query = supabase.from("follow_ups").select("*").eq("client_id", clientId).order("scheduled_date", { ascending: true });
    if (options.status && options.status !== "all") query = query.eq("status", options.status);

    const { data, error } = await query;
    if (error) return [];
    return (data || []) as FollowUp[];
  }

  public async createFollowUp(data: Omit<FollowUp, "id" | "created_at">): Promise<FollowUp | null> {
    const supabase = this.getClient();
    const { data: newFu, error } = await supabase.from("follow_ups").insert(data).select().single();
    if (error) return null;
    return newFu as FollowUp;
  }

  public async updateFollowUp(clientId: string, id: string, updates: Partial<FollowUp>): Promise<FollowUp | null> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from("follow_ups")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("client_id", clientId)
      .select()
      .single();

    if (error) return null;
    return data as FollowUp;
  }

  // -------------------------------------------------------------------
  // POLLING DAY MODULE (TURNOUT TELEMETRY - PRIVACY PRESERVING)
  // -------------------------------------------------------------------
  public async getPollingDays(clientId: string): Promise<PollingDay[]> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from("polling_days")
      .select("*")
      .eq("client_id", clientId)
      .order("polling_date", { ascending: false });

    if (error) return [];
    return (data || []) as PollingDay[];
  }

  public async getActivePollingDay(clientId: string): Promise<PollingDay | null> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from("polling_days")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return data as PollingDay;
  }

  public async getPollingDayDashboardStats(
    clientId: string,
    pollingDayId?: string
  ): Promise<PollingDayDashboardStats> {
    const supabase = this.getClient();

    // 1. Get total voters for this client
    const { count: totalVoters } = await supabase
      .from("voters")
      .select("id", { count: "exact", head: true })
      .eq("client_id", clientId);

    // 2. Get status updates for this polling day
    let updatesQuery = supabase.from("polling_day_updates").select("status, booth_id").eq("client_id", clientId);
    if (pollingDayId) {
      updatesQuery = updatesQuery.eq("polling_day_id", pollingDayId);
    }
    const { data: updates } = await updatesQuery;

    const total = totalVoters || 0;
    const voted = (updates || []).filter((u) => u.status === "VOTE_CAST" || u.status === "VOTING_REPORTED").length;
    const pending = total - voted;
    const turnoutPercentage = total > 0 ? Math.round((voted / total) * 1000) / 10 : 0;

    const notReported = (updates || []).filter((u) => u.status === "NOT_REPORTED").length;

    return {
      pollingDay: null,
      totalVoters: total,
      voteCastCount: voted,
      statusReported: (updates || []).length,
      votingActivityReported: voted,
      pendingVoters: pending,
      notReportedCount: notReported,
      followUpsCount: 0,
      turnoutPercentage,
      hourlyActivity: [],
      recentUpdates: [],
      boothStats: [],
      volunteerStats: [],
    };
  }

  public async recordPollingStatusUpdate(
    clientId: string,
    data: {
      polling_day_id: string;
      campaign_id: string;
      voter_id: string;
      booth_id?: string;
      volunteer_id?: string;
      status: string;
      updated_by: string;
      updated_by_role?: string;
      note?: string;
    }
  ): Promise<PollingDayUpdate | null> {
    const supabase = this.getClient();
    const { data: record, error } = await supabase
      .from("polling_day_updates")
      .upsert(
        {
          client_id: clientId,
          polling_day_id: data.polling_day_id,
          campaign_id: data.campaign_id,
          voter_id: data.voter_id,
          booth_id: data.booth_id || null,
          volunteer_id: data.volunteer_id || null,
          status: data.status,
          updated_by: data.updated_by,
          updated_by_role: data.updated_by_role || "volunteer",
          note: data.note || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "polling_day_id,voter_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("Error recording polling status update:", error);
      return null;
    }
    return record as PollingDayUpdate;
  }

  // -------------------------------------------------------------------
  // DASHBOARDS AGGREGATES
  // -------------------------------------------------------------------
  public async getCandidateDashboardStats(clientId: string) {
    const supabase = this.getClient();

    const [
      { count: totalVoters },
      { count: contactedVoters },
      { count: favorableVoters },
      { count: totalBooths },
      { count: totalVolunteers },
      { count: pendingTasks },
      { count: pendingFollowUps },
      { data: recentActivities },
    ] = await Promise.all([
      supabase.from("voters").select("id", { count: "exact", head: true }).eq("client_id", clientId),
      supabase.from("voters").select("id", { count: "exact", head: true }).eq("client_id", clientId).neq("contact_status", "uncontacted"),
      supabase.from("voters").select("id", { count: "exact", head: true }).eq("client_id", clientId).eq("contact_status", "favorable"),
      supabase.from("booths").select("id", { count: "exact", head: true }).eq("client_id", clientId),
      supabase.from("volunteers").select("id", { count: "exact", head: true }).eq("client_id", clientId),
      supabase.from("tasks").select("id", { count: "exact", head: true }).eq("client_id", clientId).eq("status", "pending"),
      supabase.from("follow_ups").select("id", { count: "exact", head: true }).eq("client_id", clientId).eq("status", "pending"),
      supabase.from("field_activities").select("*").eq("client_id", clientId).order("created_at", { ascending: false }).limit(6),
    ]);

    const total = totalVoters || 0;
    const contacted = contactedVoters || 0;
    const contactCoverage = total > 0 ? Math.round((contacted / total) * 100) : 0;

    return {
      totalVoters: total,
      contactedVoters: contacted,
      favorableVoters: favorableVoters || 0,
      contactCoverage,
      totalBooths: totalBooths || 0,
      totalVolunteers: totalVolunteers || 0,
      pendingTasks: pendingTasks || 0,
      pendingFollowUps: pendingFollowUps || 0,
      recentActivities: (recentActivities || []) as FieldActivity[],
    };
  }

  public async getVolunteerDashboardStats(clientId: string, volunteerUserId?: string) {
    const supabase = this.getClient();

    const [
      { count: totalVoters },
      { count: contactedVoters },
      { count: totalBooths },
      { count: pendingTasks },
      { count: myFollowUps },
      { data: myActivities },
    ] = await Promise.all([
      supabase.from("voters").select("id", { count: "exact", head: true }).eq("client_id", clientId),
      supabase.from("voters").select("id", { count: "exact", head: true }).eq("client_id", clientId).neq("contact_status", "uncontacted"),
      supabase.from("booths").select("id", { count: "exact", head: true }).eq("client_id", clientId),
      supabase.from("tasks").select("id", { count: "exact", head: true }).eq("client_id", clientId).eq("status", "pending"),
      supabase.from("follow_ups").select("id", { count: "exact", head: true }).eq("client_id", clientId).eq("status", "pending"),
      supabase.from("field_activities").select("*").eq("client_id", clientId).order("created_at", { ascending: false }).limit(5),
    ]);

    return {
      totalVoters: totalVoters || 0,
      contactedVoters: contactedVoters || 0,
      totalBooths: totalBooths || 0,
      pendingTasks: pendingTasks || 0,
      pendingFollowUps: myFollowUps || 0,
      recentActivities: (myActivities || []) as FieldActivity[],
    };
  }

  public async getSuperAdminDashboardStats() {
    const supabase = this.getClient();

    const [
      { count: totalClients },
      { count: activeCampaigns },
      { count: totalVolunteers },
      { count: totalVoters },
      { data: recentLogs },
    ] = await Promise.all([
      supabase.from("clients").select("id", { count: "exact", head: true }),
      supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("volunteers").select("id", { count: "exact", head: true }),
      supabase.from("voters").select("id", { count: "exact", head: true }),
      supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(10),
    ]);

    return {
      totalClients: totalClients || 0,
      activeCampaigns: activeCampaigns || 0,
      totalVolunteers: totalVolunteers || 0,
      totalVoters: totalVoters || 0,
      recentLogs: (recentLogs || []) as AuditLog[],
    };
  }
}

export const db = new DatabaseService();
