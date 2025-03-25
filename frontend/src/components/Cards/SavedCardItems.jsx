import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaHeart, FaRegHeart, FaShareAlt, FaDownload, FaEye, FaBookmark, FaRegBookmark,
  FaUser, FaEnvelope, FaPhone, FaGlobe, FaMapMarkerAlt, FaCalendar
} from 'react-icons/fa';
import { FiAlertCircle, FiBookmark, FiInbox, FiLoader, FiExternalLink, FiGrid } from "react-icons/fi";
import { fetchSavedCards } from "../../features/library/libraryThunks"; // Thunk to fetch saved items

// --- Icons ---
import { IoQrCode } from "react-icons/io5";


const SavedCardItem = ({ item }) => {
  // Destructure card and cardDesign from the library item.
  // Adjust this based on the actual structure of your library items.
  // Assuming the library item directly contains the card and cardDesign objects.
  const { card, cardDesign } = item;

  // Basic check: If card data is missing within the item, don't render
  if (!card) {
    console.warn("SavedCardItem missing card data in item:", item);
    return null;
  }

  return (
    // Card container styling
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-shadow duration-300 hover:shadow-lg flex flex-col h-full">
      {/* Display card image if available */}
      {cardDesign?.cardImageUrl ? (
         <img
           src={cardDesign.cardImageUrl}
           alt={`${card.title} preview`}
           className="w-full h-36 object-cover"
           onError={(e) => { e.target.style.display = 'none'; }} // Hide on error
         />
      ) : (
        // Fallback placeholder if no image
        <div className="w-full h-36 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
             <FiBookmark size={40} /> {/* Library icon as placeholder */}
        </div>
      )}

      {/* Card content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex-grow mb-4">
            {/* Card Title */}
            <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate" title={card.title}>
                {card.title || 'Untitled Card'}
            </h3>
            {/* Short Link */}
            <p className="text-xs text-gray-500 mb-3">
                Short Link: <span className="font-medium text-gray-700">{card.shortLink}</span>
            </p>
             {/* Display QR Code if available */}
             {card.qrCode ? (
                <div className="mt-3 text-center group">
                    <img
                        src={card.qrCode}
                        alt={`${card.title} QR Code`}
                        className="w-28 h-28 mx-auto border-2 border-gray-300 rounded-md p-1 transition-transform duration-200 group-hover:scale-105"
                        onError={(e) => { e.target.src = 'https://placehold.co/112x112/e2e8f0/94a3b8?text=QR+Error'; }} // Placeholder on error
                    />
                    <p className="text-xs text-gray-500 mt-2">Scan QR Code</p>
                </div>
            ) : (
                 // Placeholder if no QR code
                <div className="mt-3 py-6 text-center text-gray-400 flex flex-col items-center bg-gray-50 rounded-md">
                    <IoQrCode size={36} className="mb-2 opacity-60"/>
                    <p className="text-xs">No QR Code Available</p>
                </div>
            )}
        </div>

        {/* Action Button: Link to view the card */}
        <a
            href={`/c/${card.shortLink}`} // Adjust link based on your routing
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto bg-[#1a3a63] hover:bg-[#132a4a] text-white text-sm font-medium py-2.5 px-4 rounded-lg w-full text-center transition duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
        >
            View Card <FiExternalLink />
        </a>
      </div>
    </div>
  );
};


export default SavedCardItem;
