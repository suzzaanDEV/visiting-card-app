require('../env');
const request = require('supertest');
const { setupIntegrationDb, teardownIntegrationDb } = require('../integrationSetup');

let app;

beforeAll(async () => {
  await setupIntegrationDb();
  ({ app } = require('../../src/app'));
  const { seedAdmin } = require('../../src/seeds/adminSeed');
  await seedAdmin();
}, 30000);

afterAll(async () => {
  await teardownIntegrationDb();
}, 30000);

describe('Audit log enrichment', () => {
  let token;

  beforeAll(async () => {
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
    token = verify.body.token;
  }, 20000);

  test('settings update is captured with request context + actor identity', async () => {
    const res = await request(app)
      .put('/api/admin/settings')
      .set('Authorization', `Bearer ${token}`)
      .set('x-correlation-id', 'corr-1234')
      .send({ system: { siteName: 'Audit Test Works' } });
    expect(res.status).toBe(200);

    const AuditLog = require('../../src/models/auditLogModel');
    const entry = await AuditLog.findOne({ action: 'admin.update_settings' }).sort({ createdAt: -1 }).lean();
    expect(entry).toBeTruthy();
    expect(entry.requestId).toBeTruthy();
    expect(entry.correlationId).toBe('corr-1234');
    expect(entry.method).toBe('PUT');
    expect(entry.path).toContain('/admin/settings');
    expect(entry.actorEmail).toBeTruthy();
    expect(entry.elapsedMs).toEqual(expect.any(Number));
    expect(entry.after).toBeTruthy();
    const keys = entry.metadata instanceof Map ? entry.metadata.get('keys') : entry.metadata.keys;
    expect(keys).toContain('system');
  });

  test('GET /api/audit returns a paginated envelope', async () => {
    const res = await request(app)
      .get('/api/audit?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const { logs, total, page, limit, totalPages } = res.body;
    expect(Array.isArray(logs)).toBe(true);
    expect(total).toBeGreaterThanOrEqual(1);
    expect(page).toBe(1);
    expect(limit).toBe(10);
    expect(Math.ceil(total / 10)).toBe(totalPages);
  });

  test('search narrows results and works with the envelope', async () => {
    const res = await request(app)
      .get('/api/audit?search=update_settings')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.logs.length).toBeGreaterThanOrEqual(1);
    for (const log of res.body.logs) {
      expect(log.action).toContain('update_settings');
    }
  });

  test('category actions log under dedicated labels with before/after diffs', async () => {
    const Category = require('../../src/models/categoryModel');
    const categoryService = require('../../src/services/categoryService');

    const cat = await categoryService.create({ name: 'Test Audit', slug: 'test-audit', description: 'x', sortOrder: 1 });
    await categoryService.update(cat._id, { description: 'updated' });

    const AuditLog = require('../../src/models/auditLogModel');
    const created = await AuditLog.findOne({ action: 'admin.create_category', entityId: cat._id }).lean();
    const updated = await AuditLog.findOne({ action: 'admin.update_category', entityId: cat._id }).lean();
    expect(created).toBeTruthy();
    expect(updated).toBeTruthy();
    expect(updated.before.description).toBe('x');
    expect(updated.after.description).toBe('updated');
  });

  test('server errors are audited as system.error with statusCode', async () => {
    const res = await request(app)
      .post('/api/admin/settings')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send('{ not valid json');
    expect(res.status).toBe(400);

    const AuditLog = require('../../src/models/auditLogModel');
    const entry = await AuditLog.findOne({ action: 'system.error', statusCode: 400 }).sort({ createdAt: -1 }).lean();
    expect(entry).toBeTruthy();
    expect(entry.severity).toBe('warning');
    expect(entry.success).toBe(false);
    expect(entry.method).toBe('POST');
    expect(entry.errorMessage).toBeTruthy();
  });
});