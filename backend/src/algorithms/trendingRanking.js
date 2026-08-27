/**
 * Algorithm 3: Analytics Trending — Weighted Score Ranking
 * Use case: Popular Cards / Discover trending
 *
 * Score = w1*views + w2*loves + w3*shares + w4*recencyBoost
 * Time Complexity: O(n log n) for sort
 * Space Complexity: O(n)
 */

const DEFAULT_WEIGHTS = {
  views: 0.35,
  loves: 0.30,
  shares: 0.20,
  downloads: 0.10,
  recency: 0.05,
};

const normalize = (value, max) => (max > 0 ? value / max : 0);

const recencyBoost = (createdAt, halfLifeHours = 72) => {
  const ageMs = Date.now() - new Date(createdAt).getTime();
  const halfLifeMs = halfLifeHours * 60 * 60 * 1000;
  return Math.pow(0.5, ageMs / halfLifeMs);
};

/**
 * Rank cards by weighted engagement score.
 * @param {Array} cards - Card documents with views, loveCount, shareCount, downloadCount, createdAt
 * @param {Object} weights - Optional weight overrides
 * @param {number} limit - Result limit
 */
const rankTrendingCards = (cards, weights = {}, limit = 20) => {
  if (!cards?.length) return [];

  const w = { ...DEFAULT_WEIGHTS, ...weights };
  const maxViews = Math.max(...cards.map((c) => c.views || 0), 1);
  const maxLoves = Math.max(...cards.map((c) => c.loveCount || 0), 1);
  const maxShares = Math.max(...cards.map((c) => c.shares || 0), 1);
  const maxDownloads = Math.max(...cards.map((c) => c.downloads || 0), 1);

  const ranked = cards
    .map((card) => {
      const viewsN = normalize(card.views || 0, maxViews);
      const lovesN = normalize(card.loveCount || 0, maxLoves);
      const sharesN = normalize(card.shares || 0, maxShares);
      const downloadsN = normalize(card.downloads || 0, maxDownloads);
      const recencyN = recencyBoost(card.createdAt);

      const trendingScore =
        w.views * viewsN +
        w.loves * lovesN +
        w.shares * sharesN +
        w.downloads * downloadsN +
        w.recency * recencyN;

      return {
        card,
        trendingScore: Number(trendingScore.toFixed(6)),
        algorithm: 'weighted-trending',
        breakdown: { viewsN, lovesN, sharesN, downloadsN, recencyN },
      };
    })
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, limit);

  return ranked;
};

module.exports = {
  DEFAULT_WEIGHTS,
  recencyBoost,
  rankTrendingCards,
};
