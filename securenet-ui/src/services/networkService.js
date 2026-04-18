export const getNetworkStats = () => {
  return {
    traffic: "1.2GB",
    active: 23,
    blocked: 156,
    uptime: "99.7%"
  };
};

export const getNetworkConnections = () => {
  return [
    { id: 1, ip: "192.168.1.100", status: "active", type: "internal" },
    { id: 2, ip: "203.0.113.1", status: "blocked", type: "external" },
    { id: 3, ip: "10.0.0.1", status: "active", type: "vpn" }
  ];
};

export const getNetworkTraffic = () => {
  return {
    inbound: "856MB",
    outbound: "344MB",
    peak: "2.1GB/h"
  };
};
