const cardService = require('../services/cardService');
const savedCardService = require('../services/savedCardService');
const cardAccessService = require('../services/cardAccessService');
const notificationService = require('../services/notificationService');
const analyticsService = require('../services/analyticsService');
const searchService = require('../services/searchService');
const logger = require('../utils/logger');
const { getOwnerId, isPrivateCard, sanitizePrivateCard } = require('../utils/cardPrivacy');

const DEDUP_VIEW_MS = 5 * 60 * 1000;
const DEDUP_ACTION_MS = 60 * 1000;

// Best-effort analytics recording — never blocks or breaks the main flow.
// Returns the underlying promise so callers can optionally await the dedup
// decision (e.g. to gate counter increments on real, non-refresh views).
const recordAnalytics = (cardId, actionType, userId, req, dedupMs = DEDUP_ACTION_MS) => {
  if (!cardId) return Promise.resolve(null);
  const userAgent = req?.get?.('user-agent') || req?.headers?.['user-agent'];
  return analyticsService
    .recordEvent({
      cardId,
      userId: userId || null,
      actionType,
      metadata: {
        userAgent,
        ipAddress: req?.ip,
        visitorId: req?.headers?.['x-visitor-id'] || null,
        pageUrl: req?.originalUrl || req?.url
      },
      dedupMs
    })
    .catch(err => {
      logger.warn(`Analytics record failed (${actionType}): ${err.message}`);
      return null;
    });
};

const decodeViewer = (req) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return { isAuthenticated: false, userId: null };
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { isAuthenticated: !!decoded.userId, userId: decoded.userId || null };
  } catch {
    return { isAuthenticated: false, userId: null };
  }
};

const applyPrivateCardAccess = async (result, userId) => {
  if (!result?.card || !isPrivateCard(result.card)) {
    return {
      ...result,
      access: { granted: true, reason: 'public_card', requiresRequest: false },
    };
  }

  const ownerId = getOwnerId(result.card.ownerUserId);
  const isOwner = userId && ownerId === String(userId);

  let accessCheck = { access: false, reason: userId ? 'no_access' : 'unauthenticated' };
  if (userId) {
    accessCheck = await cardAccessService.checkAccess(result.card._id, userId);
  }

  const granted = Boolean(accessCheck.access);
  if (!isOwner && !granted) {
    result.card = sanitizePrivateCard(result.card);
  }

  result.access = {
    granted: isOwner || granted,
    reason: isOwner ? 'owner' : accessCheck.reason,
    requiresRequest: !isOwner && !granted,
    requestId: accessCheck.request?._id || null,
  };

  return result;
};

