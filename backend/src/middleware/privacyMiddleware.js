const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Middleware to filter sensitive information for non-authenticated users
const filterSensitiveData = (req, res, next) => {
  // Check if user is authenticated
  const token = req.headers.authorization?.replace('Bearer ', '');
  let isAuthenticated = false;
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      isAuthenticated = !!decoded.userId;
      logger.info(`Privacy Middleware: User authenticated: ${decoded.email}`);
    } catch (error) {
      // Token is invalid, user is not authenticated
      isAuthenticated = false;
      logger.info('Privacy Middleware: Invalid token, user not authenticated');
    }
  } else {
    logger.info('Privacy Middleware: No token provided, user not authenticated');
  }

  // Store authentication status in request object
  req.isAuthenticated = isAuthenticated;
  
  logger.info(`🔒 Privacy Middleware: User authenticated: ${isAuthenticated}`);
  
  // If user is authenticated, proceed without filtering
  if (isAuthenticated) {
    logger.info('🔒 Privacy Middleware: User authenticated, no filtering applied');
    return next();
  }

  logger.info('🔒 Privacy Middleware: User not authenticated, applying data filtering');

  // For non-authenticated users, filter sensitive data
  const originalJson = res.json;
  res.json = function(data) {
    logger.info('🔒 Privacy Middleware: Intercepting response data');
    if (data && typeof data === 'object') {
      const filteredData = filterCardData(data);
      logger.info('🔒 Privacy Middleware: Data filtered successfully');
      return originalJson.call(this, filteredData);
    }
    return originalJson.call(this, data);
  };

  next();
};

// Function to filter sensitive card data
const filterCardData = (data) => {
  if (!data) return data;

  // Handle cards array in response object (e.g., {cards: [...], pagination: {...}})
  if (data.cards && Array.isArray(data.cards)) {
    return {
      ...data,
      cards: data.cards.map(card => filterSingleCard(card))
    };
  }

  // Handle array of cards
  if (Array.isArray(data)) {
    return data.map(card => filterSingleCard(card));
  }

  // Handle single card object
  if (data.card) {
    return {
      ...data,
      card: filterSingleCard(data.card)
    };
  }

  // Handle direct card object
  return filterSingleCard(data);
};

// Function to filter a single card
const filterSingleCard = (card) => {
  if (!card || typeof card !== 'object') return card;

  const filteredCard = { ...card };

  // Mask email
  if (filteredCard.email) {
    const [localPart, domain] = filteredCard.email.split('@');
    if (localPart && domain) {
      const maskedLocal = localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1);
      filteredCard.email = `${maskedLocal}@${domain}`;
    }
  }

  // Mask phone
  if (filteredCard.phone) {
    const cleaned = filteredCard.phone.replace(/\D/g, '');
    if (cleaned.length >= 4) {
      filteredCard.phone = `***-***-${cleaned.slice(-4)}`;
    } else {
      filteredCard.phone = '***-***-****';
    }
  }

  // Hide address
  if (filteredCard.address) {
    filteredCard.address = 'Address hidden for privacy';
  }

  // Hide website
  if (filteredCard.website) {
    filteredCard.website = 'Website hidden for privacy';
  }

  return filteredCard;
};

// Middleware to add privacy headers
const addPrivacyHeaders = (req, res, next) => {
  res.setHeader('X-Privacy-Notice', 'Some contact information may be filtered for privacy');
  next();
};

module.exports = {
  filterSensitiveData,
  addPrivacyHeaders
}; 