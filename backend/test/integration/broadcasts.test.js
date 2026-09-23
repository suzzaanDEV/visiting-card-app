require('../env');
const request = require('supertest');
const { setupIntegrationDb, teardownIntegrationDb } = require('../integrationSetup');
const mongoose = require('mongoose');
const User = require('../../src/models/userModel');
const Broadcast = require('../../src/models/broadcastModel');
const broadcastService = require('../../src/services/broadcastService');

let app;

// broadcastLimiter allows 5 POSTs/hour across create/send/schedule. This file makes exactly 5.

beforeAll(async () => {
  await setupIntegrationDb();
  ({ app } = require('../../src/app'));
  await require('../../src/seeds/adminSeed').seedAdmin();
}, 30000);

afterAll(async () => {
  await teardownIntegrationDb();
}, 30000);

async function getAdminToken() {
  const { getSeedCredentials } = require('../../src/seeds/adminSeed');
  const creds = getSeedCredentials();

  const login = await request(app)
    .post('/api/admin/login')
    .send({ email: creds.email, password: creds.password });
  expect(login.status).toBe(200);

  const verify = await request(app)
    .post('/api/admin/verify-otp')
    .send({ email: creds.email, otp: login.body.devOtp });
  expect(verify.status).toBe(200);
  return verify.body.token;
}

async function createTestUsers() {
  const users = [];
  for (let i = 1; i <= 2; i++) {
    const user = await User.create({
      username: `broadcast_user_${i}`,
      email: `broadcast_user_${i}@cardly.test`,
      password: 'password123',
      name: `Broadcast User ${i}`,
      isActive: true,
      isVerified: true,
      deletedAt: null
    });
    users.push(user);
  }
  return users;
}

