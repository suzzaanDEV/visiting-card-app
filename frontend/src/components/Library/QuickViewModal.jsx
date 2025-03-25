import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiEye, FiMail, FiPhone, FiGlobe, FiMapPin, FiUser, FiBriefcase } from 'react-icons/fi';
import CardPreview from '../Cards/CardPreview';

const QuickViewModal = ({ card, isOpen, onClose, onViewFull }) => {
  if (!card || !isOpen) return null;

  // Helper function to get card data with fallbacks
  const getCardData = (card) => {
    if (!card) return null;

    return {
      fullName: card.fullName || card.ownerUserId?.name || 'Your Name',
      jobTitle: card.jobTitle || card.ownerUserId?.jobTitle || 'Job Title',
      company: card.company || card.ownerUserId?.company || 'Company',
      email: card.email || card.ownerUserId?.email || 'email@example.com',
      phone: card.phone || card.ownerUserId?.phone || '+(977) 9xxxxxxxxx',
      website: card.website || card.ownerUserId?.website || 'www.example.com',
      address: card.address || card.ownerUserId?.location || 'Address',
      bio: card.bio || card.ownerUserId?.bio || 'Bio description'
    };
  };

  const cardData = getCardData(card);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiEye className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Quick View</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card Preview */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Card Preview</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="aspect-[3/4] rounded-lg overflow-hidden">
                    <CardPreview
                      card={card}
                      template={{ id: card.templateId }}
                      className="w-full h-full"
                      showActions={false}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FiUser className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="text-sm font-medium text-gray-900">{cardData.fullName}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <FiBriefcase className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500">Job Title</p>
                      <p className="text-sm font-medium text-gray-900">{cardData.jobTitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <FiBriefcase className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500">Company</p>
                      <p className="text-sm font-medium text-gray-900">{cardData.company}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <FiMail className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{cardData.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <FiPhone className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{cardData.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <FiGlobe className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500">Website</p>
                      <p className="text-sm font-medium text-gray-900">{cardData.website}</p>
                    </div>
                  </div>

                  {cardData.address && (
                    <div className="flex items-center">
                      <FiMapPin className="h-4 w-4 text-gray-400 mr-3" />
                      <div>
                        <p className="text-xs text-gray-500">Address</p>
                        <p className="text-sm font-medium text-gray-900">{cardData.address}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={onViewFull}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    View Full Details
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuickViewModal; 