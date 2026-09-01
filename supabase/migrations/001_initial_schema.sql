-- =====================================================================
-- CHUNAV SETU - PRODUCTION MULTI-TENANT DATABASE SCHEMA & RLS POLICIES
-- =====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------
-- 1. PROFILES & ROLES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'client_admin', 'volunteer')),
    client_id UUID,
    mobile TEXT,
    avatar_url TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 2. CLIENTS (TENANTS)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    candidate_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    campaign_name TEXT NOT NULL,
    election_type TEXT NOT NULL, -- e.g., 'Lok Sabha', 'Vidhan Sabha', 'Municipal Corporation', 'Panchayat'
    location TEXT NOT NULL,      -- e.g., 'Varanasi North', 'Pune Central Ward 12'
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    logo_url TEXT,
    settings JSONB DEFAULT '{"allow_volunteer_registration": false, "contact_targets_per_day": 50}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Foreign key link for profiles.client_id
ALTER TABLE public.profiles 
    ADD CONSTRAINT fk_profiles_client 
    FOREIGN KEY (client_id) 
    REFERENCES public.clients(id) 
    ON DELETE SET NULL;

-- ---------------------------------------------------------------------
-- 3. CAMPAIGNS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    election_date DATE,
    target_voters INT DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'paused')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 4. AREAS / WARDS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    ward_number TEXT,
    pincode TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 5. BOOTHS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.booths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    area_id UUID REFERENCES public.areas(id) ON DELETE SET NULL,
    booth_number TEXT NOT NULL,
    booth_name TEXT NOT NULL,
    location_address TEXT,
    target_voter_count INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(client_id, booth_number)
);

