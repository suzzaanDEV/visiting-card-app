const mongoose = require('mongoose');
const { setupIntegrationDb, teardownIntegrationDb } = require('../integrationSetup');
const advancedSearchAlgorithms = require('../../src/algorithms/advancedSearchAlgorithms');
require('../../src/models/userModel');
require('../../src/models/cardModel');

let ownerId;
let engineerTitleCard;
let engineerNameCard;
let privateCard;

const PUBLIC_FILTER = { isPublic: true, isPrivate: { $ne: true }, privacy: { $ne: 'private' } };

beforeAll(async () => {
  await setupIntegrationDb();
  const owner = await mongoose.model('User').create({
    username: 'search-owner',
    email: `search${Date.now()}@example.com`,
    password: 'password123',
  });
  ownerId = owner._id;

  const base = { ownerUserId: ownerId, isPublic: true, isPrivate: false, privacy: 'public', isActive: true };
  const link = (s) => `link-${s}-${Date.now()}`;

  engineerTitleCard = await mongoose.model('Card').create({
    ...base,
    title: 'Senior Software Engineer',
    fullName: 'Ada Lovelace',
    jobTitle: 'Engineer',
    company: 'Cardly',
    shortLink: link('title'),
  });
  engineerNameCard = await mongoose.model('Card').create({
    ...base,
    title: 'Consultant',
    fullName: 'Alan Engineer Technician',
    jobTitle: 'Analyst',
    company: 'Acme',
    shortLink: link('name'),
  });
  await mongoose.model('Card').create({
    ...base,
    title: 'Unrelated',
    fullName: 'Mia Nonengineer',
    jobTitle: 'Writer',
    company: 'Zebra',
    shortLink: link('other'),
  });
  privateCard = await mongoose.model('Card').create({
    ownerUserId: ownerId,
    title: 'Private Software Engineer',
    fullName: 'Secret Person',
    jobTitle: 'Engineer',
    company: 'Hidden',
    isPublic: false,
    isPrivate: true,
    privacy: 'private',
    isActive: true,
    shortLink: link('private'),
  });
});

afterAll(async () => {
  await teardownIntegrationDb();
});

const runEngine = async (engine, query) => {
  const result = await advancedSearchAlgorithms[engine](query, {
    limit: 10,
    skip: 0,
    filters: PUBLIC_FILTER,
  });
  return result;
};

describe('advanced search algorithm pipelines', () => {
  const engines = ['tfidfSearch', 'bm25Search', 'hybridSearch', 'fuzzySearch'];
  const scoreField = { tfidfSearch: 'tfidfScore', bm25Search: 'bm25Score', hybridSearch: 'tfidfScore', fuzzySearch: 'fuzzyScore' };

  test.each(engines)('%s runs without throwing', async (engine) => {
    const result = await runEngine(engine, 'engineer');
    expect(result.results).toHaveLength(3);
    expect(result.algorithm).toBeDefined();
  });

  test.each(engines)('%s excludes private cards', async (engine) => {
    const result = await runEngine(engine, 'engineer');
    for (const card of result.results) {
      expect(String(card._id)).not.toBe(String(privateCard._id));
      expect(card.isPublic).not.toBe(false);
    }
  });

  test.each([
    ['tfidfSearch', 'tfidfScore'],
    ['bm25Search', 'bm25Score'],
    ['hybridSearch', 'tfidfScore'],
  ])('%s ranks title matches above name-only matches', async (engine, field) => {
    const result = await runEngine(engine, 'engineer');
    const titleCard = result.results.find((c) => String(c._id) === String(engineerTitleCard._id));
    const nameCard = result.results.find((c) => String(c._id) === String(engineerNameCard._id));
    expect(titleCard).toBeDefined();
    expect(nameCard).toBeDefined();
    expect(titleCard[field]).toBeGreaterThan(0);
    expect(titleCard[field]).toBeGreaterThan(nameCard[field]);
  });

  test.each(engines)('%s does not leak temporary pipeline fields', async (engine) => {
    const result = await runEngine(engine, 'engineer');
    for (const card of result.results) {
      expect(card).not.toHaveProperty('_titleWords');
      expect(card).not.toHaveProperty('_nameWords');
      expect(card).not.toHaveProperty('_titleLen');
      expect(card).not.toHaveProperty('docLength');
    }
  });
});