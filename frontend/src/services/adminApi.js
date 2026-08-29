import { API_BASE_URL } from './apiService';

export const adminFetch = async (path, options = {}) => {
  const token = localStorage.getItem('adminToken');
  const headers = {
    ...(options.headers || {}),
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (response.status === 401) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    if (window.location.pathname.startsWith('/admin')) {
      window.location.href = '/admin/login';
    }
  }

  return response;
};