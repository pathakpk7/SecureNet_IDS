import { fetchLogs, createLog, fetchLogsByUser, fetchLogsByDateRange } from "../logService";

export const getLogs = async () => {
  return await fetchLogs();
};

export const addLog = async (log) => {
  return await createLog(log);
};

export const getLogsByUser = async (userId) => {
  return await fetchLogsByUser(userId);
};

export const getLogsByDateRange = async (startDate, endDate) => {
  return await fetchLogsByDateRange(startDate, endDate);
};
