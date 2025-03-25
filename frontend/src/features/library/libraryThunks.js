import { createAsyncThunk } from '@reduxjs/toolkit';

// Fetch saved cards with pagination
export const fetchSavedCards = createAsyncThunk(
  'library/fetchSavedCards',
  async ({ page = 1, limit = 10, search = '', category = '' }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/library?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch saved cards');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Save a card to library
export const saveCardToLibrary = createAsyncThunk(
  'library/saveCardToLibrary',
  async ({ cardId, notes = '', tags = [] }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/library', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ cardId, notes, tags }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save card to library');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Remove a card from library
export const removeFromLibrary = createAsyncThunk(
  'library/removeFromLibrary',
  async (cardId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/library/${cardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove card from library');
      }

      return cardId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update saved card (notes, tags)
export const updateSavedCard = createAsyncThunk(
  'library/updateSavedCard',
  async ({ cardId, notes, tags }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/library/${cardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ notes, tags }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update saved card');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Check if a card is saved
export const checkCardSaved = createAsyncThunk(
  'library/checkCardSaved',
  async (cardId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/library/${cardId}/check`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check card saved status');
      }

      const data = await response.json();
      return { cardId, isSaved: data.isSaved };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get library statistics
export const fetchLibraryStats = createAsyncThunk(
  'library/fetchLibraryStats',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/library/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch library stats');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
