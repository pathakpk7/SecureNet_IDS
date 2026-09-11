-- ============================================================
-- SecureNet IDS - Supabase Cloud Database Setup Script (Enhanced)
-- ============================================================
-- Run this ENTIRE script in Supabase → SQL Editor
-- It safely drops and recreates all tables cleanly.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables in reverse dependency order (safe re-run)
DROP TABLE IF EXISTS public.user_activities CASCADE;
DROP TABLE IF EXISTS public.guidance_requests CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.blacklist CASCADE;
DROP TABLE IF EXISTS public.stats CASCADE;
DROP TABLE IF EXISTS public.logs CASCADE;
DROP TABLE IF EXISTS public.alerts CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;

-- ============================================================
-- 1. ORGANIZATIONS TABLE (with 6-Letter Unique Join Key)
-- ============================================================
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    join_key VARCHAR(6) UNIQUE NOT NULL,
    owner_id UUID,
    description TEXT,
    plan VARCHAR(50) DEFAULT 'enterprise',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. PROFILES TABLE (linked to Supabase Auth users, with Multi-Admin support)
-- ============================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user', -- 'admin' or 'user'
    specialty_role VARCHAR(100) DEFAULT 'General Security', -- e.g. 'Network Defense', 'Incident Response', 'SOC Mentorship', 'Compliance'
    org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    assigned_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    permissions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. GUIDANCE & HELP REQUESTS TABLE (Admin Volunteer & Help System)
-- ============================================================
CREATE TABLE public.guidance_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    admin_name VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'threat_analysis', -- 'threat_analysis', 'alert_triage', 'rule_configuration', 'general_guidance'
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    guidance_notes TEXT,
    related_alert_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. USER ACTIVITIES TABLE (Activity & Telemetry Tracking)
-- ============================================================
CREATE TABLE public.user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(45),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. ALERTS TABLE
-- ============================================================
CREATE TABLE public.alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_ip VARCHAR(45) NOT NULL,
    destination_ip VARCHAR(45) NOT NULL,
    protocol VARCHAR(10) NOT NULL,
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    attack_type VARCHAR(50) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    confidence REAL NOT NULL DEFAULT 0.0,
    description TEXT,
    threat_intel_data JSONB,
    packet_data JSONB,
    prediction_result JSONB,
    org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. LOGS TABLE
-- ============================================================
CREATE TABLE public.logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    logged_at TIMESTAMPTZ DEFAULT NOW(),
    level VARCHAR(20) NOT NULL DEFAULT 'info',
    message TEXT NOT NULL,
    source VARCHAR(100),
    packet_data JSONB,
    alert_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. STATS TABLE
-- ============================================================
CREATE TABLE public.stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    total_packets BIGINT DEFAULT 0,
    attack_count BIGINT DEFAULT 0,
    normal_count BIGINT DEFAULT 0,
    protocols JSONB DEFAULT '{}'::jsonb,
    attack_types JSONB DEFAULT '{}'::jsonb,
    risk_levels JSONB DEFAULT '{}'::jsonb,
    performance JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. BLACKLIST TABLE
-- ============================================================
CREATE TABLE public.blacklist (
    ip_address VARCHAR(45) PRIMARY KEY,
    reason TEXT,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    threat_intel JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. AUDIT LOGS TABLE
-- ============================================================
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    org_id UUID,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(45),
    performed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES (for fast queries)
-- ============================================================
CREATE INDEX idx_organizations_key     ON public.organizations(join_key);
CREATE INDEX idx_profiles_org          ON public.profiles(org_id);
CREATE INDEX idx_profiles_admin        ON public.profiles(assigned_admin_id);
CREATE INDEX idx_guidance_org          ON public.guidance_requests(org_id);
CREATE INDEX idx_guidance_status       ON public.guidance_requests(status);
CREATE INDEX idx_guidance_admin        ON public.guidance_requests(admin_id);
CREATE INDEX idx_user_activities_org   ON public.user_activities(org_id, timestamp DESC);
CREATE INDEX idx_alerts_detected_at    ON public.alerts(detected_at DESC);
CREATE INDEX idx_alerts_risk           ON public.alerts(risk_level);
CREATE INDEX idx_alerts_source_ip      ON public.alerts(source_ip);
CREATE INDEX idx_alerts_attack_type    ON public.alerts(attack_type);
CREATE INDEX idx_logs_logged_at        ON public.logs(logged_at DESC);
CREATE INDEX idx_stats_recorded_at     ON public.stats(recorded_at DESC);
CREATE INDEX idx_profiles_email        ON public.profiles(email);
CREATE INDEX idx_audit_performed_at    ON public.audit_logs(performed_at DESC);

-- ============================================================
-- DISABLE RLS (development mode - unrestricted access)
-- ============================================================
ALTER TABLE public.organizations     DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles          DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.guidance_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities   DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts            DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs              DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats             DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.blacklist         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs        DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- DEFAULT SEED DATA
-- ============================================================
INSERT INTO public.organizations (id, name, join_key, description)
VALUES ('00000000-0000-0000-0000-000000000001', 'SecureNet SOC Enterprise', 'SEC789', 'Primary Security Operations Center Organization')
ON CONFLICT (id) DO NOTHING;

