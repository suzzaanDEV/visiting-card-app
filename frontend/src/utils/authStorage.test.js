import { describe, it, expect, beforeEach } from 'vitest';
import { saveAuth, getToken, getStoredUser, clearAuth, normalizeUser } from './authStorage';

describe('authStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and retrieves auth data', () => {
    const user = { userId: '1', email: 'a@b.com', username: 'ab' };
    saveAuth({ token: 'tok', refreshToken: 'ref', user });
    expect(getToken()).toBe('tok');
    expect(getStoredUser().email).toBe('a@b.com');
  });

  it('clears auth data', () => {
    saveAuth({ token: 'tok', user: { userId: '1' } });
    clearAuth();
    expect(getToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
  });

  it('normalizes user shape', () => {
    const user = normalizeUser({ _id: 'abc', email: 'x@y.com', isEmailVerified: 1, twoFactorEnabled: true });
    expect(user.userId).toBe('abc');
    expect(user.isEmailVerified).toBe(true);
    expect(user.twoFactorEnabled).toBe(true);
  });
});
