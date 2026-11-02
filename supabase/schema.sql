-- ==============================================================================
-- Supabase Schema & Row Level Security (RLS) for AI Engineer Portfolio Management
-- Compatible with PostgreSQL 15+ and Supabase Database & Auth
-- ==============================================================================

-- 1. Create enum for project approval status
DO $$ BEGIN
    CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    github_id BIGINT UNIQUE, -- NULL for manually curated projects
    repo_name TEXT NOT NULL,
    repo_full_name TEXT NOT NULL,
    github_url TEXT NOT NULL,
    default_branch TEXT NOT NULL DEFAULT 'main',
    stars_count INTEGER NOT NULL DEFAULT 0,
    forks_count INTEGER NOT NULL DEFAULT 0,
    open_issues_count INTEGER NOT NULL DEFAULT 0,
    language TEXT,
    topics TEXT[] NOT NULL DEFAULT '{}',
    readme_content TEXT,
    is_private BOOLEAN NOT NULL DEFAULT false,
    is_fork BOOLEAN NOT NULL DEFAULT false,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    github_created_at TIMESTAMPTZ,
    github_updated_at TIMESTAMPTZ,
    github_pushed_at TIMESTAMPTZ,

    -- Curated & Manual overrides (Preserved across synchronizations)
    custom_title TEXT,
    custom_description TEXT,
    custom_technologies TEXT[],
    custom_highlights TEXT[],
    demo_url TEXT,
    thumbnail_url TEXT,

    -- Portfolio lifecycle and publication controls
    approval_status approval_status NOT NULL DEFAULT 'pending',
    is_published BOOLEAN NOT NULL DEFAULT false,
    is_visible BOOLEAN NOT NULL DEFAULT false,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 100,

    -- Tracking timestamps
    last_synced_at TIMESTAMPTZ,
    is_deleted_on_github BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create webhook deliveries table for idempotent GitHub webhook event processing
CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
    delivery_id TEXT PRIMARY KEY,
    event TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
CREATE TRIGGER set_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 5. Indexes for fast public and admin querying
CREATE INDEX IF NOT EXISTS idx_projects_public_query 
    ON public.projects(approval_status, is_published, is_visible, display_order);

CREATE INDEX IF NOT EXISTS idx_projects_github_id 
    ON public.projects(github_id);

CREATE INDEX IF NOT EXISTS idx_projects_repo_name 
    ON public.projects(repo_name);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for projects table
-- Public access rule: Anonymous / Public can ONLY view approved, published, and visible projects
-- NEVER exposes private repos, unpublished drafts, or pending/rejected queue to the public
DROP POLICY IF EXISTS "Public can view approved published projects" ON public.projects;
CREATE POLICY "Public can view approved published projects"
    ON public.projects
    FOR SELECT
    TO anon, authenticated
    USING (
        approval_status = 'approved' AND
        is_published = true AND
        is_visible = true AND
        is_private = false
    );

-- Admin access rule: Authenticated admin / service role has full access
DROP POLICY IF EXISTS "Service role has full access" ON public.projects;
CREATE POLICY "Service role has full access"
    ON public.projects
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Service role access for webhook idempotency
DROP POLICY IF EXISTS "Service role manages webhook deliveries" ON public.webhook_deliveries;
CREATE POLICY "Service role manages webhook deliveries"
    ON public.webhook_deliveries
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 8. Explicit grants: only the server-side service role may manage webhook deliveries.
-- The public client can read eligible projects, but cannot access webhook delivery state.
GRANT SELECT ON public.projects TO anon, authenticated;
REVOKE ALL ON public.webhook_deliveries FROM anon, authenticated;
GRANT ALL ON public.projects, public.webhook_deliveries TO service_role;
