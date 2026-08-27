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
const { seedAdmin } = require('../../src/seeds/adminSeed');

describe('Admin seed and login', () => {
  test('seedAdmin creates default admin when collection empty', async () => {
    await seedAdmin();
    const admin = await Admin.findOne({ email: 'admin@gmail.com' });
    expect(admin).toBeTruthy();
    expect(admin.name).toBe('System Admin');
    expect(admin.isVerified).toBe(true);
    const valid = await bcrypt.compare('admin123', admin.password);
    expect(valid).toBe(true);
  });

  test('seedAdmin skips when admin exists', async () => {
    await seedAdmin();
    const countBefore = await Admin.countDocuments();
    await seedAdmin();
    const countAfter = await Admin.countDocuments();
    expect(countAfter).toBe(countBefore);
  });

  test('POST /api/admin/login succeeds with seeded admin', async () => {
    await Admin.deleteMany({});
    await seedAdmin();
    const res = await request(app)
      .post('/api/admin/login')
      .send({ email: 'admin@gmail.com', password: 'admin123' });
    expect(res.status).toBe(200);
    expect(res.body.requiresOTP).toBe(true);
    expect(res.body.adminEmail).toBe('admin@gmail.com');
    // In dev mode, devOtp is returned so we can complete login
    expect(res.body.devOtp).toBeDefined();
  });
});
