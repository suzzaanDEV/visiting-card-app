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
const bcrypt = require('bcryptjs');
const Admin = require('../../src/models/adminModel');
const { seedAdmin, getSeedCredentials } = require('../../src/seeds/adminSeed');

describe('Admin seed and login', () => {
  const creds = getSeedCredentials();

  test('seedAdmin creates default admin when collection empty', async () => {
    await seedAdmin();
    const admin = await Admin.findOne({ email: creds.email });
    expect(admin).toBeTruthy();
    expect(admin.name).toBe('System Admin');
    expect(admin.isVerified).toBe(true);
    const valid = await bcrypt.compare(creds.password, admin.password);
    expect(valid).toBe(true);
  });

  test('seedAdmin skips when admin exists', async () => {
    await seedAdmin();
    const countBefore = await Admin.countDocuments();
    await seedAdmin();
    const countAfter = await Admin.countDocuments();
    expect(countAfter).toBe(countBefore);
  });

  test('seedAdmin --reset replaces existing admins', async () => {
    const originalArgv = process.argv;
    process.argv = [...originalArgv, '--reset'];
    try {
      await seedAdmin();
      const admins = await Admin.find({});
      expect(admins).toHaveLength(1);
      expect(admins[0].email).toBe(creds.email);
    } finally {
      process.argv = originalArgv;
    }
  });

  test('POST /api/admin/login succeeds with seeded admin', async () => {
    await Admin.deleteMany({});
    await seedAdmin();
    const res = await request(app)
      .post('/api/admin/login')
      .send({ email: creds.email, password: creds.password });
    expect(res.status).toBe(200);
    expect(res.body.requiresOTP).toBe(true);
    expect(res.body.adminEmail).toBe(creds.email);
    // In dev mode, devOtp is returned so we can complete login
    expect(res.body.devOtp).toBeDefined();
  });

  test('deleting a user removes them from the admin user list', async () => {
    const User = require('../../src/models/userModel');

    // Admin login + OTP verification
    const login = await request(app)
      .post('/api/admin/login')
      .send({ email: creds.email, password: creds.password });
    expect(login.status).toBe(200);
    const otp = login.body.devOtp;
    expect(otp).toBeDefined();

    const verify = await request(app)
      .post('/api/admin/verify-otp')
      .send({ email: creds.email, otp });
    expect(verify.status).toBe(200);
    const token = verify.body.token;

    // Create a normal user
    const user = await User.create({
      username: 'deleteme',
      email: 'deleteme@example.com',
      name: 'Delete Me',
      password: 'password123'
    });

    // The user shows up in the admin list first
    const before = await request(app)
      .get('/api/admin/users')
      .query({ page: 1, limit: 20 })
      .set('Authorization', `Bearer ${token}`);
    expect(before.body.users.map((u) => u.email)).toContain('deleteme@example.com');

    // Delete via admin API
    const del = await request(app)
      .delete(`/api/admin/users/${user._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(200);

    // Soft-deleted user no longer appears in the list
    const after = await request(app)
      .get('/api/admin/users')
      .query({ page: 1, limit: 20 })
      .set('Authorization', `Bearer ${token}`);
    expect(after.status).toBe(200);
    expect(after.body.users.map((u) => u.email)).not.toContain('deleteme@example.com');
  });
});
