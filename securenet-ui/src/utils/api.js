/**
 * Centralized API Configuration for SecureNet IDS
 * Handles all HTTP requests to the backend API and external threat intelligence services
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// External API Configuration
const ABUSEIPDB_API_KEY = import.meta.env.VITE_ABUSEIPDB_API_KEY;
const VIRUSTOTAL_API_KEY = import.meta.env.VITE_VIRUSTOTAL_API_KEY;
const OTX_API_KEY = import.meta.env.VITE_OTX_API_KEY;
const GOOGLE_SAFE_API_KEY = import.meta.env.VITE_GOOGLE_SAFE_API_KEY;
const URLSCAN_API_KEY = import.meta.env.VITE_URLSCAN_API_KEY;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

/**
 * Default request headers
 */
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

/**
 * Generic request handler with error handling
 * @param {string} url - The full URL to request
 * @param {Object} options - Fetch options object
 * @returns {Promise<Object>} - JSON response data
 * @throws {Error} - Network or server error
 */
const request = async (url, options = {}) => {
  try {
    // Set default headers and merge with any provided headers
    const config = {
      headers: { ...DEFAULT_HEADERS, ...options.headers },
      ...options,
    };

    const response = await fetch(url, config);

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    // Parse and return JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    // Handle network errors, JSON parsing errors, etc.
    console.error('API Request Error:', error);
    throw new Error(
      error.message || 'Network error occurred. Please try again.'
    );
  }
};

/**
 * GET request helper
 * @param {string} endpoint - API endpoint (e.g., '/users')
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Object>} - JSON response data
 */
export const getRequest = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  return request(url, { method: 'GET', ...options });
};

/**
 * POST request helper
 * @param {string} endpoint - API endpoint (e.g., '/users')
 * @param {Object} data - Request body data
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Object>} - JSON response data
 */
export const postRequest = async (endpoint, data, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
};

/**
 * PUT request helper
 * @param {string} endpoint - API endpoint (e.g., '/users/123')
 * @param {Object} data - Request body data
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Object>} - JSON response data
 */
export const putRequest = async (endpoint, data, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  return request(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
  });
};

/**
 * DELETE request helper
 * @param {string} endpoint - API endpoint (e.g., '/users/123')
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Object>} - JSON response data
 */
export const deleteRequest = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  return request(url, { method: 'DELETE', ...options });
};

/**
 * PATCH request helper
 * @param {string} endpoint - API endpoint (e.g., '/users/123')
 * @param {Object} data - Request body data
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Object>} - JSON response data
 */
export const patchRequest = async (endpoint, data, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  return request(url, {
    method: 'PATCH',
    body: JSON.stringify(data),
    ...options,
  });
};

/**
 * Upload file helper (multipart/form-data)
 * @param {string} endpoint - API endpoint
 * @param {FormData} formData - Form data with file
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Object>} - JSON response data
 */
export const uploadFile = async (endpoint, formData, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header for FormData - browser sets it automatically with boundary
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('File Upload Error:', error);
    throw new Error(
      error.message || 'File upload failed. Please try again.'
    );
  }
};

/**
 * Request with authentication token
 * @param {string} token - JWT or API token
 * @returns {Object} - Headers object with authorization
 */
export const getAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

/**
 * Authenticated GET request
 * @param {string} endpoint - API endpoint
 * @param {string} token - Authentication token
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Object>} - JSON response data
 */
export const getAuthenticatedRequest = async (endpoint, token, options = {}) => {
  return getRequest(endpoint, {
    headers: getAuthHeaders(token),
    ...options,
  });
};

/**
 * Authenticated POST request
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body data
 * @param {string} token - Authentication token
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Object>} - JSON response data
 */
export const postAuthenticatedRequest = async (endpoint, data, token, options = {}) => {
  return postRequest(endpoint, data, {
    headers: getAuthHeaders(token),
    ...options,
  });
};

// Export the base URL for reference
export { BASE_URL };

/**
 * AbuseIPDB API - IP Reputation and Threat Intelligence
 */
