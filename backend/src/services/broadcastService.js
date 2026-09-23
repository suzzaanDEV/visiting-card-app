const Broadcast = require('../models/broadcastModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const AuditLog = require('../models/auditLogModel');
const mongoose = require('mongoose');
const pushService = require('../utils/pushNotification');
const { sendEmail } = require('../utils/emailService');
const { renderBroadcast, renderBroadcastEmail } = require('../utils/emailTemplates');
const logger = require('../utils/logger');
const crypto = require('crypto');

const BATCH_SIZE = 50;
const BATCH_THROTTLE_MS = 400;
const MAX_RECIPIENT_ROWS = 2000;
const STALE_SENDING_MS = 15 * 60 * 1000;
const VALID_STATUSES = ['draft', 'scheduled', 'sending', 'sent', 'partially_sent', 'failed', 'cancelled'];
const NON_TERMINAL = ['draft', 'scheduled', 'failed'];
const ALLOWED_FILTER_KEYS = ['profession', 'city', 'country', 'hasCards'];
const STATUS_LABELS = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  sending: 'Sending',
  sent: 'Sent',
  partially_sent: 'Partially sent',
  failed: 'Failed',
  cancelled: 'Cancelled'
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomTrackingId = () => crypto.randomUUID();
const isDefined = (v) => v !== undefined && v !== null && v !== '';

// ─── Input normalization & validation ──────────────────────────────────────

function normalizeAudienceField(audience) {
  if (typeof audience === 'string') return audience;
  if (audience && typeof audience === 'object') return audience.type || 'all';
  return 'all';
}

function normalizeAudienceFilters(audience) {
  if (!(audience && typeof audience === 'object') || audience.type !== 'segment') return {};
  const raw = audience.filters || {};
  const filters = {};
  for (const key of ALLOWED_FILTER_KEYS) {
    if (isDefined(raw[key])) filters[key] = raw[key];
  }
  return filters;
}

function normalizeChannels(channels) {
  const c = { inApp: false, push: false, email: false };
  if (channels && typeof channels === 'object' && !Array.isArray(channels)) {
    c.inApp = Boolean(channels.inApp);
    c.push = Boolean(channels.push);
    c.email = Boolean(channels.email);
  } else if (Array.isArray(channels)) {
    for (const ch of channels) if (ch in c) c[ch] = true;
  }
  if (!c.inApp && !c.push && !c.email) c.inApp = true;
  return c;
}

function assertHttpUrl(value, field) {
  if (!isDefined(value)) return value;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    return value;
  } catch (err) {
    throw new Error(`${field} must be a valid http(s) URL`);
  }
}

function normalizeBroadcastInput(data = {}) {
  const title = typeof data.title === 'string' ? data.title.trim() : '';
  const message = typeof data.message === 'string' ? data.message.trim() : '';
  const notificationType = data.notificationType || 'announcement';
  const priority = data.priority || 'normal';

  if (!title) throw new Error('Title is required');
  if (title.length > 200) throw new Error('Title must be 200 characters or fewer');
  if (!message) throw new Error('Message is required');
  if (message.length > 5000) throw new Error('Message must be 5000 characters or fewer');
  if (!['announcement', 'update', 'marketing', 'security', 'card_activity'].includes(notificationType)) {
    throw new Error('Invalid notification type');
  }
  if (!['low', 'normal', 'high', 'urgent'].includes(priority)) throw new Error('Invalid priority');

  const channels = normalizeChannels(data.channels);
  const audience = normalizeAudienceField(data.audience);
  if (!['all', 'active', 'inactive', 'new', 'verified', 'segment', 'specific'].includes(audience)) {
    throw new Error('Invalid audience type');
  }

  const ctaUrl = assertHttpUrl(data.ctaUrl, 'CTA URL');
  const imageUrl = assertHttpUrl(data.imageUrl, 'Image URL');

  // Legacy frontend form sends `emailHtmlBody`; backend stores it as `emailHtml`.
  const emailHtml = data.emailHtml || data.emailHtmlBody;

  const specificUserIds =
    audience === 'specific' && Array.isArray(data.specificUserIds) && data.specificUserIds.length
      ? data.specificUserIds
      : [];

  return {
    title,
    message,
    richContent: isDefined(data.richContent) ? data.richContent : undefined,
    imageUrl,
    ctaText: isDefined(data.ctaText) ? data.ctaText : undefined,
    ctaUrl,
    notificationType,
    channels,
    audience,
    audienceFilters: normalizeAudienceFilters(data.audience),
    specificUserIds,
    priority,
    emailSubject: isDefined(data.emailSubject) ? String(data.emailSubject).trim().slice(0, 200) : undefined,
    emailHtml: isDefined(emailHtml) ? String(emailHtml) : undefined,
    pushTitle: isDefined(data.pushTitle) ? String(data.pushTitle).trim().slice(0, 120) : undefined,
    pushBody: isDefined(data.pushBody) ? String(data.pushBody).trim().slice(0, 500) : undefined
  };
}

