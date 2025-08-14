const CardAccessRequest = require('../models/cardAccessRequestModel');
const Card = require('../models/cardModel');
const User = require('../models/userModel');
const logger = require('../utils/logger');

class CardAccessService {
  // Create a new access request
  async createAccessRequest(cardId, requesterId, requestType = 'manual_request', message = '') {
    try {
      // Get the card to find the owner
      const card = await Card.findById(cardId);
      if (!card) {
        throw new Error('Card not found');
      }

      // Check if card is private
      if (card.privacy !== 'private') {
        throw new Error('Card is not private');
      }

      // Check if requester is the owner
      if (card.ownerUserId.toString() === requesterId.toString()) {
        throw new Error('Cannot request access to your own card');
      }

      // Check if request already exists
      const existingRequest = await CardAccessRequest.findOne({
        cardId,
        requesterId,
        status: { $in: ['pending', 'approved'] }
      });

      if (existingRequest) {
        if (existingRequest.status === 'approved') {
          return { access: true, request: existingRequest };
        }
        throw new Error('Access request already exists');
      }

      // Create new request
      const request = new CardAccessRequest({
        cardId,
        requesterId,
        ownerId: card.ownerUserId,
        requestType,
        requestMessage: message
      });

      await request.save();

      logger.info(`Access request created for card ${cardId} by user ${requesterId}`);
      return { access: false, request };
    } catch (error) {
      logger.error(`Create access request error: ${error.message}`);
      throw error;
    }
  }

  // Check if user has access to a private card
  async checkAccess(cardId, userId) {
    try {
      const card = await Card.findById(cardId);
      if (!card) {
        throw new Error('Card not found');
      }

      // If card is public, allow access
      if (card.privacy === 'public') {
        return { access: true, reason: 'public_card' };
      }

      // If user is the owner, allow access
      if (card.ownerUserId.toString() === userId.toString()) {
        return { access: true, reason: 'owner' };
      }

      // Check for approved access request
      const approvedRequest = await CardAccessRequest.findOne({
        cardId,
        requesterId: userId,
        status: 'approved'
      });

      if (approvedRequest && !approvedRequest.isExpired()) {
        return { access: true, reason: 'approved_request' };
      }

      // Check for pending request
      const pendingRequest = await CardAccessRequest.findOne({
        cardId,
        requesterId: userId,
        status: 'pending'
      });

      if (pendingRequest) {
        return { access: false, reason: 'pending_request', request: pendingRequest };
      }

      return { access: false, reason: 'no_access' };
    } catch (error) {
      logger.error(`Check access error: ${error.message}`);
      throw error;
    }
  }

  // Get all access requests for a card owner
  async getOwnerRequests(ownerId) {
    try {
      const requests = await CardAccessRequest.find({ ownerId })
        .populate('cardId', 'title fullName jobTitle company')
        .populate('requesterId', 'name email username')
        .sort({ createdAt: -1 });

      return requests;
    } catch (error) {
      logger.error(`Get owner requests error: ${error.message}`);
      throw error;
    }
  }

  // Get all access requests for a requester
  async getRequesterRequests(requesterId) {
    try {
      const requests = await CardAccessRequest.find({ requesterId })
        .populate('cardId', 'title fullName jobTitle company')
        .populate('ownerId', 'name email username')
        .sort({ createdAt: -1 });

      return requests;
    } catch (error) {
      logger.error(`Get requester requests error: ${error.message}`);
      throw error;
    }
  }

  // Get all access requests (admin only)
  async getAllRequests() {
    try {
      const requests = await CardAccessRequest.find({})
        .populate('cardId', 'title fullName jobTitle company')
        .populate('requesterId', 'name email username')
        .populate('ownerId', 'name email username')
        .sort({ createdAt: -1 });

      return requests;
    } catch (error) {
      logger.error(`Get all requests error: ${error.message}`);
      throw error;
    }
  }

