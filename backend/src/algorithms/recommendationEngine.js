/**
 * Algorithm 2: Content-Based Card Recommendation
 * Technique: IDF-weighted cosine similarity on weighted feature vectors
 *             + field-level scoring
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
  sameCity: 10,
  sameCountry: 5,
  sameCompany: 12,
  sharedSkills: 15,
  sharedServices: 10,
  sharedTags: 8,
  popularityBonus: 5,
};

// Similarity "match %" is a percentage bounded to [0,100]. One-shot field
// matches (profession 30 + category 20 + company 12 + city 10 + country 5)
// total 77, plus the full popularity bonus (5) = 82. Field-overlap bonuses
// (shared skills/services/tags) are unbounded, so the raw field score is clamped
// to this cap and then normalized to 0..1 — a card matching every one-shot field
// gets 100% field credit. Cosine similarity (0..1) is blended 50/50 with the
// normalized field credit, so the combined percentage is a true [0,100] value and
// saturates at exactly 100 for essentially-identical cards.
//
// Career signals (profession/category/company/skills) intentionally outweigh
// geography (city/country): two doctors in the same city are more alike than a
// designer and a cardiologist who happen to share a city. Shared location still
// contributes, but only mildly, and the IDF-weighting below prevents a shared
// country or city from dominating the cosine term.
const MAX_SIMILARITY_SCORE = 100;
const FIELD_SCORE_CAP = 82;
const COSINE_WEIGHT = 0.5;
const FIELD_WEIGHT = 0.5;

// High-frequency function words that carry no topical signal. Exact whole-token
// matches only ("and" never strips "brand"). Kept small on purpose; everything
// else is dimmed by IDF below instead of hard-blocked.
const STOPWORDS = new Set([
  'a', 'about', 'also', 'am', 'an', 'and', 'are', 'as', 'at', 'be', 'but',
  'by', 'can', 'do', 'does', 'doing', 'for', 'from', 'had', 'has', 'have',
  'he', 'her', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its',
  'just', 'me', 'my', 'no', 'not', 'of', 'on', 'or', 'our', 'out', 'so',
  'such', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these',
  'they', 'this', 'to', 'too', 'up', 'us', 'very', 'was', 'we', 'were',
  'what', 'when', 'where', 'which', 'who', 'will', 'with', 'you', 'your',
]);

const tokenize = (text = '') =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));

const buildFeatureVector = (card, idfMap) => {
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
    // IDF weighting: rare, topical tokens (e.g. "figma", "cardiologist") are
    // amplified; tokens shared by nearly every card (e.g. "nepal", "design")
    // are pushed toward weight 1 and no longer inflate cosine similarity.
    const weight = (idfMap && idfMap[token]) || 1;
    vector[token] = (vector[token] || 0) + weight;
  });
  return vector;
};

/**
 * Build an IDF (inverse document frequency) map over a corpus of cards so that
 * rare tokens outweigh ubiquitous ones when computing cosine similarity.
 * @param {Array} cards - source card + candidate pool (tokens already stopword-filtered)
 * @returns {Object} token -> idf weight in [1, log(N)+1]
 */
const computeIdf = (cards) => {
  const n = cards.length;
  const df = {};
  cards.forEach((card) => {
    Object.keys(buildFeatureVector(card)).forEach((token) => {
      df[token] = (df[token] || 0) + 1;
    });
  });
  const idf = {};
  Object.keys(df).forEach((token) => {
    idf[token] = Math.log((n + 1) / (df[token] + 1)) + 1;
  });
  return idf;
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

// Tags that appear in the vast majority of cards (e.g. "nepal" on a Nepali
// network) discriminate nothing — two random Nepali cards would be "tagged"
// similar. Any tag shared by >= NOISE_TAG_MIN_SHARE of the corpus is dropped
// from every card before feature vectors, IDF and field scores are computed.
const NOISE_TAG_MIN_SHARE = 0.35;

const dropNoiseTags = (cards) => {
  if (!cards.length) return cards;
  const tagDf = {};
  cards.forEach((card) => {
    new Set((card.tags || []).map(normalizeString).filter(Boolean)).forEach((tag) => {
      tagDf[tag] = (tagDf[tag] || 0) + 1;
    });
  });
  const noiseTags = new Set(
    Object.keys(tagDf).filter((tag) => tagDf[tag] / cards.length >= NOISE_TAG_MIN_SHARE)
  );
  if (!noiseTags.size) return cards;
  return cards.map((card) => ({
    ...card,
    tags: (card.tags || []).filter((tag) => !noiseTags.has(normalizeString(tag))),
  }));
};

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

  // Drop corpus-wide noise tags first ("nepal"-style) so tags contribute real
  // signal, then build IDF over the cleaned corpus.
  const [cleanSource, ...cleanCandidates] = dropNoiseTags([sourceCard, ...candidateCards]);
  const idf = computeIdf([cleanSource, ...cleanCandidates]);
  const sourceVector = buildFeatureVector(cleanSource, idf);
  const sourceId = String(sourceCard._id || sourceCard.cardId);

  // Check if source card has enough data for meaningful recommendations
  const hasData = cleanSource.jobTitle || cleanSource.company || cleanSource.category ||
    (cleanSource.skills && cleanSource.skills.length > 0) ||
    (cleanSource.tags && cleanSource.tags.length > 0) ||
    cleanSource.city || cleanSource.profession;

  // Cold-start: if source card has no data, return trending public cards by popularity
  if (!hasData) {
    return candidateCards
      .filter((card) => String(card._id || card.cardId) !== sourceId)
      .sort((a, b) => ((b.views || 0) + (b.loveCount || 0)) - ((a.views || 0) + (a.loveCount || 0)))
      .slice(0, limit)
      .map((card) => ({ card, score: 0, algorithm: 'cold-start-trending' }));
  }

  const scored = cleanCandidates
    .filter((card) => String(card._id || card.cardId) !== sourceId)
    .map((card) => {
      const cosineSim = cosineSimilarity(sourceVector, buildFeatureVector(card, idf));
      const fieldSc = Math.min(computeFieldScore(cleanSource, card), FIELD_SCORE_CAP);
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
  if (scored.length === 0 && cleanSource.category) {
    const categoryFallback = candidateCards
      .filter((card) => String(card._id || card.cardId) !== sourceId && normalizeString(card.category) === normalizeString(cleanSource.category))
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
  computeIdf,
  dropNoiseTags,
  cosineSimilarity,
  recommendCards,
};