// ─── Audit ─────────────────────────────────────────────────────────────────

async function addAudit(adminId, event, broadcastId, details = {}) {
  if (!adminId) return;
  try {
    await AuditLog.log({
      action: 'notification.send',
      entityType: 'notification',
      entityId: broadcastId,
      adminId,
      metadata: { event, ...details },
      severity: 'info',
      success: true
    });
  } catch (err) {
    logger.error('Failed to write broadcast audit log', { err: err.message });
  }
}

// ─── Audience resolution ───────────────────────────────────────────────────

async function resolveAudience(broadcast) {
  const { audience, audienceFilters, specificUserIds } = broadcast;

  const base = { isActive: true, deletedAt: null };
  const select = '_id email emailVerified name pushSubscriptions broadcastEmailUnsubscribed';

  const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  switch (audience) {
    case 'all':
      return User.find(base).select(select).lean();
    case 'active':
      return User.find({ ...base, lastLoginAt: { $gte: daysAgo(30) } }).select(select).lean();
    case 'inactive':
      return User.find({ ...base, $or: [{ lastLoginAt: { $lt: daysAgo(30) } }, { lastLoginAt: null }] }).select(select).lean();
    case 'new':
      return User.find({ ...base, createdAt: { $gte: daysAgo(7) } }).select(select).lean();
    case 'verified':
      return User.find({ ...base, isEmailVerified: true }).select(select).lean();
    case 'segment': {
      const query = { ...base };
      if (audienceFilters.profession) query.profession = audienceFilters.profession;
      if (audienceFilters.city) query.location = audienceFilters.city;
      else if (audienceFilters.country) query.location = audienceFilters.country;
      if (isDefined(audienceFilters.hasCards)) {
        const Card = require('../models/cardModel');
        const cardOwners = await Card.distinct('ownerUserId', { isActive: true });
        query._id = audienceFilters.hasCards === true || audienceFilters.hasCards === 'true'
          ? { $in: cardOwners }
          : { $nin: cardOwners };
      }
      return User.find(query).select(select).lean();
    }
    case 'specific': {
      const ids = [...new Set((specificUserIds || []).map((id) => String(id)))]
        .filter((id) => mongoose.Types.ObjectId.isValid(id));
      if (!ids.length) throw new Error('specificUserIds must contain at least one valid user id');
      return User.find({ ...base, _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) } }).select(select).lean();
    }
    default:
      throw new Error('Invalid audience type');
  }
}

// ─── CRUD ──────────────────────────────────────────────────────────────────

async function createBroadcast({ data, adminId, reqIp }) {
  const clean = normalizeBroadcastInput(data);
  const broadcast = new Broadcast({ ...clean, status: 'draft', createdBy: adminId });

  // Always render a base preview template when email is enabled.
  if (broadcast.channels.email && !broadcast.emailHtml) {
    broadcast.emailHtml = renderBroadcast({
      title: broadcast.title,
      message: broadcast.message,
      imageUrl: broadcast.imageUrl,
      ctaText: broadcast.ctaText,
      ctaUrl: broadcast.ctaUrl
    });
  }

  await broadcast.save();
  await addAudit(adminId, 'created', broadcast._id, { title: broadcast.title }, reqIp);

  return { broadcast };
}

async function updateBroadcast({ id, data, adminId, reqIp }) {
  const broadcast = await Broadcast.findById(id);
  if (!broadcast) throw new Error('Broadcast not found', { cause: 404 });
  if (['sending', 'sent', 'partially_sent', 'cancelled'].includes(broadcast.status)) {
    throw new Error(`Broadcasts with status "${broadcast.status}" cannot be edited`);
  }

  const clean = normalizeBroadcastInput(data);
  const updates = { ...clean };
  if (updates.channels.email && !updates.emailHtml) {
    updates.emailHtml = renderBroadcast(updates);
  }

  Object.assign(broadcast, updates, { status: 'draft' });
  await broadcast.save();
  await addAudit(adminId, 'updated', broadcast._id, { title: broadcast.title }, reqIp);

  return { broadcast };
}

