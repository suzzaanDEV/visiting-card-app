const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../src/models/userModel');
const Card = require('../src/models/cardModel');
const Template = require('../src/models/templateModel');

// Mock data for users
const mockUsers = [
  {
    username: 'ram.thapa',
    email: 'ram.thapa@gmail.com',
    password: 'password123',
    name: 'Ram Thapa',
    phone: '+977-9841234567',
    location: 'Kathmandu, Nepal',
    website: 'www.ramthapa.com',
    bio: 'Experienced software engineer with 5+ years in web development',
    jobTitle: 'Senior Software Engineer',
    company: 'Tech Solutions Nepal'
  },
  {
    username: 'sita.shrestha',
    email: 'sita.shrestha@gmail.com',
    password: 'password123',
    name: 'Sita Shrestha',
    phone: '+977-9842345678',
    location: 'Pokhara, Nepal',
    website: 'www.sitashrestha.com',
    bio: 'Creative designer passionate about user experience',
    jobTitle: 'UI/UX Designer',
    company: 'Design Studio Nepal'
  },
  {
    username: 'hari.kc',
    email: 'hari.kc@gmail.com',
    password: 'password123',
    name: 'Hari KC',
    phone: '+977-9843456789',
    location: 'Lalitpur, Nepal',
    website: 'www.harikec.com',
    bio: 'Marketing professional with expertise in digital marketing',
    jobTitle: 'Marketing Manager',
    company: 'Digital Marketing Nepal'
  }
];

// Mock data for cards (mix of public and private)
const mockCards = [
  // Public Cards
  {
    title: 'Ram Thapa - Software Engineer',
    fullName: 'Ram Thapa',
    jobTitle: 'Senior Software Engineer',
    company: 'Tech Solutions Nepal',
    email: 'ram.thapa@gmail.com',
    phone: '+977-9841234567',
    website: 'www.ramthapa.com',
    address: 'Thamel, Kathmandu, Nepal',
    bio: 'Experienced software engineer with 5+ years in web development. Specialized in React, Node.js, and MongoDB.',
    backgroundColor: '#667eea',
    textColor: '#ffffff',
    fontFamily: 'Arial',
    privacy: 'public',
    templateId: 'default',
    isPublic: true,
    isActive: true
  },
  {
    title: 'Sita Shrestha - UI/UX Designer',
    fullName: 'Sita Shrestha',
    jobTitle: 'UI/UX Designer',
    company: 'Design Studio Nepal',
    email: 'sita.shrestha@gmail.com',
    phone: '+977-9842345678',
    website: 'www.sitashrestha.com',
    address: 'Lakeside, Pokhara, Nepal',
    bio: 'Creative designer passionate about user experience and beautiful interfaces.',
    backgroundColor: '#f093fb',
    textColor: '#ffffff',
    fontFamily: 'Arial',
    privacy: 'public',
    templateId: 'modern',
    isPublic: true,
    isActive: true
  },
  {
    title: 'Hari KC - Marketing Manager',
    fullName: 'Hari KC',
    jobTitle: 'Marketing Manager',
    company: 'Digital Marketing Nepal',
    email: 'hari.kc@gmail.com',
    phone: '+977-9843456789',
    website: 'www.harikec.com',
    address: 'Patan, Lalitpur, Nepal',
    bio: 'Marketing professional with expertise in digital marketing and brand strategy.',
    backgroundColor: '#4facfe',
    textColor: '#ffffff',
    fontFamily: 'Arial',
    privacy: 'public',
    templateId: 'minimal',
    isPublic: true,
    isActive: true
  },
  // Private Cards
  {
    title: 'Private Card - John Doe',
    fullName: 'John Doe',
    jobTitle: 'Consultant',
    company: 'Private Consulting',
    email: 'john.doe@private.com',
    phone: '+977-9844567890',
    website: 'www.johndoe.com',
    address: 'Private Address, Kathmandu',
    bio: 'Private consultant with specialized expertise.',
    backgroundColor: '#43e97b',
    textColor: '#ffffff',
    fontFamily: 'Arial',
    privacy: 'private',
    templateId: 'creative',
    isPublic: false,
    isActive: true
  },
  {
    title: 'Private Card - Jane Smith',
    fullName: 'Jane Smith',
    jobTitle: 'Freelancer',
    company: 'Independent',
    email: 'jane.smith@private.com',
    phone: '+977-9845678901',
    website: 'www.janesmith.com',
    address: 'Private Location, Nepal',
    bio: 'Independent freelancer working on various projects.',
    backgroundColor: '#fa709a',
    textColor: '#ffffff',
    fontFamily: 'Arial',
    privacy: 'private',
    templateId: 'default',
    isPublic: false,
    isActive: true
  }
];

