import { createAsyncThunk } from '@reduxjs/toolkit';

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || 'Registration failed');
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      return data.user;
    } catch (error) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.status === 429) {
        // Rate limit exceeded
        const retryAfter = response.headers.get('retry-after') || '15 minutes';
        throw new Error(`Rate limit exceeded. Please wait ${retryAfter} before trying again.`);
      }

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || data.message || 'Login failed');
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      
      return data.user;
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

// Logout user
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
      
      // Remove token from localStorage
      localStorage.removeItem('token');
      return null;
    } catch (error) {
      // Even if the API call fails, we should still logout locally
      localStorage.removeItem('token');
      return null;
    }
  }
);

// Check authentication status
export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await fetch('/api/auth/check', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem('token');
        return rejectWithValue('Token invalid');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      localStorage.removeItem('token');
      return rejectWithValue(error.message || 'Authentication check failed');
    }
  }
);

// Get user profile
export const getUserProfile = createAsyncThunk(
  'auth/getUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return rejectWithValue('Failed to get profile');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get profile');
    }
  }
);

// Update user profile
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const data = await response.json();
        return rejectWithValue(data.error || 'Failed to update profile');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

// Get user stats
export const getUserStats = createAsyncThunk(
  'auth/getUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await fetch('/api/auth/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return rejectWithValue('Failed to get stats');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get stats');
    }
  }
);