export const checkIPReputation = async (ip) => {
  try {
    const response = await fetch(`https://api.abuseipdb.com/v2/check/${ip}?key=${ABUSEIPDB_API_KEY}&maxAgeInDays=90&verbose`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('AbuseIPDB API Error:', error);
    throw new Error('Failed to check IP reputation');
  }
};

/**
 * VirusTotal API - Malware and URL Analysis
 */
export const scanWithVirusTotal = async (resource, type = 'file') => {
  try {
    const endpoint = type === 'url' ? 'urls' : 'files';
    const formData = new FormData();
    formData.append('apikey', VIRUSTOTAL_API_KEY);
    formData.append('resource', resource);
    
    const response = await fetch(`https://www.virustotal.com/vtapi/v2/${endpoint}`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('VirusTotal API Error:', error);
    throw new Error('Failed to scan with VirusTotal');
  }
};

/**
 * OTX API - Threat Intelligence Feeds
 */
export const getOTXThreats = async () => {
  try {
    const response = await fetch(`https://otx.alienvault.com/api/v1/indicators?limit=50&key=${OTX_API_KEY}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('OTX API Error:', error);
    throw new Error('Failed to fetch OTX threats');
  }
};

/**
 * Google Safe Browsing API - URL Safety Check
 */
export const checkURLSafety = async (url) => {
  try {
    const requestBody = {
      client: {
        clientId: "securenet-ids",
        clientVersion: "1.0.0"
      },
      threatInfo: {
        threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
        platformTypes: ["ANY_PLATFORM"]
      },
      threatEntries: [{
        url: url,
        platformType: "ANY_PLATFORM"
      }]
    };

    const response = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_SAFE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Google Safe Browsing API Error:', error);
    throw new Error('Failed to check URL safety');
  }
};

/**
 * URLScan API - URL Analysis
 */
export const scanURL = async (url) => {
  try {
    const response = await fetch(`https://urlscan.io/api/v1/scan?key=${URLSCAN_API_KEY}&url=${encodeURIComponent(url)}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('URLScan API Error:', error);
    throw new Error('Failed to scan URL');
  }
};

/**
 * Supabase Database Operations
 */
export const supabaseRequest = async (table, method = 'GET', data = null) => {
  try {
    const options = {
      method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/json'
      }
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, options);
    return await response.json();
  } catch (error) {
    console.error('Supabase API Error:', error);
    throw new Error(`Failed to ${method} ${table}`);
  }
};

/**
 * Enhanced IP Analysis - Combine multiple threat intelligence sources
 */
export const analyzeIP = async (ip) => {
  try {
    const [abuseData, virusData] = await Promise.all([
      checkIPReputation(ip),
      scanWithVirusTotal(ip, 'ip')
    ]);

    return {
      ip,
      abuseIPDB: abuseData,
      virusTotal: virusData,
      riskScore: calculateRiskScore(abuseData, virusData),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('IP Analysis Error:', error);
    throw new Error('Failed to analyze IP');
  }
};

/**
 * Calculate risk score from multiple sources
 */
const calculateRiskScore = (abuseData, virusData) => {
  let score = 0;
  
  // AbuseIPDB scoring
  if (abuseData.abuseConfidence > 75) score += 3;
  if (abuseData.isWhitelisted === false) score += 2;
  if (abuseData.totalReports > 10) score += 2;
  
  // VirusTotal scoring
  if (virusData.positives > 0) score += 4;
  if (virusData.positives > 5) score += 3;
  
  return Math.min(score, 10); // Max score of 10
};

// Export a default object with all methods for convenience
export default {
  get: getRequest,
  post: postRequest,
  put: putRequest,
  delete: deleteRequest,
  patch: patchRequest,
  upload: uploadFile,
  getAuth: getAuthenticatedRequest,
  postAuth: postAuthenticatedRequest,
  BASE_URL,
  // External API functions
  checkIPReputation,
  scanWithVirusTotal,
  getOTXThreats,
  checkURLSafety,
  scanURL,
  supabaseRequest,
  analyzeIP,
};
