import { createSlice } from '@reduxjs/toolkit';
import * as cardsThunks from './cardsThunks.js';

const initialState = {
  // Holds the list of cards currently displayed (e.g., user's cards, public cards from search)
  cards: [],
  // Holds the details of the currently viewed/edited card
  currentCard: null,
  // Holds the available card templates
  templates: [],
  isLoading: false,
  error: null,
  // Note: Removed separate userCards, publicCards, qrCode states.
  // 'cards' array holds the list context.
  // 'currentCard' holds the full detail of one card, including its qrCode if fetched.
};

const cardsSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    // Action to manually clear errors
    clearCardError: (state) => {
      state.error = null;
    },
    // Action to manually set the current card (e.g., when navigating)
    // Might be useful, but fetching by ID is usually preferred.
    setCurrentCard: (state, action) => {
      state.currentCard = action.payload;
    },
    // Action to clear the list of cards (e.g., when logging out or changing views)
    clearCardList: (state) => {
        state.cards = [];
    },
    // Action to clear templates
    clearTemplates: (state) => {
        state.templates = [];
    }
  },
  extraReducers: (builder) => {
    // --- Fetch User's Cards (GET /api/cards/my) ---
    builder.addCase(cardsThunks.fetchUserCards.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(cardsThunks.fetchUserCards.fulfilled, (state, action) => {
      state.isLoading = false;
      state.cards = action.payload.cards || action.payload; // Handle both { cards: [...] } and [...] formats
    });
    builder.addCase(cardsThunks.fetchUserCards.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to fetch your cards';
    });

    // --- Fetch Public Card (GET /api/cards/public/view/:id) ---
    builder.addCase(cardsThunks.fetchPublicCard.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(cardsThunks.fetchPublicCard.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentCard = action.payload; // Store the full response
    });
    builder.addCase(cardsThunks.fetchPublicCard.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to fetch card';
      state.currentCard = null; // Clear current card on fetch error
    });

    // --- Fetch Card with Authentication (GET /api/cards/:id) ---
    builder.addCase(cardsThunks.fetchCard.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(cardsThunks.fetchCard.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentCard = action.payload.card || action.payload; // Handle both { card: {...} } and {...} formats
    });
    builder.addCase(cardsThunks.fetchCard.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to fetch card';
      state.currentCard = null; // Clear current card on fetch error
    });

    // --- Fetch Card by Short Link (GET /api/cards/c/:shortlink) --- 
    builder.addCase(cardsThunks.fetchCardByShortLink.pending, (state) => {
      state.isLoading = true;
      state.currentCard = null; // Clear previous card data
      state.error = null;       // Clear previous errors
    });
    builder.addCase(cardsThunks.fetchCardByShortLink.fulfilled, (state, action) => {
      state.isLoading = false;
      // Payload is { card: {...}, cardDesign: {...} }
      state.currentCard = action.payload; // Store the full response
      state.error = null;
    });
    builder.addCase(cardsThunks.fetchCardByShortLink.rejected, (state, action) => {
      state.isLoading = false;
      state.currentCard = null; // Clear card data on error
      state.error = action.payload || 'Failed to fetch card by short link';
    }); 

    // --- Create Card (POST /api/cards) ---
    builder.addCase(cardsThunks.createCard.pending, (state) => {
      state.isLoading = true; // Use this for form submission state
      state.error = null;
    });
    builder.addCase(cardsThunks.createCard.fulfilled, (state, action) => {
      // Payload is { card, cardDesign, qrCode }
      state.isLoading = false;
      // Add the core card data to the list (if the list currently shows user cards)
      // This assumes the 'cards' array might be showing the user's cards.
      // If it's showing search results, pushing might not be desired here.
      // Consider fetching user cards again or managing state more granularly if needed.
      if (action.payload.card) {
          state.cards.push(action.payload.card);
          // Set currentCard to the newly created card's core data
          // The full details including design/QR are in the payload if needed elsewhere,
          // but fetchPublicCard is the source of truth for the *full* currentCard state.
          state.currentCard = action.payload.card;
          // Or potentially combine:
          // state.currentCard = { ...action.payload.card, cardDesign: action.payload.cardDesign, qrCode: action.payload.qrCode };
      }
    });
    builder.addCase(cardsThunks.createCard.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to create card';
    });

    // --- Create Card from Template (POST /api/cards/from-template) ---
    builder.addCase(cardsThunks.createCardFromTemplate.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(cardsThunks.createCardFromTemplate.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload.card) {
          state.cards.push(action.payload.card);
          state.currentCard = action.payload.card;
      }
    });
    builder.addCase(cardsThunks.createCardFromTemplate.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to create card from template';
    });

    // --- Fetch Card Templates (GET /api/templates) ---
    builder.addCase(cardsThunks.fetchCardTemplates.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(cardsThunks.fetchCardTemplates.fulfilled, (state, action) => {
      state.isLoading = false;
      state.templates = action.payload;
    });
    builder.addCase(cardsThunks.fetchCardTemplates.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to fetch card templates';
    });

    // --- Update Card (PUT /api/cards/:id) ---
    builder.addCase(cardsThunks.updateCard.pending, (state) => {
      state.isLoading = true; // Use for form submission state
      state.error = null;
    });
    builder.addCase(cardsThunks.updateCard.fulfilled, (state, action) => {
      state.isLoading = false;
      // Payload is the full updated card object
      const updatedCard = action.payload;
      // Update the card in the main list if it exists there
      const index = state.cards.findIndex(card => card._id === updatedCard._id);
      if (index !== -1) {
        state.cards[index] = updatedCard; // Replace with updated data
      }
      // Update currentCard if the updated card is the one being viewed/edited
      if (state.currentCard && state.currentCard._id === updatedCard._id) {
        state.currentCard = updatedCard;
      }
    });
    builder.addCase(cardsThunks.updateCard.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to update card';
    });

    // --- Delete Card (DELETE /api/cards/:id) ---
    builder.addCase(cardsThunks.deleteCard.pending, (state) => {
      state.isLoading = true; // Can indicate loading state while deleting
      state.error = null;
    });
    builder.addCase(cardsThunks.deleteCard.fulfilled, (state, action) => {
      state.isLoading = false;
      const deletedCardId = action.payload; // Payload is the ID
      // Remove the card from the main list
      state.cards = state.cards.filter(card => card._id !== deletedCardId);
      // Clear currentCard if the deleted card was the one being viewed
      if (state.currentCard && state.currentCard._id === deletedCardId) {
        state.currentCard = null;
      }
    });
    builder.addCase(cardsThunks.deleteCard.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to delete card';
    });

    // --- Love/Unlove Card (POST /api/cards/:id/love) ---
    builder.addCase(cardsThunks.toggleCardLove.pending, (state) => {
      // Don't set loading for love actions to avoid UI blocking
      state.error = null;
    });
    builder.addCase(cardsThunks.toggleCardLove.fulfilled, (state, action) => {
      const { cardId, isLoved } = action.payload;
      // Update the card in the list if it exists
      const cardIndex = state.cards.findIndex(card => card._id === cardId);
      if (cardIndex !== -1) {
        state.cards[cardIndex].isLoved = isLoved;
        state.cards[cardIndex].loveCount = isLoved 
          ? (state.cards[cardIndex].loveCount || 0) + 1 
          : Math.max(0, (state.cards[cardIndex].loveCount || 0) - 1);
      }
      // Update currentCard if it's the same card
      if (state.currentCard && state.currentCard._id === cardId) {
        state.currentCard.isLoved = isLoved;
        state.currentCard.loveCount = isLoved 
          ? (state.currentCard.loveCount || 0) + 1 
          : Math.max(0, (state.currentCard.loveCount || 0) - 1);
      }
    });
    builder.addCase(cardsThunks.toggleCardLove.rejected, (state, action) => {
      state.error = action.payload || 'Failed to toggle love';
    });

    // --- Save/Unsave Card (POST /api/cards/:id/save) ---
    builder.addCase(cardsThunks.toggleCardSave.pending, (state) => {
      // Don't set loading for save actions to avoid UI blocking
      state.error = null;
    });
    builder.addCase(cardsThunks.toggleCardSave.fulfilled, (state, action) => {
      const { cardId, isSaved } = action.payload;
      // Update the card in the list if it exists
      const cardIndex = state.cards.findIndex(card => card._id === cardId);
      if (cardIndex !== -1) {
        state.cards[cardIndex].isSaved = isSaved;
      }
      // Update currentCard if it's the same card
      if (state.currentCard && state.currentCard._id === cardId) {
        state.currentCard.isSaved = isSaved;
      }
    });
    builder.addCase(cardsThunks.toggleCardSave.rejected, (state, action) => {
      state.error = action.payload || 'Failed to toggle save';
    });

    // --- Get User Card Stats (GET /api/cards/my/stats) ---
    builder.addCase(cardsThunks.fetchUserCardStats.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(cardsThunks.fetchUserCardStats.fulfilled, (state, action) => {
      state.isLoading = false;
      // Store stats in state if needed
      state.stats = action.payload;
    });
    builder.addCase(cardsThunks.fetchUserCardStats.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to fetch card stats';
    });
  },
});

export const { clearCardError, setCurrentCard, clearCardList, clearTemplates } = cardsSlice.actions;
export default cardsSlice.reducer;