async function deleteBroadcast({ id, adminId, reqIp }) {
  const broadcast = await Broadcast.findById(id);
  if (!broadcast) throw new Error('Broadcast not found', { cause: 404 });
  if (broadcast.status === 'sending') throw new Error('A broadcast that is currently sending cannot be deleted');
  await Broadcast.deleteOne({ _id: broadcast._id });
  await addAudit(adminId, 'deleted', id, { title: broadcast.title }, reqIp);
  return { success: true, id };
}

async function scheduleBroadcast({ id, scheduledAt, adminId, reqIp }) {
  const at = new Date(scheduledAt);
  if (Number.isNaN(at.getTime())) throw new Error('scheduledAt must be a valid date');
  if (at.getTime() <= Date.now()) throw new Error('scheduledAt must be in the future');

  const broadcast = await Broadcast.findById(id);
  if (!broadcast) throw new Error('Broadcast not found', { cause: 404 });
  if (['sending', 'sent', 'partially_sent'].includes(broadcast.status)) {
    throw new Error(`A broadcast with status "${broadcast.status}" cannot be scheduled`);
  }

  broadcast.scheduledAt = at;
  broadcast.status = 'scheduled';
  broadcast.deliveryCompletedAt = undefined;
  broadcast.lastError = undefined;
  await broadcast.save();
  await addAudit(adminId, 'scheduled', broadcast._id, { title: broadcast.title, scheduledAt: at.toISOString() }, reqIp);

  return { broadcast };
}

async function cancelBroadcast({ id, adminId, reqIp }) {
  const broadcast = await Broadcast.findById(id);
  if (!broadcast) throw new Error('Broadcast not found', { cause: 404 });
  if (['sent', 'partially_sent', 'cancelled'].includes(broadcast.status)) {
    throw new Error(`A broadcast with status "${broadcast.status}" cannot be cancelled`);
  }
  broadcast.status = 'cancelled';
  if (broadcast.deliveryStartedAt) broadcast.deliveryCompletedAt = broadcast.deliveryCompletedAt || new Date();
  await broadcast.save();
  await addAudit(adminId, 'cancelled', broadcast._id, { title: broadcast.title }, reqIp);

  return { broadcast };
}

// ─── Sending & background delivery ─────────────────────────────────────────

async function sendBroadcast({ id, adminId, reqIp, awaitDelivery = false }) {
  // Atomic claim: only one worker can pick this up (single-writer guarantee).
  const claimed = await Broadcast.findOneAndUpdate(
    { _id: id, status: { $in: ['draft', 'scheduled', 'failed'] } },
    { $set: { status: 'sending', deliveryStartedAt: new Date() } },
    { new: true }
  );
  if (!claimed) throw new Error('Broadcast not found or already in progress');

  const audience = await resolveAudience(claimed);
  claimed.deliveryStats = { total: audience.length, sent: 0, delivered: 0, failed: 0, opened: 0, clicked: 0 };
  claimed.sentByChannels = { inApp: 0, push: 0, email: 0 };
  claimed.unsubscribeCount = 0;
  claimed.lastError = undefined;
  claimed.recipients = [];
  claimed.deliveryCompletedAt = undefined;
  claimed.sentAt = new Date();
  await claimed.save();

  await addAudit(adminId, 'send_started', claimed._id, { title: claimed.title, recipients: audience.length }, reqIp);

  if (audience.length === 0) {
    await finishDelivery(claimed._id, 'failed', 'No recipients matched the audience criteria.');
    return { broadcast: await Broadcast.findById(claimed._id), queued: true, recipients: 0 };
  }

  if (awaitDelivery) {
    await deliverInBackground(claimed._id, audience);
  } else {
    setImmediate(() => {
      deliverInBackground(claimed._id, audience).catch((err) => {
        logger.error('Background broadcast delivery failed', { broadcastId: String(claimed._id), err: err.message });
      });
    });
  }

  const broadcast = await Broadcast.findById(claimed._id);
  return { broadcast, queued: true, recipients: audience.length };
}

