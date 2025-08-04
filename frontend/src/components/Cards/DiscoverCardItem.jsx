import React from 'react';
import { motion } from 'framer-motion';
import { IoQrCodeSharp } from "react-icons/io5";
import { FiGrid, FiExternalLink, FiClock, FiEye, FiHeart, FiLock, FiGlobe, FiUsers } from 'react-icons/fi';

/**
 * Component to display a single Discover Card Item
 * @param {object} props - Component props
 * @param {object} props.card - The card data object
 * @param {object} props.cardDesign - The card design object (optional)
 * @param {function} props.onSave - Function to save card to library
 * @param {string} props.viewMode - View mode ('grid' or 'list')
 * @param {boolean} props.showTimeAgo - Whether to show time ago
 * @param {string} props.timeAgo - Time ago string
 */
const DiscoverCardItem = ({ card, cardDesign, onSave, viewMode = 'grid', showTimeAgo = false, timeAgo, isAuthenticated = false }) => {
  // Basic check: If card data is missing, don't render anything for this item
  if (!card) {
    return null;
  }

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col h-full ${
        viewMode === 'list' ? 'flex-row' : ''
      }`}
    >
      {/* Display card image from cardDesign if available */}
      <div className={viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}>
        {cardDesign?.cardImageUrl ? (
           <img
             src={cardDesign.cardImageUrl}
             alt={`${card.title} preview`}
             className={`${viewMode === 'list' ? 'w-full h-full' : 'w-full h-36'} object-cover`}
             onError={(e) => { e.target.style.display = 'none'; }}
           />
        ) : (
          <div className={`${viewMode === 'list' ? 'w-full h-full' : 'w-full h-36'} bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 flex items-center justify-center text-blue-400`}>
               <FiGrid size={40} />
          </div>
        )}
      </div>

      {/* Card content area */}
      <div className={`p-6 flex flex-col flex-grow ${viewMode === 'list' ? 'justify-between' : ''}`}>
        {/* Section for title and metadata */}
        <div className="flex-grow mb-4">
            {/* Privacy Badge */}
            <div className="flex items-center justify-between mb-3">
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                card.privacy === 'public' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-orange-100 text-orange-700'
              }`}>
                {card.privacy === 'public' ? (
                  <>
                    <FiGlobe className="w-3 h-3 mr-1" />
                    Public
                  </>
                ) : (
                  <>
                    <FiLock className="w-3 h-3 mr-1" />
                    Private
                  </>
                )}
              </div>
              
              {/* QR Code Icon for Private Cards */}
              {card.privacy === 'private' && (
                <div className="text-orange-500">
                  <IoQrCodeSharp size={16} />
                </div>
              )}
            </div>

            {/* Card Title */}
            <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate" title={card.title}>
                {card.title || card.fullName || 'Untitled Card'}
            </h3>
            
            {/* Job Title */}
            {card.jobTitle && (
              <p className="text-sm text-gray-600 mb-2">{card.jobTitle}</p>
            )}
            
            {/* Company */}
            {card.company && (
              <p className="text-sm text-gray-500 mb-3">{card.company}</p>
            )}

            {/* Contact Info (masked for privacy) */}
            <div className="space-y-1 mb-3">
              {card.email && (
                <div className="flex items-center text-xs text-gray-500">
                  <span className="mr-2">📧</span>
                  <span className="truncate">
                    {isAuthenticated ? card.email : (
                      card.email.includes('@') ? 
                        card.email.split('@')[0].charAt(0) + '*'.repeat(card.email.split('@')[0].length - 2) + card.email.split('@')[0].charAt(card.email.split('@')[0].length - 1) + '@' + card.email.split('@')[1]
                        : '***@***.com'
                    )}
                  </span>
                </div>
              )}
              
              {card.phone && (
                <div className="flex items-center text-xs text-gray-500">
                  <span className="mr-2">📞</span>
                  <span>
                    {isAuthenticated ? card.phone : `***-***-${card.phone.slice(-4)}`}
                  </span>
                </div>
              )}

              {isAuthenticated && card.website && (
                <div className="flex items-center text-xs text-gray-500">
                  <span className="mr-2">🌐</span>
                  <span className="truncate">{card.website}</span>
                </div>
              )}

              {isAuthenticated && card.address && (
                <div className="flex items-center text-xs text-gray-500">
                  <span className="mr-2">📍</span>
                  <span className="truncate">{card.address}</span>
                </div>
              )}

              {isAuthenticated && card.bio && (
                <div className="text-xs text-gray-500 mt-2">
                  <span className="line-clamp-2">{card.bio}</span>
                </div>
              )}
            </div>

            {/* Stats and Time Ago */}
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
              {card.views && (
                <span className="flex items-center gap-1">
                  <FiEye className="h-3 w-3" />
                  {card.views} views
                </span>
              )}
              {card.loveCount && (
                <span className="flex items-center gap-1">
                  <FiHeart className="h-3 w-3" />
                  {card.loveCount} loves
                </span>
              )}
              {showTimeAgo && timeAgo && (
                <span className="flex items-center gap-1">
                  <FiClock className="h-3 w-3" />
                  {timeAgo}
                </span>
              )}
            </div>

            {/* Short Link display */}
            <p className="text-xs text-gray-500 mb-3">
                Short Link: <span className="font-medium text-gray-700">{card.shortLink}</span>
            </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* View Card Button */}
          <a
            href={`/c/${card.shortLink}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium py-3 px-4 rounded-lg text-center transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            View Card <FiExternalLink />
          </a>
          
          {/* QR Code Button for Private Cards */}
          {card.privacy === 'private' && (
            <button
              className="px-4 py-3 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors flex items-center justify-center"
              title="Private card - QR code access only"
            >
              <IoQrCodeSharp size={16} />
            </button>
          )}
        </div>

        {/* Privacy Notice for Private Cards */}
        {card.privacy === 'private' && (
          <div className="mt-3 p-2 bg-orange-50 rounded-lg">
            <p className="text-xs text-orange-700 flex items-center">
              <FiLock className="w-3 h-3 mr-1" />
              Private card - only accessible via QR code
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DiscoverCardItem;