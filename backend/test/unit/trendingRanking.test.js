const { rankTrendingCards, recencyBoost } = require('../../src/algorithms/trendingRanking');

describe('trendingRanking', () => {
  test('recencyBoost is higher for newer cards', () => {
    const now = new Date();
    const old = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    expect(recencyBoost(now)).toBeGreaterThan(recencyBoost(old));
  });

  test('rankTrendingCards orders by engagement', () => {
    const cards = [
      { _id: '1', views: 10, loveCount: 2, shareCount: 1, downloadCount: 0, createdAt: new Date() },
      { _id: '2', views: 1000, loveCount: 200, shareCount: 50, downloadCount: 10, createdAt: new Date() },
      { _id: '3', views: 50, loveCount: 5, shareCount: 2, downloadCount: 1, createdAt: new Date() },
    ];
    const ranked = rankTrendingCards(cards, {}, 3);
    expect(String(ranked[0].card._id)).toBe('2');
    expect(ranked[0].trendingScore).toBeGreaterThan(ranked[1].trendingScore);
  });
});
