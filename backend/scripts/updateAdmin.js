const mongoose = require('mongoose');
const Admin = require('../src/models/adminModel');
require('dotenv').config();

async function updateAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');

    // Find and update the existing admin
    const admin = await Admin.findOne({ username: 'admin' });
    if (admin) {
      admin.email = 'admin@cardly.com';
      await admin.save();
      console.log('Admin email updated successfully');
      console.log('Email: admin@cardly.com');
      console.log('Password: admin123');
    } else {
      console.log('Admin not found');
    }

  } catch (error) {
    console.error('Error updating admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

updateAdmin(); 