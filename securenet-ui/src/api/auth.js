import axios from 'axios';

// Auth API endpoints
const authAPI = {
  // Login endpoint
  login: async (email, password) => {
    try {
      // Simulate API call - replace with actual backend endpoint
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      // Handle different response formats
      if (response.data) {
        const { token, user } = response.data;
        
        if (token && user) {
          return {
            token,
            user: {
              id: user.id || '1',
              name: user.name || email.split('@')[0],
              email: user.email || email,
              role: user.role || 'user',
              avatar: user.avatar || null,
            }
          };
        }
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 401) {
          throw new Error(data?.message || 'Invalid email or password');
        }
        
        if (status === 429) {
          throw new Error('Too many login attempts. Please try again later.');
        }
        
        if (status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
      }
      
      throw new Error(error.message || 'Login failed');
    }
  },

  // Register endpoint
  register: async (userData) => {
    try {
      const { name, email, password, role = 'user' } = userData;
      
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
        role,
      });

      if (response.data) {
        const { token, user } = response.data;
        
        if (token && user) {
          return {
            token,
            user: {
              id: user.id || Date.now().toString(),
              name: user.name || name,
              email: user.email || email,
              role: user.role || role,
              avatar: user.avatar || null,
            }
          };
        }
      }
      
      throw new Error('Registration failed');
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 409) {
          throw new Error(data?.message || 'Email already registered');
        }
        
        if (status === 400) {
          throw new Error(data?.message || 'Invalid registration data');
        }
        
        if (status === 429) {
          throw new Error('Too many registration attempts. Please try again later.');
        }
        
        if (status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
      }
      
      throw new Error(error.message || 'Registration failed');
    }
  },

  // Logout endpoint
  logout: async (token) => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  },

  // Refresh token endpoint
  refreshToken: async (refreshToken) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/refresh', {
        token: refreshToken,
      });

      if (response.data && response.data.token) {
        return response.data.token;
      }
      
      throw new Error('Token refresh failed');
    } catch (error) {
      console.error('Token refresh error:', error);
      throw new Error('Session expired. Please login again.');
    }
  },

  // Validate token endpoint
  validateToken: async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/validate', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data?.valid || false;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },

  // Password reset request
  requestPasswordReset: async (email) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/reset-request', {
        email,
      });

      return response.data?.message || 'Password reset email sent';
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 404) {
          throw new Error(data?.message || 'Email not found');
        }
        
        if (status === 429) {
          throw new Error('Too many reset requests. Please try again later.');
        }
      }
      
      throw new Error(error.message || 'Password reset failed');
    }
  },

  // Password reset confirmation
  confirmPasswordReset: async (token, newPassword) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/reset-confirm', {
        token,
        newPassword,
      });

      return response.data?.message || 'Password reset successful';
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          throw new Error(data?.message || 'Invalid or expired reset token');
        }
      }
      
      throw new Error(error.message || 'Password reset failed');
    }
  },

  // Get user profile
  getProfile: async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        return response.data;
      }
      
      throw new Error('Failed to fetch profile');
    } catch (error) {
      if (error.response) {
        const { status } = error.response;
        
        if (status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        
        if (status === 404) {
          throw new Error('User not found');
        }
      }
      
      throw new Error(error.message || 'Failed to fetch profile');
    }
  },

  // Update user profile
  updateProfile: async (token, userData) => {
    try {
      const response = await axios.put('http://localhost:5000/api/auth/profile', userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        return response.data;
      }
      
      throw new Error('Profile update failed');
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          throw new Error(data?.message || 'Invalid profile data');
        }
        
        if (status === 401) {
          throw new Error('Session expired. Please login again.');
        }
      }
      
      throw new Error(error.message || 'Profile update failed');
    }
  },
};

export default authAPI;
