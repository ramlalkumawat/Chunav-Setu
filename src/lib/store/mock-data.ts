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
  PollingDay,
  PollingDayUpdate,
  PollingDayFollowUp,
  CommunicationLog,
  PollingSlipRecord,
  FileAsset,
} from "../types";

/**
 * Production Empty Initial States
 * Chunav Setu does NOT load any fake/mock records.
 * All records are fetched dynamically from live Supabase PostgreSQL.
 */
export const INITIAL_PROFILES: UserProfile[] = [];
export const INITIAL_CLIENTS: Client[] = [];
export const INITIAL_CAMPAIGNS: Campaign[] = [];
export const INITIAL_AREAS: Area[] = [];
export const INITIAL_BOOTHS: Booth[] = [];
export const INITIAL_VOLUNTEERS: Volunteer[] = [];
export const INITIAL_VOTERS: Voter[] = [];
export const INITIAL_TASKS: Task[] = [];
export const INITIAL_FIELD_ACTIVITIES: FieldActivity[] = [];
export const INITIAL_FOLLOW_UPS: FollowUp[] = [];
export const INITIAL_SUBSCRIPTIONS: Subscription[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
export const INITIAL_POLLING_DAYS: PollingDay[] = [];
export const INITIAL_POLLING_UPDATES: PollingDayUpdate[] = [];
export const INITIAL_POLLING_FOLLOWUPS: PollingDayFollowUp[] = [];
export const INITIAL_COMMUNICATION_LOGS: CommunicationLog[] = [];
export const INITIAL_POLLING_SLIPS: PollingSlipRecord[] = [];
export const INITIAL_FILE_ASSETS: FileAsset[] = [];
