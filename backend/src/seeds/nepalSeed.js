#!/usr/bin/env node
/**
 * Comprehensive Nepal-context seed script — populates ALL collections with
 * realistic Nepal-based data.
 *
 * Run:  node backend/src/seeds/nepalSeed.js
 *
 * Seeds:
 *   1.  Roles (3)
 *   2.  Users (10)
 *   3.  Categories (12)
 *   4.  Templates (8)
 *   5.  Cards (25)
 *   6.  Notification Templates (8)
 *   7.  Notifications (20)
 *   8.  Broadcasts (5)
 *   9.  Contact Messages (10)
 *  10.  Audit Logs (15)
 *  11.  Card Designs (for each card)
 *
 * Each collection is checked with countDocuments before seeding.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../config.env') });
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const User = require('../models/userModel');
const Card = require('../models/cardModel');
const Template = require('../models/templateModel');
const Category = require('../models/categoryModel');
const Role = require('../models/roleModel');
const NotificationTemplate = require('../models/notificationTemplateModel');
const Notification = require('../models/notificationModel');
const Broadcast = require('../models/broadcastModel');
const ContactMessage = require('../models/contactMessageModel');
const AuditLog = require('../models/auditLogModel');
const CardDesign = require('../models/cardDesignModel');
const Admin = require('../models/adminModel');

const MONGO_URI = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/cardly';
const HASHED_PASSWORD = bcrypt.hashSync('Password123!', 12);

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return count ? shuffled.slice(0, count) : shuffled[0];
}

function daysAgo(n) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

function hoursAgo(n) {
  return new Date(Date.now() - n * 60 * 60 * 1000);
}

function makeShortLink(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') +
    '-' + crypto.randomBytes(4).toString('hex');
}

// ─── ROLE DATA ────────────────────────────────────────────────────────
const ROLES = [
  {
    name: 'user',
    displayName: 'User',
    description: 'Standard user with basic permissions',
    permissions: ['cards.create', 'cards.read', 'cards.update', 'cards.delete', 'users.read'],
    isSystem: true,
    isActive: true
  },
  {
    name: 'editor',
    displayName: 'Editor',
    description: 'Can manage templates and feature cards',
    permissions: [
      'cards.create', 'cards.read', 'cards.update', 'cards.delete', 'cards.feature',
      'templates.read', 'templates.update', 'analytics.read'
    ],
    isSystem: false,
    isActive: true
  },
  {
    name: 'admin',
    displayName: 'Administrator',
    description: 'Full access to all Cardly features',
    permissions: [
      'cards.create', 'cards.read', 'cards.update', 'cards.delete', 'cards.feature',
      'users.read', 'users.update', 'users.delete', 'users.ban',
      'templates.create', 'templates.read', 'templates.update', 'templates.delete',
      'analytics.read', 'analytics.export', 'settings.read', 'settings.update',
      'policies.create', 'policies.read', 'policies.update', 'policies.delete',
      'audit.read', 'notifications.manage', 'crm.read', 'crm.update',
      'backup.create', 'backup.restore'
    ],
    isSystem: true,
    isActive: true
  }
];

// ─── USER DATA ────────────────────────────────────────────────────────
const USERS = [
  {
    name: 'Ram Bahadur Thapa',
    username: 'ramthapa',
    email: 'ram.bahadur.thapa@gmail.com',
    jobTitle: 'Senior Software Engineer',
    company: 'Leapfrog Technology Nepal',
    phone: '+977-9841234567',
    location: 'Kathmandu, Nepal',
    website: 'https://ramthapa.com.np',
    bio: 'Full-stack developer with 7+ years building scalable web and mobile applications for the Nepali market. React, Node.js, and cloud architecture enthusiast.'
  },
  {
    name: 'Sita Devi Poudel',
    username: 'sitadevi',
    email: 'sita.devi.poudel@gmail.com',
    jobTitle: 'Marketing Director',
    company: 'Ncell Axiata',
    phone: '+977-9801234567',
    location: 'Kathmandu, Nepal',
    website: 'https://sitapoudel.com.np',
    bio: 'Results-driven marketing leader with expertise in digital campaigns, brand strategy, and customer acquisition across South Asian markets.'
  },
  {
    name: 'Bikash Gurung',
    username: 'bikashgurung',
    email: 'bikash.gurung@gmail.com',
    jobTitle: 'Restaurant Owner & Chef',
    company: 'Gurung Kitchen & Bar',
    phone: '+977-9851234567',
    location: 'Pokhara, Nepal',
    website: 'https://gurungkitchen.com.np',
    bio: 'Bringing the authentic flavors of Gurung and Thakali cuisine to Lakeside Pokhara. Every plate is a journey through the Himalayas.'
  },
  {
    name: 'Anjali Sharma',
    username: 'anjlisharma',
    email: 'anjali.sharma@gmail.com',
    jobTitle: 'Cardiologist',
    company: 'Patan Hospital',
    phone: '+977-9861234567',
    location: 'Lalitpur, Nepal',
    website: 'https://patanhospital.org.np',
    bio: 'Board-certified cardiologist with 12 years of clinical experience at Patan Hospital. Advocate for preventive cardiac care in rural Nepal.'
  },
  {
    name: 'Deepak Karki',
    username: 'deepakkarki',
    email: 'deepak.karki@gmail.com',
    jobTitle: 'University Lecturer',
    company: 'Tribhuvan University, IOE',
    phone: '+977-9841987654',
    location: 'Kathmandu, Nepal',
    website: 'https://deepakkarki.edu.np',
    bio: 'Lecturer in Computer Science at the Institute of Engineering, Tribhuvan University. Researching AI applications for Nepali language processing.'
  },
  {
    name: 'Priya Magar',
    username: 'priyamagar',
    email: 'priya.magar@gmail.com',
    jobTitle: 'Wedding Photographer',
    company: 'Priya Magar Photography',
    phone: '+977-9851987654',
    location: 'Bhaktapur, Nepal',
    website: 'https://priyamagarphoto.com',
    bio: 'Award-winning photographer based in ancient Bhaktapur. Specializing in weddings, cultural events, and Himalayan landscapes.'
  },
  {
    name: 'Suman Thapa',
    username: 'sumanthapa',
    email: 'suman.thapa@gmail.com',
    jobTitle: 'Chartered Accountant',
    company: 'Thapa & Associates CA Firm',
    phone: '+977-9861987654',
    location: 'Kathmandu, Nepal',
    website: 'https://thapaassociates.com.np',
    bio: 'Chartered accountant providing tax advisory, auditing, and financial consulting to SMEs and startups across Nepal for over 10 years.'
  },
  {
    name: 'Nirmala Bhandari',
    username: 'nirmalabhandari',
    email: 'nirmala.bhandari@gmail.com',
    jobTitle: 'Senior Advocate',
    company: 'Bhandari Law Chambers',
    phone: '+977-9841230008',
    location: 'Kathmandu, Nepal',
    website: 'https://bhandarilaw.com.np',
    bio: 'Senior advocate specializing in corporate law, intellectual property, and constitutional litigation. Advising Nepal businesses since 2011.'
  },
  {
    name: 'Rajesh Khadka',
    username: 'rajeshkhadka',
    email: 'rajesh.khadka@gmail.com',
    jobTitle: 'Digital Marketing Specialist',
    company: 'HimalTech Solutions',
    phone: '+977-9851230009',
    location: 'Chitwan, Nepal',
    website: 'https://rajeshkhadka.com.np',
    bio: 'Digital marketing specialist helping Nepali businesses grow online through SEO, social media marketing, and data-driven advertising strategies.'
  },
  {
    name: 'Sabina Tamang',
    username: 'sabinatamang',
    email: 'sabina.tamang@gmail.com',
    jobTitle: 'Pharmacist & Health Entrepreneur',
    company: 'Himalayan Herbal Remedies',
    phone: '+977-9861230010',
    location: 'Dharan, Nepal',
    website: 'https://himalayanherbal.com.np',
    bio: 'Licensed pharmacist and founder of Himalayan Herbal Remedies. Bridging traditional Nepali herbal medicine with modern pharmaceutical practices.'
  }
];

// ─── CATEGORY DATA ────────────────────────────────────────────────────
const CATEGORIES = [
  { name: 'Business', slug: 'business', description: 'Business professionals, entrepreneurs, and corporate services', icon: 'Briefcase', color: '#2563eb', isFeatured: true, sortOrder: 1 },
  { name: 'Technology', slug: 'technology', description: 'Software engineers, IT consultants, and tech startups', icon: 'Monitor', color: '#6366f1', isFeatured: true, sortOrder: 2 },
  { name: 'Creative', slug: 'creative', description: 'Designers, photographers, artists, and creative agencies', icon: 'Palette', color: '#a855f7', isFeatured: true, sortOrder: 3 },
  { name: 'Healthcare', slug: 'healthcare', description: 'Doctors, pharmacists, nurses, and healthcare services', icon: 'Heart', color: '#ef4444', isFeatured: false, sortOrder: 4 },
  { name: 'Education', slug: 'education', description: 'Teachers, professors, trainers, and educational institutions', icon: 'GraduationCap', color: '#f59e0b', isFeatured: false, sortOrder: 5 },
  { name: 'Personal', slug: 'personal', description: 'Personal branding and individual professionals', icon: 'User', color: '#10b981', isFeatured: false, sortOrder: 6 },
  { name: 'Finance', slug: 'finance', description: 'Accountants, bankers, financial advisors, and auditors', icon: 'DollarSign', color: '#059669', isFeatured: false, sortOrder: 7 },
  { name: 'Real Estate', slug: 'real-estate', description: 'Property agents, builders, and real estate services', icon: 'Home', color: '#0891b2', isFeatured: false, sortOrder: 8 },
  { name: 'Marketing', slug: 'marketing', description: 'Marketing agencies, SEO specialists, and advertising pros', icon: 'TrendingUp', color: '#d946ef', isFeatured: false, sortOrder: 9 },
  { name: 'Legal', slug: 'legal', description: 'Lawyers, advocates, legal advisors, and law firms', icon: 'Scale', color: '#7c3aed', isFeatured: false, sortOrder: 10 },
  { name: 'Food & Hospitality', slug: 'food-hospitality', description: 'Restaurants, hotels, caterers, and tourism services', icon: 'UtensilsCrossed', color: '#ea580c', isFeatured: true, sortOrder: 11 },
  { name: 'Other', slug: 'other', description: 'Miscellaneous professions and services', icon: 'Grid', color: '#64748b', isFeatured: false, sortOrder: 12 }
];

// ─── TEMPLATE DATA (reused from templateSeed) ────────────────────────
const TEMPLATES = [
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
      layout: 'standard',
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
      layout: 'standard',
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

// ─── CARD DATA (25 unique cards) ──────────────────────────────────────
const CARDS = [
  // ── Technology (3) ──────────────────────────────────────────────────
  {
    fullName: 'Ram Bahadur Thapa', jobTitle: 'Senior Software Engineer', company: 'Leapfrog Technology Nepal',
    email: 'ram@lftechnology.com.np', phone: '+977-9841234567', website: 'https://ramthapa.com.np',
    address: 'New Baneshwor', city: 'Kathmandu', state: 'Bagmati', country: 'Nepal', postalCode: '44600',
    bio: 'Full-stack developer specializing in React and Node.js. Building scalable solutions for Nepal\'s growing tech ecosystem.',
    category: 'technology', industry: 'Information Technology', profession: 'Software Engineer',
    tags: ['react', 'nodejs', 'mongodb', 'fullstack', 'nepal'],
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'TypeScript', 'AWS'],
    services: ['Web Development', 'Mobile Apps', 'API Development', 'Cloud Architecture'],
    cardDesign: { backgroundColor: '#f8fafc', textColor: '#1e293b', accentColor: '#047857', fontFamily: 'Inter', borderRadius: '12px', layout: 'standard' }
  },
  {
    fullName: 'Nabin Dhakal', jobTitle: 'DevOps Engineer', company: 'Cloud Himalaya',
    email: 'nabin@cloudhimalaya.com.np', phone: '+977-9841765432', website: 'https://cloudhimalaya.com.np',
    address: 'Lazimpat', city: 'Kathmandu', state: 'Bagmati', country: 'Nepal', postalCode: '44600',
    bio: 'DevOps and cloud infrastructure engineer helping Nepali startups deploy with confidence. AWS and Kubernetes specialist.',
    category: 'technology', industry: 'Cloud Computing', profession: 'DevOps Engineer',
    tags: ['devops', 'aws', 'kubernetes', 'docker', 'ci-cd'],
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Linux', 'CI/CD'],
    services: ['Cloud Migration', 'Infrastructure Setup', 'CI/CD Pipelines', 'Server Management'],
    cardDesign: { backgroundColor: '#0d1117', textColor: '#c9d1d9', accentColor: '#58a6ff', fontFamily: 'JetBrains Mono', borderRadius: '8px', layout: 'standard' }
  },
  {
    fullName: 'Subash Adhikari', jobTitle: 'Mobile App Developer', company: 'Himalayan Apps',
    email: 'subash@himalayanapps.com.np', phone: '+977-9851345678', website: 'https://himalayanapps.com.np',
    address: 'Balaju Industrial District', city: 'Kathmandu', state: 'Bagmati', country: 'Nepal', postalCode: '44600',
    bio: 'Flutter and React Native developer building mobile applications used by millions of Nepalis. Passionate about mobile-first design.',
    category: 'technology', industry: 'Mobile Technology', profession: 'Mobile Developer',
    tags: ['flutter', 'react-native', 'mobile', 'android', 'ios'],
    skills: ['Flutter', 'React Native', 'Dart', 'Firebase', 'App Store Optimization'],
    services: ['iOS & Android Apps', 'Cross-platform Development', 'App Maintenance', 'UI/UX Design'],
    cardDesign: { backgroundColor: '#f0fdf4', textColor: '#14532d', accentColor: '#22c55e', fontFamily: 'Inter', borderRadius: '12px', layout: 'standard' }
  },
  // ── Business (3) ────────────────────────────────────────────────────
  {
    fullName: 'Sita Devi Poudel', jobTitle: 'Marketing Director', company: 'Ncell Axiata',
    email: 'sita.poudel@ncell.axiata.com', phone: '+977-9801234567', website: 'https://sitapoudel.com.np',
    address: 'Kamaladi, First Floor', city: 'Kathmandu', state: 'Bagmati', country: 'Nepal', postalCode: '44600',
    bio: 'Marketing leader driving brand growth across Nepal. Expert in digital campaigns, consumer engagement, and brand strategy.',
    category: 'business', industry: 'Telecommunications', profession: 'Marketing Director',
    tags: ['marketing', 'telecom', 'branding', 'digital', 'nepal'],
    skills: ['Brand Strategy', 'Digital Marketing', 'Market Research', 'Team Leadership', 'Analytics'],
    services: ['Brand Consulting', 'Marketing Strategy', 'Campaign Management', 'Market Research'],
    cardDesign: { backgroundColor: '#eff6ff', textColor: '#1e3a5f', accentColor: '#2563eb', fontFamily: 'Inter', borderRadius: '10px', layout: 'standard' }
  },
  {
    fullName: 'Bishnu Prasad Regmi', jobTitle: 'Managing Director', company: 'Himalayan Trading House',
    email: 'bishnu@himalayantrading.com.np', phone: '+977-9851456789', website: 'https://himalayantrading.com.np',
    address: 'Teku, Trade Road', city: 'Kathmandu', state: 'Bagmati', country: 'Nepal', postalCode: '44600',
    bio: 'Managing a leading import-export house dealing in agricultural produce and consumer goods. 15 years of trade experience.',
    category: 'business', industry: 'Import & Export', profession: 'Managing Director',
    tags: ['trading', 'import-export', 'agriculture', 'nepal', 'business'],
    skills: ['Supply Chain', 'Trade Finance', 'Negotiation', 'Logistics', 'B2B Sales'],
    services: ['Import Services', 'Export Solutions', 'Supply Chain Management', 'Business Consulting'],
    cardDesign: { backgroundColor: '#f8fafc', textColor: '#0f172a', accentColor: '#0ea5e9', fontFamily: 'Inter', borderRadius: '10px', layout: 'standard' }
  },
  {
    fullName: 'Kamala Shrestha', jobTitle: 'Co-Founder & CEO', company: 'Nepali Craft Hub',
    email: 'kamala@nepalicrafthub.com', phone: '+977-9861567890', website: 'https://nepalicrafthub.com',
    address: 'Patan Durbar Square', city: 'Lalitpur', state: 'Bagmati', country: 'Nepal', postalCode: '44700',
    bio: 'Entrepreneur bringing Nepali handcrafted products to the global market. Winner of the 2025 Nepal Women in Business Award.',
    category: 'business', industry: 'E-Commerce & Handicrafts', profession: 'CEO',
    tags: ['ecommerce', 'handicrafts', 'startup', 'women-entrepreneur', 'nepal'],
    skills: ['E-Commerce', 'Product Sourcing', 'International Trade', 'Digital Marketing', 'Leadership'],
    services: ['Handicraft Sourcing', 'Global Shipping', 'Brand Partnerships', 'Corporate Gifting'],
    cardDesign: { backgroundColor: '#fdf4ff', textColor: '#86198f', accentColor: '#d946ef', fontFamily: 'Poppins', borderRadius: '16px', layout: 'standard' }
  },
  // ── Healthcare (2) ──────────────────────────────────────────────────
  {
    fullName: 'Anjali Sharma', jobTitle: 'Cardiologist', company: 'Patan Hospital',
    email: 'anjali.sharma@patanhospital.org.np', phone: '+977-9861234567', website: 'https://patanhospital.org.np',
    address: 'Lagankhel', city: 'Lalitpur', state: 'Bagmati', country: 'Nepal', postalCode: '44700',
    bio: 'Board-certified cardiologist with 12 years of clinical experience. Advocate for affordable preventive cardiac care across Nepal.',
    category: 'healthcare', industry: 'Healthcare', profession: 'Cardiologist',
    tags: ['cardiologist', 'healthcare', 'nepal', 'hospital', 'medicine'],
    skills: ['Cardiology', 'Echocardiography', 'Patient Care', 'Cardiac Surgery Assist', 'Health Education'],
    services: ['Cardiac Consultation', 'ECG & Echo', 'Heart Health Check-ups', 'Cardiac Rehabilitation'],
    cardDesign: { backgroundColor: '#fef2f2', textColor: '#7f1d1d', accentColor: '#dc2626', fontFamily: 'Helvetica', borderRadius: '12px', layout: 'standard' }
  },
  {
    fullName: 'Sabina Tamang', jobTitle: 'Pharmacist & Health Entrepreneur', company: 'Himalayan Herbal Remedies',
    email: 'sabina@himalayanherbal.com.np', phone: '+977-9861230010', website: 'https://himalayanherbal.com.np',
    address: 'Bhanu Chowk', city: 'Dharan', state: 'Koshi', country: 'Nepal', postalCode: '56700',
    bio: 'Licensed pharmacist bridging traditional Nepali herbal medicine with modern pharmaceutical science. Founder of Himalayan Herbal Remedies.',
    category: 'healthcare', industry: 'Pharmaceutical & Herbal Medicine', profession: 'Pharmacist',
    tags: ['pharmacy', 'herbal', 'health', 'dharan', 'nepal'],
    skills: ['Pharmacology', 'Herbal Medicine', 'Product Development', 'Quality Control', 'Health Education'],
    services: ['Herbal Products', 'Health Consultation', 'Custom Remedies', 'Wellness Programs'],
    cardDesign: { backgroundColor: '#ecfdf5', textColor: '#064e3b', accentColor: '#047857', fontFamily: 'Inter', borderRadius: '12px', layout: 'standard' }
  },
  // ── Creative (3) ────────────────────────────────────────────────────
  {
    fullName: 'Priya Magar', jobTitle: 'Wedding Photographer', company: 'Priya Magar Photography',
    email: 'priya@priyamagarphoto.com', phone: '+977-9851987654', website: 'https://priyamagarphoto.com',
    address: 'Durbar Square Area', city: 'Bhaktapur', state: 'Bagmati', country: 'Nepal', postalCode: '44800',
    bio: 'Award-winning wedding and cultural photographer based in ancient Bhaktapur. Capturing the beauty of Nepal, one frame at a time.',
    category: 'creative', industry: 'Photography & Visual Arts', profession: 'Photographer',
    tags: ['photography', 'wedding', 'nepal', 'cultural', 'bhaktapur'],
    skills: ['Portrait Photography', 'Wedding Photography', 'Photo Editing', 'Lightroom', 'Drone Photography', 'Videography'],
    services: ['Wedding Photography', 'Event Coverage', 'Portrait Sessions', 'Cultural Photography', 'Photo Editing'],
    cardDesign: { backgroundColor: '#18181b', textColor: '#fafafa', accentColor: '#f97316', fontFamily: 'Inter', borderRadius: '12px', layout: 'standard' }
  },
  {
    fullName: 'Aayush Bajracharya', jobTitle: 'UI/UX Designer', company: 'PixelNepal Studio',
    email: 'aayush@pixelnepal.com', phone: '+977-9841678901', website: 'https://pixelnepal.com',
    address: 'Jawalakhel, Lalitpur', city: 'Lalitpur', state: 'Bagmati', country: 'Nepal', postalCode: '44700',
    bio: 'UI/UX designer crafting intuitive digital experiences for Nepali startups and global clients. Figma power user.',
    category: 'creative', industry: 'Digital Design', profession: 'UI/UX Designer',
    tags: ['ui-design', 'ux-research', 'figma', 'product-design', 'nepal'],
    skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research', 'Design Systems'],
    services: ['App Design', 'Website Design', 'Brand Identity', 'Design System Creation'],
    cardDesign: { backgroundColor: '#faf5ff', textColor: '#3b0764', accentColor: '#a855f7', fontFamily: 'Inter', borderRadius: '16px', layout: 'standard' }
  },
  {
    fullName: 'Anuradha Koirala', jobTitle: 'Documentary Filmmaker', company: 'Himali Films',
    email: 'anuradha@himalifilms.com', phone: '+977-9851789012', website: 'https://himalifilms.com',
    address: 'Thamel', city: 'Kathmandu', state: 'Bagmati', country: 'Nepal', postalCode: '44600',
    bio: 'Documentary filmmaker exploring social issues and Himalayan culture. Films screened at Kathmandu International Mountain Film Festival.',
    category: 'creative', industry: 'Film & Media', profession: 'Filmmaker',
    tags: ['documentary', 'film', 'kathmandu', 'himalaya', 'storytelling'],
    skills: ['Directing', 'Cinematography', 'Video Editing', 'Sound Design', 'Storytelling'],
    services: ['Documentary Production', 'Corporate Videos', 'Event Films', 'Post-Production'],
    cardDesign: { backgroundColor: '#0f172a', textColor: '#f1f5f9', accentColor: '#f43f5e', fontFamily: 'Inter', borderRadius: '10px', layout: 'standard' }
  },
  // ── Education (2) ───────────────────────────────────────────────────
  {
    fullName: 'Deepak Karki', jobTitle: 'University Lecturer', company: 'Tribhuvan University, IOE',
    email: 'deepak.karki@tu.edu.np', phone: '+977-9841987654', website: 'https://deepakkarki.edu.np',
    address: 'Chhauni, Thapathali', city: 'Kathmandu', state: 'Bagmati', country: 'Nepal', postalCode: '44600',
    bio: 'Lecturer in Computer Science at IOE. Researching NLP for Nepali languages and AI applications for local industries.',
    category: 'education', industry: 'Higher Education', profession: 'University Lecturer',
    tags: ['ai', 'nlp', 'python', 'machine-learning', 'nepal'],
    skills: ['Python', 'Machine Learning', 'NLP', 'TensorFlow', 'Research', 'Teaching'],
    services: ['IT Consulting', 'Research Collaboration', 'Workshops', 'Student Mentoring'],
    cardDesign: { backgroundColor: '#fef9ee', textColor: '#713f12', accentColor: '#ca8a04', fontFamily: 'Garamond', borderRadius: '10px', layout: 'standard' }
  },
  {
    fullName: 'Roshni Nakarmi', jobTitle: 'School Principal', company: 'Kathmandu Valley Academy',
    email: 'roshni@kva.edu.np', phone: '+977-9861890123', website: 'https://kva.edu.np',
    address: 'Baluwatar', city: 'Kathmandu', state: 'Bagmati', country: 'Nepal', postalCode: '44600',
    bio: 'Principal of Kathmandu Valley Academy with 18 years in education. Champion of STEM education and inclusive learning.',
    category: 'education', industry: 'K-12 Education', profession: 'School Principal',
    tags: ['education', 'stem', 'school', 'inclusive-learning', 'nepal'],
    skills: ['School Administration', 'Curriculum Design', 'Teacher Training', 'STEM Education', 'Student Counseling'],
    services: ['School Consultation', 'Teacher Workshops', 'STEM Programs', 'Career Counseling'],
    cardDesign: { backgroundColor: '#f0f9ff', textColor: '#0c4a6e', accentColor: '#0284c7', fontFamily: 'Inter', borderRadius: '12px', layout: 'standard' }
  },
  // ── Legal (2) ───────────────────────────────────────────────────────
  {
    fullName: 'Nirmala Bhandari', jobTitle: 'Senior Advocate', company: 'Bhandari Law Chambers',
    email: 'nirmala@bhandarilaw.com.np', phone: '+977-9841230008', website: 'https://bhandarilaw.com.np',
    address: 'Kamaladi, Floor 3', city: 'Kathmandu', state: 'Bagmati', country: 'Nepal', postalCode: '44600',
    bio: 'Senior advocate specializing in corporate law, intellectual property, and constitutional litigation. Advising Nepal businesses since 2011.',
    category: 'legal', industry: 'Legal Services', profession: 'Advocate',
    tags: ['lawyer', 'corporate-law', 'ip', 'litigation', 'nepal'],
    skills: ['Corporate Law', 'IP Law', 'Litigation', 'Legal Research', 'Contract Drafting', 'Mediation'],
    services: ['Legal Consultation', 'Corporate Advisory', 'Court Representation', 'IP Registration', 'Contract Review'],
    cardDesign: { backgroundColor: '#faf5ff', textColor: '#581c87', accentColor: '#7c3aed', fontFamily: 'Times New Roman', borderRadius: '6px', layout: 'standard' }
  },
  {
    fullName: 'Ashish Ghimire', jobTitle: 'Tax Lawyer', company: 'Ghimire & Partners',
    email: 'ashish@ghimirepartners.com.np', phone: '+977-9851901234', website: 'https://ghimirepartners.com.np',
    address: 'Durbar Marg', city: 'Kathmandu', state: 'Bagmati', country: 'Nepal', postalCode: '44600',
    bio: 'Tax lawyer with deep expertise in Nepal\'s fiscal regulations. Advising multinational companies and SMEs on tax compliance and planning.',
    category: 'legal', industry: 'Tax Law', profession: 'Tax Lawyer',
    tags: ['tax-law', 'compliance', 'fiscal', 'nepal', 'advisory'],
    skills: ['Tax Law', 'Fiscal Planning', 'GST/VAT', 'Income Tax', 'Transfer Pricing'],
    services: ['Tax Compliance', 'Tax Planning', 'GST Registration', 'Audit Representation', 'Tax Litigation'],
    cardDesign: { backgroundColor: '#f8fafc', textColor: '#1e293b', accentColor: '#6366f1', fontFamily: 'Times New Roman', borderRadius: '6px', layout: 'standard' }
  },
  // ── Food & Hospitality (3) ──────────────────────────────────────────
  {
    fullName: 'Bikash Gurung', jobTitle: 'Restaurant Owner & Chef', company: 'Gurung Kitchen & Bar',
    email: 'bikash@gurungkitchen.com.np', phone: '+977-9851234567', website: 'https://gurungkitchen.com.np',
    address: 'Lakeside Road, near Phewa Gate', city: 'Pokhara', state: 'Gandaki', country: 'Nepal', postalCode: '33700',
    bio: 'Bringing authentic Gurung and Thakali cuisine to Lakeside Pokhara since 2018. Every dish celebrates the culinary heritage of the Himalayas.',
    category: 'food-hospitality', industry: 'Restaurant & Hospitality', profession: 'Restaurant Owner',
    tags: ['restaurant', 'nepalifood', 'thakali', 'pokhara', 'hospitality'],
    skills: ['Culinary Arts', 'Restaurant Management', 'Menu Design', 'Food Safety', 'Staff Training'],
    services: ['Dine-in', 'Catering', 'Private Events', 'Cooking Classes', 'Corporate Lunches'],
    cardDesign: { backgroundColor: '#fef3c7', textColor: '#78350f', accentColor: '#d97706', fontFamily: 'Georgia', borderRadius: '8px', layout: 'standard' }
  },
  {
    fullName: 'Mandira Upreti', jobTitle: 'Hotel General Manager', company: 'Annapurna View Resort',
    email: 'mandira@annapurnaview.com.np', phone: '+977-9841012345', website: 'https://annapurnaview.com.np',
    address: 'Sarangkot', city: 'Pokhara', state: 'Gandaki', country: 'Nepal', postalCode: '33700',
    bio: 'General manager of a boutique mountain-view resort in Sarangkot, Pokhara. Creating world-class Himalayan hospitality experiences.',
    category: 'food-hospitality', industry: 'Hotel & Resort', profession: 'General Manager',
    tags: ['hotel', 'resort', 'pokhara', 'hospitality', 'mountains'],
    skills: ['Hotel Management', 'Revenue Management', 'Guest Relations', 'Event Planning', 'Quality Assurance'],
    services: ['Luxury Accommodation', 'Mountain View Dining', 'Trekking Packages', 'Yoga Retreats'],
    cardDesign: { backgroundColor: '#f0fdfa', textColor: '#134e4a', accentColor: '#14b8a6', fontFamily: 'Inter', borderRadius: '10px', layout: 'standard' }
  },
  {
    fullName: 'Rajendra Basnet', jobTitle: 'Catering Business Owner', company: 'Basnet Catering Services',
    email: 'rajendra@basnetcatering.com.np', phone: '+977-9861123456', website: 'https://basnetcatering.com.np',
    address: 'New Baneshwor', city: 'Kathmandu', state: 'Bagmati', country: 'Nepal', postalCode: '44600',
    bio: 'Premium catering services for weddings, corporate events, and cultural celebrations across the Kathmandu Valley.',
    category: 'food-hospitality', industry: 'Catering & Events', profession: 'Catering Owner',
    tags: ['catering', 'events', 'weddings', 'kathmandu', 'nepali-food'],
    skills: ['Event Catering', 'Menu Planning', 'Food Safety', 'Team Management', 'Cost Control'],
    services: ['Wedding Catering', 'Corporate Events', 'Buffet Services', 'Custom Menus', 'Live Cooking Stations'],
    cardDesign: { backgroundColor: '#fff7ed', textColor: '#7c2d12', accentColor: '#ea580c', fontFamily: 'Inter', borderRadius: '10px', layout: 'standard' }
  },
  // ── Finance (2) ─────────────────────────────────────────────────────
  {
    fullName: 'Suman Thapa', jobTitle: 'Chartered Accountant', company: 'Thapa & Associates CA Firm',
    email: 'suman@thapaassociates.com.np', phone: '+977-9861987654', website: 'https://thapaassociates.com.np',
    address: 'New Baneshwor, 4th Floor', city: 'Kathmandu', state: 'Bagmati', country: 'Nepal', postalCode: '44600',
    bio: 'Chartered accountant providing tax advisory, auditing, and financial consulting to SMEs and startups across Nepal.',
    category: 'finance', industry: 'Accounting & Finance', profession: 'Chartered Accountant',
    tags: ['accounting', 'tax', 'audit', 'finance', 'nepal'],
    skills: ['Tax Planning', 'Financial Reporting', 'Audit', 'QuickBooks', 'Nepal Tax Law'],
    services: ['Tax Filing', 'Financial Audit', 'Business Advisory', 'Bookkeeping', 'Company Registration'],
    cardDesign: { backgroundColor: '#f8fafc', textColor: '#0f172a', accentColor: '#334155', fontFamily: 'Helvetica', borderRadius: '6px', layout: 'standard' }
  },
  {
    fullName: 'Gyanendra Bista', jobTitle: 'Financial Analyst', company: 'Nepal Stock Exchange',
    email: 'gyanendra@nepse.com.np', phone: '+977-9841234590', website: 'https://nepse.com.np',
    address: 'Dilli Bazaar', city: 'Kathmandu', state: 'Bagmati', country: 'Nepal', postalCode: '44600',
    bio: 'Financial analyst tracking Nepal\'s capital markets. Expert in equity research, technical analysis, and portfolio management.',
    category: 'finance', industry: 'Capital Markets', profession: 'Financial Analyst',
    tags: ['stock-market', 'finance', 'nepse', 'investment', 'nepal'],
    skills: ['Equity Research', 'Technical Analysis', 'Financial Modeling', 'Portfolio Management', 'Excel'],
    services: ['Market Analysis', 'Investment Advisory', 'Portfolio Review', 'Financial Reports'],
    cardDesign: { backgroundColor: '#ecfdf5', textColor: '#064e3b', accentColor: '#10b981', fontFamily: 'Inter', borderRadius: '8px', layout: 'standard' }
  },
  // ── Marketing (2) ───────────────────────────────────────────────────
  {
    fullName: 'Rajesh Khadka', jobTitle: 'Digital Marketing Specialist', company: 'HimalTech Solutions',
    email: 'rajesh@himaltech.com.np', phone: '+977-9851230009', website: 'https://rajeshkhadka.com.np',
    address: 'Main Road', city: 'Chitwan', state: 'Narayani', country: 'Nepal', postalCode: '44200',
    bio: 'Helping Nepali businesses grow online through data-driven digital marketing strategies. SEO, PPC, and social media expert.',
    category: 'marketing', industry: 'Digital Marketing', profession: 'Marketing Specialist',
    tags: ['seo', 'ppc', 'social-media', 'google-ads', 'nepal'],
    skills: ['SEO', 'Google Ads', 'Facebook Marketing', 'Content Strategy', 'Analytics', 'Email Marketing'],
    services: ['SEO Audits', 'Social Media Management', 'PPC Campaigns', 'Content Marketing'],
    cardDesign: { backgroundColor: '#fdf4ff', textColor: '#86198f', accentColor: '#d946ef', fontFamily: 'Inter', borderRadius: '12px', layout: 'standard' }
  },
  {
    fullName: 'Srijana Thapa', jobTitle: 'Social Media Manager', company: 'BuzzNepal Agency',
    email: 'srijana@buzznepal.com.np', phone: '+977-9801345678', website: 'https://buzznepal.com.np',
    address: 'Thamel', city: 'Kathmandu', state: 'Bagmati', country: 'Nepal', postalCode: '44600',
    bio: 'Managing social media for Nepal\'s biggest brands. Instagram, TikTok, and Facebook marketing specialist with 200K+ managed followers.',
    category: 'marketing', industry: 'Social Media Marketing', profession: 'Social Media Manager',
    tags: ['social-media', 'instagram', 'tiktok', 'content-creation', 'nepal'],
    skills: ['Social Media Strategy', 'Content Creation', 'Influencer Marketing', 'Analytics', 'Video Production'],
    services: ['Social Media Management', 'Influencer Partnerships', 'Content Creation', 'Brand Campaigns'],
    cardDesign: { backgroundColor: '#fef2f2', textColor: '#991b1b', accentColor: '#ef4444', fontFamily: 'Inter', borderRadius: '14px', layout: 'standard' }
  },
  // ── Personal (3) ────────────────────────────────────────────────────
  {
    fullName: 'Suman Bishwokarma', jobTitle: 'Community Organizer', company: 'Kathmandu Tech Community',
    email: 'suman@ktc.com.np', phone: '+977-9841234511', website: 'https://kathmandutech.com.np',
    address: 'Jawalakhel', city: 'Lalitpur', state: 'Bagmati', country: 'Nepal', postalCode: '44700',
    bio: 'Organizing tech meetups, hackathons, and knowledge-sharing events across the Kathmandu Valley. Building Nepal\'s developer community.',
    category: 'personal', industry: 'Community & Events', profession: 'Community Organizer',
    tags: ['community', 'tech-meetup', 'hackathon', 'nepal', 'networking'],
    skills: ['Event Management', 'Community Building', 'Public Speaking', 'Networking', 'Social Media'],
    services: ['Tech Meetups', 'Hackathon Organization', 'Networking Events', 'Workshops'],
    cardDesign: { backgroundColor: '#f0fdf4', textColor: '#14532d', accentColor: '#10b981', fontFamily: 'Inter', borderRadius: '12px', layout: 'standard' }
  },
  // ── Other (2) ───────────────────────────────────────────────────────
  {
    fullName: 'Krishna Tamang', jobTitle: 'Heritage Conservation Specialist', company: 'Nepal Heritage Foundation',
    email: 'krishna@nepalheritage.org.np', phone: '+977-9841234513', website: 'https://nepalheritage.org.np',
    address: 'Patan Museum Road', city: 'Lalitpur', state: 'Bagmati', country: 'Nepal', postalCode: '44700',
    bio: 'Dedicated to preserving Nepal\'s cultural heritage sites. Working on restoration projects across the Kathmandu Valley after the 2015 earthquake.',
    category: 'other', industry: 'Cultural Heritage', profession: 'Conservation Specialist',
    tags: ['heritage', 'conservation', 'nepal', 'restoration', 'culture'],
    skills: ['Heritage Conservation', 'Archaeology', 'Project Management', 'Grant Writing', 'Community Engagement'],
    services: ['Site Restoration', 'Heritage Documentation', 'Cultural Training', 'Grant Applications'],
    cardDesign: { backgroundColor: '#fefce8', textColor: '#713f12', accentColor: '#eab308', fontFamily: 'Garamond', borderRadius: '8px', layout: 'standard' }
  },
  {
    fullName: 'Anil Rai', jobTitle: 'Freelance Graphic Designer', company: 'Rai Design Studio',
    email: 'anil@raidesignstudio.com.np', phone: '+977-9851234514', website: 'https://raidesignstudio.com.np',
    address: 'Dilli Bazaar', city: 'Kathmandu', state: 'Bagmati', country: 'Nepal', postalCode: '44600',
    bio: 'Freelance graphic designer creating brand identities, marketing materials, and digital content for Nepali and international clients.',
    category: 'other', industry: 'Graphic Design', profession: 'Graphic Designer',
    tags: ['graphic-design', 'branding', 'logo', 'nepal', 'freelance'],
    skills: ['Adobe Photoshop', 'Illustrator', 'Figma', 'Brand Identity', 'Typography'],
    services: ['Logo Design', 'Brand Identity Packages', 'Marketing Materials', 'Social Media Graphics'],
    cardDesign: { backgroundColor: '#faf5ff', textColor: '#3b0764', accentColor: '#a855f7', fontFamily: 'Inter', borderRadius: '16px', layout: 'standard' }
  }
];

// ─── NOTIFICATION TEMPLATE DATA ────────────────────────────────────────
const NOTIFICATION_TEMPLATES = [
  {
    name: 'Welcome',
    type: 'in_app',
    title: 'Welcome to Cardly!',
    body: 'Welcome to Cardly, {{userName}}! Start creating your digital business card today.',
    variables: ['userName'],
    isActive: true
  },
  {
    name: 'Card Created',
    type: 'in_app',
    title: 'Card Created Successfully',
    body: 'Your card \'{{cardName}}\' has been created successfully. Share it with your network!',
    variables: ['cardName'],
    isActive: true
  },
  {
    name: 'Card Viewed',
    type: 'in_app',
    title: 'Card Viewed',
    body: 'Your card was viewed by {{viewerName}}. Keep growing your network!',
    variables: ['viewerName'],
    isActive: true
  },
  {
    name: 'Card Loved',
    type: 'in_app',
    title: 'Someone Loved Your Card',
    body: '{{userName}} loved your card \'{{cardName}}\'. Your profile is getting attention!',
    variables: ['userName', 'cardName'],
    isActive: true
  },
  {
    name: 'Access Request',
    type: 'in_app',
    title: 'New Access Request',
    body: '{{requesterName}} has requested access to your private card. Review the request in your dashboard.',
    variables: ['requesterName'],
    isActive: true
  },
  {
    name: 'Access Approved',
    type: 'in_app',
    title: 'Access Request Approved',
    body: 'Your access request for \'{{cardName}}\' has been approved. You can now view the card.',
    variables: ['cardName'],
    isActive: true
  },
  {
    name: 'System Broadcast',
    type: 'in_app',
    title: 'System Notification',
    body: '{{broadcastMessage}}',
    variables: ['broadcastMessage'],
    isActive: true
  },
  {
    name: 'Weekly Digest',
    type: 'email',
    subject: 'Your Weekly Cardly Summary',
    title: 'Weekly Digest',
    body: 'Hi {{userName}}, here\'s your weekly summary: {{viewCount}} views, {{loveCount}} loves, and {{newConnections}} new connections.',
    variables: ['userName', 'viewCount', 'loveCount', 'newConnections'],
    isActive: true
  }
];

// ─── BROADCAST DATA ───────────────────────────────────────────────────
function buildBroadcasts() {
  const now = new Date();
  return [
    {
      title: 'Welcome to Cardly Nepal!',
      message: 'We are excited to launch Cardly in Nepal. Create your digital business card and connect with professionals across the country.',
      notificationType: 'announcement',
      channels: { inApp: true, push: true, email: true },
      audience: 'all',
      status: 'sent',
      sentAt: daysAgo(5),
      priority: 'high',
      emailSubject: 'Welcome to Cardly Nepal!',
      pushTitle: 'Welcome to Cardly!',
      pushBody: 'Create your digital business card and join Nepal\'s professional network.',
      deliveryStats: { total: 100, sent: 100, delivered: 95, failed: 5, opened: 72, clicked: 45 }
    },
    {
      title: 'New Features: AI Card Builder',
      message: 'Try our new AI-powered card builder. Describe your profession and let AI create a stunning business card for you in seconds.',
      notificationType: 'update',
      channels: { inApp: true, push: false, email: true },
      audience: 'active',
      status: 'sent',
      sentAt: daysAgo(2),
      priority: 'normal',
      emailSubject: 'Try the New AI Card Builder on Cardly',
      pushTitle: 'New Feature: AI Card Builder',
      pushBody: 'Let AI create your perfect business card in seconds.',
      deliveryStats: { total: 75, sent: 75, delivered: 70, failed: 5, opened: 55, clicked: 30 }
    },
    {
      title: 'Nepal Business Summit 2026',
      message: 'Cardly is partnering with the Nepal Chamber of Commerce for the annual business summit. Create your event card now!',
      notificationType: 'marketing',
      channels: { inApp: true, push: true, email: true },
      audience: 'all',
      status: 'scheduled',
      scheduledAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      priority: 'normal',
      emailSubject: 'Nepal Business Summit 2026 — Create Your Event Card',
      pushTitle: 'Nepal Business Summit 2026',
      pushBody: 'Create your digital card for the upcoming business summit.',
      deliveryStats: { total: 0, sent: 0, delivered: 0, failed: 0, opened: 0, clicked: 0 }
    },
    {
      title: 'February Security Update',
      message: 'Important: We have enhanced our security features. Enable two-factor authentication to keep your account safe.',
      notificationType: 'security',
      channels: { inApp: true, push: true, email: true },
      audience: 'all',
      status: 'draft',
      priority: 'urgent',
      emailSubject: 'Security Update: Enable Two-Factor Authentication',
      pushTitle: 'Security Update',
      pushBody: 'Enable 2FA to secure your Cardly account.',
      deliveryStats: { total: 0, sent: 0, delivered: 0, failed: 0, opened: 0, clicked: 0 }
    },
    {
      title: 'Cardly New Year Offer',
      message: 'Happy New Year from Cardly! Get 30% off premium templates. Use code NEPAL2026 at checkout.',
      notificationType: 'marketing',
      channels: { inApp: true, push: false, email: true },
      audience: 'new',
      status: 'cancelled',
      priority: 'low',
      emailSubject: 'New Year Offer: 30% Off Premium Templates',
      deliveryStats: { total: 0, sent: 0, delivered: 0, failed: 0, opened: 0, clicked: 0 }
    }
  ];
}

// ─── NOTIFICATION DATA (20 notifications) ─────────────────────────────
function buildNotifications(userIds, cardIds) {
  const types = ['card_loved', 'card_viewed', 'access_request', 'system', 'card_shared', 'access_approved'];
  const notifications = [];

  const templates = [
    { type: 'card_loved', title: 'Someone loved your card!', messageFn: (c) => `Your card "${c}" just received a love. Keep up the great work!` },
    { type: 'card_viewed', title: 'Your card was viewed', messageFn: (c) => `Your card "${c}" was viewed by a visitor. Great exposure!` },
    { type: 'access_request', title: 'New access request', messageFn: (c) => `A user has requested access to your card "${c}". Review it in your dashboard.` },
    { type: 'system', title: 'System Update', messageFn: () => 'Cardly has been updated with new features. Check out the latest improvements!' },
    { type: 'card_shared', title: 'Your card was shared', messageFn: (c) => `Someone shared your card "${c}". Your network is growing!` },
    { type: 'access_approved', title: 'Access request approved', messageFn: (c) => `Your access request for "${c}" has been approved. You can now view the card.` },
    { type: 'system', title: 'Welcome to Cardly!', messageFn: () => 'Thank you for joining Cardly. Start by creating your first digital business card.' },
    { type: 'card_loved', title: 'Card loved!', messageFn: (c) => `Your card "${c}" was loved by another professional. Keep networking!` },
    { type: 'card_viewed', title: 'New view on your card', messageFn: (c) => `"${c}" was viewed from a LinkedIn referral. Your card is getting noticed!` },
    { type: 'system', title: 'Weekly Tip', messageFn: () => 'Tip: Add your social media links to your card to increase engagement by 40%.' }
  ];

  for (let i = 0; i < 20; i++) {
    const t = templates[i % templates.length];
    const recipient = userIds[i % userIds.length];
    const sender = userIds[(i + 1) % userIds.length];
    const card = CARDS[i % CARDS.length];

    notifications.push({
      recipientId: recipient,
      senderId: t.type === 'system' ? undefined : sender,
      type: t.type,
      title: t.title,
      message: t.messageFn(card.fullName),
      data: { cardId: cardIds[i % cardIds.length] },
      isRead: i < 12,
      isDeleted: false,
      createdAt: hoursAgo(rand(1, 168))
    });
  }

  return notifications;
}

// ─── CONTACT MESSAGE DATA ─────────────────────────────────────────────
const CONTACT_MESSAGES = [
  {
    name: 'Hari Prasad Adhikari', email: 'hari.adhikari@gmail.com',
    subject: 'Partnership Inquiry for Hotel Chain',
    message: 'Namaste! I manage a chain of boutique hotels in Pokhara and Kathmandu. We would love to explore a partnership with Cardly to create digital visiting cards for all our staff members. Could you offer bulk pricing?',
    category: 'partnership', status: 'unread', priority: 'high'
  },
  {
    name: 'Gita Devi Joshi', email: 'gita.joshi@gmail.com',
    subject: 'QR Code Not Generating',
    message: 'Hello Cardly team, I created a card but the QR code is not generating properly. It shows a blank white square. I have tried on Chrome and Safari. My device is iPhone 14 Pro. Please help me resolve this.',
    category: 'support', status: 'read', priority: 'high'
  },
  {
    name: 'Mohan Shrestha', email: 'mohan.shrestha@outlook.com',
    subject: 'Suggestion: Nepali Language Support',
    message: 'I really like the Cardly platform! The templates are beautiful and easy to use. As a suggestion, it would be great if you could add Nepali language support for card fields and the UI. Many users in Nepal would appreciate this.',
    category: 'feedback', status: 'replied', priority: 'normal'
  },
  {
    name: 'Laxmi Gurung', email: 'laxmi.gurung@gmail.com',
    subject: 'Bug Report: Profile Picture Upload Crashes',
    message: 'When I try to upload a profile picture larger than 2MB, the entire page crashes and I have to start over. This happens on both Chrome and Firefox on my MacBook Air M2. Please fix this bug.',
    category: 'bug', status: 'archived', priority: 'high'
  },
  {
    name: 'Prakash Rai', email: 'prakash.rai@gmail.com',
    subject: 'Enterprise Plan Inquiry',
    message: 'Namaste! I am interested in using Cardly for my travel agency based in Chitwan. We have 15 staff members. Do you offer any business/enterprise plans with team management and bulk card creation features?',
    category: 'general', status: 'unread', priority: 'normal'
  },
  {
    name: 'Sunita Magar', email: 'sunita.magar@gmail.com',
    subject: 'Feature Request: Card Analytics Dashboard',
    message: 'Hi, it would be very helpful if Cardly provided an analytics dashboard showing card views, visitor demographics, and engagement metrics over time. This would help professionals understand their networking impact.',
    category: 'feedback', status: 'read', priority: 'normal'
  },
  {
    name: 'Ramesh Thapa', email: 'ramesh.thapa@gmail.com',
    subject: 'Card Not Showing in Search',
    message: 'I created a card two weeks ago but it still does not appear in the Cardly search or discovery page. I have verified that my card is set to public. Can you check what went wrong?',
    category: 'support', status: 'replied', priority: 'normal'
  },
  {
    name: 'Anita Karki', email: 'anita.karki@gmail.com',
    subject: 'Integration API Inquiry',
    message: 'Our company wants to integrate Cardly card creation into our employee onboarding portal. Do you offer a REST API for programmatic card creation? We are a tech company based in Kathmandu.',
    category: 'partnership', status: 'unread', priority: 'normal'
  },
  {
    name: 'Bishnu Basnet', email: 'bishnu.basnet@gmail.com',
    subject: 'Billing Issue',
    message: 'I was charged twice for my premium subscription last month. Please refund the extra charge and make sure my billing is correct going forward. Transaction IDs: TXN-20260115-001 and TXN-20260115-002.',
    category: 'support', status: 'read', priority: 'urgent'
  },
  {
    name: 'Kamala Tamang', email: 'kamala.tamang@gmail.com',
    subject: 'Love the Product!',
    message: 'Just wanted to say thank you to the Cardly team! I have been using Cardly for 3 months now and it has helped me connect with so many clients for my bakery business in Pokhara. Keep up the great work!',
    category: 'feedback', status: 'archived', priority: 'low'
  }
];

// ─── AUDIT LOG DATA ───────────────────────────────────────────────────
function buildAuditLogs(userIds) {
  const logs = [
    { action: 'user.register', entityType: 'user', severity: 'info' },
    { action: 'user.login', entityType: 'user', severity: 'info' },
    { action: 'card.create', entityType: 'card', severity: 'info' },
    { action: 'card.view', entityType: 'card', severity: 'info' },
    { action: 'card.love', entityType: 'card', severity: 'info' },
    { action: 'card.share', entityType: 'card', severity: 'info' },
    { action: 'card.update', entityType: 'card', severity: 'info' },
    { action: 'admin.login', entityType: 'admin', severity: 'info' },
    { action: 'admin.update_settings', entityType: 'system', severity: 'warning' },
    { action: 'admin.feature_card', entityType: 'card', severity: 'info' },
    { action: 'auth.password_change', entityType: 'user', severity: 'warning' },
    { action: 'user.register', entityType: 'user', severity: 'info' },
    { action: 'card.create', entityType: 'card', severity: 'info' },
    { action: 'card.view', entityType: 'card', severity: 'info' },
    { action: 'auth.email_verify', entityType: 'user', severity: 'info' }
  ];

  const ips = ['192.168.1.100', '10.0.0.55', '172.16.0.32', '202.59.80.45', '49.237.102.12', '103.25.176.8'];
  const agents = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/121.0',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/605.1.15',
    'Mozilla/5.0 (Linux; Android 14) Chrome/120.0 Mobile'
  ];

  return logs.map((log, i) => ({
    action: log.action,
    entityType: log.entityType,
    entityId: userIds[i % userIds.length],
    userId: userIds[i % userIds.length],
    metadata: new Map([
      ['description', `Seed audit: ${log.action}`],
      ['source', 'nepalSeed']
    ]),
    ipAddress: ips[i % ips.length],
    userAgent: agents[i % agents.length],
    severity: log.severity,
    success: true,
    createdAt: hoursAgo(rand(2, 168))
  }));
}

// ─── MAIN SEED FUNCTION ───────────────────────────────────────────────
async function seed(fresh = false) {
  console.log('Nepal comprehensive seed script starting...');
  console.log('Connecting to MongoDB...');

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB\n');

  // Fresh mode: drop all collections first
  if (fresh) {
    console.log('*** FRESH MODE: Dropping all collections... ***');
    const collections = [
      Role, User, Category, Template, Card, NotificationTemplate,
      Notification, Broadcast, ContactMessage, AuditLog, CardDesign
    ];
    for (const model of collections) {
      const name = model.collection.name;
      const count = await model.countDocuments();
      if (count > 0) {
        await model.deleteMany({});
        console.log(`  Dropped ${name} (${count} docs)`);
      }
    }
    console.log('  All collections cleared.\n');
  }

  // 1. Roles
  console.log('--- Roles ---');
  const roleCount = await Role.countDocuments();
  let roleIds = {};
  if (roleCount === 0) {
    for (const roleData of ROLES) {
      const role = await Role.create(roleData);
      roleIds[role.name] = role._id;
      console.log(`  Created role: ${role.displayName} (${role.name})`);
    }
  } else {
    console.log(`  ${roleCount} roles already exist — seed skipped`);
    const existing = await Role.find({}, 'name _id');
    existing.forEach(r => { roleIds[r.name] = r._id; });
  }
  console.log();

  // Bootstrap default admin (if none exists) — respects ADMIN_EMAIL/ADMIN_PASSWORD
  console.log('--- Admin (bootstrap) ---');
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@gmail.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === 'production' ? null : 'admin123');

    if (!adminPassword) {
      console.log('  ADMIN_PASSWORD not set — skipping admin bootstrap (production requires a password)');
    } else {
      const existingAdmins = await Admin.countDocuments();
      if (existingAdmins === 0) {
        const hashed = await bcrypt.hash(adminPassword, 12);
        const admin = await Admin.create({
          name: 'System Admin',
          username: 'admin',
          email: adminEmail,
          password: hashed,
          role: 'admin',
          isVerified: true,
          isActive: true,
        });
        console.log(`  Created default admin: ${admin.email}`);
      } else {
        console.log(`  ${existingAdmins} admin(s) already exist — admin bootstrap skipped`);
      }
    }
  } catch (err) {
    console.log('  Admin bootstrap failed:', err.message || err);
  }
  console.log();

  // 2. Users
  console.log('--- Users ---');
  const userCount = await User.countDocuments();
  let createdUsers = [];
  if (userCount === 0) {
    for (const userData of USERS) {
      const user = await User.create({
        username: userData.username,
        email: userData.email,
        password: HASHED_PASSWORD,
        name: userData.name,
        jobTitle: userData.jobTitle,
        company: userData.company,
        phone: userData.phone,
        location: userData.location,
        website: userData.website,
        bio: userData.bio,
        isActive: true,
        isEmailVerified: true,
        loginCount: rand(5, 100),
        lastLoginAt: daysAgo(rand(0, 7)),
        privacySettings: {
          defaultCardVisibility: 'public',
          showEmail: true,
          showPhone: true,
          showAddress: true,
          profileVisible: true
        },
        notificationPreferences: {
          pushEnabled: true,
          cardLoved: true,
          cardShared: true,
          cardViewed: true,
          accessRequests: true,
          accessUpdates: true,
          systemAlerts: true,
          weeklyDigest: Math.random() > 0.5
        }
      });
      createdUsers.push(user);
      console.log(`  Created user: ${user.name} (${user.email})`);
    }
  } else {
    console.log(`  ${userCount} users already exist — seed skipped`);
    createdUsers = await User.find({});
  }
  console.log();

  // 3. Categories
  console.log('--- Categories ---');
  const categoryCount = await Category.countDocuments();
  let createdCategories = [];
  if (categoryCount === 0) {
    for (const catData of CATEGORIES) {
      const cat = await Category.create(catData);
      createdCategories.push(cat);
      console.log(`  Created category: ${cat.name} (${cat.slug})`);
    }
  } else {
    console.log(`  ${categoryCount} categories already exist — seed skipped`);
    createdCategories = await Category.find({});
  }
  console.log();

  // 4. Templates
  console.log('--- Templates ---');
  const templateCount = await Template.countDocuments();
  let createdTemplates = [];
  if (templateCount === 0) {
    for (const tplData of TEMPLATES) {
      const tpl = await Template.create({
        ...tplData,
        usageCount: rand(5, 80)
      });
      createdTemplates.push(tpl);
      console.log(`  Created template: ${tpl.name} (${tpl.id})`);
    }
  } else {
    console.log(`  ${templateCount} templates already exist — seed skipped`);
    createdTemplates = await Template.find({});
  }
  console.log();

  // 5. Cards
  console.log('--- Cards ---');
  const cardCount = await Card.countDocuments();
  let createdCards = [];
  if (cardCount === 0) {
    for (let i = 0; i < CARDS.length; i++) {
      const cardData = CARDS[i];
      const owner = createdUsers[i % createdUsers.length];
      const shortLink = makeShortLink(cardData.fullName);

      const card = await Card.create({
        ownerUserId: owner._id,
        title: `${cardData.jobTitle} at ${cardData.company}`,
        fullName: cardData.fullName,
        jobTitle: cardData.jobTitle,
        company: cardData.company,
        email: cardData.email,
        phone: cardData.phone,
        mobile: cardData.phone,
        website: cardData.website,
        address: cardData.address,
        city: cardData.city,
        state: cardData.state,
        country: cardData.country,
        postalCode: cardData.postalCode,
        bio: cardData.bio,
        category: cardData.category,
        industry: cardData.industry,
        profession: cardData.profession,
        tags: cardData.tags,
        skills: cardData.skills,
        services: cardData.services,
        products: [],
        shortLink,
        isPublic: true,
        isActive: true,
        privacy: 'public',
        templateId: createdTemplates[i % createdTemplates.length]?.id || 'default',
        templateName: createdTemplates[i % createdTemplates.length]?.name || 'Default',
        cardDesign: cardData.cardDesign,
        views: rand(10, 500),
        loveCount: rand(0, 50),
        shares: rand(0, 20),
        downloads: rand(0, 15),
        featured: i < 3,
        socialLinks: {
          linkedin: `https://linkedin.com/in/${cardData.fullName.toLowerCase().replace(/\s+/g, '-')}`,
          twitter: Math.random() > 0.5 ? `https://twitter.com/${cardData.fullName.split(' ')[0].toLowerCase()}np` : undefined,
          github: cardData.category === 'technology' ? `https://github.com/${cardData.fullName.split(' ')[0].toLowerCase()}` : undefined,
          facebook: `https://facebook.com/${cardData.fullName.replace(/\s+/g, '')}`,
          instagram: Math.random() > 0.6 ? `https://instagram.com/${cardData.fullName.split(' ')[0].toLowerCase()}_np` : undefined
        }
      });

      createdCards.push(card);
      console.log(`  [${i + 1}/${CARDS.length}] Created card: ${card.fullName} — ${card.city}`);
    }
  } else {
    console.log(`  ${cardCount} cards already exist — seed skipped`);
    createdCards = await Card.find({});
  }
  console.log();

  // 6. Notification Templates
  console.log('--- Notification Templates ---');
  const ntCount = await NotificationTemplate.countDocuments();
  if (ntCount === 0) {
    for (const ntData of NOTIFICATION_TEMPLATES) {
      const nt = await NotificationTemplate.create(ntData);
      console.log(`  Created notification template: ${nt.name} (${nt.type})`);
    }
  } else {
    console.log(`  ${ntCount} notification templates already exist — seed skipped`);
  }
  console.log();

  // 7. Notifications
  console.log('--- Notifications ---');
  const nCount = await Notification.countDocuments();
  if (nCount === 0) {
    const userIds = createdUsers.map(u => u._id);
    const cardIds = createdCards.map(c => c._id);
    const notifData = buildNotifications(userIds, cardIds);

    for (const nd of notifData) {
      const notif = await Notification.create(nd);
      console.log(`  Created notification: ${notif.title} → ${notif.type}`);
    }
  } else {
    console.log(`  ${nCount} notifications already exist — seed skipped`);
  }
  console.log();

  // 8. Broadcasts
  console.log('--- Broadcasts ---');
  const bCount = await Broadcast.countDocuments();
  if (bCount === 0) {
    const broadcasts = buildBroadcasts();
    for (const bData of broadcasts) {
      const bc = await Broadcast.create(bData);
      console.log(`  Created broadcast: ${bc.title} (${bc.status})`);
    }
  } else {
    console.log(`  ${bCount} broadcasts already exist — seed skipped`);
  }
  console.log();

  // 9. Contact Messages
  console.log('--- Contact Messages ---');
  const cmCount = await ContactMessage.countDocuments();
  if (cmCount === 0) {
    for (const msg of CONTACT_MESSAGES) {
      const contact = await ContactMessage.create({
        ...msg,
        ipAddress: `${rand(100, 200)}.${rand(0, 255)}.${rand(0, 255)}.${rand(1, 254)}`,
        userAgent: 'Mozilla/5.0 (Seed Data)'
      });
      console.log(`  Created contact message: ${contact.name} — ${contact.subject} (${contact.status})`);
    }
  } else {
    console.log(`  ${cmCount} contact messages already exist — seed skipped`);
  }
  console.log();

  // 10. Audit Logs
  console.log('--- Audit Logs ---');
  const alCount = await AuditLog.countDocuments();
  if (alCount === 0) {
    const userIds = createdUsers.map(u => u._id);
    const logData = buildAuditLogs(userIds);
    for (const ld of logData) {
      const log = await AuditLog.create(ld);
      console.log(`  Created audit log: ${log.action} (${log.severity})`);
    }
  } else {
    console.log(`  ${alCount} audit logs already exist — seed skipped`);
  }
  console.log();

  // 11. Card Designs
  console.log('--- Card Designs ---');
  const cdCount = await CardDesign.countDocuments();
  if (cdCount === 0) {
    for (const card of createdCards) {
      const designData = {
        cardId: card._id,
        designJson: card.cardDesign || {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          accentColor: '#047857',
          fontFamily: 'Inter',
          borderRadius: '12px',
          layout: 'standard'
        }
      };
      await CardDesign.create(designData);
      console.log(`  Created card design for: ${card.fullName}`);
    }
  } else {
    console.log(`  ${cdCount} card designs already exist — seed skipped`);
  }
  console.log();

  // Summary
  console.log('========================================');
  console.log('  Nepal Seed Completed Successfully!');
  console.log('========================================');
  console.log(`  Roles:                ${roleCount === 0 ? ROLES.length : roleCount}`);
  console.log(`  Users:                ${userCount === 0 ? USERS.length : userCount}`);
  console.log(`  Categories:           ${categoryCount === 0 ? CATEGORIES.length : categoryCount}`);
  console.log(`  Templates:            ${templateCount === 0 ? TEMPLATES.length : templateCount}`);
  console.log(`  Cards:                ${cardCount === 0 ? CARDS.length : cardCount}`);
  console.log(`  Notification Tpls:    ${ntCount === 0 ? NOTIFICATION_TEMPLATES.length : ntCount}`);
  console.log(`  Notifications:        ${nCount === 0 ? 20 : nCount}`);
  console.log(`  Broadcasts:           ${bCount === 0 ? 5 : bCount}`);
  console.log(`  Contact Messages:     ${cmCount === 0 ? CONTACT_MESSAGES.length : cmCount}`);
  console.log(`  Audit Logs:           ${alCount === 0 ? 15 : alCount}`);
  console.log(`  Card Designs:         ${cdCount === 0 ? CARDS.length : cdCount}`);
  console.log('========================================');
  console.log('');
  console.log('All user passwords: Password123!');
  console.log('User emails: firstname.lastname@gmail.com');
  console.log('');

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

if (require.main === module) {
  const fresh = process.argv.includes('--fresh');
  seed(fresh)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Nepal seed failed:', err);
      process.exit(1);
    });
}

module.exports = { seed };
