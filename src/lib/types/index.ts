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
  campaign_name: string;
  election_type: 'Vidhan Sabha' | 'Lok Sabha' | 'Municipal Corporation' | 'Panchayat' | 'Zilla Parishad' | string;
  location: string;
  status: 'active' | 'inactive' | 'archived';
  logo_url?: string;
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
