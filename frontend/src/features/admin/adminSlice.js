import { createSlice } from '@reduxjs/toolkit';
import * as adminThunks from './adminThunks.js';

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: {
      totalUsers: 0,
      totalCards: 0,
      activeCards: 0,
      publicCards: 0,
      newUsers: 0,
      newCards: 0,
      topCards: []
    },
    users: {
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      loading: false,
      error: null
    },
    cards: {
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      loading: false,
      error: null
    },
    templates: {
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      loading: false,
      error: null
    },
    analytics: {
      userGrowth: [],
      cardGrowth: [],
      engagement: {},
      loading: false,
      error: null
    },
    accessRequests: {
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      loading: false,
      error: null
    },
    policies: [],
    contactMessages: [],
    contactTotal: 0,
    contactPage: 1,
    contactTotalPages: 1,
    auditLogs: [],
    auditStats: null,
    categories: [],
broadcasts: { data: [], total: 0, page: 1, loading: false, error: null },
  broadcastStats: null,
  broadcastOverview: null,
    notificationTemplates: [],
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUserPage: (state, action) => {
      state.users.page = action.payload;
    },
    setCardPage: (state, action) => {
      state.cards.page = action.payload;
    },
    setTemplatePage: (state, action) => {
      state.templates.page = action.payload;
    },
    setAccessRequestPage: (state, action) => {
      state.accessRequests.page = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Stats
      .addCase(adminThunks.fetchAdminDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminThunks.fetchAdminDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(adminThunks.fetchAdminDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Real-time Data
      .addCase(adminThunks.fetchRealTimeData.fulfilled, (state, action) => {
        // Update real-time stats if needed
        state.stats = { ...state.stats, ...action.payload };
      })
      
      // Fetch Users
      .addCase(adminThunks.fetchUsers.pending, (state) => {
        state.users.loading = true;
        state.users.error = null;
      })
      .addCase(adminThunks.fetchUsers.fulfilled, (state, action) => {
        state.users.loading = false;
        state.users.data = action.payload.users || action.payload;
        state.users.total = action.payload.pagination?.total || action.payload.length;
      })
      .addCase(adminThunks.fetchUsers.rejected, (state, action) => {
        state.users.loading = false;
        state.users.error = action.payload;
      })
      
      // Ban User
      .addCase(adminThunks.banUser.fulfilled, (state, action) => {
        const index = state.users.data.findIndex(user => user._id === action.payload.userId);
        if (index !== -1) {
          state.users.data[index].isActive = action.payload.user?.isActive;
        }
      })
      
      // Update User
      .addCase(adminThunks.updateUser.fulfilled, (state, action) => {
        const index = state.users.data.findIndex(user => user._id === action.payload.userId);
        if (index !== -1) {
          state.users.data[index] = action.payload.user;
        }
      })
      
      // Delete User
      .addCase(adminThunks.deleteUser.fulfilled, (state, action) => {
        state.users.data = state.users.data.filter(user => user._id !== action.payload.userId);
      })
      
      // Fetch Cards
      .addCase(adminThunks.fetchAdminCards.pending, (state) => {
        state.cards.loading = true;
        state.cards.error = null;
      })
      .addCase(adminThunks.fetchAdminCards.fulfilled, (state, action) => {
        state.cards.loading = false;
        state.cards.data = action.payload.cards || action.payload;
        state.cards.total = action.payload.pagination?.total || action.payload.length;
      })
      .addCase(adminThunks.fetchAdminCards.rejected, (state, action) => {
        state.cards.loading = false;
        state.cards.error = action.payload;
      })
      
      // Feature Card
      .addCase(adminThunks.featureCard.fulfilled, (state, action) => {
        const index = state.cards.data.findIndex(card => card._id === action.payload.cardId);
        if (index !== -1) {
          state.cards.data[index].featured = action.payload.featured;
        }
      })
      
      // Delete Card
      .addCase(adminThunks.deleteCard.fulfilled, (state, action) => {
        state.cards.data = state.cards.data.filter(card => card._id !== action.payload.cardId);
      })
      
      // Get Card Analytics
      .addCase(adminThunks.getCardAnalytics.fulfilled, (state, action) => {
        // Store card analytics if needed
        const { cardId: _cardId, analytics: _analytics } = action.payload;
        // Implementation depends on how you want to handle card analytics
      })
      
      // Fetch Templates
      .addCase(adminThunks.fetchTemplates.pending, (state) => {
        state.templates.loading = true;
        state.templates.error = null;
      })
      .addCase(adminThunks.fetchTemplates.fulfilled, (state, action) => {
        state.templates.loading = false;
        state.templates.data = action.payload.templates || action.payload;
        state.templates.total = action.payload.pagination?.total || action.payload.length;
      })
      .addCase(adminThunks.fetchTemplates.rejected, (state, action) => {
        state.templates.loading = false;
        state.templates.error = action.payload;
      })
      
      // Create Template
      .addCase(adminThunks.createTemplate.fulfilled, (state, action) => {
        state.templates.data.push(action.payload.template);
      })
      
      // Update Template
      .addCase(adminThunks.updateTemplate.fulfilled, (state, action) => {
        const index = state.templates.data.findIndex(template => template._id === action.payload.template._id);
        if (index !== -1) {
          state.templates.data[index] = action.payload.template;
        }
      })
      
      // Delete Template
      .addCase(adminThunks.deleteTemplate.fulfilled, (state, action) => {
        state.templates.data = state.templates.data.filter(template => template._id !== action.payload.templateId);
      })
      
      // Fetch Analytics
      .addCase(adminThunks.fetchAnalytics.pending, (state) => {
        state.analytics.loading = true;
        state.analytics.error = null;
      })
      .addCase(adminThunks.fetchAnalytics.fulfilled, (state, action) => {
        state.analytics = { ...action.payload, loading: false, error: null };
      })
      .addCase(adminThunks.fetchAnalytics.rejected, (state, action) => {
        state.analytics.loading = false;
        state.analytics.error = action.payload;
      })
      
      // Fetch Access Requests
      .addCase(adminThunks.fetchAccessRequests.pending, (state) => {
        state.accessRequests.loading = true;
        state.accessRequests.error = null;
      })
      .addCase(adminThunks.fetchAccessRequests.fulfilled, (state, action) => {
        state.accessRequests.loading = false;
        state.accessRequests.data = action.payload.requests || action.payload;
        state.accessRequests.total = action.payload.pagination?.total || action.payload.length;
      })
      .addCase(adminThunks.fetchAccessRequests.rejected, (state, action) => {
        state.accessRequests.loading = false;
        state.accessRequests.error = action.payload;
      })
      
      // Approve Access Request
      .addCase(adminThunks.approveAccessRequest.fulfilled, (state, action) => {
        const index = state.accessRequests.data.findIndex(request => request._id === action.payload.requestId);
        if (index !== -1) {
          state.accessRequests.data[index].status = 'approved';
          state.accessRequests.data[index].approvedAt = new Date().toISOString();
        }
      })
      
      // Reject Access Request
      .addCase(adminThunks.rejectAccessRequest.fulfilled, (state, action) => {
        const index = state.accessRequests.data.findIndex(request => request._id === action.payload.requestId);
        if (index !== -1) {
          state.accessRequests.data[index].status = 'rejected';
          state.accessRequests.data[index].rejectedAt = new Date().toISOString();
        }
      })
      // Policies
      .addCase(adminThunks.fetchPolicies.fulfilled, (state, action) => { state.policies = action.payload; })
      .addCase(adminThunks.createPolicy.fulfilled, (state, action) => { state.policies.unshift(action.payload); })
      .addCase(adminThunks.deletePolicy.fulfilled, (state, action) => { state.policies = state.policies.filter(p => p.slug !== action.payload.slug); })
      // Contact Messages
      .addCase(adminThunks.fetchContactMessages.fulfilled, (state, action) => {
        state.contactMessages = action.payload.messages || [];
        state.contactTotal = action.payload.total || 0;
        state.contactPage = action.payload.page || 1;
        state.contactTotalPages = action.payload.totalPages || 1;
      })
      // Audit Logs
      .addCase(adminThunks.fetchAuditLogs.fulfilled, (state, action) => { state.auditLogs = action.payload; })
      .addCase(adminThunks.fetchAuditStats.fulfilled, (state, action) => { state.auditStats = action.payload; })
      // Categories
      .addCase(adminThunks.fetchCategoriesAdmin.fulfilled, (state, action) => { state.categories = action.payload; })
      // ─── Broadcasts ─────────────────────────────────────────────────────
      .addCase(adminThunks.fetchBroadcasts.pending, (state) => { state.broadcasts.loading = true; state.broadcasts.error = null; })
      .addCase(adminThunks.fetchBroadcasts.fulfilled, (state, action) => {
        state.broadcasts.loading = false;
        state.broadcasts.data = action.payload.broadcasts || action.payload.data || [];
        state.broadcasts.total = action.payload.total || action.payload.broadcasts?.length || state.broadcasts.data.length;
        state.broadcasts.page = action.payload.page || 1;
      })
      .addCase(adminThunks.fetchBroadcasts.rejected, (state, action) => { state.broadcasts.loading = false; state.broadcasts.error = action.payload; })
      .addCase(adminThunks.createBroadcast.fulfilled, (state, action) => {
        const b = action.payload.broadcast || action.payload;
        state.broadcasts.data.unshift(b);
        state.broadcasts.total += 1;
      })
      .addCase(adminThunks.updateBroadcast.fulfilled, (state, action) => {
        const updated = action.payload.broadcast || action.payload;
        const idx = state.broadcasts.data.findIndex((b) => b._id === updated._id);
        if (idx !== -1) state.broadcasts.data[idx] = updated;
      })
      .addCase(adminThunks.deleteBroadcast.fulfilled, (state, action) => {
        state.broadcasts.data = state.broadcasts.data.filter((b) => b._id !== action.payload.id);
        state.broadcasts.total = Math.max(0, state.broadcasts.total - 1);
      })
      .addCase(adminThunks.sendBroadcast.fulfilled, (state, action) => {
        const updated = action.payload.broadcast || action.payload;
        const idx = state.broadcasts.data.findIndex((b) => b._id === updated._id);
        if (idx !== -1) state.broadcasts.data[idx] = updated;
      })
      .addCase(adminThunks.scheduleBroadcast.fulfilled, (state, action) => {
        const updated = action.payload.broadcast || action.payload;
        const idx = state.broadcasts.data.findIndex((b) => b._id === updated._id);
        if (idx !== -1) state.broadcasts.data[idx] = updated;
      })
      .addCase(adminThunks.cancelBroadcast.fulfilled, (state, action) => {
        const updated = action.payload.broadcast || action.payload;
        const idx = state.broadcasts.data.findIndex((b) => b._id === updated._id);
        if (idx !== -1) state.broadcasts.data[idx] = updated;
      })
      .addCase(adminThunks.fetchBroadcastStats.fulfilled, (state, action) => { state.broadcastStats = action.payload; })
      .addCase(adminThunks.fetchBroadcastOverview.fulfilled, (state, action) => { state.broadcastOverview = action.payload; })
      // ─── Notification Templates ─────────────────────────────────────────
      .addCase(adminThunks.fetchNotificationTemplates.fulfilled, (state, action) => {
        state.notificationTemplates = action.payload.templates || action.payload.data || action.payload || [];
      })
      .addCase(adminThunks.createNotificationTemplate.fulfilled, (state, action) => {
        const t = action.payload.template || action.payload;
        state.notificationTemplates.unshift(t);
      })
      .addCase(adminThunks.updateNotificationTemplate.fulfilled, (state, action) => {
        const updated = action.payload.template || action.payload;
        const idx = state.notificationTemplates.findIndex((t) => t._id === updated._id);
        if (idx !== -1) state.notificationTemplates[idx] = updated;
      })
      .addCase(adminThunks.deleteNotificationTemplate.fulfilled, (state, action) => {
        state.notificationTemplates = state.notificationTemplates.filter((t) => t._id !== action.payload.id);
      });
  }
});

export const { 
  clearError, 
  setUserPage, 
  setCardPage, 
  setTemplatePage, 
  setAccessRequestPage 
} = adminSlice.actions;

export default adminSlice.reducer; 