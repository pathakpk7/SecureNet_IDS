import React, { useState, useEffect, useMemo } from 'react';
import { 
  Laptop, 
  Server, 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  Wifi, 
  WifiOff, 
  Copy, 
  Check, 
  RefreshCw, 
  Search, 
  AlertTriangle,
  Play,
  Skull,
  X,
  Terminal,
  Cpu
} from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE, API_V1 } from '@/config/api';
import '../styles/pages/fleet.css';

const FleetDevices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedKey, setCopiedKey] = useState(false);
  const [joinKey, setJoinKey] = useState('SEC789');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceDetail, setDeviceDetail] = useState(null);
  const [killPid, setKillPid] = useState('');
  const [killModalOpen, setKillModalOpen] = useState(false);
  const [targetDeviceForKill, setTargetDeviceForKill] = useState(null);

  // Fetch join key & devices
  const fetchFleetData = async () => {
    try {
      setLoading(true);
      // 1. Fetch organization info for join key
      const orgRes = await fetch(`${API_V1}/organizations`);
      if (orgRes.ok) {
        const orgData = await orgRes.json();
        const orgList = orgData?.data || [];
        if (orgList.length > 0 && orgList[0].join_key) {
          setJoinKey(orgList[0].join_key);
        }
      }

      // 2. Fetch fleet devices
      const devRes = await fetch(`${API_V1}/devices`);
      if (devRes.ok) {
        const devBody = await devRes.json();
        const list = devBody?.data?.devices || devBody?.data || [];
        setDevices(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      console.error('Error fetching fleet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleetData();
    const interval = setInterval(fetchFleetData, 8000); // Polling every 8s
    return () => clearInterval(interval);
  }, []);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(joinKey);
    setCopiedKey(true);
    toast.success(`Organization Join Key '${joinKey}' copied to clipboard!`);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleToggleQuarantine = async (device) => {
    const newStatus = !device.is_quarantined;
    const actionLabel = newStatus ? 'isolate' : 'unisolate';
    try {
      const res = await fetch(`${API_V1}/devices/${device.id}/quarantine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quarantined: newStatus, reason: `Admin SOC 1-click ${actionLabel}` })
      });
      if (res.ok) {
        toast.success(`Host '${device.hostname}' set to ${newStatus ? 'QUARANTINED / ISOLATED' : 'UNISOLATED'}`);
        fetchFleetData();
      } else {
        toast.error('Failed to update host quarantine status');
      }
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleInspectDevice = async (device) => {
    setSelectedDevice(device);
    try {
      const res = await fetch(`${API_V1}/devices/${device.id}`);
      if (res.ok) {
        const data = await res.json();
        setDeviceDetail(data?.data?.device || device);
      } else {
        setDeviceDetail(device);
      }
    } catch {
      setDeviceDetail(device);
    }
  };

  const handleKillProcess = async () => {
    if (!killPid || !targetDeviceForKill) return;
    try {
      const res = await fetch(`${API_V1}/devices/${targetDeviceForKill.id}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command_type: 'kill_process',
          payload: { pid: parseInt(killPid, 10) }
        })
      });
      if (res.ok) {
        toast.success(`SOAR command dispatched: Terminate PID ${killPid} on ${targetDeviceForKill.hostname}`);
        setKillModalOpen(false);
        setKillPid('');
      } else {
        toast.error('Failed to dispatch kill_process command');
      }
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleDeleteDevice = async (device) => {
    if (!window.confirm(`Deregister device '${device.hostname}' from fleet?`)) return;
    try {
      const res = await fetch(`${API_V1}/devices/${device.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(`Device '${device.hostname}' deregistered`);
        fetchFleetData();
      }
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const filteredDevices = useMemo(() => {
    return devices.filter(dev => {
      const matchesSearch = !searchTerm ||
        dev.hostname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dev.ip_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dev.assigned_user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dev.os_platform?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const isOnline = dev.status === 'online';
      const isQuarantined = Boolean(dev.is_quarantined);

      if (statusFilter === 'online') return matchesSearch && isOnline && !isQuarantined;
      if (statusFilter === 'offline') return matchesSearch && dev.status === 'offline';
      if (statusFilter === 'quarantined') return matchesSearch && isQuarantined;
      return matchesSearch;
    });
  }, [devices, searchTerm, statusFilter]);

  const kpis = useMemo(() => {
    const total = devices.length;
    const quarantined = devices.filter(d => Boolean(d.is_quarantined)).length;
    const online = devices.filter(d => d.status === 'online' && !d.is_quarantined).length;
    return { total, online, quarantined };
  }, [devices]);

  return (
    <div className="fleet-container">
      {/* Header */}
      <div className="fleet-header">
        <h1 className="fleet-title">
          <Laptop className="text-cyan" size={28} />
          Endpoint Fleet Management & EDR
        </h1>
        <p className="fleet-sub">
          Monitor employee workstations, inspect live socket telemetry, and execute remote 1-click SOAR incident responses
        </p>
      </div>

      {/* Join Key Banner */}
      <div className="fleet-join-banner">
        <div className="join-banner-left">
          <div className="join-banner-icon">
            <Terminal size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
              Organization Device Enrollment Key
            </div>
            <div className="join-key-tag">{joinKey}</div>
          </div>
        </div>

        <div className="join-banner-actions">
          <button className="btn-cyan" onClick={handleCopyKey}>
            {copiedKey ? <Check size={16} /> : <Copy size={16} />}
            {copiedKey ? 'Copied!' : 'Copy Join Key'}
          </button>
          <button className="btn-dark" onClick={fetchFleetData} title="Refresh fleet status">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="fleet-kpis">
        <div className="fleet-kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(0, 245, 255, 0.1)', color: '#00f5ff' }}>
            <Laptop size={22} />
          </div>
          <div>
            <div className="kpi-val">{kpis.total}</div>
            <div className="kpi-lbl">Total Enrolled Devices</div>
          </div>
        </div>

        <div className="fleet-kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <Wifi size={22} />
          </div>
          <div>
            <div className="kpi-val" style={{ color: '#10b981' }}>{kpis.online}</div>
            <div className="kpi-lbl">Active & Online</div>
          </div>
        </div>

        <div className="fleet-kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <div className="kpi-val" style={{ color: '#ef4444' }}>{kpis.quarantined}</div>
            <div className="kpi-lbl">Quarantined / Isolated</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="fleet-toolbar">
        <div className="fleet-search-wrap">
          <Search className="fleet-search-icon" size={16} />
          <input 
            type="text" 
            placeholder="Search by hostname, IP, employee, or OS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="fleet-search-input"
          />
        </div>

        <div className="fleet-filter-pills">
          {['all', 'online', 'quarantined', 'offline'].map(status => (
            <button
              key={status}
              className={`pill-btn ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status === 'all' ? 'All Endpoints' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Fleet Table */}
      <div className="fleet-table-card">
        <table className="fleet-table">
          <thead>
            <tr>
              <th>Device Hostname</th>
              <th>Platform / OS</th>
              <th>IP Address</th>
              <th>Status</th>
              <th>Last Heartbeat</th>
              <th>Remote Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  {loading ? 'Discovering fleet devices...' : 'No enrolled devices found matching criteria.'}
                </td>
              </tr>
            ) : (
              filteredDevices.map(device => {
                const isQuarantined = Boolean(device.is_quarantined);
                const isOnline = device.status === 'online';

                return (
                  <tr key={device.id}>
                    <td>
                      <div className="device-host-col">
                        <div className="os-icon-wrap">
                          {device.os_platform === 'linux' ? <Server size={18} /> : <Laptop size={18} />}
                        </div>
                        <div>
                          <div className="host-name">{device.hostname}</div>
                          <div className="host-email">{device.assigned_user_email || 'Unassigned User'}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ color: '#cbd5e1', fontWeight: 500 }}>{device.os_platform?.toUpperCase()}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{device.os_version || 'v1.0.0'}</div>
                    </td>

                    <td>
                      <div style={{ fontFamily: 'monospace', color: '#00f5ff' }}>{device.ip_address || '127.0.0.1'}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{device.mac_address || '00:00:00:00:00:00'}</div>
                    </td>

                    <td>
                      {isQuarantined ? (
                        <span className="badge-quarantined">
                          <AlertTriangle size={12} /> ISOLATED
                        </span>
                      ) : isOnline ? (
                        <span className="badge-online">
                          <Wifi size={12} /> ONLINE
                        </span>
                      ) : (
                        <span className="badge-offline">OFFLINE</span>
                      )}
                    </td>

                    <td style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                      {device.last_heartbeat ? new Date(device.last_heartbeat).toLocaleTimeString() : 'N/A'}
                    </td>

                    <td>
                      <div className="action-btn-group">
                        <button 
                          className="btn-action"
                          onClick={() => handleInspectDevice(device)}
                          title="Inspect active sockets and system telemetry"
                        >
                          <Activity size={14} /> Telemetry
                        </button>

                        <button 
                          className={`btn-action ${isQuarantined ? 'unisolate' : 'isolate'}`}
                          onClick={() => handleToggleQuarantine(device)}
                          title={isQuarantined ? 'Restore network access' : 'Cut network access to contain breach'}
                        >
                          {isQuarantined ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                          {isQuarantined ? 'Unisolate' : 'Isolate'}
                        </button>

                        <button 
                          className="btn-action"
                          onClick={() => { setTargetDeviceForKill(device); setKillModalOpen(true); }}
                          title="Remotely terminate a process on this endpoint"
                        >
                          <Skull size={14} /> Kill
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Telemetry Modal */}
      {selectedDevice && (
        <div className="fleet-modal-overlay" onClick={() => setSelectedDevice(null)}>
          <div className="fleet-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Live Telemetry: {selectedDevice.hostname}</h2>
                <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px' }}>
                  IP: {selectedDevice.ip_address} | OS: {selectedDevice.os_version}
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedDevice(null)}>✕</button>
            </div>

            {/* Performance Gauges */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <div className="meter-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#94a3b8' }}>CPU Utilization</span>
                  <strong style={{ color: '#00f5ff' }}>
                    {selectedDevice.metadata?.cpu_cores ? `${selectedDevice.metadata.cpu_cores} Cores` : 'Normal'}
                  </strong>
                </div>
                <div className="meter-track">
                  <div className="meter-bar" style={{ width: '22%', background: '#00f5ff' }}></div>
                </div>
              </div>

              <div className="meter-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#94a3b8' }}>Memory (RAM)</span>
                  <strong style={{ color: '#10b981' }}>
                    {selectedDevice.metadata?.ram_total_gb ? `${selectedDevice.metadata.ram_total_gb} GB Installed` : 'Normal'}
                  </strong>
                </div>
                <div className="meter-track">
                  <div className="meter-bar" style={{ width: '45%', background: '#10b981' }}></div>
                </div>
              </div>
            </div>

            {/* Agent Info Box */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#cbd5e1' }}>
                <span>Agent Version: <strong>v{selectedDevice.agent_version || '1.0.0'}</strong></span>
                <span>MAC Address: <strong>{selectedDevice.mac_address}</strong></span>
                <span>Quarantine: <strong style={{ color: selectedDevice.is_quarantined ? '#ef4444' : '#10b981' }}>{selectedDevice.is_quarantined ? 'ACTIVE' : 'NONE'}</strong></span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                className={`btn-action ${selectedDevice.is_quarantined ? 'unisolate' : 'isolate'}`}
                onClick={() => { handleToggleQuarantine(selectedDevice); setSelectedDevice(null); }}
              >
                {selectedDevice.is_quarantined ? 'Lift Network Isolation' : 'Isolate Host Now'}
              </button>
              <button className="btn-dark" onClick={() => setSelectedDevice(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Kill Process Modal */}
      {killModalOpen && targetDeviceForKill && (
        <div className="fleet-modal-overlay" onClick={() => setKillModalOpen(false)}>
          <div className="fleet-modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
                <Skull size={20} /> Remote Process Termination
              </h3>
              <button className="modal-close-btn" onClick={() => setKillModalOpen(false)}>✕</button>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0 0 16px 0' }}>
              Dispatch a SOAR termination command to <strong>{targetDeviceForKill.hostname}</strong>.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px' }}>
                Target Process PID (Process ID)
              </label>
              <input 
                type="number"
                placeholder="e.g. 4012"
                value={killPid}
                onChange={(e) => setKillPid(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '10px',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-dark" onClick={() => setKillModalOpen(false)}>Cancel</button>
              <button 
                style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                onClick={handleKillProcess}
              >
                Terminate Process
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetDevices;