// Mock templates
const mockTemplates = [
  {
    id: 'default',
    name: 'Classic Template',
    description: 'Clean and professional design',
    category: 'Professional',
    isActive: true,
    isFeatured: true,
    preview: {
      backgroundColor: '#667eea',
      textColor: '#ffffff'
    },
    design: {
      backgroundColor: '#667eea',
      textColor: '#ffffff'
    }
  },
  {
    id: 'modern',
    name: 'Modern Template',
    description: 'Contemporary and stylish',
    category: 'Modern',
    isActive: true,
    isFeatured: true,
    preview: {
      backgroundColor: '#f093fb',
      textColor: '#ffffff'
    },
    design: {
      backgroundColor: '#f093fb',
      textColor: '#ffffff'
    }
  },
  {
    id: 'minimal',
    name: 'Minimal Template',
    description: 'Simple and elegant',
    category: 'Minimal',
    isActive: true,
    isFeatured: false,
    preview: {
      backgroundColor: '#4facfe',
      textColor: '#ffffff'
    },
    design: {
      backgroundColor: '#4facfe',
      textColor: '#ffffff'
    }
  },
  {
    id: 'creative',
    name: 'Creative Template',
    description: 'Bold and artistic',
    category: 'Creative',
    isActive: true,
    isFeatured: false,
    preview: {
      backgroundColor: '#43e97b',
      textColor: '#ffffff'
    },
    design: {
      backgroundColor: '#43e97b',
      textColor: '#ffffff'
    }
  }
];

async function seedMockData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Card.deleteMany({});
    await Template.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of mockUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`Created user: ${savedUser.username}`);
    }

    // Create templates
    for (const templateData of mockTemplates) {
      const template = new Template(templateData);
      await template.save();
      console.log(`Created template: ${template.name}`);
    }

    // Create cards
    for (let i = 0; i < mockCards.length; i++) {
      const cardData = mockCards[i];
      const user = createdUsers[i % createdUsers.length]; // Distribute cards among users
      
      // Generate short link
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000000000);
      const combined = timestamp + random;
      const shortLink = combined.toString(36).substring(0, 8);

      const card = new Card({
        ...cardData,
        ownerUserId: user._id,
        shortLink,
        loveCount: Math.floor(Math.random() * 50),
        views: Math.floor(Math.random() * 200),
        shares: Math.floor(Math.random() * 20),
        downloads: Math.floor(Math.random() * 10)
      });
      
      await card.save();
      console.log(`Created card: ${card.title} (${card.privacy})`);
    }

    console.log('\n✅ Mock data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users created: ${createdUsers.length}`);
    console.log(`- Templates created: ${mockTemplates.length}`);
    console.log(`- Cards created: ${mockCards.length}`);
    console.log(`- Public cards: ${mockCards.filter(c => c.privacy === 'public').length}`);
    console.log(`- Private cards: ${mockCards.filter(c => c.privacy === 'private').length}`);
    
    console.log('\n🔑 Login Credentials:');
    mockUsers.forEach(user => {
      console.log(`- Email: ${user.email}, Password: ${user.password}`);
    });

    console.log('\n🎯 Test URLs:');
    console.log('- Public cards will be visible in discovery');
    console.log('- Private cards require QR code access');
    console.log('- Login to see full contact details');

  } catch (error) {
    console.error('Error seeding mock data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedMockData(); 