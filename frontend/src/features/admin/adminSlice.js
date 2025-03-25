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
    analytics: {
      userGrowth: [],
      cardGrowth: [],
      engagement: {},
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
      // Delete User
      .addCase(adminThunks.deleteUser.fulfilled, (state, action) => {
        state.users.data = state.users.data.filter(user => user._id !== action.payload);
      })
      // Update User
      .addCase(adminThunks.updateUser.fulfilled, (state, action) => {
        const index = state.users.data.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users.data[index] = action.payload;
        }
      })
      // Toggle User Ban
      .addCase(adminThunks.toggleUserBan.fulfilled, (state, action) => {
        const index = state.users.data.findIndex(user => user._id === action.payload.userId);
        if (index !== -1) {
          state.users.data[index].isBanned = action.payload.isBanned;
        }
      })
      // Delete Card
      .addCase(adminThunks.deleteAdminCard.fulfilled, (state, action) => {
        state.cards.data = state.cards.data.filter(card => card._id !== action.payload);
      })
      // Update Card
      .addCase(adminThunks.updateAdminCard.fulfilled, (state, action) => {
        const index = state.cards.data.findIndex(card => card._id === action.payload._id);
        if (index !== -1) {
          state.cards.data[index] = action.payload;
        }
      })
      // Toggle Card Feature
      .addCase(adminThunks.toggleCardFeature.fulfilled, (state, action) => {
        const index = state.cards.data.findIndex(card => card._id === action.payload.cardId);
        if (index !== -1) {
          state.cards.data[index].isFeatured = action.payload.isFeatured;
        }
      })
      // Get Card Analytics
      .addCase(adminThunks.fetchCardAnalytics.pending, (state) => {
        // Don't set loading for analytics to avoid UI blocking
        state.error = null;
      })
      .addCase(adminThunks.fetchCardAnalytics.fulfilled, (state, action) => {
        // Store card analytics if needed
        const { cardId, analytics } = action.payload;
        // Implementation depends on how you want to handle card analytics
      })
      .addCase(adminThunks.fetchCardAnalytics.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { clearError, setUserPage, setCardPage } = adminSlice.actions;
export default adminSlice.reducer; 