async function finishDelivery(broadcastId, status, lastError) {
  const broadcast = await Broadcast.findById(broadcastId);
  if (!broadcast || broadcast.status === 'cancelled') return;
  broadcast.status = status;
  broadcast.lastError = lastError || undefined;
  broadcast.deliveryCompletedAt = new Date();
  await broadcast.save();
}

async function deliverInBackground(broadcastId, audience) {
  const broadcast = await Broadcast.findById(broadcastId).lean();
  if (!broadcast || broadcast.status !== 'sending') return;
  const content = {
    title: broadcast.title,
    message: broadcast.message,
    imageUrl: broadcast.imageUrl,
    ctaText: broadcast.ctaText,
    ctaUrl: broadcast.ctaUrl
  };

  let offset = 0;
  while (offset < audience.length) {
    const live = await Broadcast.findById(broadcastId).lean();
    if (!live || live.status === 'cancelled' || live.status !== 'sending') return;

    const chunk = audience.slice(offset, offset + BATCH_SIZE);
    await deliverChunk(broadcastId, broadcast.channels, chunk, content);
    offset += chunk.length;
    if (offset < audience.length) await sleep(BATCH_THROTTLE_MS);
  }

  const final = await Broadcast.findById(broadcastId).lean();
  if (!final || final.status !== 'sending') return;
  const { delivered, failed } = final.deliveryStats;
  const status = failed === 0 ? 'sent' : delivered > 0 ? 'partially_sent' : 'failed';
  await finishDelivery(broadcastId, status, status === 'failed' ? 'All recipients failed to receive the broadcast' : undefined);
}

async function deliverChunk(broadcastId, channels, chunk, content) {
  const rows = [];
  let sentCount = 0;
  let deliveredCount = 0;
  let failedCount = 0;
  const byChannel = { inApp: 0, push: 0, email: 0 };

  for (const user of chunk) {
    const result = await deliverToUser({
      userId: user._id,
      user,
      channels,
      content,
      broadcastId: new mongoose.Types.ObjectId(broadcastId)
    });
    rows.push(...result.rows);

    if (result.attempts > 0) {
      sentCount += 1; // recipient attempted
      if (result.delivered) deliveredCount += 1;
      else failedCount += 1;
    }
    for (const row of result.rows) {
      if (row.status !== 'sent') continue;
      if (row.channel === 'in_app') byChannel.inApp += 1;
      else if (row.channel === 'push') byChannel.push += 1;
      else if (row.channel === 'email') byChannel.email += 1;
    }
  }

  if (!rows.length) return;

  await Broadcast.updateOne(
    { _id: broadcastId },
    {
      $push: { recipients: { $each: rows, $slice: -MAX_RECIPIENT_ROWS } },
      $inc: {
        'deliveryStats.sent': sentCount,
        'deliveryStats.delivered': deliveredCount,
        'deliveryStats.failed': failedCount,
        'sentByChannels.inApp': byChannel.inApp,
        'sentByChannels.push': byChannel.push,
        'sentByChannels.email': byChannel.email
      }
    }
  );
}

async function deliverToUser({ userId, user, channels, content, broadcastId }) {
  const rows = [];
  let attempts = 0;
  let delivered = false;
  const now = new Date();
  const safeError = (err) => (err?.message || 'Delivery failed').slice(0, 200);

  if (channels.inApp) {
    attempts += 1;
    try {
      await Notification.create({
        recipientId: userId,
        senderId: new mongoose.Types.ObjectId(broadcastId),
        type: 'system',
        title: content.title,
        message: content.message,
        data: { broadcastId, notificationType: 'broadcast' },
        isRead: false
      });
      rows.push({ userId, username: user.username || user.name || '', channel: 'in_app', status: 'sent', sentAt: now });
      delivered = true;
    } catch (err) {
      rows.push({ userId, channel: 'in_app', status: 'failed', error: safeError(err), sentAt: now });
    }
  }

  if (channels.push) {
    try {
      const res = await pushService.sendToUser(userId, {
        title: content.title,
        body: content.message,
        data: {}
      });
      if (res.sent > 0) {
        attempts += 1;
        rows.push({ userId, channel: 'push', status: 'sent', sentAt: now });
        delivered = true;
      } else {
        rows.push({ userId, channel: 'push', status: 'skipped', error: 'No push subscription or push disabled', sentAt: now });
      }
    } catch (err) {
      attempts += 1;
      rows.push({ userId, channel: 'push', status: 'failed', error: safeError(err), sentAt: now });
    }
  }

  if (channels.email) {
    if (user.broadcastEmailUnsubscribed) {
      rows.push({ userId, email: user.email, channel: 'email', status: 'skipped', error: 'Email unsubscribed', sentAt: now });
    } else if (!user.email) {
      attempts += 1;
      rows.push({ userId, channel: 'email', status: 'failed', error: 'No email address on file', sentAt: now });
    } else {
      attempts += 1;
      const trackingId = randomTrackingId();
      try {
        const html = renderBroadcastEmail({
          ...content,
          tracking: { broadcastId, trackingId }
        });
        await sendEmail({ to: user.email, subject: content.title, html });
        rows.push({
          userId,
          email: user.email,
          username: user.username || user.name || '',
          trackingId,
          channel: 'email',
          status: 'sent',
          sentAt: now
        });
        delivered = true;
      } catch (err) {
        rows.push({ userId, email: user.email, channel: 'email', status: 'failed', error: safeError(err), sentAt: now });
      }
    }
  }

  return { rows, attempts, delivered };
}

