/**
 * API Client for Radius Backend
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes for long-running scrape operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging and auth token
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method.toUpperCase()} ${config.url}`);
    
    // Add auth token to requests if available
    const token = window.authToken || sessionStorage.getItem('authToken');
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
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('[API Error]', error.response?.data || error.message);
    
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Clear auth state
      sessionStorage.removeItem('authToken');
      window.authToken = null;
      
      // Optionally redirect to login
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────
// Authentication Endpoints
// ─────────────────────────────────────────────────────────────

export const register = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};

export const logout = async () => {
  const response = await apiClient.post('/auth/logout');
  return response.data;
};

export const getMe = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

export const initiateGoogleAuth = () => {
  // Redirect to backend Google OAuth endpoint
  window.location.href = `${API_BASE_URL}/auth/google`;
};

// ─────────────────────────────────────────────────────────────
// Dev Endpoints (Temporary)
// ─────────────────────────────────────────────────────────────

export const triggerIndeedScrape = async (params) => {
  const response = await apiClient.post('/dev/scrape/indeed', params);
  return response.data;
};

// ─────────────────────────────────────────────────────────────
// Lead Endpoints
// ─────────────────────────────────────────────────────────────

export const getLeads = async (params = {}) => {
  const response = await apiClient.get('/leads', { params });
  return response.data;
};

export const getLeadStats = async () => {
  const response = await apiClient.get('/leads/stats');
  return response.data;
};

export const getLeadById = async (id) => {
  const response = await apiClient.get(`/leads/${id}`);
  return response.data;
};

export const createLead = async (leadData) => {
  const response = await apiClient.post('/leads', leadData);
  return response.data;
};

export const updateLead = async (id, leadData) => {
  const response = await apiClient.put(`/leads/${id}`, leadData);
  return response.data;
};

export const deleteLead = async (id) => {
  const response = await apiClient.delete(`/leads/${id}`);
  return response.data;
};

// ─────────────────────────────────────────────────────────────
// Job Endpoints
// ─────────────────────────────────────────────────────────────

export const getJobs = async (params = {}) => {
  const response = await apiClient.get('/jobs', { params });
  return response.data;
};

export const getJobById = async (id) => {
  const response = await apiClient.get(`/jobs/${id}`);
  return response.data;
};

export const createJob = async (jobData) => {
  const response = await apiClient.post('/jobs', jobData);
  return response.data;
};

export const updateJob = async (id, jobData) => {
  const response = await apiClient.put(`/jobs/${id}`, jobData);
  return response.data;
};

export const deleteJob = async (id) => {
  const response = await apiClient.delete(`/jobs/${id}`);
  return response.data;
};

// ─────────────────────────────────────────────────────────────
// System Endpoints
// ─────────────────────────────────────────────────────────────

export const getSystemStatus = async () => {
  const response = await apiClient.get('/system/status');
  return response.data;
};

export const getSystemStats = async () => {
  const response = await apiClient.get('/system/stats');
  return response.data;
};

// ─────────────────────────────────────────────────────────────
// Preparation Guide Endpoints (LLM-powered)
// ─────────────────────────────────────────────────────────────

/**
 * Generate an interview preparation guide using AI
 * @param {Object} payload - Either { leadId: string } or { jobData: Object }
 * @returns {Promise} Response with prep guide data
 */
export const generatePrepGuide = async (payload) => {
  const response = await apiClient.post('/preparation/generate', payload);
  return response.data;
};

export const getPrepGuideHistory = async () => {
  const response = await apiClient.get('/preparation/history');
  return response.data;
};

export default apiClient;
