#!/usr/bin/env node
/**
 * Bootstrap default admin account (development only unless ADMIN_EMAIL/ADMIN_PASSWORD set).
 * Run: npm run seed:admin
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connect, disconnect } = require('../utils/mongoose');
const Admin = require('../models/adminModel');
const logger = require('../utils/logger');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const getSeedCredentials = () => {
  const email = (process.env.ADMIN_EMAIL || 'suzan.privatespace@gmail.com').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || (IS_PRODUCTION ? null : 'admin123');
  return { email, password };
};

async function seedAdmin() {
  const { email, password } = getSeedCredentials();

  if (!password) {
    logger.error('ADMIN_PASSWORD must be set in production. Seed aborted.');
    process.exit(1);
  }

  if (IS_PRODUCTION && !process.env.ADMIN_EMAIL) {
    logger.error('ADMIN_EMAIL must be set in production. Seed aborted.');
    process.exit(1);
  }

  const mongoose = require('mongoose');
  const shouldDisconnect = mongoose.connection.readyState === 0;
  if (shouldDisconnect) {
    await connect();
  }

  const existingCount = await Admin.countDocuments();
  const shouldReset = process.argv.includes('--reset') || process.env.RESET_ADMIN === 'true';
  if (existingCount > 0 && !shouldReset) {
    logger.info(`Admin seed skipped: ${existingCount} admin(s) already exist`);
    if (shouldDisconnect) await disconnect();
    return;
  }
  if (shouldReset && existingCount > 0) {
    logger.info(`Resetting admin accounts: deleting ${existingCount} existing admin(s)`);
    await Admin.deleteMany({});
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const admin = await Admin.create({
    name: 'System Admin',
    username: 'admin',
    email,
    password: hashedPassword,
    role: 'admin',
    isVerified: true,
    isActive: true,
  });

  logger.info(`Default admin created: ${admin._id} (${email})`);
  logger.info(`Default admin email: ${email}`);
  if (!IS_PRODUCTION) {
    logger.info('Default admin password: admin123 (development default — change before production)');
  }
  logger.info('Admin login: POST /api/admin/login');

  if (shouldDisconnect) {
    await disconnect();
  }
}

if (require.main === module) {
  seedAdmin()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error(`Admin seed failed: ${err.message}`);
      process.exit(1);
    });
}

module.exports = { seedAdmin, getSeedCredentials };
