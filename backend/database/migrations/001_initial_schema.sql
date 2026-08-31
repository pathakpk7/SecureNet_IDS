-- ============================================================
-- SecureNet IDS - Initial Enterprise Schema Migration
-- ============================================================
-- This migration extends the existing schema with enterprise-grade
-- multi-tenancy, RBAC, and audit logging capabilities
-- ============================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENHANCED ORGANIZATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Organization Settings
    settings JSONB DEFAULT '{
        "max_users": 100,
        "retention_days": 30,
        "alert_threshold": "medium",
        "enable_notifications": true,
        "enable_siem_export": false,
        "siem_config": {}
    }'::jsonb,
    
    -- Billing & Limits
    plan VARCHAR(50) DEFAULT 'free',
    max_alerts_per_month INTEGER DEFAULT 10000,
    max_users INTEGER DEFAULT 10,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_suspended BOOLEAN DEFAULT false,
    suspension_reason TEXT
);

-- Create indexes for organizations
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX idx_organizations_is_active ON organizations(is_active);
CREATE INDEX idx_organizations_created_at ON organizations(created_at DESC);

-- ============================================================
-- ENHANCED PROFILES TABLE WITH RBAC
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    
    -- Organization Membership
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Role-Based Access Control
    role VARCHAR(50) NOT NULL DEFAULT 'viewer' CHECK (role IN ('super_admin', 'org_admin', 'security_analyst', 'viewer')),
    
    -- Permissions (JSONB for flexibility)
    permissions JSONB DEFAULT '{}'::jsonb,
    
    -- User Settings
    settings JSONB DEFAULT '{
        "timezone": "UTC",
        "language": "en",
        "notifications": {
            "email": true,
            "push": true,
            "sms": false
        },
        "dashboard_preferences": {}
    }'::jsonb,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_invited BOOLEAN DEFAULT false,
    invitation_token UUID,
    invitation_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for profiles
CREATE INDEX idx_profiles_org_id ON profiles(org_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);
CREATE INDEX idx_profiles_invitation_token ON profiles(invitation_token);

-- ============================================================
-- ORGANIZATION INVITATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS organization_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer' CHECK (role IN ('org_admin', 'security_analyst', 'viewer')),
    
    -- Invitation Details
    token UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    invited_by UUID NOT NULL REFERENCES auth.users(id),
    message TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMP WITH TIME ZONE,
    declined_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for invitations
CREATE INDEX idx_invitations_org_id ON organization_invitations(org_id);
CREATE INDEX idx_invitations_email ON organization_invitations(email);
CREATE INDEX idx_invitations_token ON organization_invitations(token);
CREATE INDEX idx_invitations_status ON organization_invitations(status);
CREATE INDEX idx_invitations_expires_at ON organization_invitations(expires_at);

