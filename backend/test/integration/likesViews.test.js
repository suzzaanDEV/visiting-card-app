require('../env');
const request = require('supertest');
const { setupIntegrationDb, teardownIntegrationDb } = require('../integrationSetup');

let app;
let registeredEmail;

beforeAll(async () => {
  await setupIntegrationDb();
  ({ app } = require('../../src/app'));
  const { seedAdmin } = require('../../src/seeds/adminSeed');
  await seedAdmin();
  registeredEmail = `likesviews-${Date.now()}@test.com`;
}, 30000);

afterAll(async () => {
  await teardownIntegrationDb();
}, 30000);

describe('Card likes (one per user) and views (dedup-aware)', () => {
  let token;
  let cardId;
  let shortLink;

  async function registerAndLogin() {
    const register = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Likes Views Tester', email: registeredEmail, password: 'Password123!' });
    expect(register.status).toBeLessThan(500);

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: registeredEmail, password: 'Password123!' });
    expect(login.status).toBe(200);
    return login.body.token || login.body.data?.token;
  }

  beforeAll(async () => {
    token = await registerAndLogin();

    const created = await request(app)
      .post('/api/cards')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Likes Views Card',
        fullName: 'Likes Views Tester',
        jobTitle: 'QA',
        isPublic: true,
        category: 'personal'
      });
    expect(created.status).toBeLessThan(500);
    const body = created.body.card || created.body;
    cardId = body._id || body.id;
    shortLink = body.shortLink;
  }, 20000);

  test('refreshing the public card does not inflate the view count', async () => {
    const Card = require('../../src/models/cardModel');
    const before = (await Card.findById(cardId)).views;

    await request(app).get(`/api/cards/c/${shortLink}`);
    await request(app).get(`/api/cards/c/${shortLink}`);
    await request(app).get(`/api/cards/c/${shortLink}`);

    const after = (await Card.findById(cardId)).views;
    expect(after - before).toBe(1);
  });

  test('distinct visitors (different visitor-id headers) each count once', async () => {
    const Card = require('../../src/models/cardModel');
    const before = (await Card.findById(cardId)).views;

    await request(app).get(`/api/cards/c/${shortLink}`).set('x-visitor-id', 'visitor-a');
    await request(app).get(`/api/cards/c/${shortLink}`).set('x-visitor-id', 'visitor-a');
    await request(app).get(`/api/cards/c/${shortLink}`).set('x-visitor-id', 'visitor-b');

    const after = (await Card.findById(cardId)).views;
    expect(after - before).toBe(2);
  });

  test('signed-in user refreshes count only once within the window', async () => {
    const Card = require('../../src/models/cardModel');
    const before = (await Card.findById(cardId)).views;

    await request(app).get(`/api/cards/c/${shortLink}`).set('Authorization', `Bearer ${token}`);
    await request(app).get(`/api/cards/c/${shortLink}`).set('Authorization', `Bearer ${token}`);

    const after = (await Card.findById(cardId)).views;
    expect(after - before).toBe(1);
  });

  test('a user can love a card only once — the model guard prevents duplicates', async () => {
    const Card = require('../../src/models/cardModel');
    const User = require('../../src/models/userModel');

    const user = await User.findOne({ email: registeredEmail });
    const card = await Card.findById(cardId);

    // Two direct addLove calls (the second simulates a stale/concurrent like)
    // must NOT create a second love entry or double the counter.
    await card.addLove(user._id);
    await card.addLove(user._id);

    const fresh = await Card.findById(cardId);
    expect(fresh.loves.filter((l) => l.userId.toString() === user._id.toString()).length).toBe(1);
    expect(fresh.loveCount).toBe(1);
  });

  test('API toggle stays consistent and public endpoint reports isLoved', async () => {
    // Unlove (toggle flips it off)
    const unlove = await request(app)
      .post(`/api/cards/${cardId}/love`)
      .set('Authorization', `Bearer ${token}`);
    expect(unlove.status).toBe(200);
    expect(unlove.body.loved).toBe(false);
    expect(unlove.body.loveCount).toBe(0);

    // Love again
    await request(app).post(`/api/cards/${cardId}/love`).set('Authorization', `Bearer ${token}`);

    const view = await request(app)
      .get(`/api/cards/c/${shortLink}`)
      .set('Authorization', `Bearer ${token}`);
    const card = view.body.card || view.body;
    expect(card.isLoved).toBe(true);
    expect(card.loveCount).toBe(1);
  });
});

