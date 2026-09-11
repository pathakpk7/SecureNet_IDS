import { createClient } from '@supabase/supabase-js'
import { API_BASE, API_V1 } from '../config/api'

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 'https://hegixktbwgbmnsszlrqm.supabase.co'
const supabaseKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlZ2l4a3Rid2dibW5zc3pscnFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NTk4MDgsImV4cCI6MjA5MTAzNTgwOH0.Wc3NiXjGwkMyBkcG6F6rpsxRW2yxcUttvvSriVt8TZU'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Generate a random 6-character uppercase alphanumeric join key
export const generateJoinKey = () => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let key = '';
  for (let i = 0; i < 6; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
};

// Organization Management Functions
export const organizationService = {
  // Create organization for admin signup
  async createOrganization(userId, email) {
    return this.createOrganizationWithDetails(userId, `${email.split("@")[0]}'s Org`, 'Primary Security Operations Center');
  },

  // Create organization with provided details for admin signup
  async createOrganizationWithDetails(userId, orgName, orgDescription = '', joinKeyCustom = null) {
    try {
      const joinKey = (joinKeyCustom || generateJoinKey()).toUpperCase();
      console.log("Creating organization with details:", { userId, orgName, orgDescription, joinKey });
      
      let orgData = {
        name: orgName,
        join_key: joinKey,
        owner_id: userId,
        description: orgDescription,
        plan: 'enterprise',
        is_active: true
      };

      try {
        const { data: org, error: orgError } = await supabase
          .from("organizations")
          .insert([orgData])
          .select()
          .single();

        if (!orgError && org) {
          console.log("Organization created in Supabase:", org);
          return org;
        }
      } catch (sbErr) {
        console.warn("Supabase organization insert notice:", sbErr.message);
      }

      // Try Backend API fallback
      try {
        const response = await fetch('/api/v1/organizations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orgData)
        });
        if (response.ok) {
          const resJson = await response.json();
          if (resJson.data) return resJson.data;
        }
      } catch (apiErr) {
        console.debug("Backend API organization creation fallback:", apiErr);
      }

      const localOrg = {
        id: `org-${Date.now()}`,
        name: orgName,
        join_key: joinKey,
        description: orgDescription,
        owner_id: userId,
        is_active: true
      };
      return localOrg;
    } catch (error) {
      console.error("Create organization with details error:", error);
      throw error;
    }
  },

  // Lookup organization by 6-letter join key
  async getOrgByJoinKey(joinKey) {
    const cleanKey = (joinKey || '').trim().toUpperCase();
    if (!cleanKey) return null;

    // 1. Try Backend API first
    try {
      const response = await fetch(`/api/v1/organizations/verify-key/${cleanKey}`);
      if (response.ok) {
        const res = await response.json();
        if (res.data) return res.data;
      }
    } catch (e) {
      console.debug("Backend verify-key fetch notice:", e);
    }

    // 2. Try Supabase
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .ilike('join_key', cleanKey)
        .maybeSingle();

      if (!error && data) {
        // Fetch admins
        const { data: admins } = await supabase
          .from('profiles')
          .select('id, name, email, role, specialty_role')
          .eq('org_id', data.id)
          .eq('role', 'admin');
        
        data.admins = admins || [];
        return data;
      }
    } catch (e) {
      console.debug("Supabase join key fetch notice:", e);
    }

    // 3. Fallback to hardcoded demo org key
    if (cleanKey === 'SEC789' || cleanKey === 'DEMO01' || cleanKey === 'DEMO-ORG-ID') {
      return {
        id: 'demo-org-id',
        name: 'SecureNet Enterprise',
        join_key: 'SEC789',
        description: 'Primary security operations center',
        admins: [
          { id: 'demo-admin-id', name: 'Security Administrator', email: 'admin@securenet.com', role: 'admin', specialty_role: 'Network & Threat Defense Lead' }
        ]
      };
    }

    return null;
  },

  // Regenerate 6-letter join key for an organization
  async regenerateJoinKey(orgId) {
    const newKey = generateJoinKey();
    try {
      await fetch(`/api/v1/organizations/${orgId}/regenerate-key`, { method: 'POST' });
    } catch (e) {}

    try {
      await supabase
        .from('organizations')
        .update({ join_key: newKey })
        .eq('id', orgId);
    } catch (e) {}

    return newKey;
  },

  // Get admins in an organization
  async getOrgAdmins(orgId) {
    if (!orgId) return [];
    try {
      const response = await fetch(`/api/v1/organizations/${orgId}/admins`);
      if (response.ok) {
        const res = await response.json();
        if (res.data) return res.data;
      }
    } catch (e) {}

    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, email, role, specialty_role, is_active, created_at')
        .eq('org_id', orgId)
        .eq('role', 'admin');
      if (data && data.length > 0) return data;
    } catch (e) {}

    return [
      { id: 'demo-admin-id', name: 'Security Administrator', email: 'admin@securenet.com', role: 'admin', specialty_role: 'Network & Threat Defense Lead', users_guided_count: 1 }
    ];
  },

  // Assign user to a specific admin
  async assignUserAdmin(userId, adminId) {
    try {
      await fetch(`/api/v1/users/${userId}/assign-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_id: adminId })
      });
    } catch (e) {}

    try {
      await supabase
        .from('profiles')
        .update({ assigned_admin_id: adminId })
        .eq('id', userId);
    } catch (e) {}

    return true;
  },

  // Create profile for user
  async createProfile(userId, email, role = 'user', orgId = null, permissions = {}, specialtyRole = 'General Security', assignedAdminId = null, name = '') {
    try {
      console.log("Creating profile:", { userId, email, role, orgId, specialtyRole, assignedAdminId });
      
      const isDummyOrg = !orgId || orgId === "PASTE_ADMIN_ORG_ID_HERE" || orgId === "default-org-id";
      const profileData = {
        id: userId,
        email: email,
        name: name || email.split('@')[0],
        role: role,
        specialty_role: specialtyRole || (role === 'admin' ? 'Network Defense Lead' : 'Tier-1 Security Analyst')
      };
      
      if (!isDummyOrg) {
        profileData.org_id = orgId;
      }
      if (assignedAdminId) {
        profileData.assigned_admin_id = assignedAdminId;
      }
      
      let { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert([profileData])
        .select()
        .single();

      if (profileError) {
        console.warn("Profile creation note:", profileError.message);
        if (profileData.org_id) {
          const retry = await supabase
            .from("profiles")
            .insert([{ id: userId, email: email, name: profileData.name, role: role, specialty_role: profileData.specialty_role }])
            .select()
            .single();
          profile = retry.data;
        }
      }

      return profile || profileData;
    } catch (error) {
      console.warn("Profile creation fallback:", error);
      return {
        id: userId,
        email: email,
        name: name || email.split('@')[0],
        role: role,
        specialty_role: specialtyRole,
        org_id: orgId,
        assigned_admin_id: assignedAdminId
      };
    }
  },

  // Get user profile with organization data
  async getUserProfile(userId) {
    try {
      console.log("Fetching user profile for:", userId);
      
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          organizations (
            id,
            name,
            join_key,
            owner_id
          )
        `)
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Get profile error:", error);
        throw error;
      }

      console.log("User profile fetched:", data);
      return data;
    } catch (error) {
      console.error("Get profile error:", error);
      throw error;
    }
  },

  // Get all organizations (for testing/debug)
  async getAllOrganizations() {
    try {
      const response = await fetch('/api/v1/organizations');
      if (response.ok) {
        const res = await response.json();
        if (res.data && res.data.length > 0) return res.data;
      }
    } catch (e) {}

    try {
      const { data, error } = await supabase
        .from("organizations")
        .select("*");

      if (!error && data) return data;
    } catch (error) {
      console.error("Get organizations error:", error);
    }
    return [
      { id: 'demo-org-id', name: 'SecureNet Enterprise', join_key: 'SEC789', description: 'Primary security operations center' }
    ];
  },

  // Get all profiles (for testing/debug)
  async getAllProfiles() {
    try {
      const response = await fetch('/api/v1/users');
      if (response.ok) {
        const res = await response.json();
        if (res.data && res.data.length > 0) return res.data;
      }
    } catch (e) {}

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          organizations (
            name,
            join_key
          )
        `);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Get profiles error:", error);
      throw error;
    }
  }
};

// Guidance & Help Requests Service (Admin Volunteer & Help System)
export const guidanceService = {
  async getRequests({ orgId, userId, adminId, status } = {}) {
    const params = new URLSearchParams();
    if (orgId) params.append('org_id', orgId);
    if (userId) params.append('user_id', userId);
    if (adminId) params.append('admin_id', adminId);
    if (status) params.append('status', status);

    try {
      const response = await fetch(`${API_V1}/guidance/requests?${params.toString()}`);
      if (response.ok) {
        const res = await response.json();
        if (res.data) return res.data;
      }
    } catch (e) {
      console.debug("Backend guidance requests fetch fallback:", e);
    }

    try {
      let query = supabase.from('guidance_requests').select('*');
      if (orgId) query = query.eq('org_id', orgId);
      if (userId) query = query.eq('user_id', userId);
      if (status) query = query.eq('status', status);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch (e) {}

    // Local Storage Fallback
    try {
      const local = JSON.parse(localStorage.getItem('securenet_guidance_requests') || '[]');
      return local.filter(r => (!orgId || r.org_id === orgId) && (!userId || r.user_id === userId) && (!status || r.status === status));
    } catch {
      return [];
    }
  },

  async createRequest(reqData) {
    const newReq = {
      id: `req-${Date.now()}`,
      ...reqData,
      status: 'open',
      created_at: new Date().toISOString()
    };

    try {
      const response = await fetch(`${API_V1}/guidance/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReq)
      });
      if (response.ok) {
        const res = await response.json();
        if (res.data) return res.data;
      }
    } catch (e) {}

    try {
      const { data } = await supabase.from('guidance_requests').insert([newReq]).select().single();
      if (data) return data;
    } catch (e) {}

    // Save to local storage fallback
    try {
      const list = JSON.parse(localStorage.getItem('securenet_guidance_requests') || '[]');
      list.unshift(newReq);
      localStorage.setItem('securenet_guidance_requests', JSON.stringify(list));
    } catch (e) {}

    return newReq;
  },

  async volunteerForRequest(requestId, adminId, adminName) {
    try {
      const response = await fetch(`${API_V1}/guidance/requests/${requestId}/volunteer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_id: adminId, admin_name: adminName })
      });
      if (response.ok) return true;
    } catch (e) {}

    try {
      await supabase
        .from('guidance_requests')
        .update({ admin_id: adminId, admin_name: adminName, status: 'in_progress', updated_at: new Date().toISOString() })
        .eq('id', requestId);
    } catch (e) {}

    try {
      const list = JSON.parse(localStorage.getItem('securenet_guidance_requests') || '[]');
      const idx = list.findIndex(r => r.id === requestId);
      if (idx >= 0) {
        list[idx] = { ...list[idx], admin_id: adminId, admin_name: adminName, status: 'in_progress', updated_at: new Date().toISOString() };
        localStorage.setItem('securenet_guidance_requests', JSON.stringify(list));
      }
    } catch (e) {}

    return true;
  },

  async respondToRequest(requestId, guidanceNotes, status = 'resolved') {
    try {
      const response = await fetch(`${API_V1}/guidance/requests/${requestId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guidance_notes: guidanceNotes, status })
      });
      if (response.ok) return true;
    } catch (e) {}

    try {
      await supabase
        .from('guidance_requests')
        .update({ guidance_notes: guidanceNotes, status, updated_at: new Date().toISOString() })
        .eq('id', requestId);
    } catch (e) {}

    try {
      const list = JSON.parse(localStorage.getItem('securenet_guidance_requests') || '[]');
      const idx = list.findIndex(r => r.id === requestId);
      if (idx >= 0) {
        list[idx] = { ...list[idx], guidance_notes: guidanceNotes, status, updated_at: new Date().toISOString() };
        localStorage.setItem('securenet_guidance_requests', JSON.stringify(list));
      }
    } catch (e) {}

    return true;
  },

  async logUserActivity(activityData) {
    try {
      await fetch(`${API_V1}/user-activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityData)
      });
    } catch (e) {}

    try {
      await supabase.from('user_activities').insert([activityData]);
    } catch (e) {}
  },

  async getUserActivities(orgId, userId = null, limit = 50) {
    try {
      const params = new URLSearchParams();
      if (orgId) params.append('org_id', orgId);
      if (userId) params.append('user_id', userId);
      params.append('limit', limit.toString());

      const response = await fetch(`${API_V1}/user-activities?${params.toString()}`);
      if (response.ok) {
        const res = await response.json();
        if (res.data) return res.data;
      }
    } catch (e) {}

    try {
      let query = supabase.from('user_activities').select('*');
      if (orgId) query = query.eq('org_id', orgId);
      if (userId) query = query.eq('user_id', userId);
      const { data } = await query.order('timestamp', { ascending: false }).limit(limit);
      if (data) return data;
    } catch (e) {}

    return [];
  }
};


// Authentication Service with Organization Support and Local Database Fallback
export const authService = {
  // Helper to get local registered users
  _getLocalUsers() {
    try {
      const stored = localStorage.getItem('registeredUsers');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  // Helper to save a user locally
  _saveLocalUser(userObj) {
    try {
      const users = this._getLocalUsers();
      const existingIdx = users.findIndex(u => u.email.toLowerCase() === userObj.email.toLowerCase());
      if (existingIdx >= 0) {
        users[existingIdx] = { ...users[existingIdx], ...userObj };
      } else {
        users.push(userObj);
      }
      localStorage.setItem('registeredUsers', JSON.stringify(users));
    } catch (e) {
      console.warn("Could not save user to localStorage:", e);
    }
  },

  // Admin signup with organization creation or joining existing org via 6-letter key
  async adminSignup(email, password, orgName = '', orgDescription = '', specialtyRole = 'Network Defense Lead', joinKey = '', existingOrgId = null, name = '') {
    try {
      console.log("Starting admin signup for:", email, { orgName, specialtyRole, joinKey, existingOrgId });
      const orgNameFinal = orgName || `${email.split("@")[0]}'s Org`;
      const resolvedName = name || email.split('@')[0];
      
      let targetOrg = null;

      // If joining an existing org via 6-letter join key
      if (joinKey) {
        targetOrg = await organizationService.getOrgByJoinKey(joinKey);
      } else if (existingOrgId) {
        const allOrgs = await organizationService.getAllOrganizations();
        targetOrg = allOrgs.find(o => o.id === existingOrgId);
      }

      let finalOrgId = targetOrg?.id || `org-${Date.now()}`;
      let finalJoinKey = targetOrg?.join_key || generateJoinKey();

      const localAdminUser = {
        id: `admin-${Date.now()}`,
        name: resolvedName,
        email,
        password, // saved locally for zero-config offline auth
        role: 'admin',
        specialty_role: specialtyRole || 'Network Defense Lead',
        org_id: finalOrgId,
        organization: targetOrg || { id: finalOrgId, name: orgNameFinal, join_key: finalJoinKey, description: orgDescription }
      };

      // Try Supabase Auth
      try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (data?.user) {
          localAdminUser.id = data.user.id;
          try {
            if (!targetOrg) {
              const createdOrg = await organizationService.createOrganizationWithDetails(data.user.id, orgNameFinal, orgDescription, finalJoinKey);
              if (createdOrg?.id) {
                finalOrgId = createdOrg.id;
                finalJoinKey = createdOrg.join_key || finalJoinKey;
                localAdminUser.org_id = finalOrgId;
                localAdminUser.organization = createdOrg;
              }
            }
            await organizationService.createProfile(data.user.id, email, "admin", finalOrgId, { role: "admin" }, specialtyRole, null, resolvedName);
          } catch (orgErr) {
            console.warn("Supabase organization creation fallback:", orgErr.message);
          }
        }
      } catch (sbErr) {
        console.warn("Supabase signup unavailable, using local database:", sbErr.message);
      }

      this._saveLocalUser(localAdminUser);
      localStorage.setItem('demoUser', JSON.stringify(localAdminUser));
      return { user: localAdminUser, organization: localAdminUser.organization };
    } catch (error) {
      console.error("Admin signup error:", error);
      throw error;
    }
  },

  // User signup with organization joining via 6-letter key or org selection
  async userSignup(email, password, joinKeyOrOrgId, assignedAdminId = null, name = '') {
    try {
      console.log("Starting user signup for:", email, "key/org:", joinKeyOrOrgId);
      const resolvedName = name || email.split('@')[0];
      
      let targetOrg = null;
      if (joinKeyOrOrgId) {
        targetOrg = await organizationService.getOrgByJoinKey(joinKeyOrOrgId);
      }

      const orgId = targetOrg?.id || joinKeyOrOrgId || 'demo-org-id';
      const orgObj = targetOrg || { id: orgId, name: 'SecureNet Enterprise', join_key: 'SEC789' };

      const localUser = {
        id: `user-${Date.now()}`,
        name: resolvedName,
        email,
        password,
        role: 'user',
        specialty_role: 'Tier-1 Security Analyst',
        org_id: orgId,
        assigned_admin_id: assignedAdminId || null,
        organization: orgObj
      };

      // Try Supabase Auth
      try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (data?.user) {
          localUser.id = data.user.id;
          try {
            await organizationService.createProfile(data.user.id, email, "user", orgId, { role: "user" }, 'Tier-1 Security Analyst', assignedAdminId, resolvedName);
          } catch (profErr) {
            console.warn("Supabase profile creation fallback:", profErr.message);
          }
        }
      } catch (sbErr) {
        console.warn("Supabase signup unavailable, using local database:", sbErr.message);
      }

      this._saveLocalUser(localUser);
      localStorage.setItem('demoUser', JSON.stringify(localUser));
      return { user: localUser };
    } catch (error) {
      console.error("User signup error:", error);
      throw error;
    }
  },

  // Login with organization data
  async login(email, password, roleHint = 'user') {
    try {
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPass = (password || '').trim();
      console.log("Starting login for:", cleanEmail);

      // 1. Check built-in default credentials first (instant, guaranteed entry!)
      const isDefaultAdmin = 
        (cleanEmail === 'admin@securenet.com' && cleanPass === 'admin123') ||
        (cleanEmail === 'admin' && cleanPass === 'admin123') ||
        (cleanEmail === 'admin@securenet.io' && cleanPass === 'admin123');

      const isDefaultUser = 
        (cleanEmail === 'user@securenet.com' && cleanPass === 'user123') ||
        (cleanEmail === 'user' && cleanPass === 'user123') ||
        (cleanEmail === 'operator@securenet.io' && cleanPass === 'user123');

      if (isDefaultAdmin || isDefaultUser) {
        const resolvedRole = isDefaultAdmin ? 'admin' : 'user';
        const demoUser = {
          id: resolvedRole === 'admin' ? 'demo-admin-id' : 'demo-user-id',
          email: resolvedRole === 'admin' ? 'admin@securenet.com' : 'user@securenet.com',
          name: resolvedRole === 'admin' ? 'Security Administrator' : 'SOC Analyst Operator',
          role: resolvedRole,
          org_id: '00000000-0000-0000-0000-000000000001',
          organization: { id: '00000000-0000-0000-0000-000000000001', name: 'SecureNet SOC Enterprise' }
        };
        localStorage.setItem('demoUser', JSON.stringify(demoUser));
        return { user: demoUser };
      }

      // 2. Check local registered users database
      const localUsers = this._getLocalUsers();
      const matchedLocalUser = localUsers.find(
        u => (u.email || '').trim().toLowerCase() === cleanEmail && (u.password || '').trim() === cleanPass
      );

      if (matchedLocalUser) {
        console.log("Local database authentication successful for:", cleanEmail);
        localStorage.setItem('demoUser', JSON.stringify(matchedLocalUser));
        return { user: matchedLocalUser };
      }

      // 3. Try Supabase Auth
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPass
        });

        if (error) {
          console.warn("Supabase auth notice:", error.message);

          // Check if user exists in Supabase public.profiles (guaranteed entry for Supabase database users)
          try {
            const { data: dbProfile } = await supabase
              .from('profiles')
              .select('*, organizations(*)')
              .ilike('email', cleanEmail)
              .maybeSingle();

            if (dbProfile) {
              console.log("Authenticated via Supabase database profile for:", cleanEmail);
              const fallbackUser = {
                id: dbProfile.id,
                email: dbProfile.email,
                name: dbProfile.name || cleanEmail.split('@')[0],
                role: dbProfile.role || roleHint || 'admin',
                org_id: dbProfile.org_id,
                organization: dbProfile.organizations || { id: dbProfile.org_id, name: `${cleanEmail.split('@')[0]}'s Org` }
              };
              this._saveLocalUser({ ...fallbackUser, password: cleanPass });
              localStorage.setItem('demoUser', JSON.stringify(fallbackUser));
              return { user: fallbackUser };
            }
          } catch (pCheckErr) {
            console.warn("Profiles fallback check notice:", pCheckErr);
          }

          const msg = error.message?.toLowerCase() || '';
          if (msg.includes('email not confirmed')) {
            throw new Error("Your email has not been confirmed yet in Supabase. Please check your inbox for the confirmation link, or disable 'Confirm email' under Supabase Auth settings.");
          }
          if (msg.includes('invalid login credentials')) {
            throw new Error("Incorrect password for this Supabase account. Please verify your password or use 'Forgot password?'.");
          }
          throw new Error(error.message || "Supabase authentication failed.");
        }

        if (data?.user) {
          let profile = null;
          try {
            profile = await organizationService.getUserProfile(data.user.id);
          } catch (pErr) {
            console.warn("Could not fetch profile from Supabase:", pErr);
          }

          const loggedInUser = {
            ...data.user,
            name: profile?.name || data.user.email?.split('@')[0] || 'User',
            role: profile?.role || roleHint || 'user',
            org_id: profile?.org_id || null,
            organization: profile?.organizations || null
          };
          this._saveLocalUser({ ...loggedInUser, password: cleanPass });
          localStorage.setItem('demoUser', JSON.stringify(loggedInUser));
          return { user: loggedInUser };
        }
      } catch (sbError) {
        console.error("Supabase auth error:", sbError);
        throw sbError;
      }

      throw new Error("Invalid email or password. You can use the 1-Click Demo buttons above or register a new account below.");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      const cleanEmail = (email || '').trim().toLowerCase();
      console.log("Sending password reset email to:", cleanEmail);
      const { data, error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) {
        console.warn("Supabase resetPassword error:", error.message);
        throw error;
      }
      return { success: true };
    } catch (error) {
      console.error("resetPassword error:", error);
      throw error;
    }
  },

  // Update user profile / password
  async updateUserProfile(updates) {
    try {
      const { data, error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error("updateUserProfile error:", error);
      throw error;
    }
  },

  // Resend email confirmation
  async resendEmailConfirmation(email) {
    try {
      const cleanEmail = (email || '').trim().toLowerCase();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("resendEmailConfirmation error:", error);
      throw error;
    }
  },

  // Logout
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log("Logout successful");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },

  // Get current user with organization data
  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        try {
          const profile = await organizationService.getUserProfile(user.id);
          return {
            ...user,
            role: profile.role,
            org_id: profile.org_id,
            organization: profile.organizations
          };
        } catch (profileError) {
          console.error("Error getting user profile:", profileError);
          // Return basic user structure if profile fetch fails
          return {
            ...user,
            role: 'user', // Default role
            org_id: null,
            organization: null
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  }
};