async function waitForSettled(id, token, timeout = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const res = await request(app)
      .get(`/api/admin/broadcasts/${id}/delivery`)
      .set('Authorization', `Bearer ${token}`);
    if (res.status === 200 && ['sent', 'partially_sent', 'failed', 'cancelled'].includes(res.body.status)) {
      return res.body;
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error('Broadcast delivery did not settle in time');
}

describe('Broadcast lifecycle, delivery and tracking', () => {
  let token;
  let users = [];
  let broadcastId;
  const auth = () => ({ Authorization: `Bearer ${token}` });

  const validPayload = (overrides = {}) => ({
    title: 'Cardly Spring Update',
    message: 'A fresh look and new templates are now live on the platform.',
    notificationType: 'announcement',
    priority: 'normal',
    channels: { inApp: true, push: false, email: true },
    ctaText: 'View update',
    ctaUrl: 'https://cardly.app/updates',
    ...overrides
  });

  beforeAll(async () => {
    token = await getAdminToken();
    users = await createTestUsers();
  }, 20000);

  test('rejects broadcast without a title', async () => {
    const res = await request(app)
      .post('/api/admin/broadcasts')
      .set(auth())
      .send({ message: 'No title here' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Title is required/);
  });

  test('creates a broadcast and normalizes audience/channels', async () => {
    const res = await request(app)
      .post('/api/admin/broadcasts')
      .set(auth())
      .send(validPayload({
        audience: { type: 'specific', filters: {} },
        specificUserIds: users.map((u) => u._id),
        // Legacy frontend field must be mapped into `emailHtml`.
        emailHtmlBody: '<p>custom content</p>'
      }));

    expect(res.status).toBe(201);
    const b = res.body.broadcast;
    expect(b.status).toBe('draft');
    expect(b.audience).toBe('specific');
    expect(b.channels.email).toBe(true);
    expect(b.emailHtml).toBe('<p>custom content</p>');
    broadcastId = b._id;
  });

  test('rejects scheduling in the past', async () => {
    const res = await request(app)
      .post(`/api/admin/broadcasts/${broadcastId}/schedule`)
      .set(auth())
      .send({ scheduledAt: new Date(Date.now() - 60000).toISOString() });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/future/);
  });

  test('schedules a broadcast in the future', async () => {
    const res = await request(app)
      .post(`/api/admin/broadcasts/${broadcastId}/schedule`)
      .set(auth())
      .send({ scheduledAt: new Date(Date.now() + 3600000).toISOString() });
    expect(res.status).toBe(200);
    expect(res.body.broadcast.status).toBe('scheduled');
    expect(res.body.broadcast.scheduledAt).toBeTruthy();
  });

  test('sends the broadcast now (5th and final rate-limited POST)', async () => {
    const res = await request(app)
      .post(`/api/admin/broadcasts/${broadcastId}/send`)
      .set(auth());
    expect(res.status).toBe(200);
    expect(res.body.queued).toBe(true);
    expect(res.body.broadcast.status).toBe('sending');
  }, 10000);

  test('delivery completes and emits in-app + email channels', async () => {
    await waitForSettled(broadcastId, token);
  });

  test('delivery details expose per-channel recipient rows', async () => {
    const data = await waitForSettled(broadcastId, token);
    expect(data.summary.sent).toBeGreaterThanOrEqual(2); // users x channels
    expect(data.recipients.length).toBeGreaterThan(0);

    const emailRow = data.recipients.find((r) => r.channel === 'email' && r.status === 'sent');
    expect(emailRow).toBeTruthy();
    expect(emailRow.email).toBe(`broadcast_user_1@cardly.test`);
    expect(emailRow.trackingId).toBeTruthy();
  });

  test('per-broadcast stats report totals and rates', async () => {
    const res = await request(app)
      .get(`/api/admin/broadcasts/${broadcastId}/stats`)
      .set(auth());
    expect(res.status).toBe(200);
    expect(res.body.broadcastId).toBe(broadcastId);
    expect(res.body.deliveryStats.delivered).toBeGreaterThanOrEqual(2);
    expect(res.body.rates.delivered).toBeGreaterThan(0);
  });

  test('overall stats roll up statuses and channel totals', async () => {
    await waitForSettled(broadcastId, token);
    const res = await request(app)
      .get('/api/admin/broadcasts/stats')
      .set(auth());
    expect(res.status).toBe(200);
    expect(res.body.statusCounts.sent).toBeGreaterThanOrEqual(1);
    expect(res.body.totals.delivered).toBeGreaterThanOrEqual(2);
    expect(res.body.totals.emailSent).toBeGreaterThanOrEqual(2);
  });

  // ─── Email tracking (public routes) ─────────────────────────────────────

  test('open pixel increments the opened counter (once)', async () => {
    const data = await waitForSettled(broadcastId, token);
    const emailRow = data.recipients.find((r) => r.channel === 'email' && r.status === 'sent');
    const before = (await request(app).get(`/api/admin/broadcasts/${broadcastId}/stats`).set(auth())).body.deliveryStats.opened;

    const px = await request(app)
      .get(`/api/tracking/broadcast/px/${broadcastId}/${emailRow.trackingId}`)
      .set('X-Forwarded-For', '10.9.8.7');
    expect(px.status).toBe(200);
    expect(px.headers['content-type']).toMatch(/image\/gif/);

    const after = (await request(app).get(`/api/admin/broadcasts/${broadcastId}/stats`).set(auth())).body.deliveryStats.opened;
    expect(after).toBe(before + 1);

    // Idempotent: a second fetch must not double-count.
    await request(app).get(`/api/tracking/broadcast/px/${broadcastId}/${emailRow.trackingId}`);
    const again = (await request(app).get(`/api/admin/broadcasts/${broadcastId}/stats`).set(auth())).body.deliveryStats.opened;
    expect(again).toBe(before + 1);
  });

  test('click link redirects and records one click', async () => {
    const data = await waitForSettled(broadcastId, token);
    const emailRow = data.recipients.find((r) => r.channel === 'email' && r.status === 'sent');
    const before = (await request(app).get(`/api/admin/broadcasts/${broadcastId}/stats`).set(auth())).body.deliveryStats.clicked;

    const click = await request(app)
      .get(`/api/tracking/broadcast/click/${broadcastId}/${emailRow.trackingId}?url=${encodeURIComponent('https://cardly.app/updates')}`);
    expect(click.status).toBe(302);
    expect(click.headers.location).toBe('https://cardly.app/updates');

    const after = (await request(app).get(`/api/admin/broadcasts/${broadcastId}/stats`).set(auth())).body.deliveryStats.clicked;
    expect(after).toBe(before + 1);
  });

  test('click link ignores malicious redirect targets', async () => {
    const data = await waitForSettled(broadcastId, token);
    const emailRow = data.recipients.find((r) => r.channel === 'email' && r.status === 'sent');
    const click = await request(app)
      .get(`/api/tracking/broadcast/click/${broadcastId}/${emailRow.trackingId}?url=${encodeURIComponent('javascript:alert(1)')}`);
    expect(click.status).toBe(302);
    expect(click.headers.location).not.toMatch(/^javascript:/);
  });

  test('unsubscribe flags the user and confirms idempotency', async () => {
    const data = await waitForSettled(broadcastId, token);
    const emailRow = data.recipients.find((r) => r.channel === 'email' && r.status === 'sent');

    const first = await request(app).get(`/api/tracking/broadcast/unsubscribe/${broadcastId}/${emailRow.trackingId}`);
    expect(first.status).toBe(200);
    expect(first.text).toMatch(/unsubscribed/i);

    const user = await User.findById(emailRow.userId);
    expect(user.broadcastEmailUnsubscribed).toBe(true);

    const second = await request(app).get(`/api/tracking/broadcast/unsubscribe/${broadcastId}/${emailRow.trackingId}`);
    expect(second.status).toBe(200);
    const stats = (await request(app).get(`/api/admin/broadcasts/${broadcastId}/stats`).set(auth())).body;
    expect(stats.unsubscribeCount).toBe(1);
  });

  // ─── Service-level safety nets (not rate-limited) ───────────────────────

  test('unsubscribed users are skipped on the email channel', async () => {
    const other = await User.create({
      username: 'already_out',
      email: 'already_out@cardly.test',
      password: 'password123',
      name: 'Already Out',
      isActive: true,
      isVerified: true,
      deletedAt: null,
      broadcastEmailUnsubscribed: true
    });

    const broadcast = new Broadcast({
      title: 'Skip test',
      message: 'Skip me',
      status: 'draft',
      channels: { inApp: false, push: false, email: true },
      audience: 'specific',
      specificUserIds: [other._id]
    });
    await broadcast.save();

    await broadcastService.sendBroadcast({ id: broadcast._id, awaitDelivery: true });
    const stats = await broadcastService.getDeliveryDetails(broadcast._id);
    const emailRow = stats.recipients.find((r) => r.channel === 'email');
    expect(emailRow).toBeTruthy();
    expect(emailRow.status).toBe('skipped');
    expect(emailRow.error).toMatch(/unsubscribed/);
  });

  test('stalled sending broadcasts are recovered as failed', async () => {
    const stalled = new Broadcast({
      title: 'Stalled',
      message: 'Stalled delivery',
      status: 'sending',
      channels: { inApp: true },
      audience: 'all',
      deliveryStartedAt: new Date(Date.now() - broadcastService.STALE_SENDING_MS - 60000)
    });
    await stalled.save();

    await broadcastService.pollDueBroadcasts();
    const after = await Broadcast.findById(stalled._id);
    expect(after.status).toBe('failed');
    expect(after.lastError).toMatch(/stalled/i);
  });

  test('direct service call rejects a second concurrent send attempt', async () => {
    await expect(
      broadcastService.sendBroadcast({ id: broadcastId })
    ).rejects.toThrow(/already in progress/);
  });

  test('list endpoint supports status + search filtering without recipients payload', async () => {
    const res = await request(app)
      .get('/api/admin/broadcasts?status=sent&q=Spring')
      .set(auth());
    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
    expect(res.body.broadcasts[0].recipients).toBeUndefined();
  });
});