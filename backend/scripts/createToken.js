const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../src/models/userModel');

async function createToken() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');

    // Find the first user
    const user = await User.findOne({});
    if (!user) {
      console.log('No users found in database');
      return;
    }

    console.log(`Found user: ${user.email}`);

    // Create a token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log('\n🔑 Generated Token:');
    console.log(token);
    
    console.log('\n📋 Test Commands:');
    console.log(`curl -X GET "http://localhost:5050/api/cards/public" -H "Authorization: Bearer ${token}"`);
    console.log(`curl -X POST "http://localhost:5050/api/library" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"cardId": "688f9c53d98543f6eb3d27d9"}'`);

  } catch (error) {
    console.error('Error creating token:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createToken(); 