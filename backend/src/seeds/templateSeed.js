#!/usr/bin/env node
/**
 * Seed default card templates (runs on startup if collection is empty).
 */
const Template = require('../models/templateModel');
const logger = require('../utils/logger');

const templates = [
  {
    id: 'professional-dark',
    name: 'Professional Dark',
    description: 'Sleek dark theme for corporate professionals',
    category: 'business',
    tags: ['dark', 'corporate', 'professional'],
    preview: {
      backgroundColor: '#1a1a2e',
      textColor: '#ffffff',
      fontFamily: 'Inter',
      elements: [
        { type: 'text', x: 50, y: 40, text: 'Ram Bahadur Thapa', fontSize: 28, fontWeight: 'bold', fill: '#ffffff' },
        { type: 'text', x: 50, y: 80, text: 'Senior Software Engineer', fontSize: 16, fill: '#94a3b8' },
        { type: 'rect', x: 50, y: 120, width: 100, height: 3, fill: '#047857' }
      ]
    },
    design: {
      backgroundColor: '#1a1a2e',
      textColor: '#ffffff',
      fontFamily: 'Inter',
      layout: 'standard',
      aspectRatio: '16:9',
      elements: [
        { type: 'text', x: 50, y: 40, text: '{{fullName}}', fontSize: 28, fontWeight: 'bold', fill: '#ffffff' },
        { type: 'text', x: 50, y: 80, text: '{{jobTitle}}', fontSize: 16, fill: '#94a3b8' },
        { type: 'text', x: 50, y: 110, text: '{{company}}', fontSize: 14, fill: '#64748b' },
        { type: 'text', x: 50, y: 150, text: '{{email}}', fontSize: 13, fill: '#047857' },
        { type: 'text', x: 50, y: 175, text: '{{phone}}', fontSize: 13, fill: '#94a3b8' },
        { type: 'rect', x: 50, y: 210, width: 100, height: 3, fill: '#047857' }
      ]
    },
    isActive: true,
    isFeatured: true
  },
  {
    id: 'minimal-white',
    name: 'Minimal White',
    description: 'Clean minimal design with white background',
    category: 'business',
    tags: ['minimal', 'clean', 'white'],
    preview: {
      backgroundColor: '#ffffff',
      textColor: '#1a1a1a',
      fontFamily: 'Inter',
      elements: [
        { type: 'text', x: 50, y: 40, text: 'Sita Devi Poudel', fontSize: 28, fontWeight: 'bold', fill: '#1a1a1a' },
        { type: 'text', x: 50, y: 80, text: 'UX Product Designer', fontSize: 16, fill: '#6b7280' },
        { type: 'line', x1: 50, y1: 110, x2: 150, y2: 110, stroke: '#e5e7eb', strokeWidth: 1 }
      ]
    },
    design: {
      backgroundColor: '#ffffff',
      textColor: '#1a1a1a',
      fontFamily: 'Inter',
      layout: 'minimal',
      aspectRatio: '16:9',
      elements: [
        { type: 'text', x: 50, y: 40, text: '{{fullName}}', fontSize: 28, fontWeight: 'bold', fill: '#1a1a1a' },
        { type: 'text', x: 50, y: 80, text: '{{jobTitle}}', fontSize: 16, fill: '#6b7280' },
        { type: 'line', x1: 50, y1: 110, x2: 150, y2: 110, stroke: '#e5e7eb', strokeWidth: 1 },
        { type: 'text', x: 50, y: 140, text: '{{email}}', fontSize: 13, fill: '#374151' },
        { type: 'text', x: 50, y: 165, text: '{{phone}}', fontSize: 13, fill: '#6b7280' },
        { type: 'text', x: 50, y: 190, text: '{{website}}', fontSize: 13, fill: '#047857' }
      ]
    },
    isActive: true,
    isFeatured: true
  },
  {
    id: 'creative-gradient',
    name: 'Creative Gradient',
    description: 'Vibrant gradient background for creatives',
    category: 'creative',
    tags: ['gradient', 'colorful', 'creative'],
    preview: {
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      textColor: '#ffffff',
      fontFamily: 'Poppins',
      elements: [
        { type: 'text', x: 50, y: 40, text: 'Aayush Bajracharya', fontSize: 28, fontWeight: 'bold', fill: '#ffffff' },
        { type: 'text', x: 50, y: 80, text: 'Creative Director', fontSize: 16, fill: 'rgba(255,255,255,0.8)' }
      ]
    },
    design: {
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      textColor: '#ffffff',
      fontFamily: 'Poppins',
      layout: 'creative',
      aspectRatio: '16:9',
      elements: [
        { type: 'text', x: 50, y: 40, text: '{{fullName}}', fontSize: 28, fontWeight: 'bold', fill: '#ffffff' },
        { type: 'text', x: 50, y: 80, text: '{{jobTitle}}', fontSize: 16, fill: 'rgba(255,255,255,0.8)' },
        { type: 'text', x: 50, y: 115, text: '{{company}}', fontSize: 14, fill: 'rgba(255,255,255,0.6)' },
        { type: 'text', x: 50, y: 160, text: '{{email}}', fontSize: 13, fill: '#fbbf24' },
        { type: 'text', x: 50, y: 185, text: '{{phone}}', fontSize: 13, fill: 'rgba(255,255,255,0.7)' },
        { type: 'text', x: 50, y: 210, text: '{{website}}', fontSize: 13, fill: '#fbbf24' }
      ]
    },
    isActive: true,
    isFeatured: true
  },
  {
    id: 'tech-neon',
    name: 'Tech Neon',
    description: 'Futuristic neon theme for tech professionals',
    category: 'tech',
    tags: ['tech', 'neon', 'futuristic'],
    preview: {
      backgroundColor: '#0d1117',
      textColor: '#c9d1d9',
      fontFamily: 'JetBrains Mono',
      elements: [
        { type: 'text', x: 50, y: 40, text: 'Subash Adhikari', fontSize: 28, fontWeight: 'bold', fill: '#c9d1d9' },
        { type: 'text', x: 50, y: 80, text: 'Full Stack Dev', fontSize: 16, fill: '#58a6ff' },
        { type: 'rect', x: 50, y: 115, width: 120, height: 2, fill: '#58a6ff' }
      ]
    },
    design: {
      backgroundColor: '#0d1117',
      textColor: '#c9d1d9',
      fontFamily: 'JetBrains Mono',
      layout: 'modern',
      aspectRatio: '16:9',
      elements: [
        { type: 'text', x: 50, y: 40, text: '{{fullName}}', fontSize: 28, fontWeight: 'bold', fill: '#c9d1d9' },
        { type: 'text', x: 50, y: 80, text: '{{jobTitle}}', fontSize: 16, fill: '#58a6ff' },
        { type: 'rect', x: 50, y: 115, width: 120, height: 2, fill: '#58a6ff' },
        { type: 'text', x: 50, y: 145, text: '{{email}}', fontSize: 13, fill: '#58a6ff' },
        { type: 'text', x: 50, y: 170, text: '{{phone}}', fontSize: 13, fill: '#8b949e' },
        { type: 'text', x: 50, y: 195, text: '{{website}}', fontSize: 13, fill: '#58a6ff' }
      ]
    },
    isActive: true,
    isFeatured: false
  },
  {
    id: 'nature-green',
    name: 'Nature Green',
    description: 'Fresh green theme inspired by nature',
    category: 'personal',
    tags: ['nature', 'green', 'fresh'],
    preview: {
      backgroundColor: '#f0fdf4',
      textColor: '#14532d',
      fontFamily: 'Inter',
      elements: [
        { type: 'text', x: 50, y: 40, text: 'Kamala Shrestha', fontSize: 28, fontWeight: 'bold', fill: '#14532d' },
        { type: 'text', x: 50, y: 80, text: 'Nature Conservationist', fontSize: 16, fill: '#16a34a' }
      ]
    },
    design: {
      backgroundColor: '#f0fdf4',
      textColor: '#14532d',
      fontFamily: 'Inter',
      layout: 'standard',
      aspectRatio: '16:9',
      elements: [
        { type: 'text', x: 50, y: 40, text: '{{fullName}}', fontSize: 28, fontWeight: 'bold', fill: '#14532d' },
        { type: 'text', x: 50, y: 80, text: '{{jobTitle}}', fontSize: 16, fill: '#16a34a' },
        { type: 'text', x: 50, y: 110, text: '{{company}}', fontSize: 14, fill: '#15803d' },
        { type: 'text', x: 50, y: 150, text: '{{email}}', fontSize: 13, fill: '#166534' },
        { type: 'text', x: 50, y: 175, text: '{{phone}}', fontSize: 13, fill: '#15803d' }
      ]
    },
    isActive: true,
    isFeatured: false
  },
  {
    id: 'elegant-gold',
    name: 'Elegant Gold',
    description: 'Premium gold accents on dark background',
    category: 'business',
    tags: ['elegant', 'gold', 'premium'],
    preview: {
      backgroundColor: '#1c1917',
      textColor: '#fef3c7',
      fontFamily: 'Playfair Display',
      elements: [
        { type: 'text', x: 50, y: 40, text: 'Birat Pandey', fontSize: 28, fontWeight: 'bold', fill: '#fef3c7' },
        { type: 'text', x: 50, y: 80, text: 'CEO \u0026 Managing Director', fontSize: 16, fill: '#d97706' }
      ]
    },
    design: {
      backgroundColor: '#1c1917',
      textColor: '#fef3c7',
      fontFamily: 'Playfair Display',
      layout: 'premium',
      aspectRatio: '16:9',
      elements: [
        { type: 'text', x: 50, y: 40, text: '{{fullName}}', fontSize: 28, fontWeight: 'bold', fill: '#fef3c7' },
        { type: 'text', x: 50, y: 80, text: '{{jobTitle}}', fontSize: 16, fill: '#d97706' },
        { type: 'text', x: 50, y: 110, text: '{{company}}', fontSize: 14, fill: '#b45309' },
        { type: 'text', x: 50, y: 150, text: '{{email}}', fontSize: 13, fill: '#d97706' },
        { type: 'text', x: 50, y: 175, text: '{{phone}}', fontSize: 13, fill: '#fef3c7' }
      ]
    },
    isActive: true,
    isFeatured: true
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Calming blue gradient for any profession',
    category: 'general',
    tags: ['ocean', 'blue', 'calming'],
    preview: {
      backgroundColor: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
      textColor: '#ffffff',
      fontFamily: 'Inter',
      elements: [
        { type: 'text', x: 50, y: 40, text: 'Niranjan Adhikari', fontSize: 28, fontWeight: 'bold', fill: '#ffffff' },
        { type: 'text', x: 50, y: 80, text: 'Business Consultant', fontSize: 16, fill: 'rgba(255,255,255,0.8)' }
      ]
    },
    design: {
      backgroundColor: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
      textColor: '#ffffff',
      fontFamily: 'Inter',
      layout: 'standard',
      aspectRatio: '16:9',
      elements: [
        { type: 'text', x: 50, y: 40, text: '{{fullName}}', fontSize: 28, fontWeight: 'bold', fill: '#ffffff' },
        { type: 'text', x: 50, y: 80, text: '{{jobTitle}}', fontSize: 16, fill: 'rgba(255,255,255,0.8)' },
        { type: 'text', x: 50, y: 110, text: '{{company}}', fontSize: 14, fill: 'rgba(255,255,255,0.6)' },
        { type: 'text', x: 50, y: 150, text: '{{email}}', fontSize: 13, fill: '#f0f9ff' },
        { type: 'text', x: 50, y: 175, text: '{{phone}}', fontSize: 13, fill: 'rgba(255,255,255,0.7)' },
        { type: 'text', x: 50, y: 200, text: '{{website}}', fontSize: 13, fill: '#f0f9ff' }
      ]
    },
    isActive: true,
    isFeatured: false
  },
  {
    id: 'photography-dark',
    name: 'Photography',
    description: 'Showcase your visual work',
    category: 'creative',
    tags: ['photography', 'dark', 'visual'],
    preview: {
      backgroundColor: '#18181b',
      textColor: '#fafafa',
      fontFamily: 'Inter',
      elements: [
        { type: 'text', x: 50, y: 40, text: 'Photographer', fontSize: 28, fontWeight: 'bold', fill: '#fafafa' },
        { type: 'text', x: 50, y: 80, text: 'Visual Artist', fontSize: 16, fill: '#f43f5e' }
      ]
    },
    design: {
      backgroundColor: '#18181b',
      textColor: '#fafafa',
      fontFamily: 'Inter',
      layout: 'showcase',
      aspectRatio: '16:9',
      elements: [
        { type: 'text', x: 50, y: 40, text: '{{fullName}}', fontSize: 28, fontWeight: 'bold', fill: '#fafafa' },
        { type: 'text', x: 50, y: 80, text: '{{jobTitle}}', fontSize: 16, fill: '#f43f5e' },
        { type: 'text', x: 50, y: 110, text: '{{company}}', fontSize: 14, fill: '#a1a1aa' },
        { type: 'text', x: 50, y: 150, text: '{{email}}', fontSize: 13, fill: '#f43f5e' },
        { type: 'text', x: 50, y: 175, text: '{{website}}', fontSize: 13, fill: '#fafafa' }
      ]
    },
    isActive: true,
    isFeatured: false
  }
];

async function seedTemplates() {
  const count = await Template.countDocuments();
  if (count === 0) {
    await Template.insertMany(templates);
    logger.info(`Seeded ${templates.length} templates`);
  } else {
    logger.info(`${count} templates already exist — seed skipped`);
  }
}

module.exports = seedTemplates;

if (require.main === module) {
  require('dotenv').config();
  const mongoose = require('mongoose');
  mongoose.connect(process.env.DATABASE_URL).then(async () => {
    await seedTemplates();
    mongoose.disconnect();
  });
}
