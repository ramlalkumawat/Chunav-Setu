-- =====================================================================
-- CHUNAV SETU - PRODUCTION HARDENING & VOLUNTEER SCOPE EXPANSION
-- Migration: 007_production_hardening_and_volunteer_scope.sql
-- =====================================================================

-- 1. ADD USERNAME TO PROFILES WITH CASE-INSENSITIVE UNIQUE INDEX
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_lower ON public.profiles (LOWER(username)) WHERE username IS NOT NULL;

-- 2. STANDARDIZED HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_auth_client_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT client_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_my_client_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT public.get_auth_client_id();
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT (public.get_auth_role() = 'super_admin');
$$;

CREATE OR REPLACE FUNCTION public.is_client_active(client_uuid UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clients 
    WHERE id = client_uuid AND status = 'active'
  );
$$;

-- 3. REVISE VOLUNTEER RLS POLICIES — EXPAND SCOPE TO ALL TENANT BOOTHS
-- Volunteers can view ALL voters belonging to their client/tenant
DROP POLICY IF EXISTS "Volunteers view assigned booth voters" ON public.voters;
DROP POLICY IF EXISTS "Volunteers update assigned booth voters" ON public.voters;
DROP POLICY IF EXISTS "Volunteers can view and update permitted voters in their client campaign" ON public.voters;
DROP POLICY IF EXISTS "Volunteers scoped voter access" ON public.voters;

CREATE POLICY "Volunteers view tenant voters"
    ON public.voters FOR SELECT
    USING (
      client_id = public.get_auth_client_id()
      AND public.get_auth_role() = 'volunteer'
    );

CREATE POLICY "Volunteers update tenant voter contact status"
    ON public.voters FOR UPDATE
    USING (
      client_id = public.get_auth_client_id()
      AND public.get_auth_role() = 'volunteer'
    )
    WITH CHECK (
      client_id = public.get_auth_client_id()
      AND public.get_auth_role() = 'volunteer'
    );

-- Volunteers can view ALL booths in their client/tenant
DROP POLICY IF EXISTS "Tenant users can view booths" ON public.booths;
CREATE POLICY "Tenant users can view all tenant booths"
    ON public.booths FOR SELECT
    USING (
      public.is_super_admin()
      OR client_id = public.get_auth_client_id()
    );

-- Volunteers can view and update polling day updates across their entire client
DROP POLICY IF EXISTS "Volunteers view assigned booth polling updates" ON public.polling_day_updates;
DROP POLICY IF EXISTS "Volunteers insert and update assigned booth polling updates" ON public.polling_day_updates;

CREATE POLICY "Volunteers view tenant polling updates"
    ON public.polling_day_updates FOR SELECT
    USING (
      client_id = public.get_auth_client_id()
      AND public.get_auth_role() = 'volunteer'
    );

CREATE POLICY "Volunteers insert and update tenant polling updates"
    ON public.polling_day_updates FOR ALL
    USING (
      client_id = public.get_auth_client_id()
      AND public.get_auth_role() = 'volunteer'
    )
    WITH CHECK (
      client_id = public.get_auth_client_id()
      AND public.get_auth_role() = 'volunteer'
    );

-- Volunteers can view and manage polling day followups across their entire client
DROP POLICY IF EXISTS "Volunteers view and manage assigned polling followups" ON public.polling_day_followups;
CREATE POLICY "Volunteers manage tenant polling followups"
    ON public.polling_day_followups FOR ALL
    USING (
      client_id = public.get_auth_client_id()
      AND public.get_auth_role() = 'volunteer'
    )
    WITH CHECK (
      client_id = public.get_auth_client_id()
      AND public.get_auth_role() = 'volunteer'
    );

-- Volunteers can view and insert communication logs for all voters in their client
DROP POLICY IF EXISTS "Volunteers view assigned booth communication_logs" ON public.communication_logs;
CREATE POLICY "Volunteers view tenant communication_logs"
    ON public.communication_logs FOR SELECT
    USING (
      client_id = public.get_auth_client_id()
      AND public.get_auth_role() = 'volunteer'
    );

DROP POLICY IF EXISTS "Volunteers view assigned booth polling_slips" ON public.polling_slips;
CREATE POLICY "Volunteers view tenant polling_slips"
    ON public.polling_slips FOR SELECT
    USING (
      client_id = public.get_auth_client_id()
      AND public.get_auth_role() = 'volunteer'
    );

-- 4. POLLING DAY COMPLETION IMMUTABILITY TRIGGER
-- Once a polling_day is marked 'completed', prevent further modification of polling_day_updates
CREATE OR REPLACE FUNCTION public.prevent_completed_polling_updates()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_polling_status TEXT;
BEGIN
  SELECT status INTO v_polling_status 
  FROM public.polling_days 
  WHERE id = NEW.polling_day_id;

  IF v_polling_status = 'completed' THEN
    RAISE EXCEPTION 'Polling Day has been finalized and completed. Updates are locked against modification.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lock_completed_polling_updates ON public.polling_day_updates;
CREATE TRIGGER trg_lock_completed_polling_updates
BEFORE INSERT OR UPDATE ON public.polling_day_updates
FOR EACH ROW EXECUTE FUNCTION public.prevent_completed_polling_updates();

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_clients_email_lower ON public.clients(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_voters_client_booth ON public.voters(client_id, booth_id);
