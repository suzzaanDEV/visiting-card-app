const Settings = require('../models/settingsModel');
const logger = require('../utils/logger');

// Settings check cache to avoid a DB hit on every request (5s TTL)
const CACHE_TTL_MS = 5000;
const cache = { mode: false, checkedAt: 0, inflight: null };

const isMaintenanceMode = async () => {
  const now = Date.now();
  if (now - cache.checkedAt < CACHE_TTL_MS) return cache.mode;
  if (cache.inflight) {
    try { await cache.inflight; } catch { /* ignore */ }
    return cache.mode;
  }
  cache.inflight = Settings.findOne()
    .lean()
    .then((s) => { cache.mode = !!(s && s.system && s.system.maintenanceMode); })
    .catch((e) => { logger.warn(`Maintenance status check failed: ${e.message}`); cache.mode = false; })
    .finally(() => { cache.checkedAt = Date.now(); cache.inflight = null; });
  await cache.inflight;
  return cache.mode;
};

// Blocks the public API while system.maintenanceMode is enabled. Admin routes,
// health checks and read-only policy (legal) pages stay reachable so operators can
// toggle maintenance off and visitors can still read the privacy/terms pages.
const maintenanceMiddleware = async (req, res, next) => {
  if (process.env.NODE_ENV === 'test') return next();

  const path = req.path || req.originalUrl || '';
  if (path === '/health' || path.startsWith('/api/admin')) return next();
  if (req.method === 'GET' && path.startsWith('/api/policies')) return next();

  try {
    const on = await isMaintenanceMode();
    if (!on) return next();
    res.status(503).json({
      error: 'Maintenance mode is active',
      status: 503,
      maintenanceMode: true,
      message: 'We are currently performing scheduled maintenance. Please try again later.',
    });
  } catch (err) {
    // Never take the API down because the maintenance probe failed
    next();
  }
};

module.exports = maintenanceMiddleware;