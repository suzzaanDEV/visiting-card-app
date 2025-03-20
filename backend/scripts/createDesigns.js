require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const Template = require('../src/models/templateModel');
const logger = require('../src/utils/logger');

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const designs = [
  {
    id: 'modern-business',
    name: 'Modern Business',
    description: 'Clean and professional design for corporate use',
    category: 'Business',
    preview: {
      backgroundColor: '#667eea',
      elements: [
        { type: 'text', text: 'Suzan Ghimire', x: 50, y: 80, fontSize: 28, color: '#ffffff' },
        { type: 'text', text: 'CEO & Founder', x: 50, y: 120, fontSize: 16, color: '#ffffff' },
        { type: 'text', text: 'Tech Solutions Inc.', x: 50, y: 160, fontSize: 14, color: '#ffffff' }
      ]
    },
    isActive: true
  },
  {
    id: 'creative-portfolio',
    name: 'Creative Portfolio',
    description: 'Artistic design for creative professionals',
    category: 'Creative',
    preview: {
      backgroundColor: '#ff6b6b',
      elements: [
        { type: 'text', text: 'SARAH WILSON', x: 50, y: 60, fontSize: 24, color: '#ffffff' },
        { type: 'text', text: 'Creative Director', x: 50, y: 100, fontSize: 14, color: '#ffffff' },
        { type: 'text', text: 'Design Studio', x: 50, y: 130, fontSize: 12, color: '#ffffff' }
      ]
    },
    isActive: true
  },
  {
    id: 'minimalist-clean',
    name: 'Minimalist Clean',
    description: 'Simple and elegant design',
    category: 'Minimalist',
    preview: {
      backgroundColor: '#ffffff',
      elements: [
        { type: 'text', text: 'MIKE CHEN', x: 50, y: 80, fontSize: 26, color: '#333333' },
        { type: 'text', text: 'Software Engineer', x: 50, y: 120, fontSize: 14, color: '#666666' },
        { type: 'text', text: 'TechCorp', x: 50, y: 150, fontSize: 12, color: '#666666' }
      ]
    },
    isActive: true
  },
  {
    id: 'elegant-dark',
    name: 'Elegant Dark',
    description: 'Sophisticated dark theme design',
    category: 'Elegant',
    preview: {
      backgroundColor: '#2c3e50',
      elements: [
        { type: 'text', text: 'EMMA DAVIS', x: 50, y: 70, fontSize: 28, color: '#ecf0f1' },
        { type: 'text', text: 'Marketing Director', x: 50, y: 110, fontSize: 16, color: '#bdc3c7' },
        { type: 'text', text: 'Global Marketing', x: 50, y: 140, fontSize: 14, color: '#bdc3c7' }
      ]
    },
    isActive: true
  },
  {
    id: 'vibrant-gradient',
    name: 'Vibrant Gradient',
    description: 'Colorful and energetic design',
    category: 'Vibrant',
    preview: {
      backgroundColor: '#ff9a9e',
      elements: [
        { type: 'text', text: 'ALEX JOHNSON', x: 50, y: 75, fontSize: 26, color: '#ffffff' },
        { type: 'text', text: 'Product Manager', x: 50, y: 115, fontSize: 15, color: '#ffffff' },
        { type: 'text', text: 'Innovation Labs', x: 50, y: 145, fontSize: 13, color: '#ffffff' }
      ]
    },
    isActive: true
  },
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    description: 'Professional blue theme for business',
    category: 'Corporate',
    preview: {
      backgroundColor: '#1e3c72',
      elements: [
        { type: 'text', text: 'DAVID BROWN', x: 50, y: 80, fontSize: 27, color: '#ffffff' },
        { type: 'text', text: 'Financial Advisor', x: 50, y: 120, fontSize: 16, color: '#ffffff' },
        { type: 'text', text: 'Blue Chip Financial', x: 50, y: 150, fontSize: 14, color: '#ffffff' }
      ]
    },
    isActive: true
  },
  {
    id: 'tech-futuristic',
    name: 'Tech Futuristic',
    description: 'Modern tech-inspired design',
    category: 'Technology',
    preview: {
      backgroundColor: '#0f0f23',
      elements: [
        { type: 'text', text: 'LISA WONG', x: 50, y: 70, fontSize: 25, color: '#00ff88' },
        { type: 'text', text: 'AI Research Scientist', x: 50, y: 110, fontSize: 14, color: '#00ff88' },
        { type: 'text', text: 'FutureTech Labs', x: 50, y: 140, fontSize: 12, color: '#00ff88' }
      ]
    },
    isActive: true
  },
  {
    id: 'warm-autumn',
    name: 'Warm Autumn',
    description: 'Cozy autumn-inspired design',
    category: 'Warm',
    preview: {
      backgroundColor: '#d4a574',
      elements: [
        { type: 'text', text: 'RACHEL GREEN', x: 50, y: 75, fontSize: 26, color: '#8b4513' },
        { type: 'text', text: 'Interior Designer', x: 50, y: 115, fontSize: 15, color: '#8b4513' },
        { type: 'text', text: 'Cozy Spaces Design', x: 50, y: 145, fontSize: 13, color: '#8b4513' }
      ]
    },
    isActive: true
  },
  {
    id: 'elegant-gold',
    name: 'Elegant Gold',
    description: 'Luxurious gold-themed design',
    category: 'Luxury',
    preview: {
      backgroundColor: '#ffd700',
      elements: [
        { type: 'text', text: 'JAMES WILSON', x: 50, y: 80, fontSize: 28, color: '#8b4513' },
        { type: 'text', text: 'Luxury Consultant', x: 50, y: 120, fontSize: 16, color: '#8b4513' },
        { type: 'text', text: 'Prestige Services', x: 50, y: 150, fontSize: 14, color: '#8b4513' }
      ]
    },
    isActive: true
  },
  {
    id: 'nature-inspired',
    name: 'Nature Inspired',
    description: 'Fresh and natural design theme',
    category: 'Nature',
    preview: {
      backgroundColor: '#4ade80',
      elements: [
        { type: 'text', text: 'MARIA GARCIA', x: 50, y: 75, fontSize: 26, color: '#ffffff' },
        { type: 'text', text: 'Environmental Scientist', x: 50, y: 115, fontSize: 15, color: '#ffffff' },
        { type: 'text', text: 'Green Earth Research', x: 50, y: 145, fontSize: 13, color: '#ffffff' }
      ]
    },
    isActive: true
  }
];

async function createDesigns() {
  try {
    console.log('🎨 Creating 10 beautiful card designs...');
    
    for (const design of designs) {
      const existingTemplate = await Template.findOne({ id: design.id });
      
      if (existingTemplate) {
        console.log(`   ⚠️  Template ${design.name} already exists, updating...`);
        existingTemplate.name = design.name;
        existingTemplate.description = design.description;
        existingTemplate.category = design.category;
        existingTemplate.preview = design.preview;
        existingTemplate.isActive = design.isActive;
        await existingTemplate.save();
      } else {
        console.log(`   ✅ Creating template: ${design.name}`);
        const template = new Template({
          id: design.id,
          name: design.name,
          description: design.description,
          category: design.category,
          preview: design.preview,
          isActive: design.isActive
        });
        await template.save();
      }
    }
    
    console.log('🎉 All 10 designs created successfully!');
    console.log('\n📋 Design Summary:');
    designs.forEach((design, index) => {
      console.log(`   ${index + 1}. ${design.name} (${design.category})`);
    });
    
  } catch (error) {
    console.error('❌ Error creating designs:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

createDesigns(); 