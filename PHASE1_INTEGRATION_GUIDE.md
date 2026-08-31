# SecureNet IDS - Phase 1 Integration Guide

## Overview

This guide provides step-by-step instructions for integrating the Phase 1 enterprise SOC platform enhancements into the existing SecureNet IDS system.

**Phase 1 Components:**
- Multi-Tenant Architecture
- Enterprise RBAC
- SIEM Integration Layer
- Automated Reporting
- Backend Improvements
- Database Enhancements
- API Improvements

---

## Prerequisites

### Required Dependencies

Add these to your `requirements.txt`:

```txt
# Existing dependencies
fastapi>=0.104.0
uvicorn>=0.24.0
supabase>=2.3.0
pydantic>=2.5.0
pydantic-settings>=2.1.0

# New Phase 1 dependencies
reportlab>=4.0.0
psutil>=5.9.0
elasticsearch>=8.11.0
requests>=2.31.0
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## Step 1: Database Migration

### 1.1 Backup Existing Database

Before running migrations, backup your existing Supabase database:

```sql
-- Export existing data
COPY alerts TO 'alerts_backup.csv' CSV HEADER;
COPY logs TO 'logs_backup.csv' CSV HEADER;
COPY stats TO 'stats_backup.csv' CSV HEADER;
COPY blacklist TO 'blacklist_backup.csv' CSV HEADER;
```

### 1.2 Run Migration Script

Execute the migration script in your Supabase SQL editor:

```bash
# Navigate to migration directory
cd backend/database/migrations

# Run the migration
# Copy contents of 001_initial_schema.sql and execute in Supabase SQL Editor
```

**Or use Supabase CLI:**

```bash
supabase db push
```

### 1.3 Verify Migration

Check that new tables were created:

```sql
-- Verify new tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'organizations', 
    'profiles', 
    'organization_invitations', 
    'audit_logs', 
    'reports', 
    'siem_configs'
);
```

### 1.4 Migrate Existing Data

Migrate existing users to new profile structure:

```sql
-- Create profiles for existing auth.users
INSERT INTO profiles (id, email, org_id, role, is_active, created_at)
SELECT 
    id, 
    email, 
    'default-org-id'::uuid,  -- Replace with actual org ID
    'admin',
    true,
    created_at
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.users.id
);
```

---

## Step 2: Configuration Updates

### 2.1 Update Environment Variables

Add these to your `.env` file:

```bash
# Application Settings
APP_NAME=SecureNet IDS
APP_VERSION=2.0.0
ENVIRONMENT=development

# Enhanced Database Settings
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_POOL_SIZE=10
SUPABASE_MAX_OVERFLOW=20

# Model Settings
MODEL_PATH=../model/cicids_model.pkl
SCALER_PATH=../model/cicids_scaler.pkl
FEATURES_PATH=../model/cicids_features.pkl
MODEL_CONFIDENCE_THRESHOLD=0.7

# Network Settings
NETWORK_INTERFACE=Wi-Fi
CAPTURE_BUFFER_SIZE=1024
CAPTURE_TIMEOUT=30

# Threat Intelligence API Keys
VIRUSTOTAL_API_KEY=your-virustotal-key
ABUSEIPDB_API_KEY=your-abuseipdb-key
URLSCAN_API_KEY=your-urlscan-key
OTX_API_KEY=your-otx-key
GOOGLE_SAFE_API_KEY=your-google-safe-key

# Rate Limiting
API_RATE_LIMIT=100
API_RATE_LIMIT_PERIOD=60
THREAT_INTEL_RATE_LIMIT=4
THREAT_INTEL_CACHE_TTL=3600

# Detection Settings
CONFIDENCE_THRESHOLD=0.7
MAX_PACKET_SIZE=65535
CONNECTION_TIMEOUT=30
ML_WEIGHT=0.4
THREAT_INTEL_WEIGHT=0.6

# Logging
LOG_LEVEL=INFO
LOG_FILE=ids.log
LOG_MAX_SIZE=10485760
LOG_BACKUP_COUNT=5
LOG_FORMAT=%(asctime)s - %(name)s - %(levelname)s - %(message)s

# WebSocket
WEBSOCKET_PORT=8001
WEBSOCKET_PING_INTERVAL=20
WEBSOCKET_PING_TIMEOUT=20

# Background Jobs
ENABLE_BACKGROUND_JOBS=true
REPORT_GENERATION_INTERVAL=86400
CLEANUP_INTERVAL=604800
HEALTH_CHECK_INTERVAL=300

# SIEM Settings
ENABLE_SIEM_EXPORT=false
SIEM_EXPORT_INTERVAL=300
SIEM_BATCH_SIZE=100

