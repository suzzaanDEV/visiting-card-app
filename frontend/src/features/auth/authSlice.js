import { createSlice } from '@reduxjs/toolkit';
import * as authThunks from './authThunks.js';
import { getStoredUser, getToken } from '../../utils/authStorage';

// Define the initial state for the authentication slice
const initialState = {
  user: null, // Holds user data { userId, username, email } upon successful authentication
  isAuthenticated: false, // Flag indicating if the user is currently authenticated
  isLoading: false, // Flag indicating if an authentication-related async operation (login, register, checkStatus) is in progress
  error: null, // Holds error message string from the last failed operation
  stats: null, // User statistics
  isInitialized: false, // Flag indicating if the initial auth check has been completed
};

const authSlice = createSlice({
  name: 'auth', // Name of the slice
  initialState, // Initial state defined above
  reducers: {
    // Synchronous action to clear any existing error message
    clearAuthError: (state) => {
      state.error = null;
    },
    // Synchronous action to update user profile data stored in the Redux state
    // Useful after a successful profile update API call elsewhere
    // Payload should be an object containing fields to update, e.g., { name: 'New Name', profilePicture: 'new_url.jpg' }
    updateUserProfileLocal: (state, action) => {
      // Only update if the user exists and payload is provided
      if (state.user && action.payload) {
        // Merge the existing user data with the new data from the payload
        state.user = { ...state.user, ...action.payload };
      }
    },
    setInitialized: (state) => {
      state.isInitialized = true;
      state.isLoading = false;
    },
    hydrateFromStorage: (state) => {
      const token = getToken();
      const user = getStoredUser();
      if (token && user) {
        state.user = user;
        state.isAuthenticated = true;
      }
    },
  },
  // Handle actions defined outside the slice (typically async thunks)
  extraReducers: (builder) => {
    builder
      // --- Login Thunk ---
      .addCase(authThunks.login.pending, (state) => {
        state.isLoading = true; // Set loading true when login starts
        state.error = null; // Clear previous errors
        state.isAuthenticated = false; // Assume not authenticated until success
        state.user = null; // Clear user data on new attempt
      })
      .addCase(authThunks.login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null; // Ensure error is null on success
        state.isInitialized = true; // Mark as initialized
      })
      .addCase(authThunks.login.rejected, (state, action) => {
        state.isLoading = false; // Set loading false on failure
        state.isAuthenticated = false; // Ensure not authenticated
        state.user = null; // Ensure no user data
        // Store the error message received from rejectWithValue
        state.error = action.payload || 'Login failed. Please try again.';
        state.isInitialized = true; // Mark as initialized
      })

      // --- Register Thunk ---
      .addCase(authThunks.register.pending, (state) => {
        state.isLoading = true; // Set loading true
        state.error = null; // Clear previous errors
        state.isAuthenticated = false; // Assume not authenticated until success
        state.user = null; // Clear user data on new attempt
      })
      .addCase(authThunks.register.fulfilled, (state, action) => {
        state.isLoading = false;
        // If server returned a user and tokens, registration completed and user is authenticated
        if (action.payload?.user) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
        } else {
          // Registration requires email verification; store pending email for prefill but do not authenticate
          state.isAuthenticated = false;
          state.user = action.payload?.user || { email: action.payload?.pendingEmail || null };
        }
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(authThunks.register.rejected, (state, action) => {
        state.isLoading = false; // Set loading false on failure
        state.isAuthenticated = false; // Ensure not authenticated
        state.user = null; // Ensure no user data
        // Store the error message
        state.error = action.payload || 'Registration failed. Please try again.';
        state.isInitialized = true; // Mark as initialized
      })

      // --- Logout Thunk ---
      .addCase(authThunks.logout.fulfilled, (state) => {
        state.isAuthenticated = false; // Set authenticated false
        state.user = null; // Clear user data
        state.isLoading = false; // Ensure loading is reset
        state.error = null; // Clear any previous errors
        state.stats = null; // Clear stats
        state.isInitialized = true; // Mark as initialized
      })

      // --- Check Auth Status Thunk ---
      .addCase(authThunks.checkAuthStatus.pending, (state) => {
        state.isLoading = true; // Set loading true during the check
        // Don't clear isAuthenticated or user here, wait for the result
        state.error = null;
      })
      .addCase(authThunks.checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false; // Set loading false
        // action.payload will be user object if valid, null otherwise
        state.isAuthenticated = !!action.payload; // Set authenticated based on whether user data was received
        state.user = action.payload; // Store user data or null
        state.error = null; // Clear error on successful check (even if not logged in)
        state.isInitialized = true; // Mark as initialized
      })
      .addCase(authThunks.checkAuthStatus.rejected, (state) => {
        state.isLoading = false; // Set loading false
        state.isAuthenticated = false; // Explicitly set to false on failure
        state.user = null; // Clear user data
        // Can optionally store the error, but often just means session invalid/expired
        // state.error = action.payload || 'Session check failed.';
        state.error = null; // Or keep error null as it's not a user-facing error usually
        state.isInitialized = true; // Mark as initialized
      })

      // --- Get User Profile Thunk ---
      .addCase(authThunks.getUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(authThunks.getUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(authThunks.getUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to get user profile';
      })

      // --- Update User Profile Thunk ---
      .addCase(authThunks.updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(authThunks.updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(authThunks.updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update user profile';
      })

      // --- Get User Stats Thunk ---
      .addCase(authThunks.getUserStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(authThunks.getUserStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(authThunks.getUserStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to get user stats';
      })

      // --- Email OTP ---
      .addCase(authThunks.requestEmailOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(authThunks.requestEmailOtp.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(authThunks.requestEmailOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to send verification code';
      })
      .addCase(authThunks.verifyEmailOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(authThunks.verifyEmailOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.user) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        } else if (state.user) {
          state.user.isEmailVerified = true;
        }
      })
      .addCase(authThunks.verifyEmailOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Verification failed';
      })

      // --- Password reset ---
      .addCase(authThunks.forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(authThunks.forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(authThunks.forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to send reset link';
      })
      .addCase(authThunks.resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(authThunks.resetPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(authThunks.resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to reset password';
      })

      // --- Change Password Thunk ---
      .addCase(authThunks.changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(authThunks.changePassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(authThunks.changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to change password';
      });
  },
});

// Export the synchronous actions generated by createSlice
export const { clearAuthError, updateUserProfileLocal, setInitialized, hydrateFromStorage } = authSlice.actions;

// Export the reducer function for the store configuration
export default authSlice.reducer;
