const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/userModel');
const Card = require('../src/models/cardModel');
const Template = require('../src/models/templateModel');
const Admin = require('../src/models/adminModel');
require('dotenv').config();

const seedNepaliData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('🔄 Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Card.deleteMany({});
    await Template.deleteMany({});
    await Admin.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await Admin.create({
      username: 'admin',
      email: 'admin@cardly.com',
      password: adminPassword,
      role: 'admin',
      isActive: true
    });
    console.log('👑 Admin user created:', admin.email);

    // Nepali-style user data
    const nepaliUsers = [
      { name: 'Suzan Ghimire', username: 'ram_thapa', email: 'ram.thapa@gmail.com', job: 'Software Engineer' },
      { name: 'Suzan Ghimire', username: 'sita_shrestha', email: 'example@hotmail.com', job: 'Marketing Manager' },
      { name: 'Hari Kumar Tamang', username: 'hari_tamang', email: 'hari.tamang@yahoo.com', job: 'Business Analyst' },
      { name: 'Gita Kumari Rai', username: 'gita_rai', email: 'gita.rai@gmail.com', job: 'Graphic Designer' },
      { name: 'Bikash Chandra Gurung', username: 'bikash_gurung', email: 'bikash.gurung@gmail.com', job: 'Project Manager' },
      { name: 'Anita Devi Limbu', username: 'anita_limbu', email: 'anita.limbu@hotmail.com', job: 'HR Specialist' },
      { name: 'Prakash Kumar Magar', username: 'prakash_magar', email: 'prakash.magar@gmail.com', job: 'Sales Executive' },
      { name: 'Sunita Devi Chettri', username: 'sunita_chettri', email: 'sunita.chettri@yahoo.com', job: 'Accountant' },
      { name: 'Rajesh Kumar Karki', username: 'rajesh_karki', email: 'rajesh.karki@gmail.com', job: 'IT Consultant' },
      { name: 'Laxmi Devi Basnet', username: 'laxmi_basnet', email: 'laxmi.basnet@hotmail.com', job: 'Teacher' },
      { name: 'Mohan Singh Bhandari', username: 'mohan_bhandari', email: 'mohan.bhandari@gmail.com', job: 'Doctor' },
      { name: 'Sabina Devi Poudel', username: 'sabina_poudel', email: 'sabina.poudel@yahoo.com', job: 'Nurse' },
      { name: 'Krishna Kumar Adhikari', username: 'krishna_adhikari', email: 'krishna.adhikari@gmail.com', job: 'Engineer' },
      { name: 'Rekha Devi Ghimire', username: 'rekha_ghimire', email: 'rekha.ghimire@hotmail.com', job: 'Architect' },
      { name: 'Dinesh Kumar Rana', username: 'dinesh_rana', email: 'dinesh.rana@gmail.com', job: 'Lawyer' },
      { name: 'Pramila Devi Thapa', username: 'pramila_thapa', email: 'pramila.thapa@yahoo.com', job: 'Journalist' },
      { name: 'Suresh Kumar Koirala', username: 'suresh_koirala', email: 'suresh.koirala@gmail.com', job: 'Photographer' },
      { name: 'Bina Devi Joshi', username: 'bina_joshi', email: 'bina.joshi@hotmail.com', job: 'Chef' },
      { name: 'Narayan Kumar Sharma', username: 'narayan_sharma', email: 'narayan.sharma@gmail.com', job: 'Electrician' },
      { name: 'Kalpana Devi Pandey', username: 'kalpana_pandey', email: 'kalpana.pandey@yahoo.com', job: 'Artist' }
    ];

    // Create users with Nepali-style data
    const users = [];
    for (const userData of nepaliUsers) {
      const userPassword = await bcrypt.hash('password123', 10);
      const user = await User.create({
        username: userData.username,
        email: userData.email,
        password: userPassword,
        name: userData.name,
        isActive: true,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      });
      users.push(user);
    }
    console.log(`👥 Created ${users.length} Nepali-style users`);

    // Nepali-style template data
    const nepaliTemplates = [
      {
        id: 'template-nepal-1',
        name: 'Nepal Traditional',
        category: 'Traditional',
        description: 'Beautiful traditional Nepali design with cultural elements',
        isActive: true,
        isFeatured: true,
        usageCount: 245,
        rating: 4.9
      },
      {
        id: 'template-nepal-2',
        name: 'Himalayan Blue',
        category: 'Professional',
        description: 'Elegant design inspired by Himalayan mountains',
        isActive: true,
        isFeatured: true,
        usageCount: 189,
        rating: 4.8
      },
      {
        id: 'template-nepal-3',
        name: 'Kathmandu Modern',
        category: 'Modern',
        description: 'Contemporary design reflecting modern Kathmandu',
        isActive: true,
        isFeatured: false,
        usageCount: 156,
        rating: 4.7
      },
      {
        id: 'template-nepal-4',
        name: 'Pokhara Serene',
        category: 'Creative',
        description: 'Peaceful design inspired by Pokhara lakes',
        isActive: true,
        isFeatured: true,
        usageCount: 134,
        rating: 4.6
      },
      {
        id: 'template-nepal-5',
        name: 'Nepal Heritage',
        category: 'Traditional',
        description: 'Heritage design with traditional Nepali patterns',
        isActive: true,
        isFeatured: false,
        usageCount: 98,
        rating: 4.5
      },
      {
        id: 'template-nepal-6',
        name: 'Annapurna Elegant',
        category: 'Professional',
        description: 'Sophisticated design named after Annapurna range',
        isActive: true,
        isFeatured: true,
        usageCount: 87,
        rating: 4.4
      },
      {
        id: 'template-nepal-7',
        name: 'Lumbini Peaceful',
        category: 'Minimal',
        description: 'Minimalist design inspired by Buddha\'s birthplace',
        isActive: true,
        isFeatured: false,
        usageCount: 76,
        rating: 4.3
      },
      {
        id: 'template-nepal-8',
        name: 'Chitwan Wild',
        category: 'Creative',
        description: 'Dynamic design inspired by Chitwan National Park',
        isActive: true,
        isFeatured: false,
        usageCount: 65,
        rating: 4.2
      }
    ];

    // Create templates
    const templates = [];
    for (const templateInfo of nepaliTemplates) {
      const template = await Template.create({
        ...templateInfo,
        design: {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          fontFamily: 'Arial',
          elements: [],
          layout: 'standard',
          aspectRatio: '16:9'
        },
        preview: {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          fontFamily: 'Arial',
          elements: []
        }
      });
      templates.push(template);
    }
    console.log(`🎨 Created ${templates.length} Nepali-style templates`);

    // Nepali-style card data
    const nepaliCards = [
      { name: 'Suzan Ghimire', job: 'Software Engineer', company: 'Tech Solutions Nepal', location: 'Kathmandu' },
      { name: 'Suzan Ghimire', job: 'Marketing Manager', company: 'Nepal Marketing Pro', location: 'Pokhara' },
      { name: 'Hari Kumar Tamang', job: 'Business Analyst', company: 'Nepal Business Hub', location: 'Lalitpur' },
      { name: 'Gita Kumari Rai', job: 'Graphic Designer', company: 'Creative Nepal Studio', location: 'Bhaktapur' },
      { name: 'Bikash Chandra Gurung', job: 'Project Manager', company: 'Nepal Projects Ltd', location: 'Kathmandu' },
      { name: 'Anita Devi Limbu', job: 'HR Specialist', company: 'Nepal HR Solutions', location: 'Pokhara' },
      { name: 'Prakash Kumar Magar', job: 'Sales Executive', company: 'Nepal Sales Pro', location: 'Lalitpur' },
      { name: 'Sunita Devi Chettri', job: 'Accountant', company: 'Nepal Finance Corp', location: 'Bhaktapur' },
      { name: 'Rajesh Kumar Karki', job: 'IT Consultant', company: 'Nepal IT Services', location: 'Kathmandu' },
      { name: 'Laxmi Devi Basnet', job: 'Teacher', company: 'Nepal Education Trust', location: 'Pokhara' },
      { name: 'Mohan Singh Bhandari', job: 'Doctor', company: 'Nepal Medical Center', location: 'Lalitpur' },
      { name: 'Sabina Devi Poudel', job: 'Nurse', company: 'Nepal Health Care', location: 'Bhaktapur' },
      { name: 'Krishna Kumar Adhikari', job: 'Engineer', company: 'Nepal Engineering Corp', location: 'Kathmandu' },
      { name: 'Rekha Devi Ghimire', job: 'Architect', company: 'Nepal Architecture Studio', location: 'Pokhara' },
      { name: 'Dinesh Kumar Rana', job: 'Lawyer', company: 'Nepal Legal Services', location: 'Lalitpur' },
      { name: 'Pramila Devi Thapa', job: 'Journalist', company: 'Nepal News Network', location: 'Bhaktapur' },
      { name: 'Suresh Kumar Koirala', job: 'Photographer', company: 'Nepal Photography Pro', location: 'Kathmandu' },
      { name: 'Bina Devi Joshi', job: 'Chef', company: 'Nepal Culinary Arts', location: 'Pokhara' },
      { name: 'Narayan Kumar Sharma', job: 'Electrician', company: 'Nepal Electrical Services', location: 'Lalitpur' },
      { name: 'Kalpana Devi Pandey', job: 'Artist', company: 'Nepal Art Gallery', location: 'Bhaktapur' }
    ];

    // Create cards with Nepali-style data
    const cards = [];
    for (let i = 0; i < 100; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
      const randomCardData = nepaliCards[Math.floor(Math.random() * nepaliCards.length)];
      
      const card = await Card.create({
        title: `${randomCardData.name} - ${randomCardData.job}`,
        fullName: randomCardData.name,
        jobTitle: randomCardData.job,
        company: randomCardData.company,
        email: `${randomCardData.name.toLowerCase().replace(/\s+/g, '.')}@nepal.com`,
        phone: `+977-${Math.floor(Math.random() * 900000000) + 100000000}`,
        website: `www.${randomCardData.name.toLowerCase().replace(/\s+/g, '')}.com.np`,
        address: `${Math.floor(Math.random() * 999) + 1} ${randomCardData.location} Street, Nepal`,
        bio: `Professional ${randomCardData.job} with ${Math.floor(Math.random() * 10) + 5} years of experience in ${randomCardData.location}.`,
        ownerUserId: randomUser._id,
        templateId: randomTemplate.id,
        shortLink: `nepal-${i + 1}-${Math.random().toString(36).substr(2, 9)}`,
        isPublic: true,
        featured: Math.random() > 0.7,
        views: Math.floor(Math.random() * 2000) + 100,
        loveCount: Math.floor(Math.random() * 200) + 10,
        shares: Math.floor(Math.random() * 100) + 5,
        downloads: Math.floor(Math.random() * 50) + 2,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      });
      cards.push(card);
    }
    console.log(`📇 Created ${cards.length} Nepali-style cards`);

    // Update template usage counts
    for (const template of templates) {
      const usageCount = await Card.countDocuments({ templateId: template.id });
      await Template.findByIdAndUpdate(template._id, { usageCount });
    }

    console.log('✅ Nepali-style data seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Admin users: 1`);
    console.log(`   - Nepali users: ${users.length}`);
    console.log(`   - Nepali templates: ${templates.length}`);
    console.log(`   - Nepali cards: ${cards.length}`);
    console.log(`   - All data is now Nepali-style English!`);

  } catch (error) {
    console.error('❌ Error seeding Nepali data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the seeding
seedNepaliData(); 