import axios from 'axios';

// IMPORTANT: In production on Vercel, set VITE_API_URL to your Render backend URL
// and INCLUDE the /api suffix: https://your-backend.onrender.com/api
// Trailing slashes are stripped automatically to prevent double-slash issues.
const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE_URL = rawUrl.replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('projecthub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired, clear and optionally redirect
      if (localStorage.getItem('projecthub_token')) {
        localStorage.removeItem('projecthub_token');
        localStorage.removeItem('projecthub_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
};

export const projectService = {
  getProjects: (params) => api.get('/projects', { params }),
  getProjectById: (id) => api.get(`/projects/${id}`),
  createProject: (data) => api.post('/projects', data),
  updateProject: (id, data) => api.put(`/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  getMyProjects: () => api.get('/projects/my'),
  getDashboardStats: () => api.get('/projects/dashboard-stats'),
  updateOrRemoveMember: (projectId, memberId, data) =>
    api.put(`/projects/${projectId}/members/${memberId}`, data),
};

export const joinRequestService = {
  createJoinRequest: (data) => api.post('/join-requests', data),
  getReceivedRequests: () => api.get('/join-requests/received'),
  getSentRequests: () => api.get('/join-requests/sent'),
  respondToJoinRequest: (id, data) => api.put(`/join-requests/${id}/respond`, data),
};

export const resourceService = {
  getResources: (params) => api.get('/resources', { params }),
  uploadResource: (formData) =>
    api.post('/resources', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getDownloadUrl: (id) => `${API_BASE_URL}/resources/${id}/download`,
  deleteResource: (id) => api.delete(`/resources/${id}`),
};

export const taskService = {
  getTasksByProject: (projectId) => api.get(`/tasks/project/${projectId}`),
  getMyTasks: () => api.get('/tasks/my-tasks'),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

export const commentService = {
  getCommentsByProject: (projectId) => api.get(`/comments/project/${projectId}`),
  createComment: (data) => api.post('/comments', data),
  deleteComment: (id) => api.delete(`/comments/${id}`),
};

export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export const userService = {
  getStudents: (params) => api.get('/users', { params }),
  getUserProfile: (id) => api.get(`/users/${id}`),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getProjects: () => api.get('/admin/projects'),
  deleteProject: (id) => api.delete(`/admin/projects/${id}`),
  getResources: () => api.get('/admin/resources'),
  deleteResource: (id) => api.delete(`/admin/resources/${id}`),
};

export default api;
