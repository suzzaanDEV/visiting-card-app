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

describe('Notification template variables', () => {
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

  test('GET /variables returns the registry with runtime tags', async () => {
    const res = await request(app)
      .get('/api/admin/notification-templates/variables')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const vars = res.body.variables;
    expect(Array.isArray(vars)).toBe(true);
    expect(vars.length).toBeGreaterThan(5);

    const keys = new Set(vars.map((v) => v.key));
    expect(keys.has('currentTimestamp')).toBe(true);
    expect(keys.has('appName')).toBe(true);
    expect(keys.has('recipientName')).toBe(true);
    expect(keys.has('cardTitle')).toBe(true);

    const runtime = vars.filter((v) => v.runtime);
    expect(runtime.some((v) => v.key === 'currentTimestamp')).toBe(true);
    // every variable documents how it renders
    for (const v of vars) {
      expect(v.description).toBeTruthy();
      expect(v.label).toBeTruthy();
    }
  });

  test('render resolves runtime built-ins with empty variables', async () => {
    const create = await request(app)
      .post('/api/admin/notification-templates')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Welcome Runtime',
        type: 'in_app',
        title: 'Hello {{recipientName}}',
        body: 'Generated at {{currentTimestamp}} on {{appName}} — {{currentDate}}'
      });
    expect(create.status).toBe(201);
    const id = create.body.template._id;

    const rendered = await request(app)
      .post(`/api/admin/notification-templates/${id}/render`)
      .set('Authorization', `Bearer ${token}`)
      .send({ variables: { recipientName: 'Prasanna' } });
    expect(rendered.status).toBe(200);
    const body = rendered.body.rendered.body;
    expect(body).toContain('Generated at ');
    // timestamps are formatted like "Sep 23, 2026, 9:41 PM"
    expect(body).toMatch(/Generated at [A-Z][a-z]{2} \d{1,2}/);
    expect(body).toMatch(/on Cardly/);
    expect(body).toMatch(/\d{4}-\d{2}-\d{2}$/);
    // caller-supplied values were used too
    expect(rendered.body.rendered.title).toBe('Hello Prasanna');
  });

  test('render is safe against regex metacharacters in variable keys', async () => {
    const res = await request(app)
      .get('/api/admin/notification-templates/variables')
      .set('Authorization', `Bearer ${token}`);
    const vars = res.body.variables;
    expect(Array.isArray(vars)).toBe(true);
    // A key like "(app)" must not crash the RegExp construction.
    const svc = require('../../src/services/notificationTemplateService');
    await expect(svc.renderTemplate('000000000000000000000000', { '(app)': 'x' }))
      .rejects.toThrow('Template not found');
  });
});