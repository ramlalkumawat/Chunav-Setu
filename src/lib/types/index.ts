export type UserRole = 'super_admin' | 'client_admin' | 'volunteer';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  client_id?: string;
  mobile?: string;
  avatar_url?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at?: string;
}

export interface Client {
  id: string;
  name: string;
  candidate_name: string;
  mobile: string;
  email: string;
  username?: string;
  password?: string;
  campaign_name: string;
  election_type: 'Vidhan Sabha' | 'Lok Sabha' | 'Municipal Corporation' | 'Panchayat' | 'Zilla Parishad' | string;
  election_date?: string;
  location: string;
  status: 'active' | 'inactive' | 'archived';
  logo_url?: string;
  poster_url?: string;
  poster_alt?: string;
  created_at: string;
  updated_at?: string;
  // Computed aggregations
  voter_count?: number;
  volunteer_count?: number;
  booth_count?: number;
  campaign_count?: number;
}

export interface Campaign {
  id: string;
  client_id: string;
  title: string;
  description?: string;
  election_date?: string;
  target_voters: number;
  status: 'draft' | 'active' | 'completed' | 'paused';
  created_at: string;
  updated_at?: string;
}

export interface Area {
  id: string;
  client_id: string;
  campaign_id: string;
  name: string;
  ward_number?: string;
  pincode?: string;
  description?: string;
  created_at: string;
  booth_count?: number;
  voter_count?: number;
}

export interface Booth {
  id: string;
  client_id: string;
  campaign_id: string;
  area_id?: string;
  area_name?: string;
  booth_number: string;
  booth_name: string;
  location_address?: string;
  target_voter_count: number;
  voter_count?: number;
  contacted_count?: number;
  assigned_volunteers_count?: number;
  assigned_volunteers?: Volunteer[];
  progress_percentage?: number;
  created_at: string;
  updated_at?: string;
}

export interface Volunteer {
  id: string;
  client_id: string;
  user_id?: string;
  name: string;
  mobile: string;
  email?: string;
  username?: string;
  password?: string;
  assigned_booth_id?: string;
  assigned_booth_name?: string;
  assigned_area_id?: string;
  assigned_area_name?: string;
  status: 'active' | 'inactive';
  joining_date: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  // Aggregated activity stats
  total_contacts?: number;
  pending_tasks?: number;
  completed_tasks?: number;
}

export type ContactStatus = 
  | 'uncontacted' 
  | 'contacted' 
  | 'favorable' 
  | 'unfavorable' 
  | 'undecided' 
  | 'not_available';

export type FollowUpStatus = 'none' | 'pending' | 'completed';

