/**
 * Algorithm 4: QR Scan Optimization — Shortest Processing Pipeline
 * Minimizes steps from scan URL to card payload.
 *
 * Pipeline stages (optimized order):
 * 1. Parse identifier (shortLink vs cardId) — O(1)
 * 2. Cache lookup — O(1)
 * 3. Single indexed DB query — O(log n)
 * 4. Minimal field projection — O(1)
 * 5. QR generation (only if needed) — O(k)
 *
 * Total: O(log n) dominant
 */

const Card = require('../models/cardModel');
const qrCodeGenerator = require('./qrCodeGenerator');
const logger = require('../utils/logger');

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map();

const getCacheKey = (type, id) => `${type}:${id}`;

const getFromCache = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
};

const setCache = (key, value) => {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
};

const CARD_PROJECTION =
  'title fullName jobTitle company email phone website bio cardImage shortLink views loveCount isPublic privacySettings ownerUserId';

const parseScanTarget = (input) => {
  const trimmed = String(input || '').trim();
  if (!trimmed) return { type: 'invalid' };
  if (/^[a-f\d]{24}$/i.test(trimmed)) return { type: 'cardId', value: trimmed };
  if (trimmed.length <= 32) return { type: 'shortLink', value: trimmed };
  return { type: 'url', value: trimmed };
};

/**
 * Fast card resolution for QR scans — single query path with cache.
 */
const resolveCardFromScan = async (input) => {
  const parsed = parseScanTarget(input);
  if (parsed.type === 'invalid') {
    throw new Error('Invalid scan target');
  }

  const cacheKey = getCacheKey(parsed.type, parsed.value);
  const cached = getFromCache(cacheKey);
  if (cached) {
    logger.info(`QR pipeline cache hit: ${cacheKey}`);
    return { card: cached, fromCache: true, stages: ['parse', 'cache-hit'] };
  }

  let card = null;
  const stages = ['parse'];

  if (parsed.type === 'cardId') {
    card = await Card.findById(parsed.value).select(CARD_PROJECTION).lean();
    stages.push('db-by-id');
  } else if (parsed.type === 'shortLink') {
    card = await Card.findOne({ shortLink: parsed.value }).select(CARD_PROJECTION).lean();
    stages.push('db-by-shortlink');
  } else {
    const match = parsed.value.match(/\/c\/([^/?#]+)/);
    if (match) {
      card = await Card.findOne({ shortLink: match[1] }).select(CARD_PROJECTION).lean();
      stages.push('db-by-url-shortlink');
    }
  }

  if (!card) {
    throw new Error('Card not found');
  }

  setCache(cacheKey, card);
  stages.push('cache-store');
  return { card, fromCache: false, stages };
};

/**
 * Generate QR with minimal pipeline when card already resolved.
 */
const generateOptimizedQR = async (cardOrUrl, options = {}) => {
  const url =
    typeof cardOrUrl === 'string'
      ? cardOrUrl
      : `${process.env.FRONTEND_URL || 'http://localhost:5173'}/c/${cardOrUrl.shortLink}`;

  const stages = ['url-build'];
  const qrDataURL = await qrCodeGenerator.generate(url, {
    width: options.width || 256,
    margin: 1,
    errorCorrectionLevel: 'M',
    ...options,
  });
  stages.push('qr-render');

  return { qrDataURL, url, stages, algorithm: 'shortest-qr-pipeline' };
};

const clearCache = () => cache.clear();

module.exports = {
  parseScanTarget,
  resolveCardFromScan,
  generateOptimizedQR,
  clearCache,
  CACHE_TTL_MS,
};
