const base62 = require('base62');
const crypto = require('crypto');
const Card = require('../models/cardModel');
const logger = require('../utils/logger');

// Generate a more unique short link using timestamp + random
exports.generate = async () => {
  try {
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(4);
    const randomNum = randomBytes.readUInt32BE(0);
    
    // Combine timestamp and random number for uniqueness
    const combined = timestamp + randomNum;
    
    logger.info(`Generating short link - timestamp: ${timestamp}, random: ${randomNum}, combined: ${combined}`);
    
    const shortLink = base62.encode(combined);
    
    // Validate the generated short link
    if (!exports.validate(shortLink)) {
      logger.warn(`Generated short link failed validation: ${shortLink}, retrying...`);
      return await exports.generate(); // Retry if validation fails
    }
    
    logger.info(`Generated short link: ${shortLink}`);

    // Check for collision
    const existing = await Card.findOne({ shortLink });
    if (existing) {
      logger.warn(`Short link collision detected: ${shortLink}, retrying...`);
      return await exports.generate(); // Retry if collision
    }

    logger.info(`Short link generated successfully: ${shortLink}`);
    return shortLink;
  } catch (error) {
    logger.error(`Short link generation error: ${error.message}`);
    logger.error(`Error stack: ${error.stack}`);
    throw new Error('Failed to generate short link');
  }
};

// Generate custom short link (if available)
exports.generateCustom = async (customLink) => {
  try {
    // Validate custom link format
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(customLink)) {
      throw new Error('Custom link must be 3-20 characters and contain only letters, numbers, hyphens, and underscores');
    }

    const existing = await Card.findOne({ shortLink: customLink });
    if (existing) {
      throw new Error('Custom link already exists');
    }

    logger.info(`Custom short link created: ${customLink}`);
    return customLink;
  } catch (error) {
    logger.error(`Custom short link generation error: ${error.message}`);
    throw error;
  }
};

// Generate short link with prefix
exports.generateWithPrefix = async (prefix) => {
  try {
    const randomBytes = crypto.randomBytes(3);
    const randomNum = randomBytes.readUIntBE(0, 3);
    const shortLink = `${prefix}${base62.encode(randomNum)}`;

    const existing = await Card.findOne({ shortLink });
    if (existing) {
      logger.warn(`Short link with prefix collision detected: ${shortLink}, retrying...`);
      return await exports.generateWithPrefix(prefix);
    }

    logger.info(`Short link with prefix generated: ${shortLink}`);
    return shortLink;
  } catch (error) {
    logger.error(`Short link with prefix generation error: ${error.message}`);
    throw new Error('Failed to generate short link with prefix');
  }
};

// Validate short link format
exports.validate = (shortLink) => {
  const pattern = /^[a-zA-Z0-9_-]{3,20}$/;
  return pattern.test(shortLink);
};

// Get link statistics
exports.getStats = async () => {
  try {
    const totalLinks = await Card.countDocuments();
    const activeLinks = await Card.countDocuments({ isActive: true });
    const customLinks = await Card.countDocuments({ 
      shortLink: { $regex: /^[a-zA-Z]{3,}/ } 
    });

    return {
      total: totalLinks,
      active: activeLinks,
      custom: customLinks,
      generated: totalLinks - customLinks
    };
  } catch (error) {
    logger.error(`Short link stats error: ${error.message}`);
    throw new Error('Failed to get short link statistics');
  }
};

// Add link analytics tracking
const trackLinkClick = async (shortLink) => {
  try {
    const link = await ShortLink.findOneAndUpdate(
      { shortCode: shortLink },
      { 
        $inc: { clickCount: 1 },
        $push: { 
          clicks: { 
            timestamp: new Date(),
            userAgent: req.headers['user-agent'] || 'unknown'
          }
        }
      },
      { new: true }
    );
    return link;
  } catch (error) {
    console.error('Failed to track link click:', error);
  }
};