export interface Voter {
  id: string;
  client_id: string;
  campaign_id: string;
  booth_id?: string;
  booth_number?: string;
  booth_name?: string;
  area_id?: string;
  area_name?: string;
  voter_id_card: string; // EPIC No
  name: string;
  mobile?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other' | 'Unknown';
  address?: string;
  contact_status: ContactStatus;
  follow_up_status: FollowUpStatus;
  notes?: string;
  created_at: string;
  updated_at?: string;
  last_contacted_by?: string;
  last_contacted_at?: string;
  // Communication preferences & telemetry
  whatsapp_allowed?: boolean;
  calling_allowed?: boolean;
  opt_out?: boolean;
  last_called_at?: string;
  last_call_status?: CallOutcome | string;
  last_whatsapp_at?: string;
  last_slip_generated_at?: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Task {
  id: string;
  client_id: string;
  campaign_id: string;
  volunteer_id?: string;
  volunteer_name?: string;
  booth_id?: string;
  booth_name?: string;
  area_id?: string;
  area_name?: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  due_date?: string;
  status: TaskStatus;
  created_at: string;
  updated_at?: string;
}

export interface FieldActivity {
  id: string;
  client_id: string;
  campaign_id: string;
  volunteer_id: string;
  volunteer_name: string;
  voter_id: string;
  voter_name: string;
  voter_card?: string;
  booth_name?: string;
  activity_type: 'door_to_door' | 'phone_call' | 'slip_distribution' | 'rally' | 'meeting';
  outcome: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

export interface FollowUp {
  id: string;
  client_id: string;
  campaign_id: string;
  voter_id: string;
  voter_name: string;
  voter_card?: string;
  voter_mobile?: string;
  voter_address?: string;
  booth_name?: string;
  volunteer_id?: string;
  volunteer_name?: string;
  scheduled_date: string;
  priority: TaskPriority;
  status: 'pending' | 'completed' | 'cancelled';
  note?: string;
  resolution_note?: string;
  resolved_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface Subscription {
  id: string;
  client_id: string;
  client_name?: string;
  plan_name: 'ward_starter' | 'assembly_pro' | 'parliament_enterprise';
  max_voters: number;
  max_volunteers: number;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  valid_until: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  client_id?: string;
  client_name?: string;
  actor_id?: string;
  actor_name: string;
  action: string;
  target_type: string;
  target_id?: string;
  details?: Record<string, any>;
  created_at: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ---------------------------------------------------------------------
// POLLING DAY (मतदान दिवस) MODULE TYPES — OPERATIONAL STATUS ONLY
// ---------------------------------------------------------------------
export type PollingDayStatus = 'upcoming' | 'active' | 'completed';
export type PollingVoterStatus = 'VOTE_CAST' | 'PENDING' | 'NOT_REPORTED' | 'VOTING_REPORTED' | 'FOLLOW_UP_REQUIRED';

export interface PollingDay {
  id: string;
  client_id: string;
  campaign_id: string;
  title: string;
  polling_date: string;
  start_time?: string;
  end_time?: string;
  status: PollingDayStatus;
  total_target_voters?: number;
  created_at: string;
  updated_at?: string;
}

export interface PollingDayUpdate {
  id: string;
  client_id: string;
  campaign_id: string;
  polling_day_id: string;
  voter_id: string;
  voter_name: string;
  voter_id_card: string;
  booth_id: string;
  booth_number: string;
  booth_name: string;
  area_name?: string;
  volunteer_id?: string;
  volunteer_name?: string;
  status: PollingVoterStatus;
  previous_status?: PollingVoterStatus;
  note?: string;
  updated_by: string;
  updated_by_role?: string;
  created_at: string;
  updated_at?: string;
}

export interface PollingDayFollowUp {
  id: string;
  client_id: string;
  campaign_id: string;
  polling_day_id: string;
  voter_id: string;
  voter_name: string;
  voter_id_card: string;
  booth_id: string;
  booth_number: string;
  booth_name: string;
  area_name?: string;
  volunteer_id?: string;
  volunteer_name?: string;
  reason: string;
  note?: string;
  status: 'pending' | 'completed';
  created_at: string;
  completed_at?: string;
}

export interface PollingDayBoothStats {
  booth_id: string;
  booth_number: string;
  booth_name: string;
  area_name: string;
  total_voters: number;
  reported_count: number;
  vote_cast_count: number;
  voting_reported_count: number;
  pending_count: number;
  not_reported_count: number;
  follow_up_count: number;
  progress_percentage: number;
  assigned_volunteers_count: number;
}

export interface PollingDayVolunteerStats {
  volunteer_id: string;
  name: string;
  mobile: string;
  assigned_booth_id: string;
  assigned_booth_name: string;
  assigned_area_name: string;
  updates_today: number;
  vote_cast_updates: number;
  pending_updates: number;
  last_update_time?: string;
  pending_followups: number;
  is_active: boolean;
}

export interface PollingDayDashboardStats {
  pollingDay: PollingDay | null;
  totalVoters: number;
  voteCastCount: number;
  statusReported: number;
  votingActivityReported: number;
  pendingVoters: number;
  notReportedCount: number;
  followUpsCount: number;
  turnoutPercentage: number;
  hourlyActivity: { hour: string; label: string; count: number }[];
  recentUpdates: PollingDayUpdate[];
  boothStats: PollingDayBoothStats[];
  volunteerStats: PollingDayVolunteerStats[];
}

// ---------------------------------------------------------------------
// COMMUNICATION (संचार) & POLLING SERVICES MODULE TYPES
// ---------------------------------------------------------------------
export type CommunicationChannel = 'CALL' | 'WHATSAPP' | 'POLLING_SLIP';

export type CommunicationAction = 
  | 'CALL_ATTEMPTED'
  | 'CALL_CONNECTED'
  | 'WHATSAPP_OPENED'
  | 'POLLING_SLIP_GENERATED'
  | 'POLLING_SLIP_SHARED';

export type CallOutcome = 
  | 'Connected'
  | 'No Answer'
  | 'Busy'
  | 'Wrong Number'
  | 'Follow-up Required';

export interface CommunicationLog {
  id: string;
  client_id: string;
  campaign_id: string;
  voter_id: string;
  voter_name: string;
  voter_card: string;
  voter_mobile?: string;
  booth_id?: string;
  booth_number?: string;
  booth_name?: string;
  area_name?: string;
  user_id?: string;
  user_role: UserRole;
  actor_name: string;
  channel: CommunicationChannel;
  action: CommunicationAction;
  status: CallOutcome | string; // e.g., 'Connected', 'Slip Shared', 'Slip Generated', 'Opened'
  note?: string;
  created_at: string;
}

export interface PollingSlipRecord {
  id: string;
  client_id: string;
  campaign_id: string;
  voter_id: string;
  voter_name: string;
  voter_card: string;
  booth_number: string;
  booth_name: string;
  polling_date: string;
  polling_time: string;
  slip_number: string;
  created_by: string;
  created_at: string;
  shared_via_whatsapp?: boolean;
}

export interface CommunicationSummaryStats {
  todaysCalls: number;
  connectedCalls: number;
  whatsAppActivity: number;
  pollingSlipsGenerated: number;
  pendingFollowUps: number;
  totalVoters: number;
  contactablePhoneVoters: number;
  optedOutCount: number;
  channelBreakdown: {
    calls: number;
    whatsapp: number;
    slips: number;
  };
  recentLogs: CommunicationLog[];
}

// ---------------------------------------------------------------------
// STORAGE & FILE ASSET TYPES
// ---------------------------------------------------------------------
export type StorageProvider = 'supabase_storage' | 'cloudflare_r2' | 'local';
export type CampaignFileCategory = 'posters' | 'images' | 'documents' | 'branding' | 'other';
export type FileAssetStatus = 'active' | 'inactive' | 'archived' | 'deleted';

export interface FileAsset {
  id: string;
  client_id: string;
  campaign_id?: string;
  uploaded_by?: string;
  module: string;             // 'branding' | 'voter_import' | 'campaign_media' | 'documents' | string
  entity_type?: string;       // 'client_poster' | 'voter_list' | 'campaign_banner' | string
  entity_id?: string;
  file_name: string;
  file_extension: string;
  mime_type: string;
  storage_provider: StorageProvider;
  storage_path: string;       // e.g. "campaign-files/{client_id}/posters/{filename}"
  file_size: number;          // Size in bytes
  status: FileAssetStatus;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

export interface StorageUploadResult {
  success: boolean;
  fileAsset?: FileAsset;
  storagePath?: string;
  signedUrl?: string;
  error?: string;
}

export interface StorageSignedUrlResult {
  success: boolean;
  signedUrl?: string;
  expiresIn?: number;
  error?: string;
}

export interface StorageValidationOptions {
  allowedMimeTypes?: string[];
  maxSizeBytes?: number;
}
