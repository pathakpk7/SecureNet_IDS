import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Shield, 
  Settings, 
  Database, 
  AlertTriangle, 
  RefreshCw,
  UserPlus,
  Ban,
  Activity,
  TrendingUp,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { getRequest } from '../api';

const AdminPanel = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminData, setAdminData] = useState({
    users: [],
    system: {},
    security: {},
    logs: [],
    stats: {
      totalUsers: 0,
      activeUsers: 0,
      totalAlerts: 0,
      criticalAlerts: 0,
      systemLoad: 0,
      uptime: '99.9%'
    }
  });

  // Mock data for development
  const mockData = {
    users: [
      {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'admin',
        status: 'active',
        lastLogin: '2024-01-15 14:30:00',
        registered: '2024-01-01 10:00:00',
        permissions: ['read', 'write', 'delete', 'admin'],
        avatar: null
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: 'user',
        status: 'active',
        lastLogin: '2024-01-15 13:45:00',
        registered: '2024-01-10 15:30:00',
        permissions: ['read'],
        avatar: null
      },
      {
        id: 3,
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        role: 'user',
        status: 'inactive',
        lastLogin: '2024-01-14 09:15:00',
        registered: '2024-01-05 11:20:00',
        permissions: ['read'],
        avatar: null
      },
      {
        id: 4,
        name: 'Alice Brown',
        email: 'alice.brown@example.com',
        role: 'user',
        status: 'active',
        lastLogin: '2024-01-15 16:20:00',
        registered: '2024-01-08 10:45:00',
        permissions: ['read'],
        avatar: null
      },
      {
        id: 5,
        name: 'Charlie Wilson',
        email: 'charlie.wilson@example.com',
        role: 'user',
        status: 'suspended',
        lastLogin: '2024-01-12 11:30:00',
        registered: '2024-01-02 14:00:00',
        permissions: ['read'],
        avatar: null,
        reason: 'Suspicious activity detected'
      },
    ],
    system: {
      version: '2.4.1',
      lastUpdate: '2024-01-15 12:00:00',
      database: {
        size: '2.3GB',
        backups: 3,
        lastBackup: '2024-01-15 06:00:00'
      },
      security: {
        firewallStatus: 'active',
        lastScan: '2024-01-15 11:00:00',
        threatsBlocked: 156,
        sslCertificates: 'valid'
      }
    },
    logs: [
      {
        id: 1,
        timestamp: '2024-01-15 14:32:15',
        type: 'admin_action',
        user: 'John Doe',
        action: 'Created new user account',
        details: {
          user_id: 'jane.smith@example.com',
          role: 'user',
          permissions: ['read']
        }
      },
      {
        id: 2,
        timestamp: '2024-01-15 14:28:42',
        type: 'security_alert',
        user: 'System',
        action: 'DDoS attack blocked',
        details: {
          source_ip: '192.168.1.100',
          rule_triggered: 'Block DDoS Attacks',
          severity: 'high'
        }
      },
      {
        id: 3,
        timestamp: '2024-01-15 14:15:33',
        type: 'system_event',
        user: 'System',
        action: 'Database backup completed',
        details: {
          backup_size: '2.3GB',
          duration: '45 minutes'
        }
      },
      {
        id: 4,
        timestamp: '2024-01-15 13:45:22',
        type: 'user_action',
        user: 'John Doe',
        action: 'Modified user permissions',
        details: {
          target_user: 'jane.smith@example.com',
          old_permissions: ['read'],
          new_permissions: ['read', 'write']
        }
      }
    ],
    stats: {
      totalUsers: 5,
      activeUsers: 3,
      totalAlerts: 89,
      criticalAlerts: 12,
      systemLoad: 67,
      uptime: '99.9%'
    }
  };

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setAdminData(mockData);
      } catch (err) {
        setError(err.message || 'Failed to fetch admin data');
        console.error('Admin data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      // Simulate real-time admin data updates
      setAdminData(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          systemLoad: Math.max(20, prev.stats.systemLoad + (Math.random() - 0.5) * 10),
          criticalAlerts: prev.stats.criticalAlerts + (Math.random() > 0.8 ? 1 : 0),
          totalAlerts: prev.stats.totalAlerts + (Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0)
        }
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    // Refetch admin data
    setAdminData(mockData);
  };

  const handleUserAction = (userId, action) => {
    // Handle user management actions
    console.log(`User action: ${action} for user ${userId}`);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'text-neon-red';
      case 'user':
        return 'text-neon-blue';
      case 'suspended':
        return 'text-neon-yellow';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-neon-green';
      case 'inactive':
        return 'text-gray-400';
      case 'suspended':
        return 'text-neon-yellow';
      default:
        return 'text-red-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Admin Panel
            </h1>
            <p className="text-gray-400">
              System administration and user management
            </p>
          </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          className="flex items-center space-x-2 p-3 glass-card rounded-lg hover:bg-white/10 transition-all"
        >
          <RefreshCw size={18} className="text-neon-blue" />
          <span className="text-sm text-gray-300">Refresh</span>
        </motion.button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Users size={24} className="text-neon-blue" />
            <div>
              <h3 className="text-lg font-semibold text-white">Total Users</h3>
              <div className="text-3xl font-bold text-neon-blue neon-text">
                {adminData.stats.totalUsers}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Activity size={24} className="text-neon-green" />
            <div>
              <h3 className="text-lg font-semibold text-white">Active Users</h3>
              <div className="text-3xl font-bold text-neon-green neon-text">
                {adminData.stats.activeUsers}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle size={24} className="text-neon-yellow" />
            <div>
              <h3 className="text-lg font-semibold text-white">Total Alerts</h3>
              <div className="text-3xl font-bold text-neon-yellow neon-text">
                {adminData.stats.totalAlerts}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Shield size={24} className="text-neon-red" />
            <div>
              <h3 className="text-lg font-semibold text-white">Critical Alerts</h3>
              <div className="text-3xl font-bold text-neon-red neon-text">
                {adminData.stats.criticalAlerts}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Database size={24} className="text-neon-blue" />
            <div>
              <h3 className="text-lg font-semibold text-white">System Load</h3>
              <div className="text-3xl font-bold text-neon-blue neon-text">
                {adminData.stats.systemLoad}%
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neon-green/20 rounded-full flex items-center justify-center">
              <div className="text-2xl font-bold text-neon-green">99.9%</div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Uptime</h3>
              <div className="text-sm text-gray-400">System Availability</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* User Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">
            User Management
          </h3>
          
          <div className="flex items-center space-x-2">
            <button
              className="btn-primary"
            >
              <UserPlus size={18} />
              <span>Add User</span>
            </button>
            
            <button
              className="btn-secondary"
            >
              <Settings size={18} />
              <span>User Settings</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                  User
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                  Role
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                  Last Login
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                  Registered
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {adminData.users.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-all duration-300"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-white">{user.name}</div>
                        <div className="text-sm text-gray-300">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-sm font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-sm font-medium ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-400">
                      {user.lastLogin}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-400">
                      {user.registered}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUserAction(user.id, 'edit')}
                        className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      
                      <button
                        onClick={() => handleUserAction(user.id, 'permissions')}
                        className="p-1 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Shield size={16} />
                      </button>
                      
                      <button
                        onClick={() => handleUserAction(user.id, 'delete')}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* System Settings */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.8 }}
  className="glass-card p-6"