-- ============================================================
-- AUDIT LOG TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Actor Information
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255),
    role VARCHAR(50),
    
    -- Action Details
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    
    -- Request Information
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_id VARCHAR(100),
    
    -- Result
    status VARCHAR(50) DEFAULT 'success' CHECK (status IN ('success', 'failure', 'partial')),
    error_message TEXT,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for audit logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_org_id ON audit_logs(org_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_status ON audit_logs(status);

-- Partition audit logs by month for better performance
CREATE TABLE audit_logs_y2024m01 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- ============================================================
-- UPDATE EXISTING ALERTS TABLE WITH ORG_ID
-- ============================================================
ALTER TABLE alerts 
ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive', 'escalated')),
ADD COLUMN IF NOT EXISTS severity_score INTEGER DEFAULT 0 CHECK (severity_score >= 0 AND severity_score <= 100),
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS investigation_notes TEXT,
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Create indexes for alerts
CREATE INDEX IF NOT EXISTS idx_alerts_org_id ON alerts(org_id);
CREATE INDEX IF NOT EXISTS idx_alerts_assigned_to ON alerts(assigned_to);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity_score ON alerts(severity_score DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(timestamp DESC);

-- ============================================================
-- UPDATE EXISTING LOGS TABLE WITH ORG_ID
-- ============================================================
ALTER TABLE logs
ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Create indexes for logs
CREATE INDEX IF NOT EXISTS idx_logs_org_id ON logs(org_id);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);

-- ============================================================
-- UPDATE EXISTING STATS TABLE WITH ORG_ID
-- ============================================================
ALTER TABLE stats
ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Create indexes for stats
CREATE INDEX IF NOT EXISTS idx_stats_org_id ON stats(org_id);

-- ============================================================
-- UPDATE EXISTING BLACKLIST TABLE WITH ORG_ID
-- ============================================================
ALTER TABLE blacklist
ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS added_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Create indexes for blacklist
CREATE INDEX IF NOT EXISTS idx_blacklist_org_id ON blacklist(org_id);
CREATE INDEX IF NOT EXISTS idx_blacklist_added_by ON blacklist(added_by);

-- ============================================================
-- REPORTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    generated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Report Details
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly', 'custom', 'incident')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Report Parameters
    parameters JSONB DEFAULT '{}'::jsonb,
    
    -- Report Output
    format VARCHAR(20) DEFAULT 'pdf' CHECK (format IN ('pdf', 'csv', 'json')),
    file_url TEXT,
    file_size BIGINT,
    
    -- Report Data (cached)
    data JSONB DEFAULT '{}'::jsonb,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    generated_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- Create indexes for reports
CREATE INDEX idx_reports_org_id ON reports(org_id);
CREATE INDEX idx_reports_generated_by ON reports(generated_by);
CREATE INDEX idx_reports_report_type ON reports(report_type);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- ============================================================
-- SIEM EXPORT CONFIGURATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS siem_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- SIEM Type
    siem_type VARCHAR(50) NOT NULL CHECK (siem_type IN ('splunk', 'elk', 'qradar', 'custom')),
    
    -- Connection Details
    config JSONB NOT NULL,
    
    -- Export Settings
    export_format VARCHAR(20) DEFAULT 'json' CHECK (export_format IN ('json', 'cef', 'leef')),
    auto_export BOOLEAN DEFAULT false,
    export_interval VARCHAR(50) DEFAULT 'realtime',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_export_at TIMESTAMP WITH TIME ZONE,
    last_export_status VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Create indexes for siem_configs
CREATE INDEX idx_siem_configs_org_id ON siem_configs(org_id);
CREATE INDEX idx_siem_configs_siem_type ON siem_configs(siem_type);
CREATE INDEX idx_siem_configs_is_active ON siem_configs(is_active);

-- ============================================================
-- TRIGGER: UPDATED_AT TIMESTAMP
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_siem_configs_updated_at BEFORE UPDATE ON siem_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TRIGGER: AUDIT LOG ON PROFILE CHANGES
-- ============================================================
CREATE OR REPLACE FUNCTION log_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, org_id, email, role, action, resource_type, resource_id, details)
        VALUES (NEW.id, NEW.org_id, NEW.email, NEW.role, 'user_created', 'profile', NEW.id, 
                jsonb_build_object('full_name', NEW.full_name, 'is_invited', NEW.is_invited));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (user_id, org_id, email, role, action, resource_type, resource_id, details)
        VALUES (NEW.id, NEW.org_id, NEW.email, NEW.role, 'user_updated', 'profile', NEW.id,
                jsonb_build_object('changes', jsonb_build_object(
                    'old_role', OLD.role,
                    'new_role', NEW.role,
                    'old_is_active', OLD.is_active,
                    'new_is_active', NEW.is_active
                )));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (user_id, org_id, email, role, action, resource_type, resource_id, details)
        VALUES (OLD.id, OLD.org_id, OLD.email, OLD.role, 'user_deleted', 'profile', OLD.id,
                jsonb_build_object('full_name', OLD.full_name));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER profile_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW EXECUTE FUNCTION log_profile_changes();

-- ============================================================
-- VIEWS FOR ANALYTICS
-- ============================================================
CREATE OR REPLACE VIEW org_alert_summary AS
SELECT 
    org_id,
    DATE_TRUNC('day', timestamp) as date,
    COUNT(*) as total_alerts,
    COUNT(*) FILTER (WHERE risk_level = 'critical') as critical_alerts,
    COUNT(*) FILTER (WHERE risk_level = 'high') as high_alerts,
    COUNT(*) FILTER (WHERE risk_level = 'medium') as medium_alerts,
    COUNT(*) FILTER (WHERE risk_level = 'low') as low_alerts,
    AVG(confidence) as avg_confidence