# Report Settings
ENABLE_REPORTING=true
REPORT_RETENTION_DAYS=90
PDF_REPORTS_ENABLED=true
CSV_REPORTS_ENABLED=true

# Security
ENABLE_CORS=true
CORS_ORIGINS=*
ENABLE_RATE_LIMITING=true
ENABLE_AUDIT_LOGGING=true

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
ENABLE_HEALTH_ENDPOINT=true

# Multi-Tenant
ENABLE_MULTI_TENANT=true
DEFAULT_MAX_USERS_PER_ORG=100
DEFAULT_MAX_ALERTS_PER_MONTH=10000
```

### 2.2 Update Main Application

Modify your `main.py` to use enhanced configuration:

```python
from backend.config_enhanced import enhanced_settings
from backend.utils.central_logging import setup_logging
from backend.background_jobs.scheduler import scheduler
from backend.background_jobs.tasks import register_default_tasks

# Setup enhanced logging
setup_logging(
    log_level=enhanced_settings.log_level,
    log_file=enhanced_settings.log_file,
    enable_console=True,
    enable_file=True,
    enable_structured=False
)

# Register background jobs
if enhanced_settings.enable_background_jobs:
    register_default_tasks(scheduler, supabase_client)
    await scheduler.start()
```

---

## Step 3: API Integration

### 3.1 Register New Routes

Add new route modules to your FastAPI application:

```python
from backend.routes.organization_routes import router as org_router
from backend.routes.report_routes import router as report_router
from backend.routes.health_routes import router as health_router
from backend.routes.monitoring_routes import router as monitoring_router

# Register routers
app.include_router(org_router, dependencies=[Depends(get_current_user)])
app.include_router(report_router, dependencies=[Depends(get_current_user)])
app.include_router(health_router)
app.include_router(monitoring_router, dependencies=[Depends(get_current_user)])
```

### 3.2 Create Authentication Dependency

Create a dependency to extract user information from requests:

```python
from backend.rbac.permissions import Role
from backend.database.repositories.user_repository import UserRepository

