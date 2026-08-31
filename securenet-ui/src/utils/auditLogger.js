/**
 * Audit Logger Utility Functions
 * Comprehensive logging system for tracking all critical user actions
 */

import { supabase } from '../api/supabase';

/**
 * Log a user action with metadata
 * @param {Object} user - User object with id and org_id
 * @param {string} action - Action being performed
 * @param {string} target - Target of the action (optional)
 * @param {Object} metadata - Additional metadata for the log entry
 */
export const logAction = async ({
  user,
  action,
  target,
  metadata = {}
}) => {
  try {
    await supabase.from("audit_logs").insert([
      {
        user_id: user.id,
        org_id: user.org_id,
        action,
        target,
        metadata
      }
    ]);
    
    console.log(`Audit log: ${action} by user ${user.email}`, { target, metadata });
  } catch (err) {
    console.error("Audit log failed:", err);
  }
};

/**
 * Log critical security events
 * @param {Object} user - User object
 * @param {string} event - Security event type
 * @param {Object} details - Event details
 */
export const logSecurityEvent = async (user, event, details) => {
  try {
    await supabase.from("audit_logs").insert([
      {
        user_id: user.id,
        org_id: user.org_id,
        action: event,
        target: details.ipAddress || 'system',
        metadata: {
          severity: details.severity || 'medium',
          category: 'security',
          userAgent: details.userAgent || 'unknown'
        }
      }
    ]);
    
    console.log(`Security event logged: ${event} for user ${user.email}`);
  } catch (err) {
    console.error("Security event log failed:", err);
  }
};

/**
 * Log user management actions
 * @param {Object} user - User object
 * @param {string} action - Management action
 * @param {Object} target - Target user
 */
export const logUserManagement = async (user, action, target) => {
  try {
    await supabase.from("audit_logs").insert([
      {
        user_id: user.id,
        org_id: user.org_id,
        action,
        target,
        metadata: {
          category: 'user_management',
          performed_by: user.email
        }
      }
    ]);
    
    console.log(`User management: ${action} on ${target} by user ${user.email}`);
  } catch (err) {
    console.error("User management log failed:", err);
  }
};

/**
 * Get audit logs for organization
 * @param {string} orgId - Organization ID
 * @param {Object} filters - Optional filters for logs
 */
export const getOrganizationAuditLogs = async (orgId, filters = {}) => {
  try {
    let query = supabase
      .from("audit_logs")
      .select("*")
      .eq("org_id", orgId);
    
    if (filters.action) {
      query = query.eq("action", filters.action);
    }
    
    if (filters.user) {
      query = query.eq("user_id", filters.user);
    }
    
    if (filters.dateFrom) {
      query = query.gte("created_at", filters.dateFrom);
    }
    
    if (filters.dateTo) {
      query = query.lte("created_at", filters.dateTo);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Get audit logs error:", error);
      throw error;
    }
    
    return data || [];
  } catch (err) {
    console.error("Get audit logs error:", err);
    throw err;
  }
};

/**
 * Get all audit logs for admin
 * @param {Object} filters - Optional filters
 */
export const getAllAuditLogs = async (filters = {}) => {
  try {
    let query = supabase
      .from("audit_logs")
      .select("*");
    
    if (filters.action) {
      query = query.eq("action", filters.action);
    }
    
    if (filters.user) {
      query = query.eq("user_id", filters.user);
    }
    
    if (filters.dateFrom) {
      query = query.gte("created_at", filters.dateFrom);
    }
    
    if (filters.dateTo) {
      query = query.lte("created_at", filters.dateTo);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Get all audit logs error:", error);
      throw error;
    }
    
    return data || [];
  } catch (err) {
    console.error("Get all audit logs error:", err);
    throw err;
  }
};
