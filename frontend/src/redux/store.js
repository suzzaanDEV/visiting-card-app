import { configureStore } from '@reduxjs/toolkit';

// Import reducers from feature slices
import authReducer from '../features/auth/authSlice.js';
import cardsReducer from '../features/cards/cardsSlice.js';
import libraryReducer from '../features/library/librarySlice.js';
import adminReducer from '../features/admin/adminSlice.js';

// Configure the Redux store
const store = configureStore({
  reducer: {
    // Combine all reducers here
    auth: authReducer,
    cards: cardsReducer, // Renamed from 'card' to 'cards' to match slice name convention
    library: libraryReducer,
    admin: adminReducer,
    // Add other reducers here if you create more slices
  },
  // Optional: Configure middleware (e.g., for logging, handling non-serializable data)
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware({
  //   serializableCheck: {
  //     // Ignore these action types, often needed for file uploads or complex objects
  //     ignoredActions: ['cards/create/fulfilled', 'cards/update/fulfilled', 'auth/register/fulfilled'],
  //     // Ignore these field paths in all actions
  //     ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
  //     // Ignore these paths in the state
  //     ignoredPaths: ['cards.currentCard.someNonSerializableField'],
  //   },
  // }),
  // Enable Redux DevTools extension in development
  devTools: process.env.NODE_ENV !== 'production',
});
export default store;

// Note: The export remains the same, but the internal configuration is updated.
// export default store; // Default export is less common for store, named export 'store' is standard.
