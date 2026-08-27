import { API_BASE_URL } from './apiService';
import { clearAuth, getRefreshToken, getToken, normalizeUser, saveAuth } from '../utils/authStorage';

const authUrl = (path) => `${API_BASE_URL}/auth${path}`;

const authHeaders = (withJson = false) => {
  const token = getToken();
  return {
    ...(withJson && { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed (${response.status})`);
  }
  return data;
};

export const refreshSession = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  const data = await parseResponse(
    await fetch(authUrl('/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
  );

  const user = normalizeUser(data.user);
  saveAuth({ token: data.token, refreshToken: data.refreshToken, user });
  return user;
};

export const fetchCurrentUser = async () => {
  const token = getToken();
  if (!token) return null;

  let response = await fetch(authUrl('/check'), {
    headers: authHeaders(),
  });

  if (response.status === 401 && getRefreshToken()) {
    await refreshSession();
    response = await fetch(authUrl('/check'), {
      headers: authHeaders(),
    });
  }

  const data = await parseResponse(response);
  const user = normalizeUser(data.user);
  saveAuth({ token: getToken(), refreshToken: getRefreshToken(), user });
  return user;
};

export const clearSession = () => clearAuth();
