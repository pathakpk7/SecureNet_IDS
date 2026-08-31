import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, authService, organizationService } from '../api/supabase';
import { getUserPermissions } from '../utils/permissions';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user session
    const initializeAuth = async () => {
      try {
        // Check for demo user first
        const demoUserStr = localStorage.getItem('demoUser');
        if (demoUserStr) {
          const demoUser = JSON.parse(demoUserStr);
          setUser(demoUser);
          setLoading(false);
          return;
        }
        
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error getting current user:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          // Check if this is a demo user - if so, don't try to fetch profile from database
          const demoUserStr = localStorage.getItem('demoUser');
          if (demoUserStr) {
            const demoUser = JSON.parse(demoUserStr);
            if (demoUser.email === session.user.email) {
              setUser(demoUser);
              return;
            }
          }
          
          try {
            const profile = await organizationService.getUserProfile(session.user.id);
            setUser({
              ...session.user,
              role: profile.role,
              org_id: profile.org_id,
              organization: profile.organizations
            });
          } catch (error) {
            console.error('Error getting user profile:', error);
            // If profile fails due to policy issues, create a basic user structure
            setUser({
              ...session.user,
              role: 'user', // Default role
              org_id: null,
              organization: null
            });
          }
        } else {
          setUser(null);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('demoUser'); // Clear demo user on logout
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      console.log("AuthContext: Starting login for:", email);
      const result = await authService.login(email, password);
      
      // Get user permissions and set complete user object
      const userWithPermissions = {
        ...result.user,
        ...getUserPermissions(result.user)
      };
      
      setUser(userWithPermissions);
      
      // DEBUG LOGS
      console.log("USER:", userWithPermissions);
      console.log("ORG ID:", userWithPermissions.org_id);
      console.log("PERMISSIONS:", userWithPermissions.permissions);
      
      return userWithPermissions;
    } catch (error) {
      console.error("AuthContext login error:", error);
      throw error;
    }
  };

  const adminSignup = async (email, password) => {
    try {
      console.log("AuthContext: Starting admin signup for:", email);
      const result = await authService.adminSignup(email, password);
      
      // DEBUG LOGS
      console.log("ADMIN SIGNUP RESULT:", result);
      console.log("ORGANIZATION CREATED:", result.organization);
      
      return result;
    } catch (error) {
      console.error("AuthContext admin signup error:", error);
      throw error;
    }
  };

  const userSignup = async (email, password, orgId) => {
    try {
      console.log("AuthContext: Starting user signup for:", email, "org:", orgId);
      const result = await authService.userSignup(email, password, orgId);
      
      // DEBUG LOGS
      console.log("USER SIGNUP RESULT:", result);
      console.log("USER JOINED ORG:", orgId);
      
      return result;
    } catch (error) {
      console.error("AuthContext user signup error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      localStorage.removeItem('demoUser'); // Clear demo user on logout
    } catch (error) {
      // Even if logout fails, clear local state
      setUser(null);
      localStorage.removeItem('demoUser');
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await authService.resetPassword(email);
    } catch (error) {
      throw error;
    }
  };

  const resendEmailConfirmation = async (email) => {
    try {
      await authService.resendEmailConfirmation(email);
    } catch (error) {
      throw error;
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      const updatedUser = await authService.updateUserProfile(updates);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    login,
    adminSignup,
    userSignup,
    logout,
    resetPassword,
    resendEmailConfirmation,
    updateUserProfile,
    loading,
    // Debug functions for testing
    debugGetAllOrganizations: organizationService.getAllOrganizations,
    debugGetAllProfiles: organizationService.getAllProfiles
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
