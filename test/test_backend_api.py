import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

BACKEND_DIR = Path(__file__).resolve().parent.parent / 'backend'
sys.path.insert(0, str(BACKEND_DIR))

from main import app
from database.sqlite_db import sqlite_db

@pytest.fixture(scope='module')
def client():
    with TestClient(app) as c:
        yield c

def test_health_endpoints(client):
    r1 = client.get('/health')
    assert r1.status_code == 200
    assert r1.json().get('status') == 'healthy'
    
    r2 = client.get('/api/v1/health')
    assert r2.status_code == 200
    assert r2.json().get('status') == 'healthy'

def test_status_endpoint(client):
    r = client.get('/status')
    assert r.status_code == 200
    data = r.json()
    assert 'is_monitoring' in data or 'monitoring' in data or 'status' in data

def test_alerts_endpoint(client):
    r = client.get('/alerts?limit=10')
    assert r.status_code == 200
    data = r.json().get('data')
    assert 'alerts' in data or isinstance(data, list)

def test_logs_endpoint(client):
    r = client.get('/logs?limit=10')
    assert r.status_code == 200
    data = r.json().get('data')
    assert 'logs' in data or isinstance(data, list)

def test_stats_endpoint(client):
    r = client.get('/stats')
    assert r.status_code == 200
    assert 'data' in r.json()

def test_organizations_crud(client):
    # GET
    r = client.get('/api/v1/organizations/')
    assert r.status_code == 200
    orgs = r.json().get('data')
    assert isinstance(orgs, list)
    
    # POST
    new_org = {
        'name': 'Test Security Org',
        'slug': 'test-security-org',
        'description': 'Automated test organization',
        'plan': 'enterprise'
    }
    r_post = client.post('/api/v1/organizations/', json=new_org)
    assert r_post.status_code == 201
    created = r_post.json().get('data')
    assert created['name'] == new_org['name']
    org_id = created['id']
    
    # Suspend & Activate
    r_susp = client.post(f'/api/v1/organizations/{org_id}/suspend')
    assert r_susp.status_code == 200
    
    r_act = client.post(f'/api/v1/organizations/{org_id}/activate')
    assert r_act.status_code == 200

def test_users_crud(client):
    # GET
    r = client.get('/api/v1/users/')
    assert r.status_code == 200
    users = r.json().get('data')
    assert isinstance(users, list)
    
    # POST
    new_user = {
        'email': 'testuser@securenet.test',
        'name': 'Test Security User',
        'role': 'security_analyst',
        'org_id': 'demo-org-id'
    }
    r_post = client.post('/api/v1/users/', json=new_user)
    assert r_post.status_code == 201
    created = r_post.json().get('data')
    user_id = created['id']
    
    # PUT
    r_put = client.put(f'/api/v1/users/{user_id}', json={'name': 'Updated User', 'role': 'admin'})
    assert r_put.status_code == 200
    
    # DELETE
    r_del = client.delete(f'/api/v1/users/{user_id}')
    assert r_del.status_code == 200

def test_audit_logs_endpoints(client):
    # POST
    audit_entry = {
        'action': 'test_rule_created',
        'resource_type': 'firewall_rule',
        'resource_id': 'rule-99',
        'details': {'port': 8080}
    }
    r_post = client.post('/api/v1/audit-logs/', json=audit_entry)
    assert r_post.status_code == 201
    
    # GET
    r_get = client.get('/api/v1/audit-logs/?limit=10')
    assert r_get.status_code == 200
    assert isinstance(r_get.json().get('data'), list)

def test_blacklist_endpoints(client):
    # Add
    entry = {'ip_address': '198.51.100.99', 'reason': 'Test malicious IP'}
    r_add = client.post('/blacklist', json=entry)
    assert r_add.status_code == 200
    
    # Check
    r_check = client.post('/check-ip', json={'ip_address': '198.51.100.99'})
    assert r_check.status_code == 200
    res_data = r_check.json().get('data', r_check.json())
    assert res_data.get('is_blacklisted') is True
    
    # Delete
    r_del = client.delete('/blacklist/198.51.100.99')
    assert r_del.status_code == 200

def test_export_endpoints(client):
    r1 = client.get('/export/alerts')
    assert r1.status_code == 200
    assert 'text/csv' in r1.headers.get('content-type', '')
    
    r2 = client.get('/api/v1/reports/audit-logs/export')
    assert r2.status_code == 200
    assert 'text/csv' in r2.headers.get('content-type', '')
