import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hegixktbwgbmnsszlrqm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlZ2l4a3Rid2dibW5zc3pscnFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NTk4MDgsImV4cCI6MjA5MTAzNTgwOH0.Wc3NiXjGwkMyBkcG6F6rpsxRW2yxcUttvvSriVt8TZU'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Organization Management Functions
export const organizationService = {
  // Create organization for admin signup
  async createOrganization(userId, email) {
    try {
      console.log("Creating organization for user:", userId, email);
      
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert([
          {
            name: `${email.split("@")[0]}'s Org`,
            owner_id: userId
          }
        ])
        .select()
        .single();

      if (orgError) {
        console.error("Organization creation error:", orgError);
        throw orgError;
      }

      console.log("Organization created:", org);
      return org;
    } catch (error) {
      console.error("Create organization error:", error);
      throw error;
    }
  },

  // Create organization with provided details for admin signup
  async createOrganizationWithDetails(userId, orgName, orgDescription) {
    try {
      console.log("Creating organization with details:", { userId, orgName, orgDescription });
      
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert([
          {
            name: orgName,
            owner_id: userId
          }
        ])
        .select()
        .single();

      if (orgError) {
        console.error("Organization creation error:", orgError);
        throw orgError;
      }

      console.log("Organization created with details:", org);
      return org;
    } catch (error) {
      console.error("Create organization with details error:", error);
      throw error;
    }
  },

  // Create profile for user
  async createProfile(userId, email, role, orgId, permissions = {}) {
    try {
      console.log("Creating profile:", { userId, email, role, orgId });
      
      const isDummyOrg = !orgId || orgId === "PASTE_ADMIN_ORG_ID_HERE" || orgId === "default-org-id";
      const profileData = {
        id: userId,
        email: email,
        role: role
      };
      
      if (!isDummyOrg) {
        profileData.org_id = orgId;
      }
      
      let { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert([profileData])
        .select()
        .single();

      if (profileError) {
        console.warn("Profile creation note:", profileError.message);
        // If org_id foreign key failed, retry without org_id
        if (profileData.org_id) {
          const retry = await supabase
            .from("profiles")
            .insert([{ id: userId, email: email, role: role }])
            .select()
            .single();
          profile = retry.data;
          profileError = retry.error;
        }
      }

      if (profileError) {
        console.warn("Falling back to local profile session:", profileError.message);
        return {
          id: userId,
          email: email,
          role: role,
          org_id: orgId
        };
      }

      console.log("Profile created successfully:", profile);
      return profile;
    } catch (error) {
      console.warn("Profile creation fallback:", error);
      return {
        id: userId,
        email: email,
        role: role,
        org_id: orgId
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
      const { data, error } = await supabase
        .from("organizations")
        .select("*");

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Get organizations error:", error);
      throw error;
    }
  },

  // Get all profiles (for testing/debug)
  async getAllProfiles() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          organizations (
            name
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

  // Admin signup with organization creation
  async adminSignup(email, password, orgName = '', orgDescription = '') {
    try {
      console.log("Starting admin signup for:", email);
      const orgNameFinal = orgName || `${email.split("@")[0]}'s Org`;
      
      const localAdminUser = {
        id: `admin-${Date.now()}`,
        email,
        password, // saved locally for zero-config offline auth
        role: 'admin',
        org_id: `org-${Date.now()}`,
        organization: { id: `org-${Date.now()}`, name: orgNameFinal, description: orgDescription }
      };

      // Try Supabase Auth
      try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (data?.user) {
          localAdminUser.id = data.user.id;
          try {
            const org = await organizationService.createOrganizationWithDetails(data.user.id, orgNameFinal, orgDescription);
            if (org?.id) localAdminUser.org_id = org.id;
            await organizationService.createProfile(data.user.id, email, "admin", org?.id || null);
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

  // User signup with organization joining
  async userSignup(email, password, orgId) {
    try {
      console.log("Starting user signup for:", email, "org:", orgId);
      
      const localUser = {
        id: `user-${Date.now()}`,
        email,
        password,
        role: 'user',
        org_id: orgId || 'demo-org-id',
        organization: { id: orgId || 'demo-org-id', name: 'Default Organization' }
      };

      // Try Supabase Auth
      try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (data?.user) {
          localUser.id = data.user.id;
          try {
            await organizationService.createProfile(data.user.id, email, "user", orgId);
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
  async login(email, password) {
    try {
      console.log("Starting login for:", email);
      
      // 1. Check local registered users database
      const localUsers = this._getLocalUsers();
      const matchedLocalUser = localUsers.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (matchedLocalUser) {
        console.log("Local database authentication successful for:", email);
        localStorage.setItem('demoUser', JSON.stringify(matchedLocalUser));
        return { user: matchedLocalUser };
      }

      // 2. Check built-in demo credentials
      if ((email === 'admin@securenet.com' && password === 'admin123') ||
          (email === 'user@securenet.com' && password === 'user123')) {
        const role = email === 'admin@securenet.com' ? 'admin' : 'user';
        const demoUser = {
          id: role === 'admin' ? 'demo-admin-id' : 'demo-user-id',
          email,
          role,
          org_id: 'demo-org-id',
          organization: { id: 'demo-org-id', name: 'Demo Organization' }
        };
        localStorage.setItem('demoUser', JSON.stringify(demoUser));
        return { user: demoUser };
      }
      
      // 3. Try Supabase Auth
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (data?.user) {
          let profile = null;
          try {
            profile = await organizationService.getUserProfile(data.user.id);
          } catch (pErr) {
            console.warn("Could not fetch profile from Supabase:", pErr);
          }

          const loggedInUser = {
            ...data.user,
            role: profile?.role || 'user',
            org_id: profile?.org_id || null,
            organization: profile?.organizations || null
          };
          this._saveLocalUser({ ...loggedInUser, password });
          return { user: loggedInUser };
        }
      } catch (sbError) {
        console.warn("Supabase auth check notice:", sbError.message);
      }

      throw new Error("Invalid login credentials. If you haven't created an account yet, please click 'Sign up' below.");
    } catch (error) {
      console.error("Login error:", error);
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
