require('../env');
const request = require('supertest');
const { setupIntegrationDb, teardownIntegrationDb } = require('../integrationSetup');

let app;

beforeAll(async () => {
  await setupIntegrationDb();
  ({ app } = require('../../src/app'));
  await require('../../src/seeds/adminSeed').seedAdmin();
}, 30000);

afterAll(async () => {
  await teardownIntegrationDb();
}, 30000);

async function getAdminToken() {
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
  return verify.body.token;
}

describe('Admin template management', () => {
  let token;
  const templatePayload = {
    id: 'admin-test-blue',
    name: 'Admin Test Blue',
    description: 'Template created through the admin panel',
    category: 'business',
    isPremium: false,
    isActive: true,
    isFeatured: false,
    design: {
      backgroundColor: '#0f1c3f',
      textColor: '#ffffff',
      accentColor: '#3b82f6',
      fontFamily: 'Arial',
      layout: 'standard',
      borderRadius: 12,
      headerStyle: 'centered',
      avatarShape: 'circle',
      avatarSize: 120,
      backgroundImage: '',
      elements: []
    }
  };

  beforeAll(async () => {
    token = await getAdminToken();
  }, 20000);

  test('admin creates a template with a design', async () => {
    const res = await request(app)
      .post('/api/admin/templates')
      .set('Authorization', `Bearer ${token}`)
      .send(templatePayload);

    expect(res.status).toBe(201);
    const t = res.body.template;
    expect(t.id).toBe('admin-test-blue');
    expect(t.design.backgroundColor).toBe('#0f1c3f');
    expect(t.design.layout).toBe('standard');
    expect(t.isActive).toBe(true);
    // preview subdoc is derived from design so thumbnails still render
    expect(t.preview.backgroundColor).toBe('#0f1c3f');
  });

  test('newly created template is visible on the public template endpoint', async () => {
    const res = await request(app)
      .get('/api/templates');

    expect(res.status).toBe(200);
    const list = Array.isArray(res.body) ? res.body : res.body.templates || [];
    const found = list.find((t) => t.id === 'admin-test-blue');
    expect(found).toBeTruthy();
    expect(found.design.backgroundColor).toBe('#0f1c3f');
  });

  test('creating a template with a duplicate ID returns a friendly error', async () => {
    const res = await request(app)
      .post('/api/admin/templates')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...templatePayload, name: 'Admin Test Blue Duplicate' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already exists/i);
  });

  test('admin updates an existing template', async () => {
    const res = await request(app)
      .put('/api/admin/templates/admin-test-blue')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...templatePayload, name: 'Admin Test Navy', design: { ...templatePayload.design, backgroundColor: '#1e293b' } });

    expect(res.status).toBe(200);
    expect(res.body.template.name).toBe('Admin Test Navy');
    expect(res.body.template.design.backgroundColor).toBe('#1e293b');
  });

  test('admin delete deactivates the template so it leaves the public list', async () => {
    const del = await request(app)
      .delete('/api/admin/templates/admin-test-blue')
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(200);

    const Template = require('../../src/models/templateModel');
    const doc = await Template.findOne({ id: 'admin-test-blue' });
    expect(doc).toBeTruthy();
    expect(doc.isActive).toBe(false);

    const res = await request(app)
      .get('/api/templates');
    const list = Array.isArray(res.body) ? res.body : res.body.templates || [];
    expect(list.find((t) => t.id === 'admin-test-blue')).toBeUndefined();
  });
});