async def get_current_user(
    request: Request,
    supabase_client = Depends(get_supabase_client)
) -> tuple[str, Role, str]:
    """
    Extract current user information from request.
    
    Returns:
        Tuple of (user_id, user_role, org_id)
    """
    # Extract token from Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Validate token with Supabase
    token = auth_header.replace("Bearer ", "")
    user = supabase_client.auth.get_user(token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Get user profile
    user_repo = UserRepository(supabase_client)
    profile = await user_repo.get_by_id(user.user.id)
    
    if not profile:
        raise HTTPException(status_code=404, detail="User profile not found")
    
    # Get role
    role_str = profile.get("role", "viewer")
    try:
        role = Role(role_str)
    except ValueError:
        role = Role.VIEWER
    
    return user.user.id, role, profile.get("org_id")
```

### 3.3 Update Existing Endpoints

Modify existing alert creation to include org_id:

```python
async def create_and_store_alert(packet, prediction_result):
    """Create and store alert with organization context."""
    org_id = monitoring_state.get("org_id")  # Get from monitoring state
    
    alert_data = {
        "org_id": org_id,
        "source_ip": packet.source_ip,
        "destination_ip": packet.destination_ip,
        # ... other fields
    }
    
    await alert_repo.create_alert(**alert_data)
```

---

## Step 4: SIEM Integration

### 4.1 Configure SIEM Connectors

Example configuration for Splunk:

```python
from backend.siem.connectors.splunk_connector import SplunkConnector
from backend.siem.adapters import SIEMAdapter

# Create SIEM adapter
siem_adapter = SIEMAdapter()

# Register Splunk connector
siem_adapter.register_connector(
    name="splunk-primary",
    siem_type="splunk",
    config={
        "hec_url": "https://splunk.example.com:8088",
        "hec_token": "your-hec-token",
        "index": "securenet",
        "source": "securenet_ids",
        "sourcetype": "json"
    },
    demo_mode=False  # Set to True for testing
)
```

### 4.2 Configure ELK Stack

```python
siem_adapter.register_connector(
    name="elk-primary",
    siem_type="elk",
    config={
        "hosts": ["http://elasticsearch.example.com:9200"],
        "username": "elastic",
        "password": "your-password",
        "index_pattern": "securenet-alerts"
    },
    demo_mode=False
)
```

### 4.3 Configure QRadar

```python
siem_adapter.register_connector(
    name="qradar-primary",
    siem_type="qradar",
    config={
        "base_url": "https://qradar.example.com",
        "api_token": "your-api-token",
        "log_source_type": "SecureNet IDS",
        "log_source_id": 1001,
        "qid": 1000000
    },
    demo_mode=False
)
```

### 4.4 Test SIEM Connections

```python
# Test all connectors
test_results = await siem_adapter.test_all_connectors()
print(test_results)

# Test specific connector
splunk_test = await siem_adapter.test_connector("splunk-primary")
print(splunk_test)
```

### 4.5 Enable Automatic Export

Add to background tasks:

```python
async def export_alerts_to_siem():
    """Export recent alerts to SIEM."""
    alerts = await alert_repo.get_by_org(org_id, limit=100)
    await siem_adapter.export_to_all_connectors(alerts)

# Register in scheduler
scheduler.register_job(
    name="siem_export",
    func=export_alerts_to_siem,
    interval_seconds=300,  # Every 5 minutes
    enabled=True
)
```

---

## Step 5: Background Jobs Configuration

### 5.1 Enable Background Jobs

Ensure background jobs are enabled in configuration:

```python
# In main.py
if enhanced_settings.enable_background_jobs:
    register_default_tasks(scheduler, supabase_client)
    await scheduler.start()
```

### 5.2 Customize Job Intervals

Modify intervals in `.env`:

```bash
REPORT_GENERATION_INTERVAL=86400  # 24 hours
CLEANUP_INTERVAL=604800  # 7 days
HEALTH_CHECK_INTERVAL=300  # 5 minutes
```

### 5.3 Monitor Job Status

Check job status via API:

```bash
curl http://localhost:8000/api/v1/health/scheduler/status
```

Or check individual jobs:

```bash
curl http://localhost:8000/api/v1/health/scheduler/jobs
```

---

## Step 6: Testing

### 6.1 Test Database Migration

```python
# Test organization creation
from backend.database.repositories.organization_repository import OrganizationRepository

org_repo = OrganizationRepository(supabase_client)
org = await org_repo.create_organization(
    name="Test Org",
    slug="test-org",
    owner_id="user-id",
    plan="free"
)
print(f"Created org: {org}")
```

### 6.2 Test RBAC

```python
from backend.rbac.permissions import PermissionChecker, Permission, Role

checker = PermissionChecker()
has_perm = checker.has_permission(
    user_role=Role.ORG_ADMIN,
    permission=Permission.ALERT_VIEW,
    user_id="user-id",
    org_id="org-id"
)
print(f"Has permission: {has_perm}")
```

### 6.3 Test SIEM Connectors (Demo Mode)

```python
from backend.siem.connectors.splunk_connector import SplunkConnector

connector = SplunkConnector(
    config={"hec_url": "https://example.com", "hec_token": "test"},
    demo_mode=True  # Use demo mode for testing
)

await connector.connect()
await connector.export_alert({"id": "test", "source_ip": "192.168.1.1"})
```

### 6.4 Test Report Generation

```python
from backend.reporting.generators.pdf_generator import PDFReportGenerator
from backend.reporting.templates.report_templates import DailyReportTemplate

template = DailyReportTemplate(org_id)
report_data = template.generate_report_data(alerts, {})

generator = PDFReportGenerator("Test Org")
pdf_bytes = generator.generate_report(report_data, "daily")

with open("test_report.pdf", "wb") as f:
    f.write(pdf_bytes)
```

### 6.5 Test API Endpoints

```bash
# Health check
curl http://localhost:8000/api/v1/health/

# Full health check (requires auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/v1/health/full

# Start monitoring
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"interface": "Wi-Fi", "org_id": "org-id"}' \
     http://localhost:8000/api/v1/monitoring/start

# Generate report
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"report_type": "daily", "format": "pdf"}' \
     http://localhost:8000/api/v1/reports/generate
```

---

## Step 7: Monitoring and Health Checks

### 7.1 Enable Health Monitoring

Health monitoring is automatically enabled when using the enhanced configuration.

### 7.2 Access Health Endpoints

```bash
# Basic health status
curl http://localhost:8000/api/v1/health/

# Full health check
curl http://localhost:8000/api/v1/health/full

# System metrics
curl http://localhost:8000/api/v1/health/metrics?hours=1

