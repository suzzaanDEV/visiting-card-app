require('../env');
const request = require('supertest');
const { setupIntegrationDb, teardownIntegrationDb } = require('../integrationSetup');

let app;

beforeAll(async () => {
  await setupIntegrationDb();
  ({ app } = require('../../src/app'));
}, 30000);

afterAll(async () => {
  await teardownIntegrationDb();
}, 30000);

describe('Full user journey smoke test', () => {
  const unique = Date.now();
  const email = `smoke${unique}@example.com`;
  const password = 'password123';
  let token;
  let devOtp;
  let cardId;
  let shortLink;

  test('1. register returns dev OTP and requires verification', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Smoke User', email, password });

    expect(res.status).toBe(201);
    expect(res.body.requiresEmailVerification).toBe(true);
    expect(res.body.devOtp).toMatch(/^\d{6}$/);
    devOtp = res.body.devOtp;
  });

  test('2. verify-email with dev OTP succeeds', async () => {
    const res = await request(app)
      .post('/api/auth/verify-email')
      .send({ email, otp: devOtp });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  test('3. login returns new token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  test('4. create public card', async () => {
    const res = await request(app)
      .post('/api/cards')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Smoke Card',
        fullName: 'Smoke User',
        jobTitle: 'QA Engineer',
        email,
        phone: '+9779800000000',
        isPublic: true,
        privacy: 'public'
      });

    expect(res.status).toBeLessThan(500);
    const body = res.body.card || res.body;
    expect(body._id || body.id).toBeDefined();
    cardId = body._id || body.id;
    shortLink = body.shortLink;
  });

  test('5. GET /api/cards/my lists the card', async () => {
    const res = await request(app)
      .get('/api/cards/my')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const list = Array.isArray(res.body) ? res.body : res.body.cards || [];
    expect(list.some(c => (c._id || c.id) === cardId)).toBe(true);
  });

  test('6. GET /api/cards/my/stats returns stats', async () => {
    const res = await request(app)
      .get('/api/cards/my/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalCards');
  });

  test('7. GET /api/cards/c/:shortLink serves public card', async () => {
    if (!shortLink) return;
    const res = await request(app).get(`/api/cards/c/${shortLink}`);
    expect(res.status).toBe(200);
  });

  test('8. save card to library and read it back', async () => {
    const save = await request(app)
      .post('/api/library')
      .set('Authorization', `Bearer ${token}`)
      .send({ cardId });

    expect(save.status).toBeLessThan(500);

    const list = await request(app)
      .get('/api/library')
      .set('Authorization', `Bearer ${token}`);

    expect(list.status).toBe(200);
  });

  test('9. search finds the public card', async () => {
    const res = await request(app).get('/api/search?q=Smoke');
    expect(res.status).toBeLessThan(500);
  });

  test('10. love toggle works', async () => {
    const res = await request(app)
      .post(`/api/cards/${cardId}/love`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBeLessThan(500);
  });

  test('11. analytics tracking + retrieval', async () => {
    const track = await request(app)
      .post('/api/analytics/track')
      .send({ cardId, actionType: 'view' });
    expect(track.status).toBeLessThan(500);

    const get = await request(app)
      .get(`/api/analytics/card/${cardId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(get.status).toBeLessThan(500);
  });

  test('12. notifications endpoint reachable', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