describe('Private card viewed by a signed-in non-owner (QR scan path)', () => {
  let ownerToken;
  let viewerToken;
  let privateCardId;
  let privateShortLink;

  const register = async (label) => {
    const email = `pv-${label}-${Date.now()}@test.com`;
    await request(app)
      .post('/api/auth/register')
      .send({ name: `PV ${label}`, email, password: 'Password123!' });
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'Password123!' });
    expect(login.status).toBe(200);
    return login.body.token || login.body.data?.token;
  };

  beforeAll(async () => {
    ownerToken = await register('owner');
    viewerToken = await register('viewer');

    const created = await request(app)
      .post('/api/cards')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Private QR Card',
        fullName: 'PV Owner',
        email: 'owner@example.com',
        phone: '9800000000',
        isPublic: false,
        privacy: 'private',
        category: 'personal'
      });
    expect(created.status).toBeLessThan(500);
    const body = created.body.card || created.body;
    privateCardId = body._id || body.id;
    privateShortLink = body.shortLink;
  }, 20000);

  // Regression: applyPrivateCardAccess() replaces result.card with a sanitized
  // plain object, which has no Mongoose methods. Calling result.card.isLovedByUser
  // after sanitizing threw a TypeError that surfaced as a 404
  // ("result.card.isLovedByUser is not a function").
  test('short-link fetch returns a masked card with isLoved instead of erroring', async () => {
    const res = await request(app)
      .get(`/api/cards/c/${privateShortLink}`)
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    const card = res.body.card || res.body;
    expect(card._id).toBe(privateCardId);
    expect(card.isLoved).toBe(false);
    expect(card.contactLocked).toBe(true);
    expect(res.body.access.granted).toBe(false);
    expect(res.body.access.requiresRequest).toBe(true);
  });

  test('public/view fetch returns a masked card with isLoved instead of erroring', async () => {
    const res = await request(app)
      .get(`/api/cards/public/view/${privateCardId}`)
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    const card = res.body.card || res.body;
    expect(card._id).toBe(privateCardId);
    expect(card.isLoved).toBe(false);
    expect(card.contactLocked).toBe(true);
  });

  test('the owner still sees their own private card unmasked', async () => {
    const res = await request(app)
      .get(`/api/cards/c/${privateShortLink}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    const card = res.body.card || res.body;
    expect(card.email).toBe('owner@example.com');
    expect(card.contactLocked).toBeUndefined();
    expect(res.body.access.granted).toBe(true);
  });

  test('anonymous viewers still get the masked card', async () => {
    const res = await request(app).get(`/api/cards/c/${privateShortLink}`);

    expect(res.status).toBe(200);
    const card = res.body.card || res.body;
    expect(card.contactLocked).toBe(true);
    expect(res.body.access.reason).toBe('unauthenticated');
  });
});

describe('Private card access-request lifecycle (QR scan)', () => {
  let ownerToken;
  let viewerToken;
  let gatedCardId;
  let gatedShortLink;
  let requestId;

  const register = async (label) => {
    const email = `life-${label}-${Date.now()}@test.com`;
    await request(app)
      .post('/api/auth/register')
      .send({ name: `Life ${label}`, email, password: 'Password123!' });
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'Password123!' });
    expect(login.status).toBe(200);
    return login.body.token || login.body.data?.token;
  };

  beforeAll(async () => {
    ownerToken = await register('gowner');
    viewerToken = await register('gviewer');

    const created = await request(app)
      .post('/api/cards')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Gated Card',
        fullName: 'Gated Owner',
        email: 'gated.owner@example.com',
        phone: '9812345678',
        isPublic: false,
        privacy: 'private',
        category: 'personal'
      });
    expect(created.status).toBeLessThan(500);
    const body = created.body.card || created.body;
    gatedCardId = body._id || body.id;
    gatedShortLink = body.shortLink;
  }, 20000);

  test('requesting access without a token is rejected', async () => {
    const res = await request(app)
      .post(`/api/cards/${gatedCardId}/request-access`)
      .send({ message: 'let me in' });

    expect(res.status).toBe(401);
  });

  test('a signed-in non-owner can request access', async () => {
    const res = await request(app)
      .post(`/api/cards/${gatedCardId}/request-access`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ message: 'Please share your contact details' });

    expect(res.status).toBe(200);
    expect(res.body.access).toBe(false);
    requestId = res.body.request._id;
    expect(requestId).toBeTruthy();
  });

  test('while pending, the card stays masked and reports pending_request', async () => {
    const res = await request(app)
      .get(`/api/cards/c/${gatedShortLink}`)
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    const card = res.body.card || res.body;
    expect(card.contactLocked).toBe(true);
    expect(card.email).not.toBe('gated.owner@example.com');
    expect(res.body.access.granted).toBe(false);
    expect(res.body.access.reason).toBe('pending_request');
  });

  test('a non-owner cannot approve their own request', async () => {
    const res = await request(app)
      .post(`/api/cards/access-requests/${requestId}/approve`)
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  test('once the owner approves, the same short link returns full contact details', async () => {
    const approve = await request(app)
      .post(`/api/cards/access-requests/${requestId}/approve`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(approve.status).toBe(200);

    const res = await request(app)
      .get(`/api/cards/c/${gatedShortLink}`)
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    const card = res.body.card || res.body;
    expect(card.email).toBe('gated.owner@example.com');
    expect(card.phone).toBe('9812345678');
    expect(card.contactLocked).toBeUndefined();
    expect(res.body.access.granted).toBe(true);
  });

  test('approval does not unlock the card for anonymous or other viewers', async () => {
    const anon = await request(app).get(`/api/cards/c/${gatedShortLink}`);
    expect(anon.status).toBe(200);
    const anonCard = anon.body.card || anon.body;
    expect(anonCard.contactLocked).toBe(true);
    expect(anonCard.email).not.toBe('gated.owner@example.com');
    expect(anon.body.access.granted).toBe(false);

    const otherToken = await register('stranger');
    const other = await request(app)
      .get(`/api/cards/c/${gatedShortLink}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(other.status).toBe(200);
    const otherCard = other.body.card || other.body;
    expect(otherCard.contactLocked).toBe(true);
    expect(otherCard.email).not.toBe('gated.owner@example.com');
  });

  test('the approved viewer can love the gated card (isLoved resolves on a document-backed card)', async () => {
    const love = await request(app)
      .post(`/api/cards/${gatedCardId}/love`)
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(love.status).toBe(200);
    expect(love.body.loved).toBe(true);

    const res = await request(app)
      .get(`/api/cards/c/${gatedShortLink}`)
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(res.status).toBe(200);
    const card = res.body.card || res.body;
    expect(card.isLoved).toBe(true);
    expect(card.loveCount).toBe(1);
  });
});