-- ---------------------------------------------------------------------
-- 6. VOLUNTEERS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.volunteers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    email TEXT,
    assigned_booth_id UUID REFERENCES public.booths(id) ON DELETE SET NULL,
    assigned_area_id UUID REFERENCES public.areas(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 7. VOTERS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.voters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    booth_id UUID REFERENCES public.booths(id) ON DELETE SET NULL,
    area_id UUID REFERENCES public.areas(id) ON DELETE SET NULL,
    voter_id_card TEXT NOT NULL, -- e.g. EPIC number
    name TEXT NOT NULL,
    mobile TEXT,
    age INT,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other', 'Unknown')),
    address TEXT,
    contact_status TEXT NOT NULL DEFAULT 'uncontacted' 
        CHECK (contact_status IN ('uncontacted', 'contacted', 'not_available', 'favorable', 'unfavorable', 'undecided')),
    follow_up_status TEXT NOT NULL DEFAULT 'none' 
        CHECK (follow_up_status IN ('none', 'pending', 'completed')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(client_id, voter_id_card)
);

-- ---------------------------------------------------------------------
-- 8. TASKS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE SET NULL,
    booth_id UUID REFERENCES public.booths(id) ON DELETE SET NULL,
    area_id UUID REFERENCES public.areas(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 9. FIELD ACTIVITIES (DOOR-TO-DOOR LOGS)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.field_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    volunteer_id UUID NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL REFERENCES public.voters(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL DEFAULT 'door_to_door' 
        CHECK (activity_type IN ('door_to_door', 'phone_call', 'slip_distribution', 'rally', 'meeting')),
    outcome TEXT NOT NULL, -- e.g., 'Supporter', 'Opposed', 'Neutral', 'Shifted address'
    notes TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 10. FOLLOW-UPS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.follow_ups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL REFERENCES public.voters(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE SET NULL,
    scheduled_date DATE NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    note TEXT,
    resolution_note TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 11. SUBSCRIPTIONS (SUPER ADMIN MANAGEMENT)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL CHECK (plan_name IN ('ward_starter', 'assembly_pro', 'parliament_enterprise')),
    max_voters INT NOT NULL DEFAULT 5000,
    max_volunteers INT NOT NULL DEFAULT 20,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
    valid_until TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 12. AUDIT LOGS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 13. PERFORMANCE INDEXES
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_client_id ON public.profiles(client_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);

CREATE INDEX IF NOT EXISTS idx_campaigns_client_id ON public.campaigns(client_id);

CREATE INDEX IF NOT EXISTS idx_areas_client_campaign ON public.areas(client_id, campaign_id);

CREATE INDEX IF NOT EXISTS idx_booths_client_id ON public.booths(client_id);
CREATE INDEX IF NOT EXISTS idx_booths_area_id ON public.booths(area_id);
CREATE INDEX IF NOT EXISTS idx_booths_number ON public.booths(booth_number);

CREATE INDEX IF NOT EXISTS idx_volunteers_client_id ON public.volunteers(client_id);
CREATE INDEX IF NOT EXISTS idx_volunteers_user_id ON public.volunteers(user_id);
CREATE INDEX IF NOT EXISTS idx_volunteers_booth ON public.volunteers(assigned_booth_id);

CREATE INDEX IF NOT EXISTS idx_voters_client_id ON public.voters(client_id);
CREATE INDEX IF NOT EXISTS idx_voters_campaign_id ON public.voters(campaign_id);
CREATE INDEX IF NOT EXISTS idx_voters_booth_id ON public.voters(booth_id);
CREATE INDEX IF NOT EXISTS idx_voters_area_id ON public.voters(area_id);
CREATE INDEX IF NOT EXISTS idx_voters_contact_status ON public.voters(contact_status);
CREATE INDEX IF NOT EXISTS idx_voters_follow_up ON public.voters(follow_up_status);
CREATE INDEX IF NOT EXISTS idx_voters_card ON public.voters(voter_id_card);
CREATE INDEX IF NOT EXISTS idx_voters_mobile ON public.voters(mobile);

CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON public.tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_volunteer_id ON public.tasks(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

CREATE INDEX IF NOT EXISTS idx_field_activities_client_id ON public.field_activities(client_id);
CREATE INDEX IF NOT EXISTS idx_field_activities_volunteer ON public.field_activities(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_field_activities_voter ON public.field_activities(voter_id);

CREATE INDEX IF NOT EXISTS idx_follow_ups_client_id ON public.follow_ups(client_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_date ON public.follow_ups(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_follow_ups_status ON public.follow_ups(status);

CREATE INDEX IF NOT EXISTS idx_audit_logs_client ON public.audit_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);


-- ---------------------------------------------------------------------
-- 14. ROW LEVEL SECURITY (RLS) HELPER FUNCTIONS & POLICIES
-- ---------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper to check user's role
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Helper to check user's client_id
CREATE OR REPLACE FUNCTION public.get_auth_client_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT client_id FROM public.profiles WHERE id = auth.uid();
$$;

-- PROFILES POLICIES
CREATE POLICY "Super admin can view and manage all profiles"
    ON public.profiles FOR ALL
    USING (public.get_auth_role() = 'super_admin');

CREATE POLICY "Users can view and update their own profile"
    ON public.profiles FOR ALL
    USING (id = auth.uid());

CREATE POLICY "Client admin can view profiles of their tenant"
    ON public.profiles FOR SELECT
    USING (client_id = public.get_auth_client_id());

-- CLIENTS POLICIES
CREATE POLICY "Super admin has full access to clients"
    ON public.clients FOR ALL
    USING (public.get_auth_role() = 'super_admin');

CREATE POLICY "Client admins can view and update their own client record"
    ON public.clients FOR ALL
    USING (id = public.get_auth_client_id());

-- CAMPAIGNS POLICIES
CREATE POLICY "Super admin full access to campaigns"
    ON public.campaigns FOR ALL
    USING (public.get_auth_role() = 'super_admin');

CREATE POLICY "Tenant users can view their campaigns"
    ON public.campaigns FOR SELECT
    USING (client_id = public.get_auth_client_id());

CREATE POLICY "Client admins can manage their campaigns"
    ON public.campaigns FOR ALL
    USING (client_id = public.get_auth_client_id() AND public.get_auth_role() = 'client_admin');

-- BOOTHS POLICIES
CREATE POLICY "Super admin full access to booths"
    ON public.booths FOR ALL
    USING (public.get_auth_role() = 'super_admin');

CREATE POLICY "Tenant users can view booths"
    ON public.booths FOR SELECT
    USING (client_id = public.get_auth_client_id());

CREATE POLICY "Client admins can manage booths"
    ON public.booths FOR ALL
    USING (client_id = public.get_auth_client_id() AND public.get_auth_role() = 'client_admin');

-- VOTERS POLICIES
CREATE POLICY "Super admin full access to voters"
    ON public.voters FOR ALL
    USING (public.get_auth_role() = 'super_admin');

CREATE POLICY "Client admins full access to their voters"
    ON public.voters FOR ALL
    USING (client_id = public.get_auth_client_id() AND public.get_auth_role() = 'client_admin');

CREATE POLICY "Volunteers can view and update permitted voters in their client campaign"
    ON public.voters FOR ALL
    USING (client_id = public.get_auth_client_id() AND public.get_auth_role() = 'volunteer');

-- VOLUNTEERS POLICIES
CREATE POLICY "Super admin full access to volunteers"
    ON public.volunteers FOR ALL
    USING (public.get_auth_role() = 'super_admin');

CREATE POLICY "Client admins full access to their volunteers"
    ON public.volunteers FOR ALL
    USING (client_id = public.get_auth_client_id() AND public.get_auth_role() = 'client_admin');

CREATE POLICY "Volunteers can view their own record"
    ON public.volunteers FOR SELECT
    USING (user_id = auth.uid() OR client_id = public.get_auth_client_id());

-- TASKS POLICIES
CREATE POLICY "Super admin full access to tasks"
    ON public.tasks FOR ALL
    USING (public.get_auth_role() = 'super_admin');

CREATE POLICY "Client admins full access to their tasks"
    ON public.tasks FOR ALL
    USING (client_id = public.get_auth_client_id() AND public.get_auth_role() = 'client_admin');

CREATE POLICY "Volunteers can view and update their assigned tasks"
    ON public.tasks FOR ALL
    USING (client_id = public.get_auth_client_id() AND public.get_auth_role() = 'volunteer');

-- FIELD ACTIVITIES POLICIES
CREATE POLICY "Super admin full access to field activities"
    ON public.field_activities FOR ALL
    USING (public.get_auth_role() = 'super_admin');

CREATE POLICY "Client admins can view all field activities in their campaign"
    ON public.field_activities FOR SELECT
    USING (client_id = public.get_auth_client_id());

CREATE POLICY "Volunteers can insert and view their own field activities"
    ON public.field_activities FOR ALL
    USING (client_id = public.get_auth_client_id());

-- FOLLOW-UPS POLICIES
CREATE POLICY "Super admin full access to follow ups"
    ON public.follow_ups FOR ALL
    USING (public.get_auth_role() = 'super_admin');

CREATE POLICY "Client admins full access to follow ups"
    ON public.follow_ups FOR ALL
    USING (client_id = public.get_auth_client_id());

CREATE POLICY "Volunteers can view and update follow ups"
    ON public.follow_ups FOR ALL
    USING (client_id = public.get_auth_client_id());
