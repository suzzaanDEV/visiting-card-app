const { hashValue, generateOtp, generateResetToken } = require('../../src/utils/tokenUtils');

describe('tokenUtils', () => {
  test('hashValue is deterministic', () => {
    expect(hashValue('abc')).toBe(hashValue('abc'));
    expect(hashValue('abc')).not.toBe(hashValue('abcd'));
  });

  test('generateOtp returns 6-digit otp and hash', () => {
    const { otp, hash } = generateOtp();
    expect(otp).toMatch(/^\d{6}$/);
    expect(hash).toBe(hashValue(otp));
  });

  test('generateResetToken returns token and hash', () => {
    const { token, hash } = generateResetToken();
    expect(token.length).toBeGreaterThan(20);
    expect(hash).toBe(hashValue(token));
  });
});
