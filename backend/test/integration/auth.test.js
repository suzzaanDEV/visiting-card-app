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

  let twoFactorDevOtp;

  test('POST /api/auth/profile/2fa/toggle requests verification when enabling 2FA', async () => {
    const res = await request(app)
      .post('/api/auth/profile/2fa/toggle')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.requiresVerification).toBe(true);
    expect(res.body.devOtp).toMatch(/^\d{6}$/);
    twoFactorDevOtp = res.body.devOtp;
  });

  test('POST /api/auth/verify-enable-2fa completes enabling 2FA', async () => {
    const res = await request(app)
      .post('/api/auth/verify-enable-2fa')
      .set('Authorization', `Bearer ${token}`)
      .send({ otp: twoFactorDevOtp });
    
    expect(res.status).toBe(200);
    expect(res.body.twoFactorEnabled).toBe(true);
  });

  test('POST /api/auth/login requires 2FA OTP when 2FA is enabled', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'password123' });
    
    expect(res.status).toBe(200);
    expect(res.body.requiresOTP).toBe(true);
    expect(res.body.devOtp).toMatch(/^\d{6}$/);
    twoFactorDevOtp = res.body.devOtp;
  });

  test('POST /api/auth/verify-2fa completes login with correct OTP', async () => {
    const res = await request(app)
      .post('/api/auth/verify-2fa')
      .send({ email, otp: twoFactorDevOtp });
    
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.user.twoFactorEnabled).toBe(true);
  });
});
