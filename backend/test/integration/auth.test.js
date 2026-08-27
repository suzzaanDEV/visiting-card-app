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

describe('Auth API', () => {
  const unique = Date.now();
  const email = `testuser${unique}@example.com`;
  let token;
  let devOtp;

  test('POST /api/auth/register creates user and returns dev OTP', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email,
        password: 'password123',
      });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(email);
    expect(res.body.requiresEmailVerification).toBe(true);
    expect(res.body.devOtp).toMatch(/^\d{6}$/);
    devOtp = res.body.devOtp;
  });

  test('POST /api/auth/verify-email verifies OTP and returns tokens', async () => {
    const res = await request(app)
      .post('/api/auth/verify-email')
      .send({ email, otp: devOtp });
    expect(res.status).toBe(200);
    expect(res.body.user.isEmailVerified).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    token = res.body.token;
  });

  test('POST /api/auth/login works after verification', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
