import { createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

// Fetch notifications
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async ({ page = 1, limit = 20, unreadOnly = false } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, limit, unreadOnly });
      const res = await fetch(`${API_BASE}/notifications?${params}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        const data = await res.json();
        return rejectWithValue(data.error || 'Failed to fetch notifications');
      }
      return await res.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Fetch notification stats
export const fetchNotificationStats = createAsyncThunk(
  'notifications/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/notifications/stats`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        const data = await res.json();
        return rejectWithValue(data.error || 'Failed to fetch stats');
      }
      const data = await res.json();
      return data.stats;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Mark single notification as read
export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        const data = await res.json();
        return rejectWithValue(data.error || 'Failed to mark as read');
      }
      return notificationId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Mark all as read
export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        const data = await res.json();
        return rejectWithValue(data.error || 'Failed to mark all as read');
      }
      return true;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Delete a notification
export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (notificationId, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        const data = await res.json();
        return rejectWithValue(data.error || 'Failed to delete');
      }
      return notificationId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Fetch notification preferences
export const fetchPreferences = createAsyncThunk(
  'notifications/fetchPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/notifications/preferences`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        const data = await res.json();
        return rejectWithValue(data.error || 'Failed to fetch preferences');
      }
      const data = await res.json();
      return data.preferences;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Update notification preferences
export const updatePreferences = createAsyncThunk(
  'notifications/updatePreferences',
  async (preferences, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/notifications/preferences`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(preferences)
      });
      if (!res.ok) {
        const data = await res.json();
        return rejectWithValue(data.error || 'Failed to update preferences');
      }
      const data = await res.json();
      return data.preferences;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Approve an access request from a notification
export const approveAccessRequest = createAsyncThunk(
  'notifications/approveAccessRequest',
  async ({ requestId, message = '' }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/cards/access-requests/${requestId}/approve`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message })
      });
      if (!res.ok) {
        const data = await res.json();
        return rejectWithValue(data.error || 'Failed to approve');
      }
      return { requestId };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Reject an access request from a notification
export const rejectAccessRequest = createAsyncThunk(
  'notifications/rejectAccessRequest',
  async ({ requestId, message = '' }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/cards/access-requests/${requestId}/reject`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message })
      });
      if (!res.ok) {
        const data = await res.json();
        return rejectWithValue(data.error || 'Failed to reject');
      }
      return { requestId };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);
