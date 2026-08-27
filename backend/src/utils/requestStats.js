const logger = require('./logger');

const SLOW_REQUEST_THRESHOLD_MS = 250;
const MAX_SAMPLES = 200;

const requestStats = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const samples = global.__apiLatencySamples || (global.__apiLatencySamples = []);
    samples.push(durationMs);
    if (samples.length > MAX_SAMPLES) samples.shift();

    if (durationMs > SLOW_REQUEST_THRESHOLD_MS) {
      logger.warn(`Slow request: ${req.method} ${req.originalUrl} took ${durationMs.toFixed(0)}ms`);
    }
  });

  next();
};

module.exports = requestStats;