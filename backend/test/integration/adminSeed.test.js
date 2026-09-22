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
});
