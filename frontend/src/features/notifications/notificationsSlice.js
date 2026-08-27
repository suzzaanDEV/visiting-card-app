import { createSlice } from '@reduxjs/toolkit';
import {
  fetchNotifications,
  fetchNotificationStats,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  fetchPreferences,
  updatePreferences,
  approveAccessRequest,
  rejectAccessRequest
} from './notificationsThunks';

const initialState = {
  items: [],
  unreadCount: 0,
  total: 0,
  page: 1,
  pages: 1,
  loading: false,
  error: null,
  stats: { total: 0, unread: 0, today: 0 },
  preferences: {
    pushEnabled: true,
    cardLoved: true,
    cardShared: true,
    accessRequests: true,
    accessUpdates: true,
    systemAlerts: true,
    weeklyDigest: false
  },
  pushPermission: 'default',
  isPushSubscribed: false
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotificationError(state) {
      state.error = null;
    },
    setPushPermission(state, action) {
      state.pushPermission = action.payload;
    },
    setPushSubscribed(state, action) {
      state.isPushSubscribed = action.payload;
    },
    incrementUnread(state) {
      state.unreadCount += 1;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.notifications || [];
        state.unreadCount = action.payload.unreadCount || 0;
        state.total = action.payload.pagination?.total || 0;
        state.pages = action.payload.pagination?.pages || 1;
        state.page = action.payload.pagination?.page || 1;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch stats
      .addCase(fetchNotificationStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      // Mark read
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const id = action.payload;
        const item = state.items.find((n) => n._id === id);
        if (item && !item.isRead) {
          item.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      // Mark all read
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items.forEach((n) => { n.isRead = true; });
        state.unreadCount = 0;
      })

      // Delete
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const id = action.payload;
        const item = state.items.find((n) => n._id === id);
        if (item && !item.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.items = state.items.filter((n) => n._id !== id);
        state.total = Math.max(0, state.total - 1);
      })

      // Preferences
      .addCase(fetchPreferences.fulfilled, (state, action) => {
        state.preferences = { ...state.preferences, ...action.payload };
      })
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.preferences = { ...state.preferences, ...action.payload };
      })

      // Approve access request
      .addCase(approveAccessRequest.fulfilled, (state, action) => {
        const { requestId } = action.payload;
        const item = state.items.find(n => n.type === 'access_request' && n.data?.requestId === requestId);
        if (item && !item.isRead) {
          item.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      // Reject access request
      .addCase(rejectAccessRequest.fulfilled, (state, action) => {
        const { requestId } = action.payload;
        const item = state.items.find(n => n.type === 'access_request' && n.data?.requestId === requestId);
        if (item && !item.isRead) {
          item.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  }
});

export const { clearNotificationError, setPushPermission, setPushSubscribed, incrementUnread } = notificationsSlice.actions;
export default notificationsSlice.reducer;
