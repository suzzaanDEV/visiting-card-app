import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidOtp, isStrongPassword } from './validation';

describe('validation', () => {
  it('validates email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('bad')).toBe(false);
  });

  it('validates OTP', () => {
    expect(isValidOtp('123456')).toBe(true);
    expect(isValidOtp('12345')).toBe(false);
  });

  it('validates password strength', () => {
    expect(isStrongPassword('password123')).toBe(true);
    expect(isStrongPassword('short')).toBe(false);
  });
});
