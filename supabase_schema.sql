-- ============================================================
-- SecureNet IDS - Supabase Cloud Database Setup Script (SOC SaaS Multi-Tenant)
-- ============================================================
-- Run this ENTIRE script in Supabase → SQL Editor
-- It safely drops and recreates all tables cleanly.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables in reverse dependency order (safe re-run)
DROP TABLE IF EXISTS public.device_commands CASCADE;
DROP TABLE IF EXISTS public.device_telemetry CASCADE;
DROP TABLE IF EXISTS public.user_activities CASCADE;
DROP TABLE IF EXISTS public.guidance_requests CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.blacklist CASCADE;
DROP TABLE IF EXISTS public.stats CASCADE;
DROP TABLE IF EXISTS public.logs CASCADE;
DROP TABLE IF EXISTS public.alerts CASCADE;
DROP TABLE IF EXISTS public.devices CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;

-- ============================================================
-- 1. ORGANIZATIONS TABLE (Tenant Root with 6-Letter Join Key)
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
    role VARCHAR(50) DEFAULT 'user', -- 'super_admin', 'org_admin', 'security_analyst', 'user'
    specialty_role VARCHAR(100) DEFAULT 'General Security',
    org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    assigned_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    permissions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. DEVICES TABLE (Employee / Organization Fleet Endpoints)
-- ============================================================
CREATE TABLE public.devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    assigned_user_email VARCHAR(255),
    hostname VARCHAR(255) NOT NULL,
    os_platform VARCHAR(100) NOT NULL, -- 'windows', 'macos', 'linux'
    os_version VARCHAR(100),
    ip_address VARCHAR(45),
    mac_address VARCHAR(100),
    agent_version VARCHAR(50) DEFAULT '1.0.0',
    device_token VARCHAR(255) UNIQUE NOT NULL, -- Secret token used by endpoint agent
    status VARCHAR(50) DEFAULT 'online', -- 'online', 'offline', 'quarantined', 'suspicious'
    is_quarantined BOOLEAN DEFAULT FALSE,
    last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. DEVICE TELEMETRY TABLE (Periodic Heartbeats & Active Socket Telemetry)
-- ============================================================
CREATE TABLE public.device_telemetry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE NOT NULL,
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    cpu_usage REAL,
    memory_usage REAL,
    active_connections JSONB DEFAULT '[]'::jsonb, -- [{local_ip, remote_ip, remote_port, protocol, process_name, pid}]
    open_ports JSONB DEFAULT '[]'::jsonb,
    event_type VARCHAR(50) DEFAULT 'heartbeat',
    details JSONB DEFAULT '{}'::jsonb
);

-- ============================================================
-- 5. DEVICE COMMANDS TABLE (SOAR Remote Response Actions)
-- ============================================================
CREATE TABLE public.device_commands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE NOT NULL,
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    command_type VARCHAR(50) NOT NULL, -- 'isolate_network', 'unisolate_network', 'kill_process', 'block_ip', 'scan_system'
    payload JSONB DEFAULT '{}'::jsonb, -- e.g. {"pid": 4321} or {"ip": "1.2.3.4"}
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'delivered', 'executed', 'failed'
    issued_by VARCHAR(255),
    result TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    executed_at TIMESTAMPTZ
);

-- ============================================================
-- 6. GUIDANCE & HELP REQUESTS TABLE (Admin Volunteer & Help System)
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
    category VARCHAR(50) DEFAULT 'threat_analysis',
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'open',
    guidance_notes TEXT,
    related_alert_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. USER ACTIVITIES TABLE (Activity & Telemetry Tracking)
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
-- 8. ALERTS TABLE (Now Linked to Devices & Processes)
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
    device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
    hostname VARCHAR(255),
    process_name VARCHAR(255),
    process_pid INTEGER,
    triage_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. ALERT FEEDBACK TABLE (Active Learning & False Positive Loop)
