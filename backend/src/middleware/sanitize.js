const stripHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
};

const sanitizeValue = (val) => {
  if (typeof val === 'string') return stripHtml(val);
  if (Array.isArray(val)) return val.map(sanitizeValue);
  if (val && typeof val === 'object' && !(val instanceof Date) && !Buffer.isBuffer(val)) {
    const clean = {};
    for (const [k, v] of Object.entries(val)) {
      clean[k] = sanitizeValue(v);
    }
    return clean;
  }
  return val;
};

const sanitize = (req, res, next) => {
  // Don't sanitize file uploads or binary data
  if (req.is('multipart/form-data')) return next();

  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
};

module.exports = sanitize;
