import { createAsyncThunk } from '@reduxjs/toolkit';

// Fetch user's cards with pagination
export const fetchUserCards = createAsyncThunk(
  'cards/fetchUserCards',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/cards/my?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 429) {
        // Rate limit exceeded
        const retryAfter = response.headers.get('retry-after') || '15 minutes';
        throw new Error(`Rate limit exceeded. Please wait ${retryAfter} before trying again.`);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch cards');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch public card by ID
export const fetchPublicCard = createAsyncThunk(
  'cards/fetchPublicCard',
  async (cardId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/cards/public/view/${cardId}`);
      
      if (!response.ok) {
        throw new Error('Card not found');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch card by ID with authentication
export const fetchCard = createAsyncThunk(
  'cards/fetchCard',
  async (cardId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/cards/${cardId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Card not found');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch card by short link
export const fetchCardByShortLink = createAsyncThunk(
  'cards/fetchCardByShortLink',
  async (shortLink, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/cards/c/${shortLink}`);
      
      if (!response.ok) {
        throw new Error('Card not found');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch all user's cards (without pagination)
export const fetchAllUserCards = createAsyncThunk(
  'cards/fetchAllUserCards',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cards/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create a new card
export const createCard = createAsyncThunk(
  'cards/createCard',
  async (cardData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(cardData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create card');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create card from template
export const createCardFromTemplate = createAsyncThunk(
  'cards/createCardFromTemplate',
  async (cardData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      // Create FormData if cardImage exists, otherwise send as JSON
      let body, headers;
      
      if (cardData.cardImage) {
        const formData = new FormData();
        Object.keys(cardData).forEach(key => {
          if (key === 'cardImage') {
            formData.append('cardImage', cardData.cardImage);
          } else {
            formData.append(key, cardData[key]);
          }
        });
        body = formData;
        headers = {
          'Authorization': `Bearer ${token}`,
        };
      } else {
        body = JSON.stringify(cardData);
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        };
      }
      
      const response = await fetch('/api/cards/from-template', {
        method: 'POST',
        headers,
        body,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create card from template');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update a card
export const updateCard = createAsyncThunk(
  'cards/updateCard',
  async ({ cardId, cardData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/cards/${cardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(cardData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update card');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete a card
export const deleteCard = createAsyncThunk(
  'cards/deleteCard',
  async (cardId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/cards/${cardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete card');
      }

      return cardId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Love/unlove a card
export const toggleCardLove = createAsyncThunk(
  'cards/toggleCardLove',
  async (cardId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/cards/${cardId}/love`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle love');
      }

      const data = await response.json();
      return { cardId, isLoved: data.isLoved };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Save/unsave a card
export const toggleCardSave = createAsyncThunk(
  'cards/toggleCardSave',
  async (cardId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/cards/${cardId}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle save');
      }

      const data = await response.json();
      return { cardId, isSaved: data.isSaved };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get user card stats
export const fetchUserCardStats = createAsyncThunk(
  'cards/fetchUserCardStats',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cards/my/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch card stats');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch card templates
export const fetchCardTemplates = createAsyncThunk(
  'cards/fetchCardTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/templates');

      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);