-- ============================================================
CREATE TABLE public.alert_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID REFERENCES public.alerts(id) ON DELETE CASCADE NOT NULL,
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID,
    feedback_type VARCHAR(50) NOT NULL, -- 'false_positive', 'confirmed_threat', 'investigating'
    reason TEXT,
    target_ip VARCHAR(45),
    target_process VARCHAR(255),
    suppress_future BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. LOGS TABLE
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
-- 10. STATS TABLE
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
-- 11. BLACKLIST TABLE
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
-- 12. AUDIT LOGS TABLE
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
-- INDEXES (for high-speed multi-tenant SOC queries)
-- ============================================================
CREATE INDEX idx_organizations_key     ON public.organizations(join_key);
CREATE INDEX idx_profiles_org          ON public.profiles(org_id);
CREATE INDEX idx_profiles_admin        ON public.profiles(assigned_admin_id);
CREATE INDEX idx_devices_org           ON public.devices(org_id);
CREATE INDEX idx_devices_token         ON public.devices(device_token);
CREATE INDEX idx_devices_status        ON public.devices(status);
CREATE INDEX idx_devices_heartbeat     ON public.devices(last_heartbeat DESC);
CREATE INDEX idx_telemetry_device      ON public.device_telemetry(device_id, timestamp DESC);
CREATE INDEX idx_telemetry_org         ON public.device_telemetry(org_id, timestamp DESC);
CREATE INDEX idx_commands_device       ON public.device_commands(device_id, status);
CREATE INDEX idx_commands_status       ON public.device_commands(status);
CREATE INDEX idx_guidance_org          ON public.guidance_requests(org_id);
CREATE INDEX idx_guidance_status       ON public.guidance_requests(status);
CREATE INDEX idx_guidance_admin        ON public.guidance_requests(admin_id);
CREATE INDEX idx_user_activities_org   ON public.user_activities(org_id, timestamp DESC);
CREATE INDEX idx_alerts_detected_at    ON public.alerts(detected_at DESC);
CREATE INDEX idx_alerts_risk           ON public.alerts(risk_level);
CREATE INDEX idx_alerts_source_ip      ON public.alerts(source_ip);
CREATE INDEX idx_alerts_attack_type    ON public.alerts(attack_type);
CREATE INDEX idx_alerts_device         ON public.alerts(device_id);
CREATE INDEX idx_alerts_org            ON public.alerts(org_id);
CREATE INDEX idx_logs_logged_at        ON public.logs(logged_at DESC);
CREATE INDEX idx_stats_recorded_at     ON public.stats(recorded_at DESC);
CREATE INDEX idx_profiles_email        ON public.profiles(email);
CREATE INDEX idx_audit_performed_at    ON public.audit_logs(performed_at DESC);
CREATE INDEX idx_feedback_alert        ON public.alert_feedback(alert_id);
CREATE INDEX idx_feedback_type         ON public.alert_feedback(feedback_type);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR MULTI-TENANCY
-- ============================================================
-- Uncomment and enable in production when using Supabase Auth JWT with tenant_id claim:
--
-- ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "Tenant Isolation: Devices" ON public.devices
--   FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::uuid);
--
-- CREATE POLICY "Tenant Isolation: Alerts" ON public.alerts
--   FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

ALTER TABLE public.organizations     DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles          DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices           DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_telemetry  DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_commands   DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.guidance_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities   DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts            DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_feedback   DISABLE ROW LEVEL SECURITY;
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

INSERT INTO public.devices (id, org_id, assigned_user_email, hostname, os_platform, os_version, ip_address, device_token, status)
VALUES (
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000001',
    'employee-1@securenet.com',
    'SEC-FINANCE-LAPTOP',
    'windows',
    'Windows 11 Enterprise',
    '192.168.1.105',
    'dev-tok-demo-finance-pc',
    'online'
)
ON CONFLICT (device_token) DO NOTHING;
