-- =====================================================================
-- CHUNAV SETU - POSTGRESQL ROW LEVEL SECURITY (RLS) HARDENING MIGRATION
-- Migration: 003_security_hardening.sql
-- =====================================================================

-- 1. FORCE ROW LEVEL SECURITY ON ALL TABLES
-- (Prevents table owners from accidentally bypassing RLS)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.clients FORCE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns FORCE ROW LEVEL SECURITY;
ALTER TABLE public.areas FORCE ROW LEVEL SECURITY;
ALTER TABLE public.booths FORCE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers FORCE ROW LEVEL SECURITY;
ALTER TABLE public.voters FORCE ROW LEVEL SECURITY;
ALTER TABLE public.tasks FORCE ROW LEVEL SECURITY;
ALTER TABLE public.field_activities FORCE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups FORCE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs FORCE ROW LEVEL SECURITY;

-- 2. HELPER FUNCTION TO GET CURRENT VOLUNTEER'S ASSIGNED BOOTH ID
CREATE OR REPLACE FUNCTION public.get_auth_volunteer_booth_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT assigned_booth_id FROM public.volunteers WHERE user_id = auth.uid() LIMIT 1;
$$;

-- 3. REVISE VOTERS POLICY TO PREVENT UNRESTRICTED VOLUNTEER ACCESS
DROP POLICY IF EXISTS "Volunteers can view and update permitted voters in their client campaign" ON public.voters;
DROP POLICY IF EXISTS "Volunteers scoped voter access" ON public.voters;

-- Volunteers can only view voters in their assigned booth
CREATE POLICY "Volunteers view assigned booth voters"
    ON public.voters FOR SELECT
    USING (
      client_id = public.get_auth_client_id()
      AND public.get_auth_role() = 'volunteer'
      AND (booth_id = public.get_auth_volunteer_booth_id() OR booth_id IS NULL)
    );

-- Volunteers can only update contact_status and notes for assigned voters
CREATE POLICY "Volunteers update assigned booth voters"
    ON public.voters FOR UPDATE
    USING (
      client_id = public.get_auth_client_id()
      AND public.get_auth_role() = 'volunteer'
      AND (booth_id = public.get_auth_volunteer_booth_id() OR booth_id IS NULL)
    )
    WITH CHECK (
      client_id = public.get_auth_client_id()
      AND public.get_auth_role() = 'volunteer'
    );

-- Volunteers CANNOT delete voters (Delete policy explicitly restricted to client_admin and super_admin)
DROP POLICY IF EXISTS "Client admins full access to their voters" ON public.voters;
CREATE POLICY "Client admins manage voters"
    ON public.voters FOR ALL
    USING (client_id = public.get_auth_client_id() AND public.get_auth_role() = 'client_admin')
    WITH CHECK (client_id = public.get_auth_client_id() AND public.get_auth_role() = 'client_admin');

-- 4. REVISE TASKS POLICY TO SCOPE VOLUNTEER TO ASSIGNED TASKS ONLY
DROP POLICY IF EXISTS "Volunteers can view and update their assigned tasks" ON public.tasks;
CREATE POLICY "Volunteers access assigned tasks"
    ON public.tasks FOR SELECT
    USING (
      client_id = public.get_auth_client_id()
      AND public.get_auth_role() = 'volunteer'
      AND volunteer_id IN (SELECT id FROM public.volunteers WHERE user_id = auth.uid())
    );

CREATE POLICY "Volunteers update assigned task status"
    ON public.tasks FOR UPDATE
    USING (
      client_id = public.get_auth_client_id()
      AND public.get_auth_role() = 'volunteer'
      AND volunteer_id IN (SELECT id FROM public.volunteers WHERE user_id = auth.uid())
    );

-- 5. IMMUTABLE AUDIT LOG DEFENSE
-- Disallow any UPDATE or DELETE operations on audit_logs table
DROP POLICY IF EXISTS "Audit logs immutable read policy" ON public.audit_logs;
CREATE POLICY "Audit logs immutable read policy"
    ON public.audit_logs FOR SELECT
    USING (
      public.get_auth_role() = 'super_admin'
      OR (public.get_auth_role() = 'client_admin' AND client_id = public.get_auth_client_id())
    );

CREATE OR REPLACE FUNCTION public.prevent_audit_log_modification()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable. UPDATE and DELETE operations are strictly prohibited.';
END;
$$;

DROP TRIGGER IF EXISTS trg_immutable_audit_logs ON public.audit_logs;
CREATE TRIGGER trg_immutable_audit_logs
BEFORE UPDATE OR DELETE ON public.audit_logs
FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_log_modification();

-- 6. ANTI-TAMPER TRIGGER ON TENANT FOREIGN KEY (client_id)
-- Prevents reassigning existing voters or data records to another tenant
CREATE OR REPLACE FUNCTION public.prevent_client_id_tampering()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.client_id IS DISTINCT FROM NEW.client_id THEN
    RAISE EXCEPTION 'Security Violation: Modifying client_id (tenant identifier) on existing records is strictly prohibited.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_voter_tenant_tampering ON public.voters;
CREATE TRIGGER trg_prevent_voter_tenant_tampering
BEFORE UPDATE ON public.voters
FOR EACH ROW EXECUTE FUNCTION public.prevent_client_id_tampering();
