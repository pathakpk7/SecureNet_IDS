import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import RoleGuard from '../components/RoleGuard';

/**
 * SIEM Export Page
 * 
 * Provides interface for configuring and managing SIEM connectors.
 */
const SIEMExport = () => {
  const [connectors, setConnectors] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newConnector, setNewConnector] = useState({
    name: '',
    type: 'splunk',
    config: {}
  });

  useEffect(() => {
    fetchConnectors();
  }, []);

  const fetchConnectors = async () => {
    try {
      // This would call the backend API when implemented
      // For now, using mock data
      setConnectors([
        {
          id: 1,
          name: 'splunk-primary',
          type: 'splunk',
          connected: true,
          last_export: '2026-07-02T10:00:00Z'
        }
      ]);
    } catch (error) {
      toast.error('Failed to fetch SIEM connectors');
    }
  };

  const testConnection = async (connectorId) => {
    try {
      toast.loading('Testing connection...');
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.dismiss();
      toast.success('Connection test successful');
    } catch (error) {
      toast.dismiss();
      toast.error('Connection test failed');
    }
  };

  const addConnector = async () => {
    try {
      // This would call the backend API
      toast.success('SIEM connector added successfully');
      setShowAddModal(false);
      setNewConnector({ name: '', type: 'splunk', config: {} });
      fetchConnectors();
    } catch (error) {
      toast.error('Failed to add connector');
    }
  };

  const deleteConnector = async (connectorId) => {
    try {
      // This would call the backend API
      toast.success('SIEM connector deleted');
      fetchConnectors();
    } catch (error) {
      toast.error('Failed to delete connector');
    }
  };

  const getConnectorIcon = (type) => {
    switch (type) {
      case 'splunk':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        );
      case 'elk':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        );
      case 'qradar':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        );
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">SIEM Export</h1>
          <p className="text-gray-600">Configure and manage SIEM platform integrations</p>
        </div>
        <RoleGuard permission="siem.configure">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Connector
          </button>
        </RoleGuard>
      </div>

      {/* Connectors List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Active Connectors</h2>
        </div>
        
        {connectors.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <p className="text-gray-500">No SIEM connectors configured</p>
            <p className="text-sm text-gray-400 mt-2">Add a connector to start exporting alerts</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {connectors.map((connector) => (
              <div key={connector.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    {getConnectorIcon(connector.type)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{connector.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{connector.type}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                    connector.connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      connector.connected ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm font-medium">
                      {connector.connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>

                  <button
                    onClick={() => testConnection(connector.id)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Test Connection
                  </button>

                  <RoleGuard permission="siem.manage">
                    <button
                      onClick={() => deleteConnector(connector.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </RoleGuard>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Connector Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Add SIEM Connector</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Connector Name
                </label>
                <input
                  type="text"
                  value={newConnector.name}
                  onChange={(e) => setNewConnector({...newConnector, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., splunk-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SIEM Platform
                </label>
                <select
                  value={newConnector.type}
                  onChange={(e) => setNewConnector({...newConnector, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="splunk">Splunk</option>
                  <option value="elk">ELK Stack</option>
                  <option value="qradar">IBM QRadar</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Demo Mode:</strong> Configure connectors in demo mode for testing without enterprise licenses.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addConnector}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Connector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SIEMExport;
