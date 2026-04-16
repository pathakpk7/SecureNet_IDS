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
      console.log("Creating profile:", { userId, email, role, orgId, permissions });
      
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: userId,
            email: email,
            role: role,
            org_id: orgId,
            permissions: permissions
          }
        ])
        .select()
        .single();

      if (profileError) {
        console.error("Create profile error:", profileError);
        throw profileError;
      }

      console.log("Profile created:", profile);
      return profile;
    } catch (error) {
      console.error("Create profile error:", error);
      throw error;
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

// Authentication Service with Organization Support
export const authService = {
  // Admin signup with organization creation
  async adminSignup(email, password) {
    try {
      console.log("Starting admin signup for:", email);
      
      // STEP 1: Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        console.error("Auth signup error:", error);
        throw error;
      }

      console.log("User created in auth:", data);

      if (data.user) {
        // STEP 2: Create organization with default details
        const org = await organizationService.createOrganizationWithDetails(data.user.id, `${email.split("@")[0]}'s Org`, '');
        
        // STEP 3: Create admin profile with default permissions
        await organizationService.createProfile(data.user.id, email, "admin", org.id, {
          canManageUsers: true,
          canManageOrgSettings: true,
          canInviteUsers: true,
          canViewLogs: true,
          canBlockIP: true,
          canRunSimulation: true,
          canViewAnalytics: true,
          canGenerateReports: true,
          canExportData: true,
          canViewUsers: true,
          canResetPasswords: true,
          canDeactivateUsers: true
        });
        
        console.log("Admin signup completed successfully");
        return { user: data.user, organization: org };
      }

      throw new Error("User creation failed");
    } catch (error) {
      console.error("Admin signup error:", error);
      throw error;
    }
  },

  // User signup with organization joining
  async userSignup(email, password, orgId) {
    try {
      console.log("Starting user signup for:", email, "org:", orgId);
      
      // STEP 1: Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        console.error("Auth signup error:", error);
        throw error;
      }

      console.log("User created in auth:", data);

      if (data.user) {
        // STEP 2: Create profile with default user permissions
        await organizationService.createProfile(data.user.id, email, "user", orgId, {
          canViewLogs: true,
          canBlockIP: false,
          canManageUsers: false,
          canRunSimulation: false,
          canViewAnalytics: true,
          canGenerateReports: true,
          canExportData: true,
          canViewUsers: true,
          canResetPasswords: true,
          canDeactivateUsers: true
        });
        
        console.log("User signup completed successfully");
        return { user: data.user };
      }

      throw new Error("User creation failed");
    } catch (error) {
      console.error("User signup error:", error);
      throw error;
    }
  },

  // Login with organization data
  async login(email, password) {
    try {
      console.log("Starting login for:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Login error:", error);
        throw error;
      }

      console.log("Login successful:", data);

      if (data.user) {
        try {
          // Fetch user profile with organization data
          const profile = await organizationService.getUserProfile(data.user.id);
          
          console.log("User profile loaded:", profile);
          
          return {
            user: {
              ...data.user,
              role: profile.role,
              org_id: profile.org_id,
              organization: profile.organizations
            }
          };
        } catch (profileError) {
          console.error("Error getting user profile during login:", profileError);
          // Return basic user structure if profile fetch fails
          return {
            user: {
              ...data.user,
              role: 'user', // Default role
              org_id: null,
              organization: null
            }
          };
        }
      }

      throw new Error("Login failed");
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
