const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../src/models/adminModel');
require('dotenv').config({ path: './config.env' });

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await Admin.findOne({ email: 'admin@gmail.com' });
    
    if (existingSuperAdmin) {
      console.log('Super admin already exists:', existingSuperAdmin.email);
      return;
    }

    // Create super admin
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const superAdmin = new Admin({
      username: 'admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'super_admin',
      isActive: true
    });

    await superAdmin.save();

    console.log('Super admin created successfully!');
    console.log('Email: admin@gmail.com');
    console.log('Password: admin123');
    console.log('Role: super_admin');

  } catch (error) {
    console.error('Error creating super admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createSuperAdmin(); 