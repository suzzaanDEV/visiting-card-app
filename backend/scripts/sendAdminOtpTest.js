#!/usr/bin/env node
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const path = require('path');
const { connect, disconnect } = require('../src/utils/mongoose');
const Admin = require('../src/models/adminModel');
const User = require('../src/models/userModel');
const bcrypt = require('bcryptjs');
const adminService = require('../src/services/adminService');
const authService = require('../src/services/authService');

async function ensureAdmin() {
    const email = (process.env.ADMIN_EMAIL || 'admin@gmail.com').toLowerCase().trim();
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const count = await Admin.countDocuments();
    if (count === 0) {
        const hashed = await bcrypt.hash(password, 12);
        const admin = await Admin.create({
            name: 'System Admin', username: 'admin', email, password: hashed, role: 'admin', isVerified: true, isActive: true
        });
        console.log('Created admin:', admin.email);
    } else {
        const existing = await Admin.findOne({ email });
        if (!existing) {
            // create with provided email if not exists
            const hashed = await bcrypt.hash(password, 12);
            const admin = await Admin.create({
                name: 'System Admin', username: 'admin', email, password: hashed, role: 'admin', isVerified: true, isActive: true
            });
            console.log('Created admin:', admin.email);
        } else {
            console.log('Admin already exists:', existing.email);
        }
    }
}

async function run() {
    try {
        await connect();
        await ensureAdmin();

        const recipient = process.env.TEST_RECIPIENT || 'sznghimire61@gmail.com';

        // Ensure a user exists for the recipient so we can request an email OTP
        let user = await User.findOne({ email: recipient.toLowerCase().trim() });
        if (!user) {
            const tempPass = 'TempPass123!';
            const username = `testuser${Date.now()}`;
            const hashed = await bcrypt.hash(tempPass, 12);
            user = await User.create({ username, email: recipient, password: hashed, name: 'OTP Test User', isActive: true, isEmailVerified: false });
            console.log('Created test user for OTP:', user.email);
        } else {
            console.log('Test user exists:', user.email);
        }

        console.log('Requesting email OTP for', recipient);
        const res = await authService.requestEmailOtp(recipient, { suppressErrors: false, skipCooldown: true });
        console.log('OTP request response:', res);
        if (res.devOtp) console.log('Dev OTP (for development):', res.devOtp);
        if (res.emailDelivered) console.log('Email delivered according to transporter.');
    } catch (err) {
        console.error('Error during OTP test:', err);
    } finally {
        await disconnect();
        process.exit(0);
    }
}

if (require.main === module) run();
