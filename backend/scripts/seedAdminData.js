const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/userModel');
const Card = require('../src/models/cardModel');
const Template = require('../src/models/templateModel');
const Admin = require('../src/models/adminModel');
require('dotenv').config();

const seedAdminData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await Admin.findOneAndUpdate(
      { email: 'admin@cardly.com' },
      {
        username: 'admin',
        email: 'admin@cardly.com',
        password: adminPassword,
        role: 'admin',
        isActive: true
      },
      { upsert: true, new: true }
    );
    console.log('Admin user created/updated:', admin.email);

    // Create sample users
    const users = [];
    for (let i = 1; i <= 20; i++) {
      const userPassword = await bcrypt.hash('password123', 10);
      const user = await User.findOneAndUpdate(
        { email: `user${i}@example.com` },
        {
          username: `user${i}`,
          email: `user${i}@example.com`,
          password: userPassword,
          name: `User ${i}`,
          isActive: true,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
        },
        { upsert: true, new: true }
      );
      users.push(user);
    }
    console.log(`Created ${users.length} sample users`);

    // Create sample templates
    const templates = [];
    const templateData = [
      {
        name: 'Professional Blue',
        category: 'Professional',
        description: 'Clean and professional design with blue accent',
        isActive: true,
        isFeatured: true,
        usageCount: 156,
        rating: 4.8
      },
      {
        name: 'Creative Purple',
        category: 'Creative',
        description: 'Modern creative design with purple gradient',
        isActive: true,
        isFeatured: true,
        usageCount: 134,
        rating: 4.6
      },
      {
        name: 'Minimal White',
        category: 'Minimal',
        description: 'Minimalist design with clean white background',
        isActive: true,
        isFeatured: false,
        usageCount: 98,
        rating: 4.5
      },
      {
        name: 'Corporate Dark',
        category: 'Corporate',
        description: 'Professional corporate design with dark theme',
        isActive: true,
        isFeatured: false,
        usageCount: 87,
        rating: 4.3
      },
      {
        name: 'Modern Gradient',
        category: 'Modern',
        description: 'Contemporary design with gradient effects',
        isActive: true,
        isFeatured: true,
        usageCount: 76,
        rating: 4.7
      }
    ];

    for (let i = 0; i < templateData.length; i++) {
      const templateInfo = templateData[i];
      const template = await Template.findOneAndUpdate(
        { name: templateInfo.name },
        {
          id: `template-${i + 1}`,
          ...templateInfo,
          design: {
            backgroundColor: '#ffffff',
            elements: []
          },
          preview: {
            backgroundColor: '#ffffff',
            elements: []
          }
        },
        { upsert: true, new: true }
      );
      templates.push(template);
    }
    console.log(`Created ${templates.length} sample templates`);

    // Create sample cards
    const cards = [];
    const cardTitles = [
      'John Doe - CEO',
      'Jane Smith - Designer',
      'Mike Johnson - Developer',
      'Sarah Wilson - Manager',
      'David Brown - Consultant',
      'Emily Davis - Marketing',
      'Robert Wilson - Sales',
      'Lisa Anderson - HR',
      'James Taylor - Finance',
      'Maria Garcia - Operations'
    ];

    for (let i = 0; i < 50; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
      const randomTitle = cardTitles[Math.floor(Math.random() * cardTitles.length)];
      
      const card = await Card.findOneAndUpdate(
        { title: `${randomTitle} ${i + 1}` },
        {
          title: `${randomTitle} ${i + 1}`,
          fullName: randomTitle.split(' - ')[0],
          jobTitle: randomTitle.split(' - ')[1],
          company: 'Example Corp',
          email: `${randomTitle.split(' - ')[0].toLowerCase()}@example.com`,
          phone: `+1-555-${Math.floor(Math.random() * 9000) + 1000}`,
          website: 'www.example.com',
          address: '123 Thamel Marg, Kathmandu, Nepal',
          bio: 'Professional bio for ' + randomTitle.split(' - ')[0],
          ownerUserId: randomUser._id,
          templateId: randomTemplate.id,
          shortLink: `card-${i + 1}-${Math.random().toString(36).substr(2, 9)}`,
          isPublic: true,
          featured: Math.random() > 0.7,
          views: Math.floor(Math.random() * 1000) + 50,
          loveCount: Math.floor(Math.random() * 100) + 5,
          shares: Math.floor(Math.random() * 50) + 2,
          downloads: Math.floor(Math.random() * 20) + 1,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        },
        { upsert: true, new: true }
      );
      cards.push(card);
    }
    console.log(`Created ${cards.length} sample cards`);

    // Update template usage counts
    for (const template of templates) {
      const usageCount = await Card.countDocuments({ templateId: template._id });
      await Template.findByIdAndUpdate(template._id, { usageCount });
    }

    console.log('✅ Admin data seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Admin users: 1`);
    console.log(`   - Sample users: ${users.length}`);
    console.log(`   - Sample templates: ${templates.length}`);
    console.log(`   - Sample cards: ${cards.length}`);

  } catch (error) {
    console.error('Error seeding admin data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seeding
seedAdminData(); 