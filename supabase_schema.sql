-- ============================================================
-- SecureNet IDS - Supabase Cloud Database Setup Script (Fixed)
-- ============================================================
-- Run this ENTIRE script in Supabase → SQL Editor
-- It safely drops and recreates all tables cleanly.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables in reverse dependency order (safe re-run)
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.blacklist CASCADE;
DROP TABLE IF EXISTS public.stats CASCADE;
DROP TABLE IF EXISTS public.logs CASCADE;
DROP TABLE IF EXISTS public.alerts CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;

-- ============================================================
-- 1. ORGANIZATIONS TABLE
-- ============================================================
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    owner_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. PROFILES TABLE (linked to Supabase Auth users)
-- ============================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    permissions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. ALERTS TABLE
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
-- 4. LOGS TABLE
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
-- 5. STATS TABLE
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
-- 6. BLACKLIST TABLE
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
-- 7. AUDIT LOGS TABLE
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
CREATE INDEX idx_alerts_detected_at  ON public.alerts(detected_at DESC);
CREATE INDEX idx_alerts_risk         ON public.alerts(risk_level);
CREATE INDEX idx_alerts_source_ip    ON public.alerts(source_ip);
CREATE INDEX idx_alerts_attack_type  ON public.alerts(attack_type);
CREATE INDEX idx_logs_logged_at      ON public.logs(logged_at DESC);
CREATE INDEX idx_stats_recorded_at   ON public.stats(recorded_at DESC);
CREATE INDEX idx_profiles_email      ON public.profiles(email);
CREATE INDEX idx_audit_performed_at  ON public.audit_logs(performed_at DESC);

-- ============================================================
-- DISABLE RLS (development mode - unrestricted access)
-- ============================================================
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles      DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs          DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.blacklist     DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs    DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- DEFAULT SEED DATA
-- ============================================================
INSERT INTO public.organizations (id, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Organization')
ON CONFLICT (id) DO NOTHING;
