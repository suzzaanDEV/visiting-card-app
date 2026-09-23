require('../env');
const request = require('supertest');
const { setupIntegrationDb, teardownIntegrationDb } = require('../integrationSetup');

let app;

beforeAll(async () => {
  await setupIntegrationDb();
  ({ app } = require('../../src/app'));
  await require('../../src/seeds/templateSeed')();
}, 30000);

afterAll(async () => {
  await teardownIntegrationDb();
}, 30000);

async function registerAndGetToken(suffix) {
  const unique = Date.now() + suffix;
  const email = `template-card-${unique}@example.com`;
  const password = 'password123';
  const reg = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Template Card User', email, password });
  expect(reg.status).toBe(201);
  const verify = await request(app)
    .post('/api/auth/verify-email')
    .send({ email, otp: reg.body.devOtp });
  expect(verify.status).toBe(200);
  return verify.body.token;
}

describe('Card creation inherits selected template design', () => {
  let token;

  beforeAll(async () => {
    token = await registerAndGetToken('a');
  }, 20000);

  test('creating a card with a templateId bakes the template design into cardDesign', async () => {
    const Template = require('../../src/models/templateModel');
    const tmpl = await Template.findOne({ id: 'elegant-gold' });
    expect(tmpl).toBeTruthy();
    const design = tmpl.design;

    const res = await request(app)
      .post('/api/cards')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Templated Card',
        fullName: 'Templated User',
        jobTitle: 'Designer',
        email: 'templated@example.com',
        phone: '+9779800000001',
        privacy: 'public',
        templateId: 'elegant-gold'
      });

    expect(res.status).toBeLessThan(400);
    const body = res.body.card || res.body;
    expect(body.cardDesign).toBeDefined();
    expect(body.cardDesign.backgroundColor).toBe(design.backgroundColor);
    expect(body.cardDesign.textColor).toBe(design.textColor);
    expect(body.cardDesign.fontFamily).toBe(design.fontFamily);
    expect(body.cardDesign.accentColor).toBe(design.accentColor);
    expect(body.cardDesign.borderRadius).toBe(`${design.borderRadius}px`);
    expect(body.cardDesign.layout).toBe(design.layout);
    expect(body.backgroundColor).toBe(design.backgroundColor);
    expect(body.templateId).toBe('elegant-gold');
    expect(body.templateName).toBe(tmpl.name);
  });

  test('creating a card without a template keeps the default design', async () => {
    const res = await request(app)
      .post('/api/cards')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Plain Card',
        fullName: 'Plain User',
        jobTitle: 'Engineer',
        privacy: 'public'
      });

    expect(res.status).toBeLessThan(400);
    const body = res.body.card || res.body;
    expect(body.cardDesign.backgroundColor).toBe('#ffffff');
    expect(body.cardDesign.layout).toBe('standard');
  });

  test('an explicit cardDesign still wins over the template design', async () => {
    const res = await request(app)
      .post('/api/cards')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Custom Designed Card',
        fullName: 'Custom User',
        jobTitle: 'Designer',
        privacy: 'public',
        templateId: 'tech-neon',
        cardDesign: {
          backgroundColor: '#fafafa',
          textColor: '#111111',
          accentColor: '#000000',
          fontFamily: 'Georgia',
          borderRadius: '8px',
          layout: 'minimal'
        }
      });

    expect(res.status).toBeLessThan(400);
    const body = res.body.card || res.body;
    expect(body.templateId).toBe('tech-neon');
    expect(body.cardDesign.backgroundColor).toBe('#fafafa');
    expect(body.cardDesign.textColor).toBe('#111111');
    expect(body.cardDesign.fontFamily).toBe('Georgia');
  });

  test('the public short-link endpoint serves the card with its template attached', async () => {
    const Template = require('../../src/models/templateModel');
    const tmpl = await Template.findOne({ id: 'creative-gradient' });
    expect(tmpl).toBeTruthy();

    const res = await request(app)
      .post('/api/cards')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Public Templated Card',
        fullName: 'Public Template User',
        jobTitle: 'Designer',
        privacy: 'public',
        templateId: 'creative-gradient'
      });

    const body = res.body.card || res.body;
    expect(body.templateId).toBe('creative-gradient');

    const pub = await request(app).get(`/api/cards/c/${body.shortLink}`);
    expect(pub.status).toBe(200);
    expect(pub.body.card.cardDesign.backgroundColor).toBe(tmpl.design.backgroundColor);
    expect(pub.body.template).toBeDefined();
    expect(pub.body.template.id).toBe('creative-gradient');
  });
});