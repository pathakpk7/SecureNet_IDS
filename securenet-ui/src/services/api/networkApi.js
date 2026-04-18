import { getNetworkStats, getNetworkConnections, getNetworkTraffic } from "../networkService";

export const getNetworkStatistics = async () => {
  return getNetworkStats();
};

export const getNetworkConnectionsList = async () => {
  return getNetworkConnections();
};

export const getNetworkTrafficData = async () => {
  return getNetworkTraffic();
};
