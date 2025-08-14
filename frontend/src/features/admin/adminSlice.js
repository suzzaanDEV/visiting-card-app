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
        state.users.total = action.payload.total || action.payload.length;
      })
      .addCase(adminThunks.fetchUsers.rejected, (state, action) => {
        state.users.loading = false;
        state.users.error = action.payload;
      })
      
      // Ban User
      .addCase(adminThunks.banUser.fulfilled, (state, action) => {
        const index = state.users.data.findIndex(user => user._id === action.payload.userId);
        if (index !== -1) {
          state.users.data[index].isBanned = action.payload.isBanned;
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
        state.cards.total = action.payload.total || action.payload.length;
      })
      .addCase(adminThunks.fetchAdminCards.rejected, (state, action) => {
        state.cards.loading = false;
        state.cards.error = action.payload;
      })
      
      // Feature Card
      .addCase(adminThunks.featureCard.fulfilled, (state, action) => {
        const index = state.cards.data.findIndex(card => card._id === action.payload.cardId);
        if (index !== -1) {
          state.cards.data[index].isFeatured = action.payload.isFeatured;
        }
      })
      
      // Delete Card
      .addCase(adminThunks.deleteCard.fulfilled, (state, action) => {
        state.cards.data = state.cards.data.filter(card => card._id !== action.payload.cardId);
      })
      
      // Get Card Analytics
      .addCase(adminThunks.getCardAnalytics.fulfilled, (state, action) => {
        // Store card analytics if needed
        const { cardId, analytics } = action.payload;
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
        state.templates.total = action.payload.total || action.payload.length;
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
        state.analytics.loading = false;
        state.analytics = action.payload;
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
        state.accessRequests.total = action.payload.total || action.payload.length;
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