import { fetchAlerts, createAlert, updateAlert, deleteAlert } from "../alertService";

export const getAlerts = async () => {
  return await fetchAlerts();
};

export const addAlert = async (alert) => {
  return await createAlert(alert);
};

export const modifyAlert = async (id, updates) => {
  return await updateAlert(id, updates);
};

export const removeAlert = async (id) => {
  return await deleteAlert(id);
};