>
  <div className="flex items-center justify-between mb-6">
    <h3 className="text-xl font-semibold text-white">
      System Settings
    </h3>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-2">
          System Information
        </h4>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-400">Version</span>
            <span className="text-sm text-white">
              {adminData.system.version}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-400">Last Update</span>
            <span className="text-sm text-white">
              {adminData.system.lastUpdate}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-400">Database</span>
            <span className="text-sm text-white">
              {adminData.system.database.size}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-400">Backups</span>
            <span className="text-sm text-white">
              {adminData.system.database.backups}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-400">Last Backup</span>
            <span className="text-sm text-white">
              {adminData.system.database.lastBackup}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-2">
          Security Settings
        </h4>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-400">
              Firewall Status
            </span>
            <span className={`text-sm font-medium ${getStatusColor(adminData.system.security.firewallStatus)}`}>
              {adminData.system.security.firewallStatus}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-400">
              Threats Blocked
            </span>
            <span className="text-sm text-white">
              {adminData.system.security.threatsBlocked}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-400">
              SSL Certificates
            </span>
            <span className={`text-sm font-medium ${getStatusColor(adminData.system.security.sslCertificates)}`}>
              {adminData.system.security.sslCertificates}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-400">
              Last Security Scan
            </span>
            <span className="text-sm text-white">
              {adminData.system.security.lastScan}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* ✅ FIX: moved inside SAME motion.div */}
  <div className="flex justify-end mt-6">
    <button className="btn-primary">
      Save Settings
    </button>
  </div>
</motion.div>

      {/* System Logs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">
            System Logs
          </h3>
          
          <div className="flex items-center space-x-2">
            <button className="btn-secondary">
              <Eye size={18} />
              <span>View All Logs</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {adminData.logs.slice(0, 10).map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-4 rounded-lg border border-gray-600/30"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${log.type === 'admin_action' ? 'bg-neon-blue' : log.type === 'security_alert' ? 'bg-neon-red' : 'bg-gray-600'}`}></div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      {log.type}
                    </span>
                    <span className="text-xs text-gray-500">• {log.user}</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-1">
                    {log.action}
                  </p>
                  <span className="text-xs text-gray-500">
                    {log.timestamp}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <button className="btn-secondary">
            View All Logs
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPanel;