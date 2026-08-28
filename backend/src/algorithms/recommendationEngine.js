/**
 * Algorithm 2: Content-Based Card Recommendation
 * Technique: Cosine similarity on weighted feature vectors + field-level scoring
 * Use case: Suggested Connections / Discover
 *
 * Time Complexity: O(n * f) where n = cards, f = features
 * Space Complexity: O(n)
 */

const FIELD_WEIGHTS = {
  jobTitle: 3,
  company: 3,
  category: 2,
  city: 2,
  country: 1,
  industry: 2,
  profession: 2,
  skills: 2,
  services: 1,
  tags: 1,
  bio: 1,
};

const MATCH_SCORES = {
  sameProfession: 30,
  sameCategory: 20,
  sameCity: 20,
  sameCountry: 10,
  sameCompany: 12,
  sharedSkills: 15,
  sharedServices: 10,
  sharedTags: 8,
  popularityBonus: 5,
};

// Similarity "match %" is a percentage and must never exceed 100.
// The maximum reachable field-match component is the sum of every one-shot
// MATCH_SCORES entry (30+20+20+10+12) plus the full popularity bonus (5) = 97.
// Field-overlap bonuses (shared skills/services/tags) are unbounded, so the raw
// field score is clamped to this cap before being normalized to 0..1 — a card that
// matches every one-shot field therefore gets 100% field credit. Cosine similarity
// (0..1) is blended 50/50 with that normalized field credit, so the combined
// percentage is a true [0, 100] value and saturates at exactly 100 for
// essentially-identical cards.
const MAX_SIMILARITY_SCORE = 100;
const FIELD_SCORE_CAP = 97;
const COSINE_WEIGHT = 0.5;
const FIELD_WEIGHT = 0.5;

const tokenize = (text = '') =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);

const buildFeatureVector = (card) => {
  const tokens = [
    ...tokenize(card.jobTitle).flatMap((t) => Array(FIELD_WEIGHTS.jobTitle).fill(t)),
    ...tokenize(card.company).flatMap((t) => Array(FIELD_WEIGHTS.company).fill(t)),
    ...tokenize(card.category).flatMap((t) => Array(FIELD_WEIGHTS.category).fill(t)),
    ...tokenize(card.city).flatMap((t) => Array(FIELD_WEIGHTS.city).fill(t)),
    ...tokenize(card.country).flatMap((t) => Array(FIELD_WEIGHTS.country).fill(t)),
    ...tokenize(card.industry).flatMap((t) => Array(FIELD_WEIGHTS.industry).fill(t)),
    ...tokenize(card.profession).flatMap((t) => Array(FIELD_WEIGHTS.profession).fill(t)),
    ...(card.skills || []).flatMap((s) => tokenize(s).flatMap((t) => Array(FIELD_WEIGHTS.skills).fill(t))),
    ...(card.services || []).flatMap((s) => tokenize(s).flatMap((t) => Array(FIELD_WEIGHTS.services).fill(t))),
    ...(card.tags || []).flatMap((s) => tokenize(s).flatMap((t) => Array(FIELD_WEIGHTS.tags).fill(t))),
    ...tokenize(card.bio).flatMap((t) => Array(FIELD_WEIGHTS.bio).fill(t)),
  ];

  const vector = {};
  tokens.forEach((token) => {
    vector[token] = (vector[token] || 0) + 1;
  });
  return vector;
};

