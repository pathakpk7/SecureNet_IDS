import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';

/**
 * OrganizationSwitcher Component
 * 
 * Allows users to switch between organizations they have access to.
 * Only visible for users with multiple organization memberships.
 */
const OrganizationSwitcher = ({ currentOrgId, onOrgChange }) => {
  const [organizations, setOrganizations] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserOrganizations();
  }, []);

  const fetchUserOrganizations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user's organizations
      const { data: profiles } = await supabase
        .from('profiles')
        .select('org_id, organizations(*)')
        .eq('id', user.id);

      if (profiles) {
        const orgs = profiles.map(p => p.organizations).filter(Boolean);
        setOrganizations(orgs);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrgChange = (org) => {
    onOrgChange(org);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-lg h-10 w-48"></div>
    );
  }

  if (organizations.length <= 1) {
    return (
      <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg">
        <span className="text-sm font-medium text-gray-700">
          {organizations[0]?.name || 'Default Organization'}
        </span>
      </div>
    );
  }

  const currentOrg = organizations.find(org => org.id === currentOrgId) || organizations[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span className="text-sm font-medium text-gray-700">{currentOrg?.name}</span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-2">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => handleOrgChange(org)}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors ${
                    org.id === currentOrgId ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{org.name}</span>
                    {org.id === currentOrgId && (
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{org.plan}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrganizationSwitcher;
