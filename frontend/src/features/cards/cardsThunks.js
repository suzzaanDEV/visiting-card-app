import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../services/apiService';
import { getToken } from '../../utils/authStorage';
import { getRateLimitMessage } from '../../services/rateLimitUtils';

// Fetch user's cards with pagination
export const fetchUserCards = createAsyncThunk(
  'cards/fetchUserCards',
  async ({ page = 1 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/cards/my?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 429) {
        // Rate limit exceeded
        throw new Error(await getRateLimitMessage(response));
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
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/cards/public/view/${cardId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

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
      const token = getToken();
      const headers = {};

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/cards/c/${shortLink}`, {
        headers
      });

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
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch card suggestions (random popular public cards)
export const fetchSuggestions = createAsyncThunk(
  'cards/fetchSuggestions',
  async ({ limit = 6 } = {}, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/cards/suggestions?limit=${limit}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch suggestions');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch content-based card recommendations for a given cardId
export const fetchRecommendations = createAsyncThunk(
  'cards/fetchRecommendations',
  async ({ cardId, limit = 6 } = {}, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/search/recommendations/${cardId}?limit=${limit}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch recommendations');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Personalized discovery feed (public; uses the user's token when present so the
// backend ranks cards by their profile instead of showing the same trending list)
export const fetchDiscover = createAsyncThunk(
  'cards/fetchDiscover',
  async ({ page = 1, limit = 12, search, category, industry, location } = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      let url = `/api/cards/discover?page=${page}&limit=${limit}`;
      if (category) url += `&category=${encodeURIComponent(category)}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (industry) url += `&industry=${encodeURIComponent(industry)}`;
      if (location) url += `&location=${encodeURIComponent(location)}`;

      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to load discovery feed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
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

// Fetch popular public cards (sorted by views)
export const fetchPopularCards = createAsyncThunk(
  'cards/fetchPopular',
  async ({ limit = 8, page = 1 } = {}, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/cards/public?limit=${limit}&page=${page}&sortBy=views`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch popular cards');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch recent public cards (sorted by createdAt)
export const fetchRecentCards = createAsyncThunk(
  'cards/fetchRecent',
  async ({ limit = 8, page = 1 } = {}, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/cards/public?limit=${limit}&page=${page}&sortBy=createdAt`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch recent cards');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch featured public cards
export const fetchFeaturedCards = createAsyncThunk(
  'cards/fetchFeatured',
  async ({ limit = 4 } = {}, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/cards/public?limit=${limit}&sortBy=featured`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch featured cards');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch public cards for discovery
export const fetchPublicCards = createAsyncThunk(
  'cards/fetchPublicCards',
  async ({ page = 1, limit = 10, category, search, industry, location, privacy, sortBy } = {}, { rejectWithValue }) => {
    try {
      let url = `/api/cards/public?page=${page}&limit=${limit}`;

      if (category) url += `&category=${encodeURIComponent(category)}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (industry) url += `&industry=${encodeURIComponent(industry)}`;
      if (location) url += `&location=${encodeURIComponent(location)}`;
      if (privacy) url += `&privacy=${encodeURIComponent(privacy)}`;
      if (sortBy) url += `&sortBy=${encodeURIComponent(sortBy)}`;

      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch public cards');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);