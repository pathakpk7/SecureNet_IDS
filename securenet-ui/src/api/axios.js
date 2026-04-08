import axios from 'axios';
import { authAPI } from './auth';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('securenet_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle authentication errors
      if (status === 401) {
        localStorage.removeItem('securenet_token');
        localStorage.removeItem('securenet_user');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      // Handle forbidden access
      if (status === 403) {
        window.location.href = '/unauthorized';
        return Promise.reject(error);
      }
      
      // Handle server errors
      if (status >= 500) {
        console.error('Server Error:', data);
        return Promise.reject(new Error('Server error occurred'));
      }
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const apiRequest = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${api.defaults.baseURL}${endpoint}`,
    };

    if (data) {
      config.data = data;
    }

    const response = await api(config);
    return response.data;
  } catch (error) {
    console.error(`API Error (${method} ${endpoint}):`, error);
    throw error;
  }
};

// Convenience methods
export const get = (endpoint, params = null) => {
  return apiRequest('get', endpoint, null, params);
};

export const post = (endpoint, data) => {
  return apiRequest('post', endpoint, data);
};

export const put = (endpoint, data) => {
  return apiRequest('put', endpoint, data);
};

export const del = (endpoint) => {
  return apiRequest('delete', endpoint);
};

// Specific API methods
export const getRequest = async (endpoint) => {
  try {
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('GET request failed:', error);
    throw error;
  }
};

export const postRequest = async (endpoint, data) => {
  try {
    const response = await api.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error('POST request failed:', error);
    throw error;
  }
};

export default api;
