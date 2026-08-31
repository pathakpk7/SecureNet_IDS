-- ============================================================
-- SecureNet IDS - Supabase Cloud Database Setup Script
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    owner_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    permissions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_ip VARCHAR(45) NOT NULL,
    destination_ip VARCHAR(45) NOT NULL,
    protocol VARCHAR(10) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    attack_type VARCHAR(50) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    confidence REAL NOT NULL,
    description TEXT,
    threat_intel_data JSONB,
    packet_data JSONB,
    prediction_result JSONB,
    org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. LOGS TABLE
CREATE TABLE IF NOT EXISTS public.logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    source VARCHAR(100),
    packet_data JSONB,
    alert_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. STATS TABLE
CREATE TABLE IF NOT EXISTS public.stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_packets BIGINT DEFAULT 0,
    attack_count BIGINT DEFAULT 0,
    normal_count BIGINT DEFAULT 0,
    protocols JSONB DEFAULT '{}'::jsonb,
    attack_types JSONB DEFAULT '{}'::jsonb,
    risk_levels JSONB DEFAULT '{}'::jsonb,
    performance JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. BLACKLIST TABLE
CREATE TABLE IF NOT EXISTS public.blacklist (
    ip_address VARCHAR(45) PRIMARY KEY,
    reason TEXT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    threat_intel JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    org_id UUID,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON public.alerts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_risk ON public.alerts(risk_level);
CREATE INDEX IF NOT EXISTS idx_alerts_source_ip ON public.alerts(source_ip);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON public.logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_stats_timestamp ON public.stats(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
