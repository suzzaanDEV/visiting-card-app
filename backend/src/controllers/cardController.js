const cardService = require('../services/cardService');
const savedCardService = require('../services/savedCardService');
const cardAccessService = require('../services/cardAccessService');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

// Create a new card
exports.createCard = async (req, res, next) => {
  try {
    const { 
      title, 
      isPublic, 
      designJson, 
      templateId, 
      customShortLink,
      fullName,
      jobTitle,
      email,
      phone,
      website,
      company,
      address,
      bio
    } = req.body;
    const cardImage = req.file;
    
    logger.info(`createCard: title=${title}, isPublic=${isPublic}, designJson=${designJson ? 'provided' : 'none'}, cardImage=${cardImage ? 'provided' : 'none'}, fullName=${fullName}`);
    
    // Validate required fields
    if (!fullName || fullName.trim() === '') {
      logger.error(`createCard: fullName is missing or empty. Received: "${fullName}"`);
      return res.status(400).json({ error: 'Full name is required' });
    }
    
    const result = await cardService.createCard(req.user.userId, {
      title,
      isPublic,
      designJson,
      cardImage,
      templateId,
      customShortLink,
      fullName,
      jobTitle,
      email,
      phone,
      website,
      company,
      address,
      bio
    });
    
    res.status(201).json(result);
  } catch (error) {
    logger.error(`Create card error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Create card from template
exports.createCardFromTemplate = async (req, res, next) => {
  try {
    logger.info(`Request headers: ${JSON.stringify(req.headers)}`);
    logger.info(`Request body keys: ${Object.keys(req.body)}`);
    logger.info(`Request body: ${JSON.stringify(req.body)}`);
    
    // Handle both FormData and JSON
    let cardData = req.body;
    
    // If the data is coming as FormData, it might be in a different format
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
      logger.info('Processing FormData request');
      // FormData fields should be directly accessible in req.body
      cardData = req.body;
    }
    
    const { 
      title, 
      isPublic, 
      templateId, 
      fullName, 
      jobTitle, 
      email, 
      phone, 
      website, 
      company, 
      address, 
      bio, 
      backgroundColor, 
      textColor, 
      fontFamily 
    } = cardData;
    const cardImage = req.file;
    
    logger.info(`createCardFromTemplate: title=${title}, isPublic=${isPublic}, templateId=${templateId}, fullName=${fullName}, formData="${JSON.stringify(cardData)}", cardImage=${cardImage ? 'provided' : 'none'}`);
    logger.info(`Template ID type: ${typeof templateId}, value: ${templateId}`);
    logger.info(`Full name type: ${typeof fullName}, value: ${fullName}`);
    
    // Validate required fields
    if (!fullName || fullName.trim() === '') {
      logger.error(`createCardFromTemplate: fullName is missing or empty. Received: "${fullName}"`);
      logger.error(`All received fields: ${JSON.stringify(cardData)}`);
      return res.status(400).json({ error: 'Full name is required' });
    }
    
    const result = await cardService.createCardFromTemplate(req.user.userId, {
      title,
      isPublic,
      templateId,
      fullName,
      jobTitle,
      email,
      phone,
      website,
      company,
      address,
      bio,
      backgroundColor,
      textColor,
      fontFamily,
      cardImage
    });
    
    res.status(201).json(result);
  } catch (error) {
    logger.error(`Create card from template error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Get all cards for a user
exports.getUserCards = async (req, res, next) => {
  try {
    const cards = await cardService.getUserCards(req.user.userId);
    res.status(200).json({ cards });
  } catch (error) {
    logger.error(`Get user cards error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Get a specific card
exports.getCard = async (req, res, next) => {
  try {
    logger.info(`getCard called with cardId: ${req.params.cardId}, userId: ${req.user.userId}`);
    const card = await cardService.getCard(req.params.cardId, req.user.userId);
    res.status(200).json({ card });
  } catch (error) {
    logger.error(`Get card error: ${error.message}`);
    res.status(404).json({ error: error.message });
  }
};

// Update a card
exports.updateCard = async (req, res, next) => {
  try {
    const { 
      title, 
      isPublic, 
      designJson,
      fullName,
      jobTitle,
      email,
      phone,
      website,
      company,
      address,
      bio,
      backgroundColor,
      textColor,
      fontFamily,
      templateId
    } = req.body;
    const cardImage = req.file;
    
    const result = await cardService.updateCard(req.params.cardId, req.user.userId, {
      title,
      isPublic,
      designJson,
      fullName,
      jobTitle,
      email,
      phone,
      website,
      company,
      address,
      bio,
      backgroundColor,
      textColor,
      fontFamily,
      templateId,
      cardImage
    });
    
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Update card error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Delete a card
exports.deleteCard = async (req, res, next) => {
  try {
    await cardService.deleteCard(req.params.cardId, req.user.userId);
    res.status(200).json({ message: 'Card deleted successfully' });
  } catch (error) {
    logger.error(`Delete card error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Get all public cards (for discovery)
exports.getPublicCards = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, search, privacy } = req.query;
    const cards = await cardService.getPublicCards({
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      search,
      privacy
    });

    // Check if user is authenticated for privacy filtering
    const token = req.headers.authorization?.replace('Bearer ', '');
    let isAuthenticated = false;
    
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        isAuthenticated = !!decoded.userId;
      } catch (error) {
        isAuthenticated = false;
      }
    }

    // Convert Mongoose documents to plain objects
    if (cards.cards) {
      cards.cards = cards.cards.map(card => {
        // Convert Mongoose document to plain object
        const cardObj = card.toObject ? card.toObject() : card;
        return cardObj;
      });
    }

    // Add privacy header
    res.setHeader('X-Privacy-Notice', 'Some contact information may be filtered for privacy');
    
    res.status(200).json(cards);
  } catch (error) {
    logger.error(`Get public cards error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Get card by short link (for public viewing)
exports.getCardByShortLink = async (req, res, next) => {
  try {
    const result = await cardService.getCardByShortLink(req.params.shortLink);
    
    // Increment view count
    if (result && result.card) {
      await result.card.incrementViews();
    }

    // Check if user is authenticated for privacy filtering
    const token = req.headers.authorization?.replace('Bearer ', '');
    let isAuthenticated = false;
    let userId = null;
    
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        isAuthenticated = !!decoded.userId;
        userId = decoded.userId;
      } catch (error) {
        isAuthenticated = false;
      }
    }

    // Check if user has approved access for private cards
    let hasApprovedAccess = false;
    let isOwner = false;
    if (isAuthenticated && result && result.card) {
      // Check if user is the owner
      isOwner = result.card.ownerUserId?.toString() === userId?.toString();
      
      // Check if user has approved access for private cards
      if (result.card.privacy === 'private') {
        const accessCheck = await cardAccessService.checkAccess(result.card._id, userId);
        hasApprovedAccess = accessCheck.access && (accessCheck.reason === 'approved_request' || accessCheck.reason === 'owner');
      }
    }

    // Filter sensitive data for users without approved access to private cards
    // Don't filter if user is the owner or has approved access
    if (result && result.card && result.card.privacy === 'private' && !isOwner && !hasApprovedAccess) {
      // Convert Mongoose document to plain object
      const cardObj = result.card.toObject ? result.card.toObject() : result.card;
      const filteredCard = { ...cardObj };
      
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

      result.card = filteredCard;
    }

    // Add privacy header only for private cards
    if (result && result.card && result.card.privacy === 'private') {
      res.setHeader('X-Privacy-Notice', 'Some contact information may be filtered for privacy');
    }
    
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Get card by short link error: ${error.message}`);
    res.status(404).json({ error: error.message });
  }
};

// Get card by ID (for public viewing)
exports.getCardById = async (req, res, next) => {
  try {
    const result = await cardService.getCardById(req.params.cardId);
    
    if (!result || !result.card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    // Increment view count
    try {
      if (result.card && typeof result.card.incrementViews === 'function') {
        await result.card.incrementViews();
      }
    } catch (incrementError) {
      logger.warn(`Failed to increment views for card ${req.params.cardId}: ${incrementError.message}`);
      // Continue without incrementing views
    }

    // Check if user is authenticated for privacy filtering
    const token = req.headers.authorization?.replace('Bearer ', '');
    let isAuthenticated = false;
    let userId = null;
    
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        isAuthenticated = !!decoded.userId;
        userId = decoded.userId;
      } catch (error) {
        isAuthenticated = false;
      }
    }

    // Check if user has approved access for private cards
    let hasApprovedAccess = false;
    let isOwner = false;
    if (isAuthenticated && result && result.card) {
      // Check if user is the owner
      isOwner = result.card.ownerUserId?.toString() === userId?.toString();
      
      // Check if user has approved access for private cards
      if (result.card.privacy === 'private') {
        const accessCheck = await cardAccessService.checkAccess(result.card._id, userId);
        hasApprovedAccess = accessCheck.access && (accessCheck.reason === 'approved_request' || accessCheck.reason === 'owner');
      }
    }

    // Filter sensitive data for users without approved access to private cards
    // Don't filter if user is the owner or has approved access
    if (result && result.card && result.card.privacy === 'private' && !isOwner && !hasApprovedAccess) {
      // Convert Mongoose document to plain object
      const cardObj = result.card.toObject ? result.card.toObject() : result.card;
      const filteredCard = { ...cardObj };
      
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

      result.card = filteredCard;
    }

    // Add privacy header only for private cards
    if (result && result.card && result.card.privacy === 'private') {
      res.setHeader('X-Privacy-Notice', 'Some contact information may be filtered for privacy');
    }
    
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Get card by ID error: ${error.message}`);
    res.status(404).json({ error: error.message });
  }
};

// Love/Unlove a card
exports.toggleLove = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const result = await cardService.toggleLove(cardId, req.user.userId);
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Toggle love error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Save card to user's library
exports.saveCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { notes, tags } = req.body;
    
    const result = await savedCardService.saveCard(req.user.userId, cardId, { notes, tags });
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Save card error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Remove card from user's library
exports.unsaveCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    await savedCardService.unsaveCard(req.user.userId, cardId);
    res.status(200).json({ message: 'Card removed from library' });
  } catch (error) {
    logger.error(`Unsave card error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Get user's saved cards
exports.getSavedCards = async (req, res, next) => {
  try {
    const savedCards = await savedCardService.getUserSavedCards(req.user.userId);
    res.status(200).json({ savedCards });
  } catch (error) {
    logger.error(`Get saved cards error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Generate QR code for existing card
exports.generateQRCode = async (req, res, next) => {
  try {
    const qrCodeUrl = await cardService.generateQRCode(req.params.cardId, req.user.userId);
    res.status(200).json({ qrCode: qrCodeUrl });
  } catch (error) {
    logger.error(`Generate QR code error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Export contact as VCF file
exports.exportContact = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const vcfContent = await cardService.generateVCF(cardId);
    
    res.setHeader('Content-Type', 'text/vcard');
    res.setHeader('Content-Disposition', `attachment; filename="contact-${cardId}.vcf"`);
    res.status(200).send(vcfContent);
  } catch (error) {
    logger.error(`Export contact error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Share card (increment share count)
exports.shareCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    await cardService.incrementShares(cardId);
    res.status(200).json({ message: 'Share recorded' });
  } catch (error) {
    logger.error(`Share card error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Download card (increment download count)
exports.downloadCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    await cardService.incrementDownloads(cardId);
    res.status(200).json({ message: 'Download recorded' });
  } catch (error) {
    logger.error(`Download card error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Get card analytics
exports.getCardAnalytics = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const analytics = await cardService.getCardAnalytics(cardId, req.user.userId);
    res.status(200).json(analytics);
  } catch (error) {
    logger.error(`Get card analytics error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Get trending cards
exports.getTrendingCards = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const cards = await cardService.getTrendingCards(parseInt(limit));
    res.status(200).json({ cards });
  } catch (error) {
    logger.error(`Get trending cards error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Get user's loved cards
exports.getLovedCards = async (req, res, next) => {
  try {
    const cards = await cardService.getUserLovedCards(req.user.userId);
    res.status(200).json({ cards });
  } catch (error) {
    logger.error(`Get loved cards error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Save contact to device
exports.saveContact = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const card = await cardService.getCardById(cardId);
    
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Generate VCF content for contact
    const vcfContent = await cardService.generateVCF(cardId);
    
    // Set headers for VCF download
    res.setHeader('Content-Type', 'text/vcard');
    res.setHeader('Content-Disposition', `attachment; filename="contact-${card.shortLink}.vcf"`);
    res.status(200).send(vcfContent);
  } catch (error) {
    logger.error(`Save contact error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Get card with enhanced information for authenticated users
exports.getCardWithEnhancedInfo = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const userId = req.user?.userId;
    
    const result = await cardService.getCardById(cardId);
    
    if (!result || !result.card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Check access for private cards
    if (result.card.privacy === 'private' && userId) {
      const accessCheck = await cardAccessService.checkAccess(cardId, userId);
      if (!accessCheck.access) {
        return res.status(403).json({ 
          error: 'Access denied', 
          reason: accessCheck.reason,
          requestId: accessCheck.request?._id 
        });
      }
    }

    // For private cards, check if user has approved access to show full information
    let hasApprovedAccess = false;
    let isOwner = false;
    if (result.card.privacy === 'private' && userId) {
      // Check if user is the owner
      isOwner = result.card.ownerUserId?.toString() === userId;
      
      // Check if user has approved access
      const accessCheck = await cardAccessService.checkAccess(cardId, userId);
      hasApprovedAccess = accessCheck.access && (accessCheck.reason === 'approved_request' || accessCheck.reason === 'owner');
    }

    // Add enhanced information for authenticated users
    if (userId) {
      const enhancedCard = {
        ...result.card.toObject(),
        isLoved: await cardService.isLovedByUser(cardId, userId),
        isSaved: await savedCardService.isCardSavedByUser(cardId, userId),
        canEdit: result.card.ownerUserId?.toString() === userId,
        fullContactInfo: isOwner || hasApprovedAccess || result.card.privacy === 'public',
        hasApprovedAccess: hasApprovedAccess
      };
      
      return res.json({ 
        success: true, 
        card: enhancedCard,
        cardDesign: result.cardDesign,
        template: result.template
      });
    }

    // For non-authenticated users, return basic info
    return res.json({ 
      success: true, 
      card: result.card,
      cardDesign: result.cardDesign,
      template: result.template
    });
  } catch (error) {
    logger.error(`Get card with enhanced info error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Request access to private card
exports.requestCardAccess = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { message } = req.body;
    const userId = req.user.userId;

    const result = await cardAccessService.createAccessRequest(cardId, userId, 'manual_request', message);
    
    // Create notification for card owner
    if (!result.access) {
      await notificationService.createAccessRequestNotification(cardId, userId, result.request._id);
    }
    
    res.status(200).json({
      success: true,
      access: result.access,
      request: result.request,
      message: result.access ? 'Access granted' : 'Access request sent'
    });
  } catch (error) {
    logger.error(`Request card access error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Grant QR access to private card
exports.grantQRAccess = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const userId = req.user.userId;

    const result = await cardAccessService.grantQRAccess(cardId, userId);
    
    res.status(200).json({
      success: true,
      access: result.access,
      request: result.request,
      message: 'Access granted via QR code'
    });
  } catch (error) {
    logger.error(`Grant QR access error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Get access requests for card owner
exports.getAccessRequests = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const requests = await cardAccessService.getOwnerRequests(userId);
    
    res.status(200).json({
      success: true,
      requests
    });
  } catch (error) {
    logger.error(`Get access requests error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Approve access request (card owner can approve their requests)
exports.approveAccessRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { message } = req.body;
    const userId = req.user.userId;

    const request = await cardAccessService.approveRequest(requestId, userId, message);
    
    // Create notification for requester
    await notificationService.createAccessApprovedNotification(requestId);
    
    res.status(200).json({
      success: true,
      request,
      message: 'Access request approved'
    });
  } catch (error) {
    logger.error(`Approve access request error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Reject access request (card owner can reject their requests)
exports.rejectAccessRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { message } = req.body;
    const userId = req.user.userId;

    const request = await cardAccessService.rejectRequest(requestId, userId, message);
    
    // Create notification for requester
    await notificationService.createAccessRejectedNotification(requestId, message);
    
    res.status(200).json({
      success: true,
      request,
      message: 'Access request rejected'
    });
  } catch (error) {
    logger.error(`Reject access request error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};