// Create a new card
exports.createCard = async (req, res, next) => {
  try {
    const {
      title,
      isPublic,
      privacy,
      designJson,
      templateId,
      customShortLink,
      fullName,
      jobTitle,
      department,
      email,
      phone,
      mobile,
      fax,
      website,
      company,
      address,
      city,
      state,
      country,
      postalCode,
      bio,
      tagline,
      companyTagline,
      socialLinks,
      cardDesign,
      templateName,
      category,
      tags,
      backgroundColor,
      textColor,
      fontFamily,
      industry,
      profession,
      skills,
      services,
      products
    } = req.body;
    const cardImage = req.file;

    logger.info(`createCard: title=${title}, isPublic=${isPublic}, fullName=${fullName}`);

    if (!fullName || fullName.trim() === '') {
      logger.error(`createCard: fullName is missing or empty.`);
      return res.status(400).json({ error: 'Full name is required' });
    }

    const result = await cardService.createCard(req.user.userId, {
      title,
      isPublic,
      privacy,
      designJson,
      cardImage,
      templateId,
      customShortLink,
      fullName,
      jobTitle,
      department,
      email,
      phone,
      mobile,
      fax,
      website,
      company,
      address,
      city,
      state,
      country,
      postalCode,
      bio,
      tagline,
      companyTagline,
      socialLinks,
      cardDesign,
      templateName,
      category,
      tags,
      backgroundColor,
      textColor,
      fontFamily,
      industry,
      profession,
      skills,
      services,
      products
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
      privacy,
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
      privacy,
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

// Get aggregate stats for all of a user's cards
exports.getUserCardStats = async (req, res, next) => {
  try {
    const stats = await cardService.getUserCardStats(req.user.userId);
    // Flat shape so frontend can read stats.totalCards directly from the payload
    res.status(200).json(stats);
  } catch (error) {
    logger.error(`Get user card stats error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Get a specific card
exports.getCard = async (req, res, next) => {
  try {
    logger.info(`getCard called with cardId: ${req.params.cardId}, userId: ${req.user.userId}`);
    const card = await cardService.getCard(req.params.cardId, req.user.userId);
    res.status(200).json({ success: true, card });
  } catch (error) {
    logger.error(`Get card error: ${error.message}`);
    res.status(404).json({ success: false, error: error.message });
  }
};

// Update a card
exports.updateCard = async (req, res, next) => {
  try {
    const {
      title,
      isPublic,
      privacy,
      designJson,
      fullName,
      jobTitle,
      department,
      email,
      phone,
      mobile,
      fax,
      website,
      company,
      address,
      city,
      state,
      country,
      postalCode,
      bio,
      tagline,
      companyTagline,
      socialLinks,
      cardDesign,
      backgroundColor,
      textColor,
      fontFamily,
      templateId,
      templateName,
      category,
      tags,
      industry,
      profession,
      skills,
      services,
      products
    } = req.body;
    const cardImage = req.file;

    const result = await cardService.updateCard(req.params.cardId, req.user.userId, {
      title,
      isPublic,
      privacy,
      designJson,
      fullName,
      jobTitle,
      department,
      email,
      phone,
      mobile,
      fax,
      website,
      company,
      address,
      city,
      state,
      country,
      postalCode,
      bio,
      tagline,
      companyTagline,
      socialLinks,
      cardDesign,
      backgroundColor,
      textColor,
      fontFamily,
      templateId,
      templateName,
      category,
      tags,
      industry,
      profession,
      skills,
      services,
      products,
      cardImage
    });

    res.status(200).json({ success: true, card: result.card, cardDesign: result.cardDesign });
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
    const { page = 1, limit = 10, category, search, privacy, sortBy, industry, location } = req.query;
    const cards = await cardService.getPublicCards({
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      search,
      privacy,
      sortBy,
      industry,
      location
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

    // Increment view count only for real views (dedup-aware): a refresh of the
    // same card by the same user/visitor within the dedup window is not a view.
    const { userId } = decodeViewer(req);
    const event = await recordAnalytics(result?.card?._id, 'view', userId, req, DEDUP_VIEW_MS);
    if (result?.card && event && !event.deduplicated && typeof result.card.incrementViews === 'function') {
      await result.card.incrementViews();
    }

    // Resolve isLoved while `result.card` is still the Mongoose document:
    // applyPrivateCardAccess() may replace it with a sanitized plain object,
    // which has no document methods (isLovedByUser, incrementViews, ...).
    const isLoved = userId && typeof result?.card?.isLovedByUser === 'function'
      ? result.card.isLovedByUser(userId)
      : false;

    const payload = await applyPrivateCardAccess(result, userId);
    if (userId && payload.card) {
      const cardObj = payload.card.toObject ? payload.card.toObject() : { ...payload.card };
      cardObj.isLoved = isLoved;
      payload.card = cardObj;
    }

    if (payload.card && isPrivateCard(payload.card)) {
      res.setHeader('X-Privacy-Notice', 'Contact details require approved access');
    }

    res.status(200).json(payload);
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

    // Increment view count only for real views (dedup-aware): a refresh of the
    // same card by the same user/visitor within the dedup window is not a view.
    const { userId } = decodeViewer(req);
    let event = null;
    try {
      event = await recordAnalytics(result?.card?._id, 'view', userId, req, DEDUP_VIEW_MS);
      if (event && !event.deduplicated && typeof result.card.incrementViews === 'function') {
        await result.card.incrementViews();
      }
    } catch (incrementError) {
      logger.warn(`Failed to count view for card ${req.params.cardId}: ${incrementError.message}`);
    }

    const isLoved = userId && typeof result?.card?.isLovedByUser === 'function'
      ? result.card.isLovedByUser(userId)
      : false;

    const payload = await applyPrivateCardAccess(result, userId);
    if (userId && payload.card) {
      const cardObj = payload.card.toObject ? payload.card.toObject() : { ...payload.card };
      cardObj.isLoved = isLoved;
      payload.card = cardObj;
    }

    if (payload.card && isPrivateCard(payload.card)) {
      res.setHeader('X-Privacy-Notice', 'Contact details require approved access');
    }

    res.status(200).json(payload);
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
    recordAnalytics(cardId, result.loved ? 'love' : 'unlove', req.user.userId, req);
    // Notify card owner when someone loves their card (only on love, not unlove)
    if (result.loved) {
      notificationService.createCardLovedNotification(cardId, req.user.userId).catch(err =>
        logger.warn(`Failed to create love notification: ${err.message}`)
      );
    }
    res.status(200).json({ cardId, loved: result.loved, loveCount: result.loveCount });
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
    recordAnalytics(cardId, 'save', req.user.userId, req);
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
    const { userId } = decodeViewer(req);
    const cardDoc = await cardService.getCardById(cardId);
    if (!cardDoc?.card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    if (isPrivateCard(cardDoc.card)) {
      const accessCheck = userId
        ? await cardAccessService.checkAccess(cardId, userId)
        : { access: false };
      if (!accessCheck.access) {
        return res.status(403).json({ error: 'Access request required to export this private card' });
      }
    }

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
    recordAnalytics(cardId, 'share', req.user?.userId, req);
    // Notify card owner when someone shares their card
    if (req.user?.userId) {
      notificationService.createCardSharedNotification(cardId, req.user.userId).catch(err =>
        logger.warn(`Failed to create share notification: ${err.message}`)
      );
    }
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
    recordAnalytics(cardId, 'download', req.user?.userId, req);
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

// Personalized discovery feed (optional auth; anonymous → trending)
exports.getDiscover = async (req, res, next) => {
  try {
    const { limit = 12, page = 1, search = '', category = '', industry = '', location = '', sortBy = '' } = req.query;
    const userId = req.user?.userId || null;
    const data = await searchService.getDiscoverCards({ userId, limit, page, search, category, industry, location, sortBy });
    res.status(200).json(data);
  } catch (error) {
    logger.error(`Get discover cards error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Get suggested cards (random popular public cards)
exports.getSuggestions = async (req, res, next) => {
  try {
    const { limit = 6 } = req.query;
    const Card = require('../models/cardModel');
    const suggestions = await Card.aggregate([
      { $match: { isPublic: true, isActive: true } },
      { $sample: { size: parseInt(limit) } },
      { $lookup: { from: 'users', localField: 'ownerUserId', foreignField: '_id', as: 'owner', pipeline: [{ $project: { name: 1, username: 1, avatar: 1 } }] } },
      { $unwind: { path: '$owner', preserveNullAndEmptyArrays: true } }
    ]);
    res.status(200).json({ suggestions });
  } catch (error) {
    logger.error(`Get suggestions error: ${error.message}`);
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
    const { userId } = decodeViewer(req);
    const card = await cardService.getCardById(cardId);

    if (!card?.card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    if (isPrivateCard(card.card)) {
      const accessCheck = userId
        ? await cardAccessService.checkAccess(cardId, userId)
        : { access: false };
      if (!accessCheck.access) {
        return res.status(403).json({ error: 'Access request required to save this private contact' });
      }
    }

    // Generate VCF content for contact
    const vcfContent = await cardService.generateVCF(cardId);

    // Set headers for VCF download
    res.setHeader('Content-Type', 'text/vcard');
      res.setHeader('Content-Disposition', `attachment; filename="contact-${card.card.shortLink}.vcf"`);
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
      isOwner = getOwnerId(result.card.ownerUserId) === String(userId);

      // Check if user has approved access
      const accessCheck = await cardAccessService.checkAccess(cardId, userId);
      hasApprovedAccess = accessCheck.access && (accessCheck.reason === 'approved_request' || accessCheck.reason === 'owner');
    }

    // Add enhanced information for authenticated users
    if (userId) {
      const enhancedCard = {
        ...result.card.toObject(),
        isLoved: await result.card.isLovedByUser(userId),
        isSaved: await savedCardService.isCardSavedByUser(cardId, userId),
        canEdit: getOwnerId(result.card.ownerUserId) === String(userId),
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

// Check access status for a card
exports.checkCardAccess = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const userId = req.user.userId;

    const accessCheck = await cardAccessService.checkAccess(cardId, userId);

    res.status(200).json({
      success: true,
      access: accessCheck.access,
      reason: accessCheck.reason,
      request: accessCheck.request
    });
  } catch (error) {
    logger.error(`Check card access error: ${error.message}`);
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
      message: result.access ? 'You already have access' : 'Access request sent. The card owner must approve it.'
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

// Update card privacy
exports.updateCardPrivacy = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { privacy } = req.body;
    const userId = req.user.userId;

    // Validate privacy value
    if (!privacy || !['public', 'private'].includes(privacy)) {
      return res.status(400).json({ error: 'Privacy must be either "public" or "private"' });
    }

    const card = await cardService.updateCardPrivacy(cardId, userId, privacy);

    logger.info(`Card privacy updated: ${cardId} by user ${userId} to ${privacy}`);

    res.status(200).json({
      success: true,
      card: {
        _id: card._id,
        privacy: card.privacy,
        isPublic: card.isPublic,
        isPrivate: card.isPrivate
      },
      message: `Card is now ${privacy}`
    });
  } catch (error) {
    logger.error(`Update card privacy error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Archive a card (soft delete)
exports.archiveCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const userId = req.user.userId;
    const Card = require('../models/cardModel');
    const card = await Card.findOne({ _id: cardId, ownerUserId: userId });
    if (!card) return res.status(404).json({ error: 'Card not found' });
    card.isActive = false;
    await card.save();
    res.status(200).json({ message: 'Card archived', card: { _id: card._id, isActive: false } });
  } catch (error) {
    logger.error(`Archive card error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Restore a card
exports.restoreCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const userId = req.user.userId;
    const Card = require('../models/cardModel');
    const card = await Card.findOne({ _id: cardId, ownerUserId: userId });
    if (!card) return res.status(404).json({ error: 'Card not found' });
    card.isActive = true;
    await card.save();
    res.status(200).json({ message: 'Card restored', card: { _id: card._id, isActive: true } });
  } catch (error) {
    logger.error(`Restore card error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Duplicate a card
exports.duplicateCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const userId = req.user.userId;
    const Card = require('../models/cardModel');
    const card = await Card.findOne({ _id: cardId, ownerUserId: userId });
    if (!card) return res.status(404).json({ error: 'Card not found' });
    const cardObj = card.toObject();
    delete cardObj._id;
    delete cardObj.shortLink;
    delete cardObj.createdAt;
    delete cardObj.updatedAt;
    delete cardObj.loves;
    delete cardObj.__v;
    cardObj.title = `${cardObj.title} (Copy)`;
    cardObj.views = 0;
    cardObj.loveCount = 0;
    cardObj.shares = 0;
    cardObj.downloads = 0;
    const newCard = await cardService.createCard(userId, cardObj);
    res.status(201).json(newCard);
  } catch (error) {
    logger.error(`Duplicate card error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Get archived cards
exports.getArchivedCards = async (req, res, next) => {
  try {
    const Card = require('../models/cardModel');
    const cards = await Card.find({ ownerUserId: req.user.userId, isActive: false }).sort({ updatedAt: -1 });
    res.status(200).json({ cards });
  } catch (error) {
    logger.error(`Get archived cards error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Card completion score
exports.getCardCompletionScore = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const Card = require('../models/cardModel');
    const card = await Card.findOne({ _id: cardId, ownerUserId: req.user.userId });
    if (!card) return res.status(404).json({ error: 'Card not found' });
    const fields = ['fullName', 'jobTitle', 'company', 'email', 'phone', 'website', 'bio', 'address', 'city', 'country'];
    const socialFields = Object.keys(card.socialLinks || {}).filter(k => card.socialLinks[k]);
    const filled = fields.filter(f => card[f] && card[f].toString().trim() !== '').length;
    const total = fields.length + 1;
    let score = Math.round((filled / total) * 100);
    if (socialFields.length > 0) score = Math.min(100, score + 10);
    const missing = fields.filter(f => !card[f] || card[f].toString().trim() === '');
    res.status(200).json({ score, missing, socialLinksCount: socialFields.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};