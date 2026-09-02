-- =====================================================================
-- CHUNAV SETU - COMMUNICATION & POLLING SLIP MODULE SCHEMA & RLS
-- Migration: 005_communication_module.sql
-- =====================================================================

-- 1. EXTEND VOTERS TABLE WITH COMMUNICATION PREFERENCES & TELEMETRY
ALTER TABLE public.voters ADD COLUMN IF NOT EXISTS whatsapp_allowed BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.voters ADD COLUMN IF NOT EXISTS calling_allowed BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.voters ADD COLUMN IF NOT EXISTS opt_out BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.voters ADD COLUMN IF NOT EXISTS last_called_at TIMESTAMPTZ;
ALTER TABLE public.voters ADD COLUMN IF NOT EXISTS last_call_status TEXT;
ALTER TABLE public.voters ADD COLUMN IF NOT EXISTS last_whatsapp_at TIMESTAMPTZ;
ALTER TABLE public.voters ADD COLUMN IF NOT EXISTS last_slip_generated_at TIMESTAMPTZ;

-- 2. COMMUNICATION LOGS TABLE
CREATE TABLE IF NOT EXISTS public.communication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL REFERENCES public.voters(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_role TEXT NOT NULL CHECK (user_role IN ('super_admin', 'client_admin', 'volunteer')),
    actor_name TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('CALL', 'WHATSAPP', 'POLLING_SLIP')),
    action TEXT NOT NULL CHECK (action IN ('CALL_ATTEMPTED', 'CALL_CONNECTED', 'WHATSAPP_OPENED', 'POLLING_SLIP_GENERATED', 'POLLING_SLIP_SHARED')),
    status TEXT NOT NULL, -- 'Connected', 'No Answer', 'Busy', 'Wrong Number', 'Follow-up Required', 'Slip Shared', 'Slip Generated', 'Opened'
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. POLLING SLIPS METADATA TABLE (Object storage reference only, NEVER binary files in DB)
CREATE TABLE IF NOT EXISTS public.polling_slips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL REFERENCES public.voters(id) ON DELETE CASCADE,
    slip_number TEXT NOT NULL,
    file_url TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_comm_logs_client ON public.communication_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_comm_logs_campaign ON public.communication_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_comm_logs_voter ON public.communication_logs(voter_id);
CREATE INDEX IF NOT EXISTS idx_comm_logs_user ON public.communication_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_comm_logs_channel ON public.communication_logs(channel);
CREATE INDEX IF NOT EXISTS idx_comm_logs_action ON public.communication_logs(action);
CREATE INDEX IF NOT EXISTS idx_comm_logs_status ON public.communication_logs(status);
CREATE INDEX IF NOT EXISTS idx_comm_logs_created ON public.communication_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_polling_slips_client ON public.polling_slips(client_id);
CREATE INDEX IF NOT EXISTS idx_polling_slips_voter ON public.polling_slips(voter_id);
CREATE INDEX IF NOT EXISTS idx_polling_slips_created ON public.polling_slips(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_voters_comm_prefs ON public.voters(client_id, opt_out, whatsapp_allowed, calling_allowed);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_logs FORCE ROW LEVEL SECURITY;

ALTER TABLE public.polling_slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polling_slips FORCE ROW LEVEL SECURITY;

-- COMMUNICATION LOGS POLICIES
CREATE POLICY "Super admin full access to communication_logs"
    ON public.communication_logs FOR ALL
    USING (public.get_auth_role() = 'super_admin');

CREATE POLICY "Client admin full access to tenant communication_logs"
    ON public.communication_logs FOR ALL
    USING (client_id = public.get_auth_client_id() AND public.get_auth_role() = 'client_admin')
    WITH CHECK (client_id = public.get_auth_client_id() AND public.get_auth_role() = 'client_admin');

CREATE POLICY "Volunteers view assigned booth communication_logs"
    ON public.communication_logs FOR SELECT
    USING (
      client_id = public.get_auth_client_id()
      AND public.get_auth_role() = 'volunteer'
      AND (
        user_id = auth.uid()
        OR voter_id IN (
          SELECT id FROM public.voters 
          WHERE booth_id = public.get_auth_volunteer_booth_id()
        )
      )
    );

CREATE POLICY "Volunteers insert own communication_logs"
    ON public.communication_logs FOR INSERT
    WITH CHECK (
      client_id = public.get_auth_client_id()
      AND public.get_auth_role() = 'volunteer'
    );

-- POLLING SLIPS POLICIES
CREATE POLICY "Super admin full access to polling_slips"
    ON public.polling_slips FOR ALL
    USING (public.get_auth_role() = 'super_admin');

CREATE POLICY "Client admin full access to tenant polling_slips"
    ON public.polling_slips FOR ALL
    USING (client_id = public.get_auth_client_id() AND public.get_auth_role() = 'client_admin')
    WITH CHECK (client_id = public.get_auth_client_id() AND public.get_auth_role() = 'client_admin');

CREATE POLICY "Volunteers view assigned booth polling_slips"
    ON public.polling_slips FOR SELECT
    USING (
      client_id = public.get_auth_client_id()
      AND public.get_auth_role() = 'volunteer'
      AND voter_id IN (
        SELECT id FROM public.voters 
        WHERE booth_id = public.get_auth_volunteer_booth_id()
      )
    );

CREATE POLICY "Volunteers insert polling_slips for assigned voters"
    ON public.polling_slips FOR INSERT
    WITH CHECK (
      client_id = public.get_auth_client_id()
      AND public.get_auth_role() = 'volunteer'
    );
