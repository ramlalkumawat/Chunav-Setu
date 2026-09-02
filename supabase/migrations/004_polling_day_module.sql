-- =====================================================================
-- CHUNAV SETU - POLLING DAY (मतदान दिवस) MODULE DATABASE SCHEMA & RLS
-- Migration: 004_polling_day_module.sql
-- =====================================================================

-- 0. EXTEND CLIENTS TABLE FOR BRANDING & ELECTION DATE
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS poster_url TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS poster_alt TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS election_date DATE;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS username TEXT;

-- 1. POLLING DAYS TABLE
CREATE TABLE IF NOT EXISTS public.polling_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    polling_date DATE NOT NULL,
    start_time TEXT DEFAULT '07:00 AM',
    end_time TEXT DEFAULT '06:00 PM',
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
    total_target_voters INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(client_id, polling_date)
);

-- 2. POLLING DAY UPDATES TABLE (Rapid Field Turnout Telemetry)
-- STRICT PRIVACY: NEVER records voter choice or political vote preference.
CREATE TABLE IF NOT EXISTS public.polling_day_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    polling_day_id UUID NOT NULL REFERENCES public.polling_days(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL REFERENCES public.voters(id) ON DELETE CASCADE,
    booth_id UUID REFERENCES public.booths(id) ON DELETE SET NULL,
    volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('VOTE_CAST', 'PENDING', 'NOT_REPORTED', 'VOTING_REPORTED', 'FOLLOW_UP_REQUIRED')),
    previous_status TEXT,
    note TEXT,
    updated_by TEXT NOT NULL,
    updated_by_role TEXT DEFAULT 'volunteer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(polling_day_id, voter_id)
);

-- 3. POLLING DAY FOLLOW-UPS TABLE (Operational Callbacks / Issues)
CREATE TABLE IF NOT EXISTS public.polling_day_followups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    polling_day_id UUID NOT NULL REFERENCES public.polling_days(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL REFERENCES public.voters(id) ON DELETE CASCADE,
    booth_id UUID REFERENCES public.booths(id) ON DELETE SET NULL,
    volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    note TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_polling_days_client ON public.polling_days(client_id);
CREATE INDEX IF NOT EXISTS idx_polling_days_status ON public.polling_days(status);
CREATE INDEX IF NOT EXISTS idx_polling_updates_client ON public.polling_day_updates(client_id);
CREATE INDEX IF NOT EXISTS idx_polling_updates_pd ON public.polling_day_updates(polling_day_id);
CREATE INDEX IF NOT EXISTS idx_polling_updates_booth ON public.polling_day_updates(booth_id);
CREATE INDEX IF NOT EXISTS idx_polling_updates_vol ON public.polling_day_updates(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_polling_updates_status ON public.polling_day_updates(status);
CREATE INDEX IF NOT EXISTS idx_polling_updates_created ON public.polling_day_updates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_polling_followups_client ON public.polling_day_followups(client_id);
CREATE INDEX IF NOT EXISTS idx_polling_followups_status ON public.polling_day_followups(status);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.polling_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polling_days FORCE ROW LEVEL SECURITY;

ALTER TABLE public.polling_day_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polling_day_updates FORCE ROW LEVEL SECURITY;

ALTER TABLE public.polling_day_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polling_day_followups FORCE ROW LEVEL SECURITY;

-- POLLING DAYS POLICIES
CREATE POLICY "Super admin full access to polling_days"
    ON public.polling_days FOR ALL
    USING (public.get_auth_role() = 'super_admin');

CREATE POLICY "Client admin full access to their polling_days"
    ON public.polling_days FOR ALL
    USING (client_id = public.get_auth_client_id() AND public.get_auth_role() = 'client_admin')
    WITH CHECK (client_id = public.get_auth_client_id() AND public.get_auth_role() = 'client_admin');

CREATE POLICY "Volunteers can view their client polling_days"
    ON public.polling_days FOR SELECT
    USING (client_id = public.get_auth_client_id() AND public.get_auth_role() = 'volunteer');

-- POLLING DAY UPDATES POLICIES
CREATE POLICY "Super admin full access to polling_day_updates"
    ON public.polling_day_updates FOR ALL
    USING (public.get_auth_role() = 'super_admin');

CREATE POLICY "Client admin full access to their polling_day_updates"
    ON public.polling_day_updates FOR ALL
    USING (client_id = public.get_auth_client_id() AND public.get_auth_role() = 'client_admin')
    WITH CHECK (client_id = public.get_auth_client_id() AND public.get_auth_role() = 'client_admin');

CREATE POLICY "Volunteers view assigned booth polling updates"
    ON public.polling_day_updates FOR SELECT
    USING (
      client_id = public.get_auth_client_id()
      AND public.get_auth_role() = 'volunteer'
      AND (booth_id = public.get_auth_volunteer_booth_id() OR booth_id IS NULL)
    );

CREATE POLICY "Volunteers insert and update assigned booth polling updates"
    ON public.polling_day_updates FOR ALL
    USING (
      client_id = public.get_auth_client_id()
      AND public.get_auth_role() = 'volunteer'
      AND (booth_id = public.get_auth_volunteer_booth_id() OR booth_id IS NULL)
    )
    WITH CHECK (
      client_id = public.get_auth_client_id()
      AND public.get_auth_role() = 'volunteer'
    );

-- POLLING DAY FOLLOW-UPS POLICIES
CREATE POLICY "Super admin full access to polling_day_followups"
    ON public.polling_day_followups FOR ALL
    USING (public.get_auth_role() = 'super_admin');

CREATE POLICY "Client admin full access to polling_day_followups"
    ON public.polling_day_followups FOR ALL
    USING (client_id = public.get_auth_client_id() AND public.get_auth_role() = 'client_admin')
    WITH CHECK (client_id = public.get_auth_client_id() AND public.get_auth_role() = 'client_admin');

CREATE POLICY "Volunteers view and manage assigned polling followups"
    ON public.polling_day_followups FOR ALL
    USING (
      client_id = public.get_auth_client_id()
      AND public.get_auth_role() = 'volunteer'
      AND (volunteer_id IN (SELECT id FROM public.volunteers WHERE user_id = auth.uid()) OR booth_id = public.get_auth_volunteer_booth_id())
    )
    WITH CHECK (
      client_id = public.get_auth_client_id()
      AND public.get_auth_role() = 'volunteer'
    );
