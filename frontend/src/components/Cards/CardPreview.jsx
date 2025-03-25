import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEye, FaHeart } from 'react-icons/fa';
import TemplateCardRenderer from '../TemplateCardRenderer';

const CardPreview = ({ card, template, className = "", showActions = true }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (card) {
      setIsLoading(false);
    }
  }, [card]);

  // Helper function to get card data with fallbacks
  const getCardData = (card) => {
    if (!card) return null;
    
    return {
      fullName: card.fullName || card.title || card.ownerUserId?.name || 'Your Name',
      jobTitle: card.jobTitle || card.ownerUserId?.jobTitle || 'Job Title',
      company: card.company || card.ownerUserId?.company || 'Company',
      email: card.email || card.ownerUserId?.email || 'email@example.com',
      phone: card.phone || card.ownerUserId?.phone || '+(977) 9xxxxxxxxx',
      website: card.website || card.ownerUserId?.website || 'www.example.com',
      address: card.address || card.ownerUserId?.location || 'Address',
      bio: card.bio || card.ownerUserId?.bio || 'Bio description',
      views: card.views || 0,
      loveCount: card.loveCount || 0
    };
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-neutral-100 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
          <div className="text-sm text-neutral-500">Loading card...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-neutral-100 rounded-lg ${className}`}>
        <div className="text-center text-neutral-500">
          <div className="text-lg font-semibold mb-2">Error</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className={`flex items-center justify-center bg-neutral-100 rounded-lg ${className}`}>
        <div className="text-center text-neutral-500">
          <div className="text-lg font-semibold mb-2">No Card Data</div>
          <div className="text-sm">Card information not available</div>
        </div>
      </div>
    );
  }

  const cardData = getCardData(card);

  // If we have a template, use TemplateCardRenderer
  if (template && (template.design || template.preview)) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`relative w-full h-full overflow-hidden rounded-lg ${className}`}
      >
        <TemplateCardRenderer
          card={cardData}
          template={template}
          className="w-full h-full"
        />
      </motion.div>
    );
  }

  // Fallback design when no template is available
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`relative w-full h-full overflow-hidden rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600 ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-secondary-600"></div>
      
      {/* Card Content */}
      <div className="relative z-10 p-6 text-white h-full flex flex-col justify-center">
        <div className="text-center">
          {/* Avatar/Initials */}
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">
              {cardData.fullName ? cardData.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
            </span>
          </div>
          
          {/* Name */}
          <h3 className="text-xl font-bold mb-2">
            {cardData.fullName}
          </h3>
          
          {/* Job Title */}
          {cardData.jobTitle && (
            <p className="text-white/90 text-sm mb-1">
              {cardData.jobTitle}
            </p>
          )}
          
          {/* Company */}
          {cardData.company && (
            <p className="text-white/80 text-sm mb-3">
              {cardData.company}
            </p>
          )}
          
          {/* Contact Info */}
          <div className="space-y-1 text-xs text-white/70">
            {cardData.email && (
              <p>{cardData.email}</p>
            )}
            {cardData.phone && (
              <p>{cardData.phone}</p>
            )}
            {cardData.website && (
              <p>{cardData.website}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Card Stats */}
      {showActions && (
        <div className="absolute bottom-2 right-2 text-xs text-white/80">
          <div className="flex items-center space-x-2">
            <FaEye className="h-3 w-3" />
            <span>{cardData.views}</span>
            <FaHeart className="h-3 w-3" />
            <span>{cardData.loveCount}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CardPreview; 