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

describe('Access request admin actions are audited', () => {
  let token;
  let requesterToken;
  let adminToken;
  let cardId;
  let requestId;
  const ownerEmail = `accessowner-${Date.now()}@test.com`;
  const requesterEmail = `accessrequester-${Date.now()}@test.com`;
  const rejectRequesterEmail = `accessreject-${Date.now()}@test.com`;

  async function registerAndLogin(email) {
    const register = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Access Tester', email, password: 'Password123!' });
    expect(register.status).toBeLessThan(500);

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'Password123!' });
    expect(login.status).toBe(200);
    return login.body.token || login.body.data?.token;
  }

  beforeAll(async () => {
    token = await registerAndLogin(ownerEmail);
    requesterToken = await registerAndLogin(requesterEmail);

    const created = await request(app)
      .post('/api/cards')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Private Access Card',
        fullName: 'Access Owner',
        jobTitle: 'PM',
        privacy: 'private',
        category: 'personal'
      });
    expect(created.status).toBeLessThan(500);
    cardId = (created.body.card || created.body)._id || (created.body.card || created.body).id;

    const reqRes = await request(app)
      .post(`/api/cards/${cardId}/request-access`)
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({ message: 'Please share' });
    expect(reqRes.status).toBeLessThan(500);
    expect(reqRes.body.access).toBe(false);
    requestId = reqRes.body.request._id;
    expect(requestId).toBeTruthy();

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
    adminToken = verify.body.token;
  }, 30000);

  test('approve writes an enriched admin.approve_access entry', async () => {
    const res = await request(app)
      .post(`/api/admin/access-requests/${requestId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-correlation-id', 'access-approve-1')
      .send({ adminNotes: 'Approved by QA' });
    expect(res.status).toBe(200);

    const AuditLog = require('../../src/models/auditLogModel');
    const entry = await AuditLog.findOne({ action: 'admin.approve_access', entityId: requestId })
      .sort({ createdAt: -1 }).lean();
    expect(entry).toBeTruthy();
    expect(entry.actorEmail).toBeTruthy();
    expect(entry.method).toBe('POST');
    expect(entry.path).toContain('/admin/access-requests/');
    expect(entry.correlationId).toBe('access-approve-1');
    expect(entry.before.status).toBe('pending');
    expect(entry.after.status).toBe('approved');
    expect(entry.metadata.hasNotes).toBe(true);
  });

  test('reject writes admin.reject_access with the reason', async () => {
    // A distinct requester (the approved user above is now granted access).
    const rejectRequesterToken = await registerAndLogin(rejectRequesterEmail);
    const fresh = await request(app)
      .post(`/api/cards/${cardId}/request-access`)
      .set('Authorization', `Bearer ${rejectRequesterToken}`)
      .send({ message: 'Second attempt' });
    expect(fresh.status).toBeLessThan(500);
    const freshRequestId = fresh.body.request._id;

    const res = await request(app)
      .post(`/api/admin/access-requests/${freshRequestId}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ adminNotes: 'No', reason: 'Not a colleague' });
    expect(res.status).toBe(200);

    const AuditLog = require('../../src/models/auditLogModel');
    const entry = await AuditLog.findOne({ action: 'admin.reject_access', entityId: freshRequestId })
      .sort({ createdAt: -1 }).lean();
    expect(entry).toBeTruthy();
    expect(entry.actorEmail).toBeTruthy();
    expect(entry.before.status).toBe('pending');
    expect(entry.after.status).toBe('rejected');
    expect(entry.metadata.reason).toBe('Not a colleague');
  });
});