import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import RoleGuard from '../components/RoleGuard';
import { RoleWrapper } from '../components/RoleGuard';

/**
 * Enhanced Admin Panel
 * 
 * Comprehensive admin interface for managing organizations, users,
 * and system settings with role-based access control.
 */
const EnhancedAdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('organizations');
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  
  // Organization form state
  const [orgForm, setOrgForm] = useState({
    name: '',
    slug: '',
    description: '',
    plan: 'free'
  });

  // User form state
  const [userForm, setUserForm] = useState({
    email: '',
    role: 'security_analyst',
    org_id: ''
  });

  useEffect(() => {
    if (activeTab === 'organizations') {
      fetchOrganizations();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/organizations/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (response.ok) {
        const body = await response.json();
        const data = Array.isArray(body) ? body : (body.data || []);
        setOrganizations(data);
      } else {
        toast.error('Failed to fetch organizations');
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setOrganizations([
        { id: 'demo-org-id', name: 'SecureNet Enterprise', slug: 'securenet-enterprise', plan: 'enterprise', is_active: true, created_at: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/users/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (response.ok) {
        const body = await response.json();
        const data = Array.isArray(body) ? body : (body.data || []);
        setUsers(data);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      setUsers([
        { id: '1', email: 'admin@securenet.com', name: 'Admin User', role: 'admin', org_id: 'demo-org-id', is_active: true, created_at: new Date().toISOString() },
        { id: '2', email: 'analyst@securenet.com', name: 'Analyst', role: 'user', org_id: 'demo-org-id', is_active: true, created_at: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/organizations/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(orgForm)
      });

      if (response.ok) {
        toast.success('Organization created successfully');
        setShowOrgModal(false);
        setOrgForm({ name: '', slug: '', description: '', plan: 'free' });
        fetchOrganizations();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to create organization');
      }
    } catch (error) {
      toast.error('Error creating organization');
    }
  };

  const createUser = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(userForm)
      });

      if (response.ok) {
        toast.success('User created successfully');
        setShowUserModal(false);
        setUserForm({ email: '', role: 'user', org_id: '' });
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to create user');
      }
    } catch (error) {
      toast.error('Error creating user');
    }
  };

  const suspendOrganization = async (orgId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/organizations/${orgId}/suspend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ reason: 'Administrative action' })
      });

      if (response.ok) {
        toast.success('Organization suspended');
        fetchOrganizations();
      } else {
        toast.error('Failed to suspend organization');
      }
    } catch (error) {
      toast.error('Error suspending organization');
    }
  };

  const activateOrganization = async (orgId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/organizations/${orgId}/activate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (response.ok) {
        toast.success('Organization activated');
        fetchOrganizations();
      } else {
        toast.error('Failed to activate organization');
      }
    } catch (error) {
      toast.error('Error activating organization');
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (response.ok) {
        toast.success('User role updated');
        fetchUsers();
      } else {
        toast.error('Failed to update user role');
      }
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const toggleUserStatus = async (userId, isActive) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ is_active: isActive })
      });
      if (response.ok) {
        toast.success(isActive ? 'User activated' : 'User deactivated');
        fetchUsers();
      } else {
        toast.error('Failed to update user status');
      }
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
        <p className="text-gray-600">Manage organizations, users, and system settings</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <RoleWrapper allowedRoles={['super_admin', 'org_admin']}>
              <button
                onClick={() => setActiveTab('organizations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'organizations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Organizations
              </button>
            </RoleWrapper>
            
            <RoleWrapper allowedRoles={['super_admin', 'org_admin']}>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Users
              </button>
            </RoleWrapper>
            
            <RoleWrapper allowedRoles={['super_admin']}>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                System Settings
              </button>
            </RoleWrapper>
          </nav>
        </div>
      </div>

      {/* Organizations Tab */}
      {activeTab === 'organizations' && (
        <RoleWrapper allowedRoles={['super_admin', 'org_admin']}>
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Organizations</h2>
              <RoleGuard permission="org.create">
                <button
                  onClick={() => setShowOrgModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Organization
                </button>
              </RoleGuard>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {organizations.map((org) => (
                      <tr key={org.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {org.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {org.slug}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full capitalize">
                            {org.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {org.is_active ? (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                              Suspended
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(org.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <RoleWrapper allowedRoles={['super_admin']}>
                            {org.is_active ? (
                              <button
                                onClick={() => suspendOrganization(org.id)}
                                className="text-red-600 hover:text-red-700 mr-3"
                              >
                                Suspend
                              </button>
                            ) : (
                              <button
                                onClick={() => activateOrganization(org.id)}
                                className="text-green-600 hover:text-green-700 mr-3"
                              >
                                Activate
                              </button>
                            )}
                          </RoleWrapper>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </RoleWrapper>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <RoleWrapper allowedRoles={['super_admin', 'org_admin']}>
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Users</h2>
              <RoleGuard permission="user.create">
                <button
                  onClick={() => setShowUserModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add User
                </button>
              </RoleGuard>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(user.id, e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="super_admin">Super Admin</option>
                            <option value="org_admin">Org Admin</option>
                            <option value="security_analyst">Security Analyst</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.is_active ? (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => toggleUserStatus(user.id, !user.is_active)}
                            className={user.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </RoleWrapper>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <RoleWrapper allowedRoles={['super_admin']}>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">System Settings</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Background Jobs</h3>
                  <p className="text-sm text-gray-500">Enable automated background tasks</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">SIEM Export</h3>
                  <p className="text-sm text-gray-500">Enable automatic SIEM platform exports</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Automated Reports</h3>
                  <p className="text-sm text-gray-500">Enable scheduled report generation</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Audit Logging</h3>
                  <p className="text-sm text-gray-500">Log all user actions for compliance</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </RoleWrapper>
      )}

      {/* Add Organization Modal */}
      {showOrgModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Add Organization</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={orgForm.name}
                  onChange={(e) => setOrgForm({...orgForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                <input
                  type="text"
                  value={orgForm.slug}
                  onChange={(e) => setOrgForm({...orgForm, slug: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
                <select
                  value={orgForm.plan}
                  onChange={(e) => setOrgForm({...orgForm, plan: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={orgForm.description}
                  onChange={(e) => setOrgForm({...orgForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowOrgModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createOrganization}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedAdminPanel;
