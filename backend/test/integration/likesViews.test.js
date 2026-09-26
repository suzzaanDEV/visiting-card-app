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