// Frontend API service utility for centralized API configuration
// This replaces hardcoded URLs throughout the application

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const apiClient = {
  // Base URL for all API calls
  baseURL: API_URL,

  // User endpoints
  users: {
    register: `${API_URL}/api/users/register`,
    login: `${API_URL}/api/users/login`,
    profile: `${API_URL}/api/users/profile`,
    getAll: `${API_URL}/api/users`,
    getById: (id) => `${API_URL}/api/users/${id}`,
    update: (id) => `${API_URL}/api/users/${id}`,
    block: (id) => `${API_URL}/api/users/block/${id}`,
    renew: (id) => `${API_URL}/api/users/renew/${id}`,
    createAdmin: `${API_URL}/api/users/admin/create`,
  },

  // Membership endpoints
  membership: {
    getRequests: `${API_URL}/api/membership/requests`,
    approve: (id) => `${API_URL}/api/membership/approve/${id}`,
    reject: (id) => `${API_URL}/api/membership/reject/${id}`,
    requestRenewal: `${API_URL}/api/membership/request-renewal`,
  },

  // Dashboard endpoints
  dashboard: {
    stats: `${API_URL}/api/dashboard/stats`,
  },

  // Trainer endpoints
  trainers: `${API_URL}/api/trainers`,

  // Feedback endpoints
  feedback: {
    submit: `${API_URL}/api/feedback`,
    getForTrainer: (trainerId) => `${API_URL}/api/feedback/trainer/${trainerId}`,
  // Contact endpoints
  contact: {
    create: `${API_URL}/api/contact`,
    getAll: `${API_URL}/api/contact`,
    getById: (id) => `${API_URL}/api/contact/${id}`,
    update: (id) => `${API_URL}/api/contact/${id}`,
    reply: (id) => `${API_URL}/api/contact/${id}/reply`,
    delete: (id) => `${API_URL}/api/contact/${id}`,
  },
};

export default apiClient;