// ─── Scheduler support ─────────────────────────────────────────────────────

async function pollDueBroadcasts(now = new Date()) {
  const due = await Broadcast.find({ status: 'scheduled', scheduledAt: { $lte: now } }).select('_id');
  for (const b of due) {
    try {
      await sendBroadcast({ id: b._id });
    } catch (err) {
      logger.error('Scheduled broadcast failed to start', { broadcastId: String(b._id), err: err.message });
    }
  }

  // Recover workers that stalled (process crash or long-blocking event loop).
  const staleCutoff = new Date(now.getTime() - STALE_SENDING_MS);
  const stale = await Broadcast.find({ status: 'sending', deliveryStartedAt: { $lt: staleCutoff } }).select('_id status');
  for (const doc of stale) {
    doc.status = 'failed';
    doc.lastError = 'Delivery stalled and was stopped. Re-send from the admin panel to retry.';
    doc.deliveryCompletedAt = new Date();
    await doc.save();
  }

  return { queued: due.length, recovered: stale.length };
}

// ─── Email tracking ────────────────────────────────────────────────────────

async function recordOpen(broadcastId, trackingId) {
  const res = await Broadcast.updateOne(
    { _id: broadcastId, 'recipients.trackingId': trackingId, 'recipients.status': 'sent', 'recipients.opened': { $ne: true } },
    { $set: { 'recipients.$.opened': true, 'recipients.$.openedAt': new Date() }, $inc: { 'deliveryStats.opened': 1 } }
  );
  return { success: res.modifiedCount > 0 };
}

async function recordClick(broadcastId, trackingId) {
  const res = await Broadcast.updateOne(
    { _id: broadcastId, 'recipients.trackingId': trackingId, 'recipients.status': 'sent', 'recipients.clicked': { $ne: true } },
    { $set: { 'recipients.$.clicked': true, 'recipients.$.clickedAt': new Date() }, $inc: { 'deliveryStats.clicked': 1 } }
  );
  return { success: res.modifiedCount > 0 };
}

async function unsubscribe(broadcastId, trackingId) {
  const broadcast = await Broadcast.findOne({ _id: broadcastId, 'recipients.trackingId': trackingId });
  if (!broadcast) throw new Error('Tracking link not found', { cause: 404 });

  const idx = broadcast.recipients.findIndex((r) => r.trackingId === trackingId);
  const row = broadcast.recipients[idx];
  const already = Boolean(row.unsubscribed);

  if (!already) {
    broadcast.recipients[idx].unsubscribed = true;
    broadcast.unsubscribeCount += 1;
    if (row.userId) {
      await User.updateOne({ _id: row.userId }, { $set: { broadcastEmailUnsubscribed: true } });
    }
    await broadcast.save();
  }

  return { success: true, alreadyUnsubscribed: already };
}

// ─── Reads / reports ───────────────────────────────────────────────────────

async function getBroadcasts({ limit = 10, page = 1, status, q, sort }) {
  const filter = {};
  if (VALID_STATUSES.includes(status)) filter.status = status;
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { message: { $regex: q, $options: 'i' } }
    ];
  }

  const total = await Broadcast.countDocuments(filter);
  const broadcasts = await Broadcast.find(filter)
    .sort(sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select('-recipients');

  return { total, page, limit, broadcasts };
}