# Scheduler status
curl http://localhost:8000/api/v1/health/scheduler/status
```

### 7.3 Configure Alert Thresholds

Modify thresholds in `health_monitor.py`:

```python
self.alert_thresholds = {
    "cpu_percent": 80,
    "memory_percent": 85,
    "disk_percent": 90
}
```

---

## Step 8: Frontend Integration (Future Work)

The following frontend components need to be created to consume the new APIs:

### 8.1 Required Pages

- **Enterprise SOC Dashboard** (`/dashboard`)
  - Organization switcher
  - Role-based widgets
  - Real-time monitoring status
  - System health indicators

- **Admin Panel** (`/admin`)
  - Organization management
  - User management
  - Role assignment
  - System settings

- **Reports Page** (`/reports`)
  - Report generation interface
  - Report history
  - Download options

- **SIEM Export Page** (`/siem`)
  - Connector configuration
  - Export status
  - Test connections

- **Audit Log Page** (`/audit`)
  - Audit log viewer
  - Filtering options
  - Export functionality

### 8.2 Required Components

- `OrganizationSwitcher.jsx` - Organization selection dropdown
- `RoleGuard.jsx` - Permission-based component wrapper
- `MonitoringControl.jsx` - Start/stop monitoring controls
- `HealthIndicator.jsx` - System health status display
- `ReportGenerator.jsx` - Report generation form
- `SIEMConnectorConfig.jsx` - SIEM connector configuration

---

## Troubleshooting

### Database Migration Fails

**Issue:** Migration script fails due to existing tables

**Solution:** Check for conflicts and manually resolve:

```sql
-- Check existing tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Drop conflicting tables if needed (BACKUP FIRST!)
DROP TABLE IF EXISTS alerts CASCADE;
```

### SIEM Connection Fails

**Issue:** Cannot connect to SIEM platform

**Solution:** 
1. Verify network connectivity
2. Check API credentials
3. Test with demo mode first
4. Check firewall rules

### Background Jobs Not Running

**Issue:** Scheduled tasks not executing

**Solution:**
1. Check scheduler status: `curl /api/v1/health/scheduler/status`
2. Verify `ENABLE_BACKGROUND_JOBS=true` in config
3. Check logs for errors
4. Manually trigger job for testing

### Permission Errors

**Issue:** API returns 403 Forbidden

**Solution:**
1. Verify user role in profiles table
2. Check permission mapping in `permissions.py`
3. Ensure audit logging is enabled
4. Check RLS policies in database

---

## Performance Optimization

### Database Indexes

The migration script includes indexes, but you may need additional ones based on query patterns:

```sql
-- Add custom indexes if needed
CREATE INDEX idx_alerts_org_timestamp ON alerts(org_id, timestamp DESC);
CREATE INDEX idx_audit_logs_user_timestamp ON audit_logs(user_id, created_at DESC);
```

### Connection Pooling

Configure Supabase connection pool:

```python
# In config_enhanced.py
supabase_pool_size = 20
supabase_max_overflow = 40
```

### Caching

Enable repository caching (already implemented in base_repository.py):

```python
repo = AlertRepository(supabase_client)
repo.set_cache_ttl(600)  # 10 minutes
```

---

## Security Considerations

### API Keys

- Never commit API keys to version control
- Use environment variables or secret management
- Rotate keys regularly
- Use least-privilege access

### Row-Level Security

- RLS policies are enabled by default
- Verify policies match your security requirements
- Test with different user roles

### Audit Logging

- Audit logging is enabled by default
- Regularly review audit logs
- Set up alerts for suspicious activities
- Implement log retention policies

---

## Deployment Checklist

Before deploying to production:

- [ ] Run database migration in staging first
- [ ] Backup production database
- [ ] Update all environment variables
- [ ] Configure SIEM connectors in production
- [ ] Enable background jobs
- [ ] Test all API endpoints
- [ ] Verify health monitoring
- [ ] Configure log aggregation
- [ ] Set up monitoring alerts
- [ ] Review and tighten RLS policies
- [ ] Test disaster recovery procedures
- [ ] Document custom configurations
- [ ] Train operations team

---

## Support and Maintenance

### Regular Maintenance Tasks

1. **Weekly:**
   - Review audit logs
   - Check SIEM export status
   - Monitor system health

2. **Monthly:**
   - Review and rotate API keys
   - Clean up old reports
   - Update threat intelligence feeds

3. **Quarterly:**
   - Review and update RBAC permissions
   - Optimize database indexes
   - Review SIEM connector configurations

### Log Locations

- Application logs: `ids.log`
- Audit logs: `ids_audit.log`
- Error logs: Check application logs for ERROR level

### Backup Strategy

- Database: Daily automated backups via Supabase
- Reports: Retain for 90 days (configurable)
- Audit logs: Retain for 90 days (configurable)

---

## Next Steps

After completing Phase 1 integration:

1. **Implement Frontend Components** (Phase 2)
   - Create new React pages and components
   - Integrate with new API endpoints
   - Implement role-based UI

2. **Performance Testing**
   - Load test API endpoints
   - Test SIEM connector performance
   - Optimize database queries

3. **Security Audit**
   - Review RLS policies
   - Audit permission assignments
   - Test authentication flows

4. **Documentation**
   - Update API documentation
   - Create user guides
   - Document custom configurations

---

## Contact and Support

For issues or questions:
- Check existing documentation
- Review audit logs for error details
- Test with demo mode enabled
- Consult Supabase documentation for database issues

---

**Last Updated:** 2026-07-02
**Version:** 2.0.0
**Phase:** 1 Complete
