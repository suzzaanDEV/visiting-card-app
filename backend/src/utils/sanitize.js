/**
 * Escape special regex characters to prevent ReDoS / injection in MongoDB $regex.
 */
const escapeRegex = (value = '') =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = { escapeRegex };
