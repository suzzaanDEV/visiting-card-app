const express = require('express');
const router = express.Router();
const broadcastService = require('../services/broadcastService');
const logger = require('../utils/logger');

// 1x1 transparent GIF
const PIXEL_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

const frontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173';

router.get('/broadcast/px/:broadcastId/:trackingId', async (req, res) => {
  const { broadcastId, trackingId } = req.params;
  try {
    await broadcastService.recordOpen(broadcastId, trackingId);
  } catch (err) {
    logger.warn('Open tracking failed', { broadcastId, trackingId, err: err.message });
  }
  res.set({
    'Content-Type': 'image/gif',
    'Content-Length': PIXEL_GIF.length,
    'Cache-Control': 'no-store, max-age=0',
    'Pragma': 'no-cache'
  });
  res.send(PIXEL_GIF);
});

router.get('/broadcast/click/:broadcastId/:trackingId', async (req, res) => {
  const { broadcastId, trackingId } = req.params;
  try {
    await broadcastService.recordClick(broadcastId, trackingId);
  } catch (err) {
    logger.warn('Click tracking failed', { broadcastId, trackingId, err: err.message });
  }

  let target = frontendUrl();
  try {
    const url = new URL(req.query.url);
    if (['http:', 'https:'].includes(url.protocol)) target = url.toString();
  } catch (err) {
    // Ignore invalid redirect targets; fall back to the frontend home.
  }
  res.redirect(302, target);
});

router.get('/broadcast/unsubscribe/:broadcastId/:trackingId', async (req, res) => {
  const { broadcastId, trackingId } = req.params;
  let already = false;
  try {
    const result = await broadcastService.unsubscribe(broadcastId, trackingId);
    already = result.alreadyUnsubscribed;
  } catch (err) {
    logger.warn('Unsubscribe failed', { broadcastId, trackingId, err: err.message });
    return res.status(404).send(
      '<!doctype html><html><head><meta charset="utf-8"><title>Unsubscribe</title></head>' +
      '<body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f8fafc;color:#0f172a;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">' +
      '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:40px;max-width:420px;text-align:center;">' +
      '<h2 style="margin:0 0 8px;">Link not recognised</h2>' +
      '<p style="color:#64748b;margin:0 0 20px;">This unsubscribe link is invalid or expired.</p>' +
      `<a href="${frontendUrl()}" style="color:#0d9488;font-weight:600;">Go to Cardly</a>` +
      '</div></body></html>'
    );
  }

  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(
    '<!doctype html><html><head><meta charset="utf-8"><title>Unsubscribed</title></head>' +
    '<body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f8fafc;color:#0f172a;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">' +
    '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:40px;max-width:420px;text-align:center;">' +
    `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#0d9488" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 16px;"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4Z"/></svg>` +
    '<h2 style="margin:0 0 8px;">You’re unsubscribed</h2>' +
    '<p style="color:#64748b;margin:0 0 24px;">' +
    (already
      ? 'You were already unsubscribed from Cardly broadcast emails.'
      : 'You will no longer receive broadcast emails from Cardly. You can always resubscribe from your notification settings.') +
    '</p>' +
    `<a href="${frontendUrl()}" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;font-weight:600;padding:10px 20px;border-radius:8px;">Back to Cardly</a>` +
    '</div></body></html>'
  );
});

module.exports = router;