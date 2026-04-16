import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const OrgDebug = () => {
  const { user, debugGetAllOrganizations, debugGetAllProfiles } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const orgs = await debugGetAllOrganizations();
      const profs = await debugGetAllProfiles();
      setOrganizations(orgs || []);
      setProfiles(profs || []);
    } catch (error) {
      console.error("Debug fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      background: 'rgba(0,0,0,0.8)', 
      color: '#fff', 
      margin: '20px',
      borderRadius: '8px',
      fontFamily: 'monospace'
    }}>
      <h2>Organization Debug Panel</h2>
      
      {/* Current User Info */}
      <div style={{ marginBottom: '20px', padding: '10px', background: 'rgba(255,255,255,0.1)' }}>
        <h3>Current User:</h3>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>

      {/* Organizations */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Organizations ({organizations.length}):</h3>
        <button onClick={fetchData} disabled={loading} style={{ marginBottom: '10px' }}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
        {organizations.map(org => (
          <div key={org.id} style={{ 
            padding: '10px', 
            background: 'rgba(0,255,255,0.1)', 
            marginBottom: '5px',
            borderRadius: '4px'
          }}>
            <strong>ID:</strong> {org.id}<br />
            <strong>Name:</strong> {org.name}<br />
            <strong>Owner:</strong> {org.owner_id}<br />
            <strong>Created:</strong> {org.created_at}
          </div>
        ))}
      </div>

      {/* Profiles */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Profiles ({profiles.length}):</h3>
        {profiles.map(profile => (
          <div key={profile.id} style={{ 
            padding: '10px', 
            background: 'rgba(255,0,255,0.1)', 
            marginBottom: '5px',
            borderRadius: '4px'
          }}>
            <strong>ID:</strong> {profile.id}<br />
            <strong>Email:</strong> {profile.email}<br />
            <strong>Role:</strong> {profile.role}<br />
            <strong>Org ID:</strong> {profile.org_id}<br />
            <strong>Org Name:</strong> {profile.organizations?.name || 'N/A'}<br />
            <strong>Created:</strong> {profile.created_at}
          </div>
        ))}
      </div>

      {/* Test Instructions */}
      <div style={{ padding: '10px', background: 'rgba(255,255,0,0.1)' }}>
        <h3>Multi-Tenant Verification Steps:</h3>
        <button onClick={() => window.location.href = '/signup'} style={{ marginBottom: '10px', padding: '8px', background: '#ff3366', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Go to Signup Page
        </button>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
          <div style={{ padding: '10px', background: 'rgba(0,255,0,0.1)' }}>
            <h4>STEP 1: Admin Signup</h4>
            <p>Create admin account with organization details</p>
          </div>
          
          <div style={{ padding: '10px', background: 'rgba(255,0,255,0.1)' }}>
            <h4>STEP 2: User Signup</h4>
            <p>Join existing organization with admin's org_id</p>
          </div>
          
          <div style={{ padding: '10px', background: 'rgba(0,255,255,0.1)' }}>
            <h4>STEP 3: Verify Data</h4>
            <p>Check debug panel for org_id assignments</p>
          </div>
        </div>
        
        <div style={{ padding: '10px', background: 'rgba(255,255,0,0.1)', marginTop: '20px' }}>
          <h4>Expected Results:</h4>
          <ul>
            <li>✅ Organizations table populated</li>
            <li>✅ Profiles have org_id</li>
            <li>✅ Admin + User share same org_id</li>
            <li>✅ Frontend user has org_id</li>
            <li>✅ Multiple orgs are isolated</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrgDebug;