  // Approve an access request
  async approveRequest(requestId, ownerId, message = '') {
    try {
      const request = await CardAccessRequest.findById(requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      // Check if user is the card owner
      if (request.ownerId.toString() !== ownerId.toString()) {
        throw new Error('Not authorized to approve this request');
      }

      if (request.status !== 'pending') {
        throw new Error('Request is not pending');
      }

      await request.approve(message);
      logger.info(`Access request ${requestId} approved by ${ownerId}`);
      return request;
    } catch (error) {
      logger.error(`Approve request error: ${error.message}`);
      throw error;
    }
  }

  // Reject an access request
  async rejectRequest(requestId, ownerId, message = '') {
    try {
      const request = await CardAccessRequest.findById(requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      // Check if user is the card owner
      if (request.ownerId.toString() !== ownerId.toString()) {
        throw new Error('Not authorized to reject this request');
      }

      if (request.status !== 'pending') {
        throw new Error('Request is not pending');
      }

      await request.reject(message);
      logger.info(`Access request ${requestId} rejected by ${ownerId}`);
      return request;
    } catch (error) {
      logger.error(`Reject request error: ${error.message}`);
      throw error;
    }
  }

  // Grant immediate access via QR scan
  async grantQRAccess(cardId, requesterId) {
    try {
      const card = await Card.findById(cardId);
      if (!card) {
        throw new Error('Card not found');
      }

      if (card.privacy !== 'private') {
        throw new Error('Card is not private');
      }

      // Create or update access request for QR scan
      let request = await CardAccessRequest.findOne({
        cardId,
        requesterId,
        requestType: 'qr_scan'
      });

      if (!request) {
        request = new CardAccessRequest({
          cardId,
          requesterId,
          ownerId: card.ownerUserId,
          requestType: 'qr_scan',
          status: 'approved',
          requestMessage: 'Access granted via QR code scan'
        });
      } else {
        request.status = 'approved';
        request.requestMessage = 'Access granted via QR code scan';
      }

      await request.save();
      logger.info(`QR access granted for card ${cardId} to user ${requesterId}`);
      return { access: true, request };
    } catch (error) {
      logger.error(`Grant QR access error: ${error.message}`);
      throw error;
    }
  }

  // Clean up expired requests
  async cleanupExpiredRequests() {
    try {
      const result = await CardAccessRequest.deleteMany({
        expiresAt: { $lt: new Date() }
      });

      logger.info(`Cleaned up ${result.deletedCount} expired access requests`);
      return result.deletedCount;
    } catch (error) {
      logger.error(`Cleanup expired requests error: ${error.message}`);
      throw error;
    }
  }

  // Get all access requests (admin)
  async getAllAccessRequests({ page = 1, limit = 20, status, sortBy = 'createdAt', sortOrder = 'desc' }) {
    try {
      const skip = (page - 1) * limit;
      const query = {};

      if (status) {
        query.status = status;
      }

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const requests = await CardAccessRequest.find(query)
        .populate('cardId', 'title fullName email company')
        .populate('requesterId', 'username name email')
        .populate('ownerId', 'username name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);

      const total = await CardAccessRequest.countDocuments(query);

      return {
        requests,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error(`Get all access requests error: ${error.message}`);
      throw error;
    }
  }

  // Approve access request (admin)
  async approveAccessRequest(requestId, { adminId, adminNotes }) {
    try {
      const request = await CardAccessRequest.findById(requestId)
        .populate('cardId', 'title fullName email')
        .populate('requesterId', 'username name email');

      if (!request) {
        throw new Error('Access request not found');
      }

      if (request.status !== 'pending') {
        throw new Error('Request is not pending');
      }

      request.status = 'approved';
      request.adminId = adminId;
      request.adminNotes = adminNotes;
      request.approvedAt = new Date();
      await request.save();

      logger.info(`Access request approved by admin: ${requestId}`);
      return {
        success: true,
        request,
        message: 'Access request approved successfully'
      };
    } catch (error) {
      logger.error(`Approve access request error: ${error.message}`);
      throw error;
    }
  }

  // Reject access request (admin)
  async rejectAccessRequest(requestId, { adminId, adminNotes, reason }) {
    try {
      const request = await CardAccessRequest.findById(requestId)
        .populate('cardId', 'title fullName email')
        .populate('requesterId', 'username name email');

      if (!request) {
        throw new Error('Access request not found');
      }

      if (request.status !== 'pending') {
        throw new Error('Request is not pending');
      }

      request.status = 'rejected';
      request.adminId = adminId;
      request.adminNotes = adminNotes;
      request.rejectionReason = reason;
      request.rejectedAt = new Date();
      await request.save();

      logger.info(`Access request rejected by admin: ${requestId}`);
      return {
        success: true,
        request,
        message: 'Access request rejected successfully'
      };
    } catch (error) {
      logger.error(`Reject access request error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new CardAccessService(); 