FROM alerts
WHERE org_id IS NOT NULL
GROUP BY org_id, DATE_TRUNC('day', timestamp)
ORDER BY date DESC;

CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
    user_id,
    org_id,
    email,
    role,
    COUNT(*) as total_actions,
    COUNT(*) FILTER (WHERE action LIKE '%login%') as login_count,
    COUNT(*) FILTER (WHERE action LIKE '%alert%') as alert_actions,
    MAX(created_at) as last_activity
FROM audit_logs
WHERE user_id IS NOT NULL
GROUP BY user_id, org_id, email, role
ORDER BY last_activity DESC;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on sensitive tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE siem_configs ENABLE ROW LEVEL SECURITY;

-- Organization policies
CREATE POLICY "Super admins can view all organizations" ON organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
        )
    );

CREATE POLICY "Users can view their own organization" ON organizations
    FOR SELECT USING (
        id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    );

-- Profile policies
CREATE POLICY "Super admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
        )
    );

CREATE POLICY "Org admins can view org profiles" ON profiles
    FOR SELECT USING (
        org_id IN (
            SELECT org_id FROM profiles 
            WHERE id = auth.uid() AND role IN ('org_admin', 'super_admin')
        )
    );

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (id = auth.uid());

-- Alert policies
CREATE POLICY "Users can view org alerts" ON alerts
    FOR SELECT USING (
        org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Super admins can view all alerts" ON alerts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
        )
    );

-- Audit log policies
CREATE POLICY "Super admins can view all audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
        )
    );

CREATE POLICY "Org admins can view org audit logs" ON audit_logs
    FOR SELECT USING (
        org_id IN (
            SELECT org_id FROM profiles 
            WHERE id = auth.uid() AND role IN ('org_admin', 'super_admin')
        )
    );

-- Report policies
CREATE POLICY "Users can view org reports" ON reports
    FOR SELECT USING (
        org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    );

-- SIEM config policies
CREATE POLICY "Org admins can manage siem configs" ON siem_configs
    FOR ALL USING (
        org_id IN (
            SELECT org_id FROM profiles 
            WHERE id = auth.uid() AND role IN ('org_admin', 'super_admin')
        )
    );

-- ============================================================
-- FUNCTIONS FOR DATA MANAGEMENT
-- ============================================================

-- Function to clean up old audit logs
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM audit_logs 
    WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Function to get organization statistics
CREATE OR REPLACE FUNCTION get_org_statistics(p_org_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_users', (SELECT COUNT(*) FROM profiles WHERE org_id = p_org_id AND is_active = true),
        'total_alerts', (SELECT COUNT(*) FROM alerts WHERE org_id = p_org_id AND created_at > NOW() - INTERVAL '30 days'),
        'active_alerts', (SELECT COUNT(*) FROM alerts WHERE org_id = p_org_id AND status = 'open'),
        'critical_alerts', (SELECT COUNT(*) FROM alerts WHERE org_id = p_org_id AND risk_level = 'critical' AND created_at > NOW() - INTERVAL '7 days'),
        'total_reports', (SELECT COUNT(*) FROM reports WHERE org_id = p_org_id),
        'last_activity', (SELECT MAX(created_at) FROM audit_logs WHERE org_id = p_org_id)
    ) INTO v_stats;
    
    RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- COMPLETION MESSAGE
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE 'Enterprise schema migration completed successfully';
    RAISE NOTICE 'Created tables: organizations (enhanced), profiles (enhanced), organization_invitations, audit_logs, reports, siem_configs';
    RAISE NOTICE 'Updated tables: alerts, logs, stats, blacklist with org_id columns';
    RAISE NOTICE 'Created indexes for performance optimization';
    RAISE NOTICE 'Created views: org_alert_summary, user_activity_summary';
    RAISE NOTICE 'Enabled Row Level Security (RLS) policies';
    RAISE NOTICE 'Created triggers for audit logging and timestamp management';
    RAISE NOTICE 'Created utility functions: cleanup_old_audit_logs, get_org_statistics';
END $$;
