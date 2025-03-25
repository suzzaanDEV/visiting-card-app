import React from 'react';
import { IoQrCodeSharp } from "react-icons/io5";
import { FiGrid, FiExternalLink, FiClock, FiEye, FiHeart } from 'react-icons/fi';

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
const DiscoverCardItem = ({ card, cardDesign, onSave, viewMode = 'grid', showTimeAgo = false, timeAgo }) => {
  // Basic check: If card data is missing, don't render anything for this item
  if (!card) {
    return null;
  }

  return (
    // Card container with styling for appearance and hover effects
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-shadow duration-300 hover:shadow-lg flex flex-col h-full ${
      viewMode === 'list' ? 'flex-row' : ''
    }`}>
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
          <div className={`${viewMode === 'list' ? 'w-full h-full' : 'w-full h-36'} bg-gradient-to-br from-indigo-100 to-purple-200 flex items-center justify-center text-indigo-400`}>
               <FiGrid size={40} />
          </div>
        )}
      </div>

      {/* Card content area */}
      <div className={`p-5 flex flex-col flex-grow ${viewMode === 'list' ? 'justify-between' : ''}`}>
        {/* Section for title and metadata */}
        <div className="flex-grow mb-4">
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
              <p className="text-sm text-gray-500 mb-2">{card.company}</p>
            )}

            {/* Stats and Time Ago */}
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
              {card.viewCount && (
                <span className="flex items-center gap-1">
                  <FiEye className="h-3 w-3" />
                  {card.viewCount} views
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
            className="flex-1 bg-[#1a3a63] hover:bg-[#132a4a] text-white text-sm font-medium py-2.5 px-4 rounded-lg text-center transition duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            View Card <FiExternalLink />
          </a>
          
          {/* Save to Library Button */}
          {onSave && (
            <button
              onClick={() => onSave(card._id)}
              disabled={card.isSaved}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                card.isSaved
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {card.isSaved ? 'Saved' : 'Save'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscoverCardItem;