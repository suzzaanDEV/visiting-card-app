const {
  buildFeatureVector,
  cosineSimilarity,
  computeIdf,
  dropNoiseTags,
  tokenize,
  recommendCards,
} = require('../../src/algorithms/recommendationEngine');

describe('recommendationEngine', () => {
  const source = {
    _id: '1',
    jobTitle: 'Software Engineer',
    company: 'Acme Corp',
    location: 'Kathmandu',
    category: 'technology',
    bio: 'Building web apps',
  };

  const candidates = [
    { _id: '2', jobTitle: 'Software Engineer', company: 'Acme Corp', location: 'Kathmandu', category: 'technology' },
    { _id: '3', jobTitle: 'Chef', company: 'Food Co', location: 'Pokhara', category: 'food' },
    { _id: '4', jobTitle: 'Backend Developer', company: 'Acme Corp', location: 'Kathmandu', category: 'technology' },
  ];

  test('cosineSimilarity returns 1 for identical vectors', () => {
    const v = buildFeatureVector(source);
    expect(cosineSimilarity(v, v)).toBeCloseTo(1, 5);
  });

  test('recommendCards ranks similar cards higher', () => {
    const results = recommendCards(source, candidates, 2);
    expect(results).toHaveLength(2);
    expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
    expect(['2', '4']).toContain(String(results[0].card._id));
  });

  test('recommendCards excludes source card', () => {
    const results = recommendCards(source, [source, ...candidates], 5);
    expect(results.every((r) => String(r.card._id) !== '1')).toBe(true);
  });

  test('similarity score is capped at 100 (never shows >100% match)', () => {
    const rich = {
      _id: '10',
      jobTitle: 'Software Engineer',
      company: 'Acme Corp',
      category: 'technology',
      profession: 'engineer',
      city: 'Kathmandu',
      country: 'Nepal',
      skills: ['node', 'react', 'js'],
      services: ['web dev'],
      tags: ['web', 'startup'],
      bio: 'Building web apps',
    };
    const clone = { ...rich, _id: '11' };
    const duplicates = Array.from({ length: 12 }, (_, i) => ({ ...rich, _id: String(100 + i) }));

    const results = recommendCards(rich, [clone, ...duplicates], 13);
    expect(results).toHaveLength(13);
    results.forEach((r) => {
      expect(r.score).toBeGreaterThan(0);
      expect(r.score).toBeLessThanOrEqual(100);
    });
    expect(results[0].score).toBeCloseTo(100, 1);
  });

  test('tokenize keeps 2-char topical tokens and drops stopwords', () => {
    expect(tokenize('ui/ux designer')).toEqual(expect.arrayContaining(['ui', 'ux', 'designer']));
    expect(tokenize('the for and in up')).toEqual([]);
    expect(tokenize('brand identity')).toContain('brand');
  });

  test('computeIdf amplifies rare tokens over ubiquitous ones', () => {
    const docs = [
      { jobTitle: 'Cardiologist', city: 'Lalitpur', country: 'Nepal' },
      { jobTitle: 'Cardiologist', city: 'Kathmandu', country: 'Nepal' },
      { jobTitle: 'UI/UX Designer', city: 'Lalitpur', country: 'Nepal' },
      { jobTitle: 'Graphic Designer', city: 'Pokhara', country: 'Nepal' },
    ];
    const idf = computeIdf(docs);
    expect(idf.cardiologist).toBeGreaterThan(idf.nepal);
    expect(idf.designer).toBeGreaterThan(idf.nepal);
    expect(idf.nepal).toBeGreaterThanOrEqual(1);
  });

  test('dropNoiseTags removes tags shared by most of the corpus only', () => {
    const cards = [
      { _id: '1', tags: ['nepal', 'figma'] },
      { _id: '2', tags: ['nepal', 'art'] },
      { _id: '3', tags: ['nepal', 'ux'] },
    ];
    const clean = dropNoiseTags(cards);
    expect(clean[0].tags).toEqual(['figma']);
    expect(clean[1].tags).toEqual(['art']);
    expect(clean[2].tags).toEqual(['ux']);
  });

  test('a same-city cardiologist is not recommended above fellow designers for a UI/UX designer', () => {
    const designer = {
      _id: '1',
      jobTitle: 'UI/UX Designer',
      company: 'PixelNepal Studio',
      category: 'creative',
      city: 'Lalitpur',
      country: 'Nepal',
      industry: 'Digital Design',
      profession: 'UI/UX Designer',
      skills: ['Figma', 'Prototyping'],
      tags: ['ui-design', 'figma'],
      bio: 'Crafting intuitive digital experiences',
    };
    const cardiologist = {
      _id: '2',
      jobTitle: 'Cardiologist',
      company: 'Patan Hospital',
      category: 'healthcare',
      city: 'Lalitpur',
      country: 'Nepal',
      industry: 'Healthcare',
      profession: 'Cardiologist',
      skills: ['Echocardiography'],
      tags: ['cardiologist', 'nepal'],
      bio: 'Heart care and check ups',
    };
    const graphicDesigner = {
      _id: '3',
      jobTitle: 'Graphic Designer',
      company: 'Creative Co',
      category: 'creative',
      city: 'Kathmandu',
      country: 'Nepal',
      industry: 'Design',
      profession: 'Graphic Designer',
      skills: ['Figma', 'Illustration'],
      tags: ['art', 'figma'],
      bio: 'Posters and brand identity',
    };
    const uxResearcher = {
      _id: '4',
      jobTitle: 'UX Researcher',
      company: 'Studio Nepal',
      category: 'creative',
      city: 'Pokhara',
      country: 'Nepal',
      industry: 'Digital Design',
      profession: 'UX Researcher',
      skills: ['User Research', 'Prototyping'],
      tags: ['ux', 'research'],
      bio: 'Usability testing with real users',
    };

    const results = recommendCards(designer, [cardiologist, graphicDesigner, uxResearcher], 5);
    const byId = (id) => results.find((r) => String(r.card._id) === id);
    const cardiologistScore = byId('2').score;
    const graphicScore = byId('3').score;
    const uxScore = byId('4').score;

    expect(graphicScore).toBeGreaterThan(cardiologistScore);
    expect(uxScore).toBeGreaterThan(cardiologistScore);
    expect(['3', '4']).toContain(String(results[0].card._id));
    expect(cardiologistScore).toBeLessThan(20);
  });
});
