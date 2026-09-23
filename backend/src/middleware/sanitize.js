// Fields that legitimately carry rich HTML (admin broadcast email composer).
// These are NOT served on Cardly pages — they render inside email clients (no XSS surface).
const ALLOW_HTML_HINTS = ['emailHtml', 'emailHtmlBody', 'richContent'];

const stripHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
};

const sanitizeValue = (val, allowHtml = false) => {
  if (allowHtml) return val;
  if (typeof val === 'string') return stripHtml(val);
  if (Array.isArray(val)) return val.map((item) => sanitizeValue(item, allowHtml));
  if (val && typeof val === 'object' && !(val instanceof Date) && !Buffer.isBuffer(val)) {
    const clean = {};
    for (const [k, v] of Object.entries(val)) {
      clean[k] = sanitizeValue(v, ALLOW_HTML_HINTS.includes(k));
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
