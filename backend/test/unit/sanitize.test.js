const { escapeRegex } = require('../../src/utils/sanitize');

describe('sanitize.escapeRegex', () => {
  test('escapes regex special characters', () => {
    expect(escapeRegex('hello.world')).toBe('hello\\.world');
    expect(escapeRegex('a+b*c?')).toBe('a\\+b\\*c\\?');
  });

  test('handles empty string', () => {
    expect(escapeRegex('')).toBe('');
  });
});
