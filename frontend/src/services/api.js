import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          
          localStorage.setItem('access_token', response.data.access);
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  logout: (refreshToken) => api.post('/auth/logout/', { refresh: refreshToken }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
};

// Wellness API
export const wellnessAPI = {
  getDashboard: () => api.get('/wellness/dashboard/'),
  getTodayGoals: () => api.get('/wellness/goals/today/'),
  getGoals: (params) => api.get('/wellness/goals/', { params }),
  createGoal: (data) => api.post('/wellness/goals/', data),
  updateGoal: (id, data) => api.patch(`/wellness/goals/${id}/`, data),
  deleteGoal: (id) => api.delete(`/wellness/goals/${id}/`),
  logProgress: (goalId, data) => api.post(`/wellness/goals/${goalId}/log/`, data),
  getWeeklyProgress: () => api.get('/wellness/goals/weekly/'),
  getReminders: () => api.get('/wellness/reminders/'),
  getUpcomingReminders: () => api.get('/wellness/reminders/upcoming/'),
  createReminder: (data) => api.post('/wellness/reminders/', data),
  updateReminder: (id, data) => api.patch(`/wellness/reminders/${id}/`, data),
  deleteReminder: (id) => api.delete(`/wellness/reminders/${id}/`),
  getHealthTip: () => api.get('/wellness/health-tip/'),
};

// Health Info API (public)
export const healthAPI = {
  getArticles: (params) => api.get('/health/articles/', { params }),
  getLatestArticles: () => api.get('/health/articles/latest/'),
  getArticle: (slug) => api.get(`/health/articles/${slug}/`),
  getPrivacyPolicy: () => api.get('/health/privacy-policy/'),
  getFAQs: () => api.get('/health/faqs/'),
  getPublicInfo: () => api.get('/health/public/'),
};

// Provider API
export const providerAPI = {
  getPatients: () => api.get('/auth/provider/patients/'),
  getPatientDetail: (id) => api.get(`/auth/provider/patients/${id}/`),
};

export default api;

