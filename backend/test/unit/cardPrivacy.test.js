const { getOwnerId, isPrivateCard, sanitizePrivateCard } = require('../../src/utils/cardPrivacy');

describe('cardPrivacy', () => {
  test('getOwnerId handles populated and raw ids', () => {
    expect(getOwnerId('abc123')).toBe('abc123');
    expect(getOwnerId({ _id: 'abc123' })).toBe('abc123');
  });

  test('isPrivateCard detects privacy flag', () => {
    expect(isPrivateCard({ privacy: 'private' })).toBe(true);
    expect(isPrivateCard({ isPrivate: true })).toBe(true);
    expect(isPrivateCard({ privacy: 'public' })).toBe(false);
  });

  test('sanitizePrivateCard masks contact fields', () => {
    const sanitized = sanitizePrivateCard({
      email: 'jane@example.com',
      phone: '1234567890',
      website: 'https://jane.dev',
      address: '42 Secret Lane',
      socialLinks: { linkedin: 'https://linkedin.com/in/jane' },
    });

    expect(sanitized.email).not.toBe('jane@example.com');
    expect(sanitized.email).toContain('*');
    expect(sanitized.phone).toMatch(/\*\*\*/);
    expect(sanitized.website).toContain('Hidden');
    expect(sanitized.address).toContain('hidden');
    expect(sanitized.contactLocked).toBe(true);
    expect(sanitized.socialLinks).toEqual({});
  });
});
