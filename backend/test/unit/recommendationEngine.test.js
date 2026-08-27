const {
  buildFeatureVector,
  cosineSimilarity,
  recommendCards,
} = require('../../src/algorithms/recommendationEngine');

describe('recommendationEngine', () => {
  const source = {
    _id: '1',
    jobTitle: 'Software Engineer',
    company: 'Acme Corp',
    location: 'Kathmandu',
    category: 'technology',
    bio: 'Building web apps',
  };

  const candidates = [
    { _id: '2', jobTitle: 'Software Engineer', company: 'Acme Corp', location: 'Kathmandu', category: 'technology' },
    { _id: '3', jobTitle: 'Chef', company: 'Food Co', location: 'Pokhara', category: 'food' },
    { _id: '4', jobTitle: 'Backend Developer', company: 'Acme Corp', location: 'Kathmandu', category: 'technology' },
  ];

  test('cosineSimilarity returns 1 for identical vectors', () => {
    const v = buildFeatureVector(source);
    expect(cosineSimilarity(v, v)).toBeCloseTo(1, 5);
  });

  test('recommendCards ranks similar cards higher', () => {
    const results = recommendCards(source, candidates, 2);
    expect(results).toHaveLength(2);
    expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
    expect(['2', '4']).toContain(String(results[0].card._id));
  });

  test('recommendCards excludes source card', () => {
    const results = recommendCards(source, [source, ...candidates], 5);
    expect(results.every((r) => String(r.card._id) !== '1')).toBe(true);
  });
});
