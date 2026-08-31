import { supabase } from '../api/supabase';

const authService = {
  register: async (userData) => {
    try {
      console.log('Attempting to register user:', userData.email);
      
      // Check for demo credentials first
      if ((userData.email === 'admin@securenet.com' && userData.password === 'admin123') ||
          (userData.email === 'user@securenet.com' && userData.password === 'user123')) {
        
        // Create mock user object for demo accounts
        const mockUser = {
          id: userData.email === 'admin@securenet.com' ? 'admin-demo-id' : 'user-demo-id',
          email: userData.email,
          user_metadata: {
            name: userData.name || (userData.email === 'admin@securenet.com' ? 'Admin User' : 'Regular User'),
            role: userData.role || (userData.email === 'admin@securenet.com' ? 'admin' : 'user')
          },
          created_at: new Date().toISOString(),
          email_confirmed_at: new Date().toISOString() // Mark as confirmed
        };
        
        console.log('Demo registration successful:', mockUser);
        return mockUser;
      }
      
      // Register user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role || 'user'
          }
        }
      });

      console.log('Signup response:', { data, error });

      if (error) {
        console.error('Signup error:', error);
        throw new Error(error.message);
      }

      // Check if user needs email confirmation
      if (data.user && !data.user.email_confirmed_at) {
        console.log('User registered but email not confirmed');
        throw new Error('Please check your email to confirm your account before logging in.');
      }

      console.log('User registered successfully:', data.user);
      return data.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  login: async (email, password, rememberMe = false) => {
    try {
      console.log('Attempting login for:', email);
      
      // Check for demo credentials first
      if ((email === 'admin@securenet.com' && password === 'admin123') ||
          (email === 'user@securenet.com' && password === 'user123')) {
        
        // Create mock user object for demo accounts
        const mockUser = {
          id: email === 'admin@securenet.com' ? 'admin-demo-id' : 'user-demo-id',
          email: email,
          user_metadata: {
            name: email === 'admin@securenet.com' ? 'Admin User' : 'Regular User',
            role: email === 'admin@securenet.com' ? 'admin' : 'user'
          },
          created_at: new Date().toISOString()
        };
        
        console.log('Demo login successful:', mockUser);
        return mockUser;
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      console.log('Login response:', { data, error });

      if (error) {
        console.error('Login error:', error);
        
        // Handle specific error cases
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Your email has not been confirmed. Please check your inbox and click the confirmation link, or request a new confirmation email.');
        } else if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        } else {
          throw new Error(error.message);
        }
      }

      console.log('Login successful:', data.user);
      
      // Store session persistence based on remember me
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }

      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
      localStorage.removeItem('rememberMe');
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        throw new Error(error.message);
      }
      return user;
    } catch (error) {
      return null;
    }
  },

  resetPassword: async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error) {
      throw error;
    }
  },

  updateUserProfile: async (updates) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });

      if (error) {
        throw new Error(error.message);
      }

      return data.user;
    } catch (error) {
      throw error;
    }
  },

  // Resend email confirmation
  resendEmailConfirmation: async (email) => {
    try {
      console.log('Resending confirmation email to:', email);
      
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      console.log('Resend confirmation response:', { data, error });

      if (error) {
        console.error('Resend confirmation error:', error);
        throw new Error(error.message);
      }

      console.log('Confirmation email resent successfully');
      return true;
    } catch (error) {
      console.error('Resend confirmation error:', error);
      throw error;
    }
  },

  // Listen to auth state changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

export default authService;
