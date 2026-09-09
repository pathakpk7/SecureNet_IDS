import { supabase } from './supabase';

// Generate or retrieve unique device ID to distinguish between laptop, mobile, tabs
export const getDeviceId = () => {
  try {
    let id = localStorage.getItem('securenet_device_id');
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      localStorage.setItem('securenet_device_id', id);
    }
    return id;
  } catch {
    return 'dev_' + Math.random().toString(36).substring(2, 9);
  }
};

/**
 * Fetch the latest synchronized read/deleted notification IDs from Supabase
 * @param {string} syncKey e.g. 'admin_notifications_sync' or 'user_notifications_sync'
 */
export const fetchRemoteNotificationState = async (syncKey) => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('details')
      .eq('resource_type', 'notifications_sync')
      .eq('resource_id', syncKey)
      .order('performed_at', { ascending: false })
      .limit(1);

    if (!error && data && data.length > 0 && data[0]?.details) {
      const details = data[0].details;
      return {
        readIds: Array.isArray(details.read_ids) ? details.read_ids : [],
        deletedIds: Array.isArray(details.deleted_ids) ? details.deleted_ids : []
      };
    }
  } catch (err) {
    console.warn('[NotificationSync] Failed to fetch remote state:', err);
  }
  return { readIds: [], deletedIds: [] };
};

/**
 * Persist the latest synchronized read/deleted notification IDs into Supabase
 * @param {string} syncKey
 * @param {Array<string>} readIds
 * @param {Array<string>} deletedIds
 */
export const pushRemoteNotificationState = async (syncKey, readIds, deletedIds) => {
  try {
    await supabase.from('audit_logs').insert([
      {
        action: 'SYNC_STATE',
        resource_type: 'notifications_sync',
        resource_id: syncKey,
        details: {
          read_ids: Array.from(readIds || []),
          deleted_ids: Array.from(deletedIds || []),
          updated_at: new Date().toISOString(),
          updated_by_device: getDeviceId()
        }
      }
    ]);
  } catch (err) {
    console.warn('[NotificationSync] Failed to push remote state:', err);
  }
};
