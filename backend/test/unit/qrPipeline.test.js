const {
  parseScanTarget,
  clearCache,
} = require('../../src/algorithms/qrPipeline');

describe('qrPipeline', () => {
  beforeEach(() => clearCache());

  test('parseScanTarget detects cardId', () => {
    const id = '507f1f77bcf86cd799439011';
    expect(parseScanTarget(id)).toEqual({ type: 'cardId', value: id });
  });

  test('parseScanTarget detects shortLink', () => {
    expect(parseScanTarget('abc12')).toEqual({ type: 'shortLink', value: 'abc12' });
  });

  test('parseScanTarget detects url shortlink', () => {
    const result = parseScanTarget('http://localhost:5173/c/xyz789');
    expect(['url', 'shortLink']).toContain(result.type);
  });

  test('parseScanTarget invalid input', () => {
    expect(parseScanTarget('')).toEqual({ type: 'invalid' });
  });
});
