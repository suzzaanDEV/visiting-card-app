// API Service Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Export the base URL for other services that might need it
export { API_BASE_URL };

// Export commonly used endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    CHECK: '/api/auth/check',
    PROFILE: '/api/auth/profile',
    STATS: '/api/auth/stats',
  },
  
  // Card endpoints
  CARDS: {
    MY_CARDS: '/api/cards/my',
    CREATE: '/api/cards',
    UPDATE: (id) => `/api/cards/${id}`,
    DELETE: (id) => `/api/cards/${id}`,
    GET_BY_ID: (id) => `/api/cards/${id}`,
    GET_BY_SHORT_LINK: (shortLink) => `/api/cards/c/${shortLink}`,
    PUBLIC_VIEW: (id) => `/api/cards/public/view/${id}`,
    FROM_TEMPLATE: '/api/cards/from-template',
    STATS: '/api/cards/my/stats',
  },
  
  // Template endpoints
  TEMPLATES: {
    GET_ALL: '/api/templates',
    CREATE: '/api/templates',
    UPDATE: (id) => `/api/templates/${id}`,
    DELETE: (id) => `/api/templates/${id}`,
  },
  
  // Library endpoints
  LIBRARY: {
    GET_ITEMS: (page = 1, limit = 20) => `/api/library?page=${page}&limit=${limit}`,
    ADD_ITEM: '/api/library',
    REMOVE_ITEM: (cardId) => `/api/library/${cardId}`,
    STATS: '/api/library/stats',
  },
  
  // Search endpoints
  SEARCH: {
    SEARCH: '/api/search',
  },
  
  // Admin endpoints
  ADMIN: {
    DASHBOARD: '/api/admin/dashboard',
    USERS: {
      GET_ALL: '/api/admin/users',
      GET_BY_ID: (id) => `/api/admin/users/${id}`,
      UPDATE: (id) => `/api/admin/users/${id}`,
      DELETE: (id) => `/api/admin/users/${id}`,
      BAN: (id) => `/api/admin/users/${id}/ban`,
    },
    CARDS: {
      GET_ALL: '/api/admin/cards',
      GET_BY_ID: (id) => `/api/admin/cards/${id}`,
      UPDATE: (id) => `/api/admin/cards/${id}`,
      DELETE: (id) => `/api/admin/cards/${id}`,
      FEATURE: (id) => `/api/admin/cards/${id}/feature`,
      ANALYTICS: (id) => `/api/admin/cards/${id}/analytics`,
    },
  },
  
  // Analytics endpoints
  ANALYTICS: {
    DASHBOARD: '/api/analytics/dashboard',
    USER_GROWTH: '/api/analytics/user-growth',
    CARD_GROWTH: '/api/analytics/card-growth',
    ENGAGEMENT: '/api/analytics/engagement',
  },
}; 