function summarizeStats(broadcast) {
  const { deliveryStats, sentByChannels, status, unsubscribeCount } = broadcast;
  const total = deliveryStats.total || 0;
  const rate = (n) => (total ? +(n / total).toFixed(4) : 0);
  return {
    broadcastId: String(broadcast._id),
    status,
    deliveryStats,
    sentByChannels,
    unsubscribeCount,
    lastError: broadcast.lastError || null,
    sentAt: broadcast.sentAt || null,
    deliveryStartedAt: broadcast.deliveryStartedAt || null,
    deliveryCompletedAt: broadcast.deliveryCompletedAt || null,
    rates: {
      delivered: rate(deliveryStats.delivered),
      failed: rate(deliveryStats.failed),
      opened: rate(deliveryStats.opened),
      clicked: rate(deliveryStats.clicked)
    }
  };
}

async function getBroadcastStats(id) {
  const broadcast = await Broadcast.findById(id);
  if (!broadcast) throw new Error('Broadcast not found', { cause: 404 });
  return summarizeStats(broadcast);
}

async function getGlobalStats() {
  const [byStatus, totals] = await Promise.all([
    Broadcast.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Broadcast.aggregate([
      {
        $group: {
          _id: null,
          broadcasts: { $sum: 1 },
          totalRecipients: { $sum: '$deliveryStats.total' },
          delivered: { $sum: '$deliveryStats.delivered' },
          failed: { $sum: '$deliveryStats.failed' },
          opened: { $sum: '$deliveryStats.opened' },
          clicked: { $sum: '$deliveryStats.clicked' },
          inAppSent: { $sum: '$sentByChannels.inApp' },
          pushSent: { $sum: '$sentByChannels.push' },
          emailSent: { $sum: '$sentByChannels.email' },
          unsubscribes: { $sum: '$unsubscribeCount' }
        }
      }
    ])
  ]);

  const statusCounts = { draft: 0, scheduled: 0, sending: 0, sent: 0, partially_sent: 0, failed: 0, cancelled: 0 };
  for (const row of byStatus) statusCounts[row._id] = row.count;

  const agg = totals[0] || {};
  return {
    statusCounts,
    totals: {
      broadcasts: agg.broadcasts || 0,
      totalRecipients: agg.totalRecipients || 0,
      delivered: agg.delivered || 0,
      failed: agg.failed || 0,
      opened: agg.opened || 0,
      clicked: agg.clicked || 0,
      inAppSent: agg.inAppSent || 0,
      pushSent: agg.pushSent || 0,
      emailSent: agg.emailSent || 0,
      unsubscribes: agg.unsubscribes || 0
    }
  };
}

async function getDeliveryDetails(id, options = {}) {
  const { status, page = 1, limit = 20 } = options;
  const broadcast = await Broadcast.findById(id);
  if (!broadcast) throw new Error('Broadcast not found', { cause: 404 });

  const summary = {
    total: broadcast.recipients.length,
    sent: 0,
    delivered: 0,
    failed: 0,
    skipped: 0,
    opened: 0,
    clicked: 0,
    unsubscribed: 0
  };

  const filtered = [];
  for (const r of broadcast.recipients) {
    if (r.status === 'sent') summary.sent += 1;
    else if (r.status === 'failed') summary.failed += 1;
    else if (r.status === 'skipped') summary.skipped += 1;
    if (r.opened) summary.opened += 1;
    if (r.clicked) summary.clicked += 1;
    if (r.unsubscribed) summary.unsubscribed += 1;
    if (!status || r.status === status) filtered.push(r);
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const recipients = filtered.slice(start, start + limit);

  return {
    broadcastId: String(broadcast._id),
    status: broadcast.status,
    total,
    page,
    limit,
    hasMore: start + recipients.length < total,
    summary,
    recipients
  };
}

module.exports = {
  BATCH_SIZE,
  BATCH_THROTTLE_MS,
  MAX_RECIPIENT_ROWS,
  STALE_SENDING_MS,
  VALID_STATUSES,
  NON_TERMINAL,
  STATUS_LABELS,
  normalizeBroadcastInput,
  createBroadcast,
  updateBroadcast,
  deleteBroadcast,
  scheduleBroadcast,
  cancelBroadcast,
  sendBroadcast,
  pollDueBroadcasts,
  recordOpen,
  recordClick,
  unsubscribe,
  getBroadcasts,
  getBroadcastStats,
  getGlobalStats,
  getDeliveryDetails
};