const cosineSimilarity = (vecA, vecB) => {
  const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dot = 0;
  let magA = 0;
  let magB = 0;

  keys.forEach((key) => {
    const a = vecA[key] || 0;
    const b = vecB[key] || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  });

  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

const normalizeString = (val = '') => String(val).toLowerCase().trim();

const fieldScore = (source, candidate, field) => {
  const a = normalizeString(source[field]);
  const b = normalizeString(candidate[field]);
  if (!a || !b) return 0;
  return a === b ? 1 : 0;
};

const arrayOverlapScore = (arrA = [], arrB = []) => {
  const setA = new Set(arrA.map(normalizeString).filter(Boolean));
  const setB = new Set(arrB.map(normalizeString).filter(Boolean));
  if (setA.size === 0 || setB.size === 0) return 0;
  let overlap = 0;
  for (const val of setA) {
    if (setB.has(val)) overlap++;
  }
  return overlap;
};

const computeFieldScore = (source, candidate) => {
  let score = 0;

  if (fieldScore(source, candidate, 'profession')) score += MATCH_SCORES.sameProfession;
  if (fieldScore(source, candidate, 'category')) score += MATCH_SCORES.sameCategory;
  if (fieldScore(source, candidate, 'city')) score += MATCH_SCORES.sameCity;
  if (fieldScore(source, candidate, 'country')) score += MATCH_SCORES.sameCountry;
  if (fieldScore(source, candidate, 'company')) score += MATCH_SCORES.sameCompany;

  score += arrayOverlapScore(source.skills, candidate.skills) * MATCH_SCORES.sharedSkills;
  score += arrayOverlapScore(source.services, candidate.services) * MATCH_SCORES.sharedServices;
  score += arrayOverlapScore(source.tags, candidate.tags) * MATCH_SCORES.sharedTags;

  const maxViews = Math.max(source.views || 0, candidate.views || 0, 1);
  const maxLoves = Math.max(source.loveCount || 0, candidate.loveCount || 0, 1);
  const popularityNorm = ((candidate.views || 0) / maxViews + (candidate.loveCount || 0) / maxLoves) / 2;
  score += popularityNorm * MATCH_SCORES.popularityBonus;

  return score;
};

/**
 * Recommend cards similar to a source card or user profile card.
 * @param {Object} sourceCard - Reference card for similarity
 * @param {Array} candidateCards - Pool of public cards
 * @param {number} limit - Max recommendations
 */
const recommendCards = (sourceCard, candidateCards, limit = 6) => {
  if (!sourceCard || !candidateCards?.length) {
    return [];
  }

  const sourceVector = buildFeatureVector(sourceCard);
  const sourceId = String(sourceCard._id || sourceCard.cardId);

  // Check if source card has enough data for meaningful recommendations
  const hasData = sourceCard.jobTitle || sourceCard.company || sourceCard.category ||
    (sourceCard.skills && sourceCard.skills.length > 0) ||
    (sourceCard.tags && sourceCard.tags.length > 0) ||
    sourceCard.city || sourceCard.profession;

  // Cold-start: if source card has no data, return trending public cards by popularity
  if (!hasData) {
    return candidateCards
      .filter((card) => String(card._id || card.cardId) !== sourceId)
      .sort((a, b) => ((b.views || 0) + (b.loveCount || 0)) - ((a.views || 0) + (a.loveCount || 0)))
      .slice(0, limit)
      .map((card) => ({ card, score: 0, algorithm: 'cold-start-trending' }));
  }

  const scored = candidateCards
    .filter((card) => String(card._id || card.cardId) !== sourceId)
    .map((card) => {
      const cosineSim = cosineSimilarity(sourceVector, buildFeatureVector(card));
      const fieldSc = Math.min(computeFieldScore(sourceCard, card), FIELD_SCORE_CAP);
      // Blend cosine similarity (0..1) with the normalized field-match credit (0..1)
      // on a 50/50 scale so the result is a true percentage bounded in [0, 100].
      const combinedScore =
        COSINE_WEIGHT * (cosineSim * MAX_SIMILARITY_SCORE) +
        FIELD_WEIGHT * ((fieldSc / FIELD_SCORE_CAP) * MAX_SIMILARITY_SCORE);
      return {
        card,
        score: Math.min(MAX_SIMILARITY_SCORE, Number(combinedScore.toFixed(2))),
        algorithm: 'content-based-hybrid',
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // Fallback: if cosine similarity yields 0 results, fall back to same-category cards sorted by views
  if (scored.length === 0 && sourceCard.category) {
    const categoryFallback = candidateCards
      .filter((card) => String(card._id || card.cardId) !== sourceId && normalizeString(card.category) === normalizeString(sourceCard.category))
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, limit)
      .map((card) => ({ card, score: 0.1, algorithm: 'category-fallback' }));

    return categoryFallback;
  }

  return scored;
};

module.exports = {
  FIELD_WEIGHTS,
  MATCH_SCORES,
  tokenize,
  buildFeatureVector,
  cosineSimilarity,
  recommendCards,
};
