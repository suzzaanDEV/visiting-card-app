import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../services/apiService';
import { fetchCurrentUser, refreshSession } from '../../services/authService';
import { clearAuth, getToken, normalizeUser, saveAuth } from '../../utils/authStorage';
import { getRateLimitMessage } from '../../services/rateLimitUtils';

const authUrl = (path) => `${API_BASE_URL}/auth${path}`;

const persistAuthResponse = (data) => {
  const user = normalizeUser(data.user);
  saveAuth({
    token: data.token,
    refreshToken: data.refreshToken,
    user,
  });
  return user;
};

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(authUrl('/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.error || 'Registration failed');
      }

      // If server issued tokens, persist them; otherwise treat as pending verification
      if (data.token) {
        const user = persistAuthResponse(data);
        return { user, devOtp: data.devOtp, otpMessage: data.otpMessage };
      }
      // Save pending email for prefill in verify flow
      if (data.user?.email) sessionStorage.setItem('pendingEmail', data.user.email);
      if (data.pendingId) sessionStorage.setItem('pendingId', data.pendingId);
      return { pendingEmail: data.user?.email || null, pendingId: data.pendingId || null, devOtp: data.devOtp, otpMessage: data.otpMessage };
    } catch (error) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const requestEmailOtp = createAsyncThunk(
  'auth/requestEmailOtp',
  async (payload, { rejectWithValue }) => {
    try {
      // payload can be a string email or an object { email, pendingId }
      let body = {};
      if (typeof payload === 'string') body = { email: payload };
      else body = payload || {};

      const response = await fetch(authUrl('/verify-email/request'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to send verification code');
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to send verification code');
    }
  }
);

export const verifyEmailOtp = createAsyncThunk(
  'auth/verifyEmailOtp',
  async ({ email, otp, userId }, { rejectWithValue }) => {
    try {
      const body = { otp };
      if (userId) body.userId = userId;
      else body.email = email;

      const response = await fetch(authUrl('/verify-email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.error || 'Invalid verification code');
      }

      const user = normalizeUser(data.user);
      // Persist tokens returned by server
      if (data.token) {
        saveAuth({ token: data.token, refreshToken: data.refreshToken, user });
      }
      return { message: data.message, user };
    } catch (error) {
      return rejectWithValue(error.message || 'Verification failed');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await fetch(authUrl('/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to send reset link');
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to send reset link');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const response = await fetch(authUrl('/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to reset password');
      }
      return data.message || 'Password reset successfully';
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to reset password');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(authUrl('/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.status === 429) {
        const message = await getRateLimitMessage(response);
        return rejectWithValue(message);
      }

      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.error || data.message || 'Login failed');
      }

      // If server requires two-factor authentication, return a special payload
      if (data.requiresOTP) {
        return { twoFactor: true, email, ...data };
      }

      return persistAuthResponse(data);
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const verifyTwoFactor = createAsyncThunk(
  'auth/verifyTwoFactor',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await fetch(authUrl('/verify-2fa'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.error || 'Two-factor verification failed');
      }

      return persistAuthResponse(data);
    } catch (error) {
      return rejectWithValue(error.message || 'Two-factor verification failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      const token = getToken();
      if (token) {
        await fetch(authUrl('/logout'), {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      clearAuth();
      return null;
    } catch {
      clearAuth();
      return null;
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const user = await fetchCurrentUser();
      if (!user) {
        clearAuth();
        return rejectWithValue('No token found');
      }
      return user;
    } catch (error) {
      try {
        const user = await refreshSession();
        return user;
      } catch {
        clearAuth();
        return rejectWithValue(error.message || 'Authentication check failed');
      }
    }
  }
);

export const getUserProfile = createAsyncThunk(
  'auth/getUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const user = await fetchCurrentUser();
      if (!user) {
        return rejectWithValue('No token found');
      }
      return user;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await fetch(authUrl('/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to update profile');
      }

      const user = normalizeUser(data.user);
      saveAuth({ token, user });
      return user;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  'auth/uploadAvatar',
  async (file, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No token found');
      }

      const form = new FormData();
      form.append('avatar', file);

      const response = await fetch(authUrl('/profile/avatar'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to upload avatar');
      }

      const user = normalizeUser(data.user);
      saveAuth({ token, user });
      return user;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to upload avatar');
    }
  }
);

export const removeAvatar = createAsyncThunk(
  'auth/removeAvatar',
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await fetch(authUrl('/profile/avatar'), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to remove avatar');
      }

      const user = normalizeUser(data.user);
      saveAuth({ token, user });
      return user;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to remove avatar');
    }
  }
);

export const getUserStats = createAsyncThunk(
  'auth/getUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await fetch(authUrl('/stats'), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        return rejectWithValue('Failed to get stats');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get stats');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await fetch(authUrl('/change-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to change password');
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to change password');
    }
  }
);
