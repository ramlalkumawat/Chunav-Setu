-- =====================================================================
-- CHUNAV SETU - SUPABASE STORAGE INTEGRATION & FILE_ASSETS SCHEMA
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. FILE_ASSETS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.file_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    module TEXT NOT NULL,          -- e.g. 'branding', 'voter_import', 'campaign_media', 'documents'
    entity_type TEXT,              -- e.g. 'client_poster', 'voter_list', 'campaign_banner'
    entity_id TEXT,                -- e.g. client ID, campaign ID, voter batch ID
    file_name TEXT NOT NULL,
    file_extension TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    storage_provider TEXT NOT NULL DEFAULT 'supabase_storage'
        CHECK (storage_provider IN ('supabase_storage', 'cloudflare_r2')),
    storage_path TEXT NOT NULL,    -- e.g. 'campaign-files/{client_id}/posters/{unique_filename}'
    file_size BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' 
        CHECK (status IN ('active', 'inactive', 'archived', 'deleted')),
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_file_assets_client_id ON public.file_assets(client_id);
CREATE INDEX IF NOT EXISTS idx_file_assets_campaign_id ON public.file_assets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_file_assets_module ON public.file_assets(module);
CREATE INDEX IF NOT EXISTS idx_file_assets_storage_path ON public.file_assets(storage_path);
CREATE INDEX IF NOT EXISTS idx_file_assets_entity ON public.file_assets(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_file_assets_status ON public.file_assets(status);

-- ---------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY (RLS) FOR FILE_ASSETS
-- ---------------------------------------------------------------------
ALTER TABLE public.file_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_assets FORCE ROW LEVEL SECURITY;

-- Super Admin: Full Access across all tenants
CREATE POLICY "super_admin_all_file_assets" ON public.file_assets
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'super_admin'
        )
    );

-- Client Admin: Manage files strictly for their own tenant
CREATE POLICY "client_admin_own_file_assets" ON public.file_assets
    FOR ALL
    USING (
        client_id = (
            SELECT client_id FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'client_admin'
        )
    )
    WITH CHECK (
        client_id = (
            SELECT client_id FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'client_admin'
        )
    );

-- Volunteer: Read-only access to campaign files belonging to their tenant
CREATE POLICY "volunteer_read_file_assets" ON public.file_assets
    FOR SELECT
    USING (
        client_id = (
            SELECT client_id FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'volunteer'
        )
        AND status = 'active'
    );

-- ---------------------------------------------------------------------
-- 3. STORAGE BUCKET RLS POLICIES FOR SUPABASE STORAGE
-- (campaign-files & voter-files)
-- ---------------------------------------------------------------------

-- Note: In Supabase Storage, objects are stored in `storage.objects` table.
-- The path structure is:
-- campaign-files/{client_id}/{category}/{filename}
-- voter-files/{client_id}/{filename}

-- Policy for CAMPAIGN-FILES (Private Bucket)
-- 1. Super Admin: full access to campaign-files
CREATE POLICY "super_admin_campaign_files" ON storage.objects
    FOR ALL
    USING (
        bucket_id = 'campaign-files'
        AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'super_admin'
        )
    );

-- 2. Client Admin: access only files starting with their client_id
CREATE POLICY "client_admin_campaign_files" ON storage.objects
    FOR ALL
    USING (
        bucket_id = 'campaign-files'
        AND (storage.foldername(name))[1] = (
            SELECT client_id::text FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'client_admin'
        )
    )
    WITH CHECK (
        bucket_id = 'campaign-files'
        AND (storage.foldername(name))[1] = (
            SELECT client_id::text FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'client_admin'
        )
    );

-- 3. Volunteer: Read-only access to their tenant's campaign files
CREATE POLICY "volunteer_read_campaign_files" ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'campaign-files'
        AND (storage.foldername(name))[1] = (
            SELECT client_id::text FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'volunteer'
        )
    );

-- Policy for VOTER-FILES (Private Bucket)
-- 1. Super Admin: full access to voter-files
CREATE POLICY "super_admin_voter_files" ON storage.objects
    FOR ALL
    USING (
        bucket_id = 'voter-files'
        AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'super_admin'
        )
    );

-- 2. Client Admin: access only voter files in their client_id
CREATE POLICY "client_admin_voter_files" ON storage.objects
    FOR ALL
    USING (
        bucket_id = 'voter-files'
        AND (storage.foldername(name))[1] = (
            SELECT client_id::text FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'client_admin'
        )
    )
    WITH CHECK (
        bucket_id = 'voter-files'
        AND (storage.foldername(name))[1] = (
            SELECT client_id::text FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'client_admin'
        )
    );
