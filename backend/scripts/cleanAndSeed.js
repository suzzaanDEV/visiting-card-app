require('dotenv').config({ path: './config.env' });
const mongoose = require('../src/utils/mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/userModel');
const Admin = require('../src/models/adminModel');
const Card = require('../src/models/cardModel');
const CardDesign = require('../src/models/cardDesignModel');
const Template = require('../src/models/templateModel');
const SavedCard = require('../src/models/savedCardModel');

async function cleanAndSeedDatabase() {
  try {
    console.log('🧹 Starting database cleanup and seeding...');

    // Clear all existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Admin.deleteMany({});
    await Card.deleteMany({});
    await CardDesign.deleteMany({});
    await Template.deleteMany({});
    await SavedCard.deleteMany({});
    console.log('✅ All collections cleared');

    // Create admin user
    console.log('👨‍💼 Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = new Admin({
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
      name: 'System Administrator'
    });
    await admin.save();
    console.log('✅ Admin user created');

    // Create test users with realistic data
    console.log('👥 Creating test users...');
    const users = [];
    const userData = [
      {
        username: 'ram_thapa',
        email: 'ram.thapa@cardly.com',
        name: 'Suzan Ghimire',
        phone: '+(977) 9xxxxxxxxx',
        location: 'Kathmandu, Nepal',
        website: 'https://johndoe.com',
        bio: 'Senior Software Engineer with 8+ years of experience in full-stack development. Passionate about creating scalable web applications and mentoring junior developers.'
      },
      {
        username: 'jane_smith',
        email: 'example@cardly.com',
        name: 'Jane Smith',
        phone: '+1 (555) 987-6543',
        location: 'Pokhara, Nepal',
        website: 'https://janesmith.com',
        bio: 'UX/UI Designer with expertise in user-centered design, prototyping, and design systems. Previously worked at Google and Facebook.'
      },
      {
        username: 'mike_wilson',
        email: 'mike@example.com',
        name: 'Mike Wilson',
        phone: '+1 (555) 456-7890',
        location: 'Lalitpur, Nepal',
        website: 'https://mikewilson.com',
        bio: 'Product Manager with 6+ years experience in SaaS products. Led teams of 15+ developers and launched 3 successful products.'
      },
      {
        username: 'sarah_johnson',
        email: 'sarah@example.com',
        name: 'Sarah Johnson',
        phone: '+1 (555) 234-5678',
        location: 'Bhaktapur, Nepal',
        website: 'https://sarahjohnson.com',
        bio: 'Marketing Director with expertise in digital marketing, brand strategy, and growth hacking. Increased company revenue by 300% in 2 years.'
      },
      {
        username: 'david_brown',
        email: 'david@example.com',
        name: 'David Brown',
        phone: '+1 (555) 345-6789',
        location: 'Chitwan, Nepal',
        website: 'https://davidbrown.com',
        bio: 'Data Scientist specializing in machine learning and predictive analytics. PhD in Computer Science from Stanford University.'
      }
    ];

    for (const userInfo of userData) {
      const password = await bcrypt.hash('password123', 12);
      const user = new User({
        ...userInfo,
        password,
        isActive: true
      });
      await user.save();
      users.push(user);
      console.log(`✅ Created user: ${userInfo.username}`);
    }

    // Create professional templates
    console.log('📋 Creating card templates...');
    const templates = [
      {
        id: 'modern-business',
        name: 'Modern Business',
        description: 'Clean and professional business card template with modern typography',
        category: 'business',
        isActive: true,
        preview: {
          backgroundColor: '#ffffff',
          elements: [
            {
              type: 'Text',
              x: 50,
              y: 50,
              text: 'John Doe',
              fontSize: 28,
              fontFamily: 'Arial, sans-serif',
              color: '#2c3e50',
              fontWeight: 'bold'
            },
            {
              type: 'Text',
              x: 50,
              y: 90,
              text: 'Senior Software Engineer',
              fontSize: 16,
              fontFamily: 'Arial, sans-serif',
              color: '#7f8c8d'
            },
            {
              type: 'Text',
              x: 50,
              y: 120,
              text: 'john@example.com',
              fontSize: 14,
              fontFamily: 'Arial, sans-serif',
              color: '#3498db'
            }
          ]
        },
        design: {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          fontFamily: 'Arial',
          elements: [
            {
              type: 'Text',
              x: 50,
              y: 50,
              text: 'John Doe',
              fontSize: 28,
              fontFamily: 'Arial, sans-serif',
              color: '#2c3e50',
              fontWeight: 'bold'
            },
            {
              type: 'Text',
              x: 50,
              y: 90,
              text: 'Senior Software Engineer',
              fontSize: 16,
              fontFamily: 'Arial, sans-serif',
              color: '#7f8c8d'
            },
            {
              type: 'Text',
              x: 50,
              y: 120,
              text: 'john@example.com',
              fontSize: 14,
              fontFamily: 'Arial, sans-serif',
              color: '#3498db'
            }
          ],
          layout: 'standard',
          aspectRatio: '16:9'
        }
      },
      {
        id: 'creative-portfolio',
        name: 'Creative Portfolio',
        description: 'Bold and creative portfolio template for designers and artists',
        category: 'creative',
        isActive: true,
        preview: {
          backgroundColor: '#1a1a1a',
          elements: [
            {
              type: 'Text',
              x: 50,
              y: 50,
              text: 'Jane Smith',
              fontSize: 32,
              fontFamily: 'Arial, sans-serif',
              color: '#ffffff',
              fontWeight: 'bold'
            },
            {
              type: 'Text',
              x: 50,
              y: 100,
              text: 'UX/UI Designer',
              fontSize: 18,
              fontFamily: 'Arial, sans-serif',
              color: '#ff6b6b'
            },
            {
              type: 'Text',
              x: 50,
              y: 130,
              text: 'Creating digital experiences',
              fontSize: 14,
              fontFamily: 'Arial, sans-serif',
              color: '#ffffff'
            }
          ]
        },
        design: {
          backgroundColor: '#1a1a1a',
          textColor: '#ffffff',
          fontFamily: 'Arial',
          elements: [
            {
              type: 'Text',
              x: 50,
              y: 50,
              text: 'Jane Smith',
              fontSize: 32,
              fontFamily: 'Arial, sans-serif',
              color: '#ffffff',
              fontWeight: 'bold'
            },
            {
              type: 'Text',
              x: 50,
              y: 100,
              text: 'UX/UI Designer',
              fontSize: 18,
              fontFamily: 'Arial, sans-serif',
              color: '#ff6b6b'
            },
            {
              type: 'Text',
              x: 50,
              y: 130,
              text: 'Creating digital experiences',
              fontSize: 14,
              fontFamily: 'Arial, sans-serif',
              color: '#ffffff'
            }
          ],
          layout: 'standard',
          aspectRatio: '16:9'
        }
      },
      {
        id: 'minimal-contact',
        name: 'Minimal Contact',
        description: 'Simple and elegant minimal contact card',
        category: 'minimal',
        isActive: true,
        preview: {
          backgroundColor: '#f8f9fa',
          elements: [
            {
              type: 'Text',
              x: 50,
              y: 50,
              text: 'Mike Wilson',
              fontSize: 24,
              fontFamily: 'Arial, sans-serif',
              color: '#333333',
              fontWeight: 'bold'
            },
            {
              type: 'Text',
              x: 50,
              y: 85,
              text: 'Product Manager',
              fontSize: 16,
              fontFamily: 'Arial, sans-serif',
              color: '#666666'
            },
            {
              type: 'Text',
              x: 50,
              y: 115,
              text: 'mike@example.com',
              fontSize: 14,
              fontFamily: 'Arial, sans-serif',
              color: '#007bff'
            }
          ]
        },
        design: {
          backgroundColor: '#f8f9fa',
          textColor: '#333333',
          fontFamily: 'Arial',
          elements: [
            {
              type: 'Text',
              x: 50,
              y: 50,
              text: 'Mike Wilson',
              fontSize: 24,
              fontFamily: 'Arial, sans-serif',
              color: '#333333',
              fontWeight: 'bold'
            },
            {
              type: 'Text',
              x: 50,
              y: 85,
              text: 'Product Manager',
              fontSize: 16,
              fontFamily: 'Arial, sans-serif',
              color: '#666666'
            },
            {
              type: 'Text',
              x: 50,
              y: 115,
              text: 'mike@example.com',
              fontSize: 14,
              fontFamily: 'Arial, sans-serif',
              color: '#007bff'
            }
          ],
          layout: 'standard',
          aspectRatio: '16:9'
        }
      },
      {
        id: 'executive-professional',
        name: 'Executive Professional',
        description: 'Premium executive business card template',
        category: 'executive',
        isActive: true,
        preview: {
          backgroundColor: '#2c3e50',
          elements: [
            {
              type: 'Text',
              x: 50,
              y: 50,
              text: 'Sarah Johnson',
              fontSize: 26,
              fontFamily: 'Arial, sans-serif',
              color: '#ffffff',
              fontWeight: 'bold'
            },
            {
              type: 'Text',
              x: 50,
              y: 90,
              text: 'Marketing Director',
              fontSize: 16,
              fontFamily: 'Arial, sans-serif',
              color: '#ecf0f1'
            },
            {
              type: 'Text',
              x: 50,
              y: 120,
              text: 'sarah@example.com',
              fontSize: 14,
              fontFamily: 'Arial, sans-serif',
              color: '#3498db'
            }
          ]
        },
        design: {
          backgroundColor: '#2c3e50',
          textColor: '#ffffff',
          fontFamily: 'Arial',
          elements: [
            {
              type: 'Text',
              x: 50,
              y: 50,
              text: 'Sarah Johnson',
              fontSize: 26,
              fontFamily: 'Arial, sans-serif',
              color: '#ffffff',
              fontWeight: 'bold'
            },
            {
              type: 'Text',
              x: 50,
              y: 90,
              text: 'Marketing Director',
              fontSize: 16,
              fontFamily: 'Arial, sans-serif',
              color: '#ecf0f1'
            },
            {
              type: 'Text',
              x: 50,
              y: 120,
              text: 'sarah@example.com',
              fontSize: 14,
              fontFamily: 'Arial, sans-serif',
              color: '#3498db'
            }
          ],
          layout: 'standard',
          aspectRatio: '16:9'
        }
      },
      {
        id: 'tech-professional',
        name: 'Tech Professional',
        description: 'Modern template for technology professionals',
        category: 'technology',
        isActive: true,
        preview: {
          backgroundColor: '#34495e',
          elements: [
            {
              type: 'Text',
              x: 50,
              y: 50,
              text: 'David Brown',
              fontSize: 28,
              fontFamily: 'Arial, sans-serif',
              color: '#ffffff',
              fontWeight: 'bold'
            },
            {
              type: 'Text',
              x: 50,
              y: 90,
              text: 'Data Scientist',
              fontSize: 16,
              fontFamily: 'Arial, sans-serif',
              color: '#3498db'
            },
            {
              type: 'Text',
              x: 50,
              y: 120,
              text: 'david@example.com',
              fontSize: 14,
              fontFamily: 'Arial, sans-serif',
              color: '#ecf0f1'
            }
          ]
        },
        design: {
          backgroundColor: '#34495e',
          textColor: '#ffffff',
          fontFamily: 'Arial',
          elements: [
            {
              type: 'Text',
              x: 50,
              y: 50,
              text: 'David Brown',
              fontSize: 28,
              fontFamily: 'Arial, sans-serif',
              color: '#ffffff',
              fontWeight: 'bold'
            },
            {
              type: 'Text',
              x: 50,
              y: 90,
              text: 'Data Scientist',
              fontSize: 16,
              fontFamily: 'Arial, sans-serif',
              color: '#3498db'
            },
            {
              type: 'Text',
              x: 50,
              y: 120,
              text: 'david@example.com',
              fontSize: 14,
              fontFamily: 'Arial, sans-serif',
              color: '#ecf0f1'
            }
          ],
          layout: 'standard',
          aspectRatio: '16:9'
        }
      }
    ];

    const createdTemplates = [];
    for (const template of templates) {
      const newTemplate = new Template(template);
      await newTemplate.save();
      createdTemplates.push(newTemplate);
      console.log(`✅ Created template: ${template.name}`);
    }

    // Create sample cards for each user
    console.log('🃏 Creating business cards...');
    const cardTitles = [
      'Professional Business Card',
      'Personal Contact Card',
      'Freelance Portfolio Card',
      'Creative Portfolio',
      'Executive Contact'
    ];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const numCards = Math.floor(Math.random() * 3) + 1; // 1-3 cards per user

      for (let j = 0; j < numCards; j++) {
        const template = createdTemplates[Math.floor(Math.random() * createdTemplates.length)];
        const card = new Card({
          ownerUserId: user._id,
          title: cardTitles[j] || `Card ${j + 1}`,
          isPublic: Math.random() > 0.3, // 70% public
          shortLink: `card${i}${j}${Date.now()}`,
          templateId: template._id.toString(),
          fullName: user.name, // <-- Added fullName
          viewCount: Math.floor(Math.random() * 100),
          shareCount: Math.floor(Math.random() * 20)
        });
        await card.save();

        // Create card design
        const cardDesign = new CardDesign({
          cardId: card._id,
          designJson: JSON.stringify({
            width: 800,
            height: 480,
            backgroundColor: template.preview.backgroundColor,
            elements: template.preview.elements.map(element => ({
              ...element,
              text: user.name,
              // Add contact info
              ...(element.text.includes('@') && { text: user.email }),
              ...(element.text.includes('Engineer') && { text: user.bio.split(' ').slice(0, 3).join(' ') }),
              ...(element.text.includes('Designer') && { text: 'UX/UI Designer' }),
              ...(element.text.includes('Manager') && { text: 'Product Manager' }),
              ...(element.text.includes('Director') && { text: 'Marketing Director' }),
              ...(element.text.includes('Scientist') && { text: 'Data Scientist' })
            }))
          })
        });
        await cardDesign.save();
        console.log(`✅ Created card: ${card.title} for ${user.username}`);
      }
    }

    // Create some saved cards (users saving other users' cards)
    console.log('💾 Creating saved cards...');
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const otherUsers = users.filter(u => u._id.toString() !== user._id.toString());
      
      // Each user saves 1-2 cards from other users
      const numToSave = Math.floor(Math.random() * 2) + 1;
      for (let j = 0; j < numToSave; j++) {
        const otherUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
        const otherUserCards = await Card.find({ ownerUserId: otherUser._id });
        
        if (otherUserCards.length > 0) {
          const cardToSave = otherUserCards[Math.floor(Math.random() * otherUserCards.length)];
          const savedCard = new SavedCard({
            userId: user._id,
            cardId: cardToSave._id,
            savedAt: new Date()
          });
          await savedCard.save();
          console.log(`✅ ${user.username} saved ${otherUser.username}'s card`);
        }
      }
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Admin users: 1`);
    console.log(`- Regular users: ${users.length}`);
    console.log(`- Cards created: ${await Card.countDocuments()}`);
    console.log(`- Templates created: ${await Template.countDocuments()}`);
    console.log(`- Saved cards: ${await SavedCard.countDocuments()}`);
    
    console.log('\n🔑 Admin credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
    console.log('\n👤 Test user credentials:');
    console.log('Email: john@example.com');
    console.log('Password: password123');
    console.log('Email: jane@example.com');
    console.log('Password: password123');
    console.log('Email: mike@example.com');
    console.log('Password: password123');
    console.log('Email: sarah@example.com');
    console.log('Password: password123');
    console.log('Email: david@example.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

cleanAndSeedDatabase(); 