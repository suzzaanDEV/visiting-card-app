const Card = require('../models/cardModel');
const CardDesign = require('../models/cardDesignModel');
const Template = require('../models/templateModel');
const User = require('../models/userModel');
const imageService = require('./imageService');
const logger = require('../utils/logger');
const qrCodeGenerator = require('../algorithms/qrCodeGenerator');
const shortLinkGenerator = require('../algorithms/shortLinkGenerator');
const cloudinary = require('../utils/cloudinary');
const cardAccessService = require('./cardAccessService');

// Add caching mechanism
const cardCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedCard = (cardId) => {
  const cached = cardCache.get(cardId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

class CardService {
  async createCard(userId, { 
    title, 
    fullName, 
    jobTitle, 
    company, 
    email, 
    phone, 
    website, 
    address, 
    bio, 
    isPublic, 
    designJson, 
    cardImage, 
    backgroundColor, 
    textColor, 
    fontFamily, 
    templateId, 
    customShortLink,
    privacy = 'public'
  }) {
    try {
      // Generate short link
      const shortLink = customShortLink || await shortLinkGenerator.generate();
      
      // Create card with privacy settings
      const card = new Card({
        ownerUserId: userId,
        title,
        fullName,
        jobTitle,
        company,
        email,
        phone,
        website,
        address,
        bio,
        backgroundColor: backgroundColor || '#ffffff',
        textColor: textColor || '#000000',
        fontFamily: fontFamily || 'Arial',
        shortLink,
        isPublic: privacy === 'public',
        isPrivate: privacy === 'private',
        privacy,
        templateId
      });

      await card.save();
      logger.info(`Card created: ${card._id} by user: ${userId}`);

      return card;
    } catch (error) {
      logger.error(`Create card error: ${error.message}`);
      throw error;
    }
  }

  async createCardFromTemplate(userId, { 
    title, 
    isPublic, 
    privacy = 'public',
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
  }) {
    try {
      logger.info(`Creating card from template for user ${userId} with title: ${title}, fullName: ${fullName}`);

      // Validate fullName
      if (!fullName || fullName.trim() === '') {
        throw new Error('Full name is required');
      }

      // Generate short link
      const shortLink = await shortLinkGenerator.generate();

      // Create the card
      const cardData = {
        ownerUserId: userId,
        title: title || `${fullName}'s Card`,
        fullName,
        jobTitle,
        company,
        email,
        phone,
        website,
        address,
        bio,
        shortLink,
        isPublic: privacy === 'public',
        isPrivate: privacy === 'private',
        privacy,
        backgroundColor,
        textColor,
        fontFamily,
        templateId: templateId || null
      };
      
      logger.info(`Creating card with data: ${JSON.stringify(cardData)}`);
      
      const card = new Card(cardData);

      // Handle image upload if provided
      let cardImageUrl = null;
      if (cardImage) {
        try {
          // Check if Cloudinary is properly configured
          if (process.env.CLOUDINARY_CLOUD_NAME && 
              process.env.CLOUDINARY_API_KEY && 
              process.env.CLOUDINARY_API_SECRET &&
              process.env.CLOUDINARY_CLOUD_NAME !== 'your-cloud-name' &&
              process.env.CLOUDINARY_API_KEY !== 'your-api-key') {
            
            cardImageUrl = await imageService.uploadImage(cardImage);
            card.cardImage = cardImageUrl;
            logger.info(`Image uploaded successfully: ${cardImageUrl}`);
          } else {
            logger.warn('Cloudinary not configured, skipping image upload');
            // You could store the image locally or use a different service
          }
        } catch (uploadError) {
          logger.error(`Image upload failed: ${uploadError.message}`);
          // Continue without image - card will still be created
        }
      }

      await card.save();
      logger.info(`Card created successfully with ID: ${card._id}`);

      // Create card design
      const cardDesign = new CardDesign({
        cardId: card._id,
        designJson: JSON.stringify({
          backgroundColor: backgroundColor || '#ffffff',
          textColor: textColor || '#000000',
          fontFamily: fontFamily || 'Arial',
          elements: []
        })
      });

      await cardDesign.save();

      // Generate QR code
      const qrCodeUrl = await qrCodeGenerator.generate(
        `${process.env.FRONTEND_URL || 'http://localhost:5173'}/c/${shortLink}`
      );
      card.qrCode = qrCodeUrl;
      await card.save();

      return {
        card,
        cardDesign,
        qrCode: qrCodeUrl
      };
    } catch (error) {
      logger.error(`Error creating card from template: ${error.message}`);
      throw error;
    }
  }

  async generateDesignFromTemplate(template, data) {
    // This is a simplified template system
    // In a real application, you'd have more sophisticated template rendering
    const design = {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      elements: [
        {
          type: 'text',
          x: 50,
          y: 50,
          text: data.fullName || 'Your Name',
          fontSize: 32,
          fontFamily: 'Arial, sans-serif',
          fill: '#333333',
          fontWeight: 'bold'
        },
        {
          type: 'text',
          x: 50,
          y: 100,
          text: data.jobTitle || 'Job Title',
          fontSize: 18,
          fontFamily: 'Arial, sans-serif',
          fill: '#666666'
        },
        {
          type: 'text',
          x: 50,
          y: 150,
          text: data.company || 'Company',
          fontSize: 16,
          fontFamily: 'Arial, sans-serif',
          fill: '#888888'
        },
        {
          type: 'text',
          x: 50,
          y: 200,
          text: data.email || 'email@example.com',
          fontSize: 14,
          fontFamily: 'Arial, sans-serif',
          fill: '#333333'
        },
        {
          type: 'text',
          x: 50,
          y: 230,
          text: data.phone || '+1 234 567 8900',
          fontSize: 14,
          fontFamily: 'Arial, sans-serif',
          fill: '#333333'
        },
        {
          type: 'text',
          x: 50,
          y: 260,
          text: data.website || 'www.example.com',
          fontSize: 14,
          fontFamily: 'Arial, sans-serif',
          fill: '#333333'
        },
        {
          type: 'text',
          x: 50,
          y: 290,
          text: data.address || 'Address',
          fontSize: 14,
          fontFamily: 'Arial, sans-serif',
          fill: '#333333'
        }
      ]
    };

    return JSON.stringify(design);
  }

  async getCard(cardId, userId) {
    logger.info(`getCard service called with cardId: ${cardId}, userId: ${userId}`);
    
    if (!cardId) {
      throw new Error('Card ID is required');
    }
    
    const card = await Card.findById(cardId);
    if (!card) {
      throw new Error('Card not found');
    }

    // Check if user can access this card using card access service
    const cardAccessService = require('./cardAccessService');
    const accessCheck = await cardAccessService.checkAccess(cardId, userId);
    
    if (!accessCheck.access) {
      throw new Error('Unauthorized to access this card');
    }

    // Check if user loved this card
    const isLoved = card.isLovedByUser(userId);

    return {
      ...card.toObject(),
      isLoved
    };
  }

  async getUserCards(userId) {
    const cards = await Card.find({ ownerUserId: userId, isActive: true })
      .populate('ownerUserId', 'username name email phone location website bio jobTitle company')
      .sort({ createdAt: -1 });

    return cards;
  }

  async updateCard(cardId, userId, { 
    title, 
    isPublic, 
    privacy,
    designJson, 
    cardImage,
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
  }) {
    const card = await Card.findById(cardId);
    if (!card) {
      throw new Error('Card not found');
    }
    if (card.ownerUserId.toString() !== userId) {
      throw new Error('Unauthorized to update this card');
    }

    const cardDesign = await CardDesign.findOne({ cardId });
    if (!cardDesign) {
      throw new Error('Card design not found');
    }

    // Validate designJson if provided
    if (designJson) {
      try {
        JSON.parse(designJson);
      } catch (error) {
        logger.error(`Invalid designJson: ${error.message}`);
        throw new Error('Invalid design JSON');
      }
    }

    let cardImageUrl = cardDesign.cardImageUrl;
    if (cardImage) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'cardly_cards',
              resource_type: 'image'
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          uploadStream.end(cardImage.buffer);
        });
        cardImageUrl = uploadResult.secure_url;
        if (cardDesign.cardImageUrl) {
          try {
            const publicId = cardDesign.cardImageUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`cardly_cards/${publicId}`);
          } catch (destroyError) {
            logger.warn(`Failed to destroy old image: ${destroyError.message}`);
          }
        }
      } catch (error) {
        logger.warn(`Cloudinary upload failed for card image: ${error.message}`);
        // Keep the existing image URL if upload fails
        cardImageUrl = cardDesign.cardImageUrl;
      }
    }

    // Update Card with all fields
    if (title !== undefined) card.title = title;
    if (isPublic !== undefined) card.isPublic = isPublic;
    if (privacy !== undefined) {
      card.privacy = privacy;
      card.isPublic = privacy === 'public';
      card.isPrivate = privacy === 'private';
    }
    if (fullName !== undefined) card.fullName = fullName;
    if (jobTitle !== undefined) card.jobTitle = jobTitle;
    if (email !== undefined) card.email = email;
    if (phone !== undefined) card.phone = phone;
    if (website !== undefined) card.website = website;
    if (company !== undefined) card.company = company;
    if (address !== undefined) card.address = address;
    if (bio !== undefined) card.bio = bio;
    if (templateId !== undefined) card.templateId = templateId;
    await card.save();

    // Update CardDesign
    if (designJson !== undefined) cardDesign.designJson = designJson;
    if (backgroundColor !== undefined) cardDesign.backgroundColor = backgroundColor;
    if (textColor !== undefined) cardDesign.textColor = textColor;
    if (fontFamily !== undefined) cardDesign.fontFamily = fontFamily;
    cardDesign.cardImageUrl = cardImageUrl;
    await cardDesign.save();

    logger.info(`Card updated: ${cardId} for user: ${userId}`);
    return { card, cardDesign };
  }

  async deleteCard(cardId, userId) {
    const card = await Card.findById(cardId);
    if (!card) {
      throw new Error('Card not found');
    }
    if (card.ownerUserId.toString() !== userId) {
      throw new Error('Unauthorized to delete this card');
    }

    // Soft delete
    card.isActive = false;
    await card.save();

    logger.info(`Card deleted: ${cardId} by user: ${userId}`);
    return { message: 'Card deleted successfully' };
  }

  async getPublicCards({ page = 1, limit = 10, category, search, privacy }) {
    try {
      const skip = (page - 1) * limit;
      
      // Build query based on privacy filter
      const query = {
        isActive: true
      };

      // Apply privacy filter
      if (privacy && privacy !== 'all') {
        query.privacy = privacy;
        // Also filter by isPublic for backward compatibility
        if (privacy === 'public') {
          query.isPublic = true;
        } else if (privacy === 'private') {
          query.isPublic = false;
        }
      } else if (!privacy) {
        // Default to public cards if no privacy filter specified
        // Show only cards that are explicitly public
        query.$and = [
          {
            $or: [
              { privacy: 'public' },
              { privacy: { $exists: false }, isPublic: true }
            ]
          },
          {
            $or: [
              { isPublic: true },
              { isPrivate: { $ne: true } }
            ]
          }
        ];
      }
      // If privacy === 'all', don't add any privacy filter

      // Add search functionality
      if (search) {
        query.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { jobTitle: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
          { bio: { $regex: search, $options: 'i' } }
        ];
      }

      // Add category filter if provided
      if (category) {
        query.jobTitle = { $regex: category, $options: 'i' };
      }

      const cards = await Card.find(query)
        .populate('ownerUserId', 'username name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Card.countDocuments(query);
      const pages = Math.ceil(total / limit);

      return {
        cards,
        pagination: {
          page,
          limit,
          total,
          pages
        }
      };
    } catch (error) {
      logger.error(`getPublicCards error: ${error.message}`);
      throw error;
    }
  }

  async getCardByShortLink(shortLink) {
    const card = await Card.findOne({ shortLink, isActive: true })
      .populate('ownerUserId', 'username name email phone location website bio jobTitle company');

    if (!card) {
      throw new Error('Card not found');
    }

    // Get the card design
    const cardDesign = await CardDesign.findOne({ cardId: card._id });
    
    // Get template data if templateId exists
    let template = null;
    if (card.templateId) {
      try {
        const Template = require('../models/templateModel');
        // Find by string id field only
        template = await Template.findOne({ 
          id: card.templateId, 
          isActive: true 
        });
      } catch (templateError) {
        logger.warn(`Template lookup failed for templateId ${card.templateId}: ${templateError.message}`);
      }
    }
    
    return { card, cardDesign, template };
  }

  async getCardById(cardId) {
    try {
      const card = await Card.findById(cardId)
        .populate('ownerUserId', 'username name email phone location website bio jobTitle company');

      if (!card) {
        throw new Error('Card not found');
      }

      // Get the card design
      const cardDesign = await CardDesign.findOne({ cardId: card._id });
      
      // Get template data if templateId exists
      let template = null;
      if (card.templateId) {
        try {
          const Template = require('../models/templateModel');
          // First try to find by string id field
          template = await Template.findOne({ 
            id: card.templateId, 
            isActive: true 
          });
          
          // If not found by string id, try by _id (ObjectId)
          if (!template) {
            template = await Template.findById(card.templateId);
          }
        } catch (templateError) {
          logger.warn(`Template lookup failed for templateId ${card.templateId}: ${templateError.message}`);
        }
      }
      
      return { card, cardDesign, template };
    } catch (error) {
      logger.error(`getCardById error: ${error.message}`);
      throw error;
    }
  }

  async toggleLove(cardId, userId) {
    const card = await Card.findById(cardId);
    if (!card) {
      throw new Error('Card not found');
    }

    const isLoved = card.isLovedByUser(userId);
    
    if (isLoved) {
      card.removeLove(userId);
      await card.save();
      logger.info(`Love removed from card ${cardId} by user ${userId}`);
      return { loved: false, loveCount: card.loveCount };
    } else {
      card.addLove(userId);
      await card.save();
      logger.info(`Love added to card ${cardId} by user ${userId}`);
      return { loved: true, loveCount: card.loveCount };
    }
  }

  async getUserLovedCards(userId) {
    const cards = await Card.find({
      'loves.userId': userId,
      isActive: true
    })
    .populate('ownerUserId', 'username name')
    .sort({ createdAt: -1 });

    return cards;
  }

  async generateQRCode(cardId, userId) {
    const card = await Card.findById(cardId);
    if (!card) {
      throw new Error('Card not found');
    }
    if (card.ownerUserId.toString() !== userId) {
      throw new Error('Unauthorized to generate QR code for this card');
    }

    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const cardUrl = `${frontendUrl}/c/${card.shortLink}`;
      
      logger.info(`Generating QR code for URL: ${cardUrl}`);
      
      const qrCodeData = await qrCodeGenerator.generate(
        cardUrl,
        {
          errorCorrectionLevel: 'H',
          width: 300,
          color: {
            dark: '#1a3a63',
            light: '#ffffff'
          }
        }
      );
      
      // Try to upload to Cloudinary if configured, otherwise use data URL directly
      let qrCodeUrl;
      try {
        const uploadResult = await cloudinary.uploader.upload(qrCodeData, {
                          folder: 'cardly_qr',
          resource_type: 'image'
        });
        qrCodeUrl = uploadResult.secure_url;
        logger.info(`QR code uploaded to Cloudinary: ${qrCodeUrl}`);
      } catch (cloudinaryError) {
        logger.warn(`Cloudinary upload failed, using data URL: ${cloudinaryError.message}`);
        // Use the data URL directly if Cloudinary is not configured
        qrCodeUrl = qrCodeData;
        logger.info(`Using QR code data URL directly`);
      }
      
      card.qrCode = qrCodeUrl;
      await card.save();
      
      logger.info(`QR code generated for card: ${cardId}`);
      return card.qrCode;
    } catch (error) {
      logger.error(`QR code generation error: ${error.message}`);
      throw new Error('Failed to generate QR code');
    }
  }

  async generateVCF(cardId) {
    const card = await Card.findById(cardId)
      .populate('ownerUserId', 'username name email phone location website bio');

    if (!card) {
      throw new Error('Card not found');
    }

    // Use card's fullName instead of user's name, fallback to user's name if fullName is not available
    const contactName = card.fullName || card.ownerUserId?.name || card.ownerUserId?.username || 'Unknown';
    
    // Parse the full name into first and last name
    const nameParts = contactName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Use card's company for organization
    const organization = card.company || '';
    
    const vcf = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${contactName}`,
      `N:${lastName};${firstName};;;`,
      `EMAIL:${card.email || card.ownerUserId?.email || ''}`,
      `TEL:${card.phone || card.ownerUserId?.phone || ''}`,
      `URL:${card.website || card.ownerUserId?.website || ''}`,
      `ADR:;;${card.address || card.ownerUserId?.location || ''};;;;`,
      `NOTE:${card.bio || card.ownerUserId?.bio || ''}`,
      `ORG:${organization}`,
      `TITLE:${card.jobTitle || ''}`,
      'END:VCARD'
    ].join('\r\n');

    return vcf;
  }

  async incrementShares(cardId) {
    const card = await Card.findById(cardId);
    if (!card) {
      throw new Error('Card not found');
    }
    return await card.incrementShares();
  }

  async incrementDownloads(cardId) {
    const card = await Card.findById(cardId);
    if (!card) {
      throw new Error('Card not found');
    }
    return await card.incrementDownloads();
  }

  async getCardAnalytics(cardId, userId) {
    const card = await Card.findById(cardId);
    if (!card) {
      throw new Error('Card not found');
    }
    if (card.ownerUserId.toString() !== userId) {
      throw new Error('Unauthorized to view analytics for this card');
    }

    return {
      views: card.views,
      loves: card.loveCount,
      shares: card.shares,
      downloads: card.downloads,
      createdAt: card.createdAt
    };
  }

  async getTrendingCards(limit = 10) {
    const cards = await Card.find({ isPublic: true, isActive: true })
      .populate('ownerUserId', 'username name')
      .sort({ loveCount: -1, views: -1 })
      .limit(limit);

    return cards;
  }

  async getCardStats(userId) {
    const stats = await Card.aggregate([
      { $match: { ownerUserId: new require('mongoose').Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalCards: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalLoves: { $sum: '$loveCount' },
          totalShares: { $sum: '$shares' },
          totalDownloads: { $sum: '$downloads' }
        }
      }
    ]);

    return stats[0] || {
      totalCards: 0,
      totalViews: 0,
      totalLoves: 0,
      totalShares: 0,
      totalDownloads: 0
    };
  }

  // Admin methods
  async getAllCards({ page = 1, limit = 20, search, category, sortBy = 'createdAt', sortOrder = 'desc' }) {
    try {
      const skip = (page - 1) * limit;
      const query = {};

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { shortLink: { $regex: search, $options: 'i' } }
        ];
      }

      if (category) {
        query.templateId = category;
      }

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const cards = await Card.find(query)
        .populate('ownerUserId', 'username name')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);

      const total = await Card.countDocuments(query);

      return {
        cards,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error(`Get all cards error: ${error.message}`);
      throw error;
    }
  }



  async updateCardAdmin(cardId, updateData) {
    try {
      const card = await Card.findById(cardId);
      if (!card) {
        throw new Error('Card not found');
      }

      // Update allowed fields
      const allowedFields = ['title', 'isPublic', 'isActive'];
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          card[field] = updateData[field];
        }
      });

      await card.save();
      logger.info(`Card updated by admin: ${cardId}`);
      return card;
    } catch (error) {
      logger.error(`Update card admin error: ${error.message}`);
      throw error;
    }
  }

  async deleteCardAdmin(cardId) {
    try {
      const card = await Card.findById(cardId);
      if (!card) {
        throw new Error('Card not found');
      }

      // Soft delete
      card.isActive = false;
      await card.save();

      logger.info(`Card deleted by admin: ${cardId}`);
      return { message: 'Card deleted successfully' };
    } catch (error) {
      logger.error(`Delete card admin error: ${error.message}`);
      throw error;
    }
  }

  async getCardAnalyticsAdmin(cardId) {
    try {
      const card = await Card.findById(cardId)
        .populate('ownerUserId', 'username name');

      if (!card) {
        throw new Error('Card not found');
      }

      return {
        card: {
          _id: card._id,
          title: card.title,
          shortLink: card.shortLink,
          owner: card.ownerUserId
        },
        analytics: {
          views: card.views,
          loves: card.loveCount,
          shares: card.shares,
          downloads: card.downloads,
          createdAt: card.createdAt
        }
      };
    } catch (error) {
      logger.error(`Get card analytics admin error: ${error.message}`);
      throw error;
    }
  }

  async getTrendingCardsAdmin(limit = 10, period = '7d') {
    try {
      const days = period === '30d' ? 30 : period === '90d' ? 90 : 7;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const cards = await Card.find({
        isActive: true,
        createdAt: { $gte: startDate }
      })
      .populate('ownerUserId', 'username name')
      .sort({ loveCount: -1, views: -1 })
      .limit(limit);

      return cards;
    } catch (error) {
      logger.error(`Get trending cards admin error: ${error.message}`);
      throw error;
    }
  }

  async toggleCardFeature(cardId, featured) {
    try {
      const card = await Card.findById(cardId);
      if (!card) {
        throw new Error('Card not found');
      }

      card.featured = featured;
      await card.save();

      logger.info(`Card ${featured ? 'featured' : 'unfeatured'}: ${cardId}`);
      return card;
    } catch (error) {
      logger.error(`Toggle card feature error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new CardService();