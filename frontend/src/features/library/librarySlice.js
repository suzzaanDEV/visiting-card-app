import { createSlice } from '@reduxjs/toolkit';
import * as libraryThunks from './libraryThunks.js';

const initialState = {
  items: [], // Holds the array of library item objects
  isLoading: false,
  error: null,
  stats: null, // Library statistics
};

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    // Action to manually clear errors
    clearLibraryError: (state) => {
      state.error = null;
    },
    // Optional: Action to clear library on logout
    clearLibrary: (state) => {
        state.items = [];
        state.isLoading = false;
        state.error = null;
        state.stats = null;
    }
  },
  extraReducers: (builder) => {
    // --- Fetch saved cards ---
    builder.addCase(libraryThunks.fetchSavedCards.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(libraryThunks.fetchSavedCards.fulfilled, (state, action) => {
      state.isLoading = false;
      // Handle the correct response format from backend
      state.items = action.payload.savedCards || action.payload.cards || action.payload || [];
    });
    builder.addCase(libraryThunks.fetchSavedCards.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to fetch saved cards';
    });

    // --- Save card to library ---
    builder.addCase(libraryThunks.saveCardToLibrary.pending, (state) => {
      // Optionally set a specific loading state like state.isAdding = true
      state.isLoading = true; // General loading state
      state.error = null;
    });
    builder.addCase(libraryThunks.saveCardToLibrary.fulfilled, (state, action) => {
      state.isLoading = false;
      // Payload is the new library item object
      // Avoid duplicates if the item might already be added due to race conditions
      const exists = state.items.some(item => item._id === action.payload._id); // Assuming items have _id
      if (!exists) {
          state.items.push(action.payload);
      }
    });
    builder.addCase(libraryThunks.saveCardToLibrary.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to save card to library';
    });

    // --- Remove from library ---
    builder.addCase(libraryThunks.removeFromLibrary.pending, (state) => {
       // Optionally set a specific loading state like state.isRemoving = true
      state.isLoading = true; // General loading state
      state.error = null;
    });
    builder.addCase(libraryThunks.removeFromLibrary.fulfilled, (state, action) => {
      state.isLoading = false;
      const removedItemId = action.payload; // Payload is the ID of the removed library item
      // Filter out the item using its unique ID (_id is typical for MongoDB)
      state.items = state.items.filter(item => item._id !== removedItemId);
    });
    builder.addCase(libraryThunks.removeFromLibrary.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to remove item from library';
    });

    // --- Update saved card ---
    builder.addCase(libraryThunks.updateSavedCard.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(libraryThunks.updateSavedCard.fulfilled, (state, action) => {
      state.isLoading = false;
      const updatedCard = action.payload;
      // Update the card in the list if it exists
      const index = state.items.findIndex(item => item._id === updatedCard._id);
      if (index !== -1) {
        state.items[index] = updatedCard;
      }
    });
    builder.addCase(libraryThunks.updateSavedCard.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to update saved card';
    });

    // --- Check if card is saved ---
    builder.addCase(libraryThunks.checkCardSaved.pending, (state) => {
      // Don't set loading for check actions to avoid UI blocking
      state.error = null;
    });
    builder.addCase(libraryThunks.checkCardSaved.fulfilled, (state, action) => {
      // This might be used to update a card's saved status in the main cards list
      // Implementation depends on how you want to handle this
    });
    builder.addCase(libraryThunks.checkCardSaved.rejected, (state, action) => {
      state.error = action.payload || 'Failed to check card saved status';
    });

    // --- Get library statistics ---
    builder.addCase(libraryThunks.fetchLibraryStats.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(libraryThunks.fetchLibraryStats.fulfilled, (state, action) => {
      state.isLoading = false;
      state.stats = action.payload;
    });
    builder.addCase(libraryThunks.fetchLibraryStats.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to fetch library statistics';
    });
  },
});

// Export actions including the new clearLibrary if added
export const { clearLibraryError, clearLibrary } = librarySlice.actions;
export default librarySlice.reducer;
