const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../src/models/userModel');
const Card = require('../src/models/cardModel');
const Template = require('../src/models/templateModel');
const Admin = require('../src/models/adminModel');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear all data
const clearAllData = async () => {
  try {
    console.log('🗑️  Clearing all data...');
    await User.deleteMany({});
    await Card.deleteMany({});
    await Template.deleteMany({});
    await Admin.deleteMany({});
    console.log('✅ All data cleared');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
};

// Seed admin users
const seedAdmins = async () => {
  const admins = [
    {
      username: 'admin',
      email: 'admin@cardly.com',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'super_admin',
      isActive: true
    },
    {
      username: 'moderator',
      email: 'moderator@cardly.com',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'admin',
      isActive: true
    }
  ];

  try {
    const createdAdmins = await Admin.insertMany(admins);
    console.log(`✅ Created ${createdAdmins.length} admin users`);
    return createdAdmins;
  } catch (error) {
    console.error('❌ Error seeding admins:', error);
  }
};

// Seed regular users
const seedUsers = async () => {
  const users = [
    {
      name: 'Ram Bahadur Thapa',
      username: 'ram_thapa',
      email: 'ram.thapa@gmail.com',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      phone: '+977-9851234567',
      location: 'Kathmandu, Nepal',
      website: 'www.ramthapa.com.np',
      bio: 'Professional Software Engineer with 5 years of experience in web development',
      jobTitle: 'Software Engineer',
      company: 'Tech Solutions Nepal',
      isActive: true
    },
    {
      name: 'Sita Devi Shrestha',
      username: 'sita_shrestha',
      email: 'sita.shrestha@hotmail.com',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      phone: '+977-9842345678',
      location: 'Lalitpur, Nepal',
      website: 'www.sitashrestha.com.np',
      bio: 'Creative Marketing Manager with expertise in digital marketing and brand strategy',
      jobTitle: 'Marketing Manager',
      company: 'Digital Marketing Pro',
      isActive: true
    },
    {
      name: 'Krishna Kumar Adhikari',
      username: 'krishna_adhikari',
      email: 'krishna.adhikari@yahoo.com',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      phone: '+977-9833456789',
      location: 'Pokhara, Nepal',
      website: 'www.krishnaadhikari.com.np',
      bio: 'Experienced Architect specializing in sustainable design and urban planning',
      jobTitle: 'Architect',
      company: 'Nepal Architecture Studio',
      isActive: true
    },
    {
      name: 'Anita Devi Limbu',
      username: 'anita_limbu',
      email: 'anita.limbu@outlook.com',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      phone: '+977-9824567890',
      location: 'Bhaktapur, Nepal',
      website: 'www.anitalimbu.com.np',
      bio: 'Passionate HR Specialist with expertise in talent acquisition and employee development',
      jobTitle: 'HR Specialist',
      company: 'Nepal HR Solutions',
      isActive: true
    },
    {
      name: 'Dinesh Kumar Rana',
      username: 'dinesh_rana',
      email: 'dinesh.rana@protonmail.com',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      phone: '+977-9815678901',
      location: 'Chitwan, Nepal',
      website: 'www.dineshrana.com.np',
      bio: 'Dedicated Lawyer with specialization in corporate law and legal consulting',
      jobTitle: 'Lawyer',
      company: 'Nepal Legal Services',
      isActive: true
    }
  ];

  try {
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} regular users`);
    return createdUsers;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  }
};

// Seed templates
const seedTemplates = async () => {
  const templates = [
    {
      id: 'template-nepal-1',
      name: 'Nepal Professional',
      description: 'Clean and professional design perfect for business professionals',
      category: 'business',
      preview: {
        backgroundColor: '#1a3a63',
        textColor: '#ffffff',
        fontFamily: 'Arial',
        elements: [{ type: 'text', content: 'Sample Card' }]
      },
      design: {
        backgroundColor: '#1a3a63',
        textColor: '#ffffff',
        fontFamily: 'Arial',
        elements: [{ type: 'text', content: 'Sample Card' }],
        layout: 'standard',
        aspectRatio: '16:9'
      },
      isActive: true,
      isFeatured: true
    },
    {
      id: 'template-nepal-2',
      name: 'Nepal Creative',
      description: 'Bold and colorful design for creative professionals',
      category: 'creative',
      preview: {
        backgroundColor: '#ff6b6b',
        textColor: '#ffffff',
        fontFamily: 'Helvetica',
        elements: [{ type: 'text', content: 'Sample Card' }]
      },
      design: {
        backgroundColor: '#ff6b6b',
        textColor: '#ffffff',
        fontFamily: 'Helvetica',
        elements: [{ type: 'text', content: 'Sample Card' }],
        layout: 'creative',
        aspectRatio: '16:9'
      },
      isActive: true,
      isFeatured: true
    },
    {
      id: 'template-nepal-3',
      name: 'Nepal Minimal',
      description: 'Simple and elegant design with clean typography',
      category: 'minimal',
      preview: {
        backgroundColor: '#f8f9fa',
        textColor: '#333333',
        fontFamily: 'Georgia',
        elements: [{ type: 'text', content: 'Sample Card' }]
      },
      design: {
        backgroundColor: '#f8f9fa',
        textColor: '#333333',
        fontFamily: 'Georgia',
        elements: [{ type: 'text', content: 'Sample Card' }],
        layout: 'minimal',
        aspectRatio: '16:9'
      },
      isActive: true,
      isFeatured: false
    },
    {
      id: 'template-nepal-4',
      name: 'Nepal Modern',
      description: 'Contemporary design with modern aesthetics',
      category: 'modern',
      preview: {
        backgroundColor: '#667eea',
        textColor: '#ffffff',
        fontFamily: 'Verdana',
        elements: [{ type: 'text', content: 'Sample Card' }]
      },
      design: {
        backgroundColor: '#667eea',
        textColor: '#ffffff',
        fontFamily: 'Verdana',
        elements: [{ type: 'text', content: 'Sample Card' }],
        layout: 'modern',
        aspectRatio: '16:9'
      },
      isActive: true,
      isFeatured: false
    },
    {
      id: 'template-nepal-5',
      name: 'Nepal Corporate',
      description: 'Traditional business card design for corporate settings',
      category: 'business',
      preview: {
        backgroundColor: '#2e7d32',
        textColor: '#ffffff',
        fontFamily: 'Times New Roman',
        elements: [{ type: 'text', content: 'Sample Card' }]
      },
      design: {
        backgroundColor: '#2e7d32',
        textColor: '#ffffff',
        fontFamily: 'Times New Roman',
        elements: [{ type: 'text', content: 'Sample Card' }],
        layout: 'standard',
        aspectRatio: '16:9'
      },
      isActive: true,
      isFeatured: false
    },
    {
      id: 'template-nepal-6',
      name: 'Nepal Artistic',
      description: 'Artistic design for creative professionals',
      category: 'creative',
      preview: {
        backgroundColor: '#c2185b',
        textColor: '#ffffff',
        fontFamily: 'Courier New',
        elements: [{ type: 'text', content: 'Sample Card' }]
      },
      design: {
        backgroundColor: '#c2185b',
        textColor: '#ffffff',
        fontFamily: 'Courier New',
        elements: [{ type: 'text', content: 'Sample Card' }],
        layout: 'creative',
        aspectRatio: '16:9'
      },
      isActive: true,
      isFeatured: false
    },
    {
      id: 'template-nepal-7',
      name: 'Nepal Elegant',
      description: 'Elegant design with sophisticated typography',
      category: 'minimal',
      preview: {
        backgroundColor: '#4a148c',
        textColor: '#ffffff',
        fontFamily: 'Georgia',
        elements: [{ type: 'text', content: 'Sample Card' }]
      },
      design: {
        backgroundColor: '#4a148c',
        textColor: '#ffffff',
        fontFamily: 'Georgia',
        elements: [{ type: 'text', content: 'Sample Card' }],
        layout: 'elegant',
        aspectRatio: '16:9'
      },
      isActive: true,
      isFeatured: false
    },
    {
      id: 'template-nepal-8',
      name: 'Nepal Dynamic',
      description: 'Dynamic design with vibrant colors',
      category: 'modern',
      preview: {
        backgroundColor: '#e65100',
        textColor: '#ffffff',
        fontFamily: 'Arial',
        elements: [{ type: 'text', content: 'Sample Card' }]
      },
      design: {
        backgroundColor: '#e65100',
        textColor: '#ffffff',
        fontFamily: 'Arial',
        elements: [{ type: 'text', content: 'Sample Card' }],
        layout: 'dynamic',
        aspectRatio: '16:9'
      },
      isActive: true,
      isFeatured: false
    }
  ];

  try {
    const createdTemplates = await Template.insertMany(templates);
    console.log(`✅ Created ${createdTemplates.length} templates`);
    return createdTemplates;
  } catch (error) {
    console.error('❌ Error seeding templates:', error);
  }
};

// Generate short link
const generateShortLink = () => {
  const prefix = 'nepal';
  const randomNum = Math.floor(Math.random() * 100);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `${prefix}-${randomNum}-${randomStr}`;
};

// Seed cards
const seedCards = async (users, templates) => {
  const cards = [];
  
  const nepaliNames = [
    'Suresh Kumar Koirala',
    'Dinesh Kumar Rana',
    'Rekha Devi Ghimire',
    'Ram Bahadur Thapa',
    'Bina Devi Joshi',
    'Anita Devi Limbu',
    'Kalpana Devi Pandey',
    'Sunita Devi Chettri',
    'Prakash Kumar Magar',
    'Rajesh Kumar Karki'
  ];

  const nepaliJobs = [
    'Software Engineer',
    'Photographer',
    'Lawyer',
    'Architect',
    'Chef',
    'HR Specialist',
    'Artist',
    'Teacher',
    'Doctor',
    'Engineer'
  ];

  const nepaliCompanies = [
    'Tech Solutions Nepal',
    'Nepal Photography Pro',
    'Nepal Legal Services',
    'Nepal Architecture Studio',
    'Nepal Culinary Arts',
    'Nepal HR Solutions',
    'Nepal Art Gallery',
    'Nepal Education Trust',
    'Nepal Medical Center',
    'Nepal Engineering Corp'
  ];

  const nepaliAddresses = [
    '731 Kathmandu Street, Nepal',
    '947 Lalitpur Street, Nepal',
    '710 Pokhara Street, Nepal',
    '769 Kathmandu Street, Nepal',
    '233 Pokhara Street, Nepal',
    '525 Pokhara Street, Nepal',
    '955 Bhaktapur Street, Nepal',
    '876 Lalitpur Street, Nepal',
    '281 Kathmandu Street, Nepal',
    '720 Lalitpur Street, Nepal'
  ];

  const nepaliPhones = [
    '+977-935660350',
    '+977-610916699',
    '+977-631968247',
    '+977-988807789',
    '+977-606472040',
    '+977-252399507',
    '+977-878495290',
    '+977-618772771',
    '+977-288703334',
    '+977-219019623'
  ];

  const nepaliEmails = [
    'suresh.kumar.koirala@nepal.com',
    'dinesh.kumar.rana@nepal.com',
    'rekha.devi.ghimire@nepal.com',
    'ram.bahadur.thapa@nepal.com',
    'bina.devi.joshi@nepal.com',
    'anita.devi.limbu@nepal.com',
    'kalpana.devi.pandey@nepal.com',
    'sunita.devi.chettri@nepal.com',
    'prakash.kumar.magar@nepal.com',
    'rajesh.kumar.karki@nepal.com'
  ];

  const nepaliWebsites = [
    'www.sureshkumarkoirala.com.np',
    'www.dineshkumarrana.com.np',
    'www.rekhadevighimire.com.np',
    'www.rambahadurthapa.com.np',
    'www.binadevijoshi.com.np',
    'www.anitadevilimbu.com.np',
    'www.kalpanadevipandey.com.np',
    'www.sunitadevichettri.com.np',
    'www.prakashkumarmagar.com.np',
    'www.rajeshkumarkarki.com.np'
  ];

  const nepaliBios = [
    'Professional Software Engineer with 10 years of experience in Kathmandu.',
    'Professional Lawyer with 6 years of experience in Lalitpur.',
    'Professional Architect with 11 years of experience in Pokhara.',
    'Professional Software Engineer with 5 years of experience in Kathmandu.',
    'Professional Chef with 5 years of experience in Pokhara.',
    'Professional HR Specialist with 9 years of experience in Pokhara.',
    'Professional Artist with 12 years of experience in Bhaktapur.',
    'Professional Teacher with 8 years of experience in Kathmandu.',
    'Professional Lawyer with 10 years of experience in Lalitpur.',
    'Professional Engineer with 7 years of experience in Kathmandu.'
  ];

  const backgroundColors = [
    '#667eea', '#764ba2', '#11998e', '#f12711', '#ff6b6b',
    '#1a3a63', '#4a148c', '#2e7d32', '#e65100', '#c2185b'
  ];

  const textColors = ['#ffffff', '#000000', '#333333', '#666666'];

  for (let i = 0; i < 50; i++) {
    const user = users[i % users.length];
    const template = templates[i % templates.length];
    const nameIndex = i % nepaliNames.length;
    
    // Mix public and private cards
    const privacy = i % 3 === 0 ? 'private' : 'public';
    
    cards.push({
      ownerUserId: user._id,
      title: `${nepaliNames[nameIndex]} - ${nepaliJobs[nameIndex]}`,
      fullName: nepaliNames[nameIndex],
      jobTitle: nepaliJobs[nameIndex],
      company: nepaliCompanies[nameIndex],
      email: nepaliEmails[nameIndex],
      phone: nepaliPhones[nameIndex],
      website: nepaliWebsites[nameIndex],
      address: nepaliAddresses[nameIndex],
      bio: nepaliBios[nameIndex],
      backgroundColor: backgroundColors[i % backgroundColors.length],
      textColor: textColors[i % textColors.length],
      fontFamily: 'Arial',
      shortLink: generateShortLink(),
      isPublic: privacy === 'public',
      isPrivate: privacy === 'private',
      privacy: privacy,
      templateId: template.id,
      featured: i < 10, // First 10 cards are featured
      loveCount: Math.floor(Math.random() * 300) + 50,
      views: Math.floor(Math.random() * 2000) + 100,
      shares: Math.floor(Math.random() * 100) + 10,
      downloads: Math.floor(Math.random() * 50) + 5,
      isActive: true,
      loves: []
    });
  }

  try {
    const createdCards = await Card.insertMany(cards);
    console.log(`✅ Created ${createdCards.length} cards`);
    return createdCards;
  } catch (error) {
    console.error('❌ Error seeding cards:', error);
  }
};

// Main seeding function
const seedData = async () => {
  try {
    console.log('🌱 Starting data seeding...');
    
    // Clear all existing data
    await clearAllData();
    
    // Seed admins
    const admins = await seedAdmins();
    
    // Seed regular users
    const users = await seedUsers();
    
    // Seed templates
    const templates = await seedTemplates();
    
    // Seed cards
    const cards = await seedCards(users, templates);
    
    console.log('\n🎉 Data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${admins.length} admin users created`);
    console.log(`   - ${users.length} regular users created`);
    console.log(`   - ${templates.length} templates created`);
    console.log(`   - ${cards.length} cards created`);
    console.log('\n🔑 Default passwords for all users: "password"');
    console.log('\n👤 Sample users:');
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email})`);
    });
    console.log('\n🎨 Sample templates:');
    templates.forEach(template => {
      console.log(`   - ${template.name} (${template.category})`);
    });
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the seeding
if (require.main === module) {
  connectDB().then(seedData);
}

module.exports = { seedData }; 