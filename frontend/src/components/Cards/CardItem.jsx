
import React, { useEffect, useState } from 'react'; // Added useState
import { FiAlertCircle, FiLoader, FiPlusCircle, FiLogIn, FiExternalLink, FiBookmark, FiImage } from 'react-icons/fi'; // Added FiBookmark, FiImage
import { FaQrcode } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchUserCards } from '../../features/cards/cardsThunks';
import { clearCardError } from '../../features/cards/cardsSlice';
// Removed unused import: FiGrid

// --- SavedCardItem Component Definition (from user prompt) ---
// Displays a single card from the user's collection ("My Cards")
const CardItem = ({ item }) => {
  // Destructure card and cardDesign from the library item.
  // Assuming the item structure from fetchUserCards is { card: {...}, cardDesign: {...} }
  const { card, cardDesign } = item;

  // Basic check: If card data is missing within the item, don't render
  if (!card) {
    console.warn("SavedCardItem missing card data in item:", item);
    return null;
  }

  const cardTitle = card.title || 'Untitled Card';
  const cardImageUrl = cardDesign?.cardImageUrl;
  const cardShortLink = card.shortLink;
  const cardQrCode = card.qrCode; // Get QR code URL

  // Construct the link URL if shortLink exists
  const linkUrl = cardShortLink ? `/c/${cardShortLink}` : '#';

  return (
    // Card container styling
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-shadow duration-300 hover:shadow-lg flex flex-col h-full">
      {/* Display card image if available */}
      {cardImageUrl ? (
         <Link to={linkUrl} title={`View card: ${cardTitle}`}> {/* Link the image */}
             <img
               src={cardImageUrl}
               alt={`${cardTitle} preview`}
               className="w-full h-36 object-cover"
               onError={(e) => { e.target.style.display = 'none'; }} // Hide on error
               loading="lazy"
             />
         </Link>
      ) : (
        // Fallback placeholder if no image
        <Link to={linkUrl} title={`View card: ${cardTitle}`} className="w-full h-36 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
             <FiImage size={40} /> {/* Use FiImage as placeholder */}
        </Link>
      )}

      {/* Card content */}
      <div className="p-4 flex flex-col flex-grow"> {/* Reduced padding slightly */}
        <div className="flex-grow mb-3">
            {/* Card Title */}
            <h3 className="text-md font-semibold text-gray-800 mb-1 truncate" title={cardTitle}>
                {cardTitle}
            </h3>
            {/* Short Link */}
            {cardShortLink && ( // Only show if shortlink exists
                <p className="text-xs text-gray-500 mb-2">
                    Short Link: <span className="font-medium text-gray-700">{cardShortLink}</span>
                </p>
            )}
             {/* Display QR Code if available - Smaller version */}
             {cardQrCode ? (
                <div className="mt-2 text-center group">
                    <img
                        src={cardQrCode}
                        alt={`${cardTitle} QR Code`}
                        // Smaller QR code for list view
                        className="w-20 h-20 mx-auto border border-gray-200 rounded p-0.5 transition-transform duration-200 group-hover:scale-105 bg-white"
                        onError={(e) => { e.target.src = 'https://placehold.co/80x80/e2e8f0/94a3b8?text=QR+Err'; }}
                    />
                    {/* <p className="text-xs text-gray-500 mt-1">Scan QR</p> */}
                </div>
            ) : (
                 // Placeholder if no QR code
                <div className="mt-2 py-4 text-center text-gray-400 flex flex-col items-center bg-gray-50 rounded text-xs">
                    <FaQrcode size={24} className="mb-1 opacity-60"/>
                    <span>No QR Code</span>
                </div>
            )}
        </div>

        {/* Action Button: Link to view the card */}
        <Link
            to={linkUrl}
            // Prevent navigation if linkUrl is '#'
            onClick={(e) => { if (linkUrl === '#') e.preventDefault(); }}
            className={`mt-auto bg-[#1a3a63] hover:bg-[#132a4a] text-white text-sm font-medium py-2 px-4 rounded-lg w-full text-center transition duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md ${linkUrl === '#' ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={linkUrl === '#' ? 'Short link missing' : 'View Card'}
        >
            View Card <FiExternalLink />
        </Link>
      </div>
    </div>
  );
};

export default CardItem;