import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch, FiGrid, FiList, FiTrash2, FiCopy, FiEye, FiEdit, FiShare, FiDownload, FiHeart, FiUser, FiMail, FiPhone, FiGlobe, FiMapPin, FiCalendar, FiBarChart } from 'react-icons/fi';
import { FaHeart, FaShareAlt, FaDownload, FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { fetchSavedCards } from "../../features/library/libraryThunks";
import { fetchUserCards, deleteCard } from '../../features/cards/cardsThunks';
import toast from 'react-hot-toast';

// --- Redux Actions and Thunks ---
import { clearLibraryError } from "../../features/library/librarySlice";

// --- Components ---
import KonvaRenderer from '../../components/KonvaRenderer';

// --- Icons ---
import {
    FiAlertCircle, FiInbox, FiLoader, FiExternalLink,
    FiTrash2, FiImage, FiEye, FiDownload, FiShare, FiHeart,
    FiGrid, FiList, FiSearch, FiFilter, FiRefreshCw
} from "react-icons/fi";
import { FaQrcode, FaRegHeart, FaHeart, FaRegBookmark, FaBookmark as FaBookmarkSolid } from 'react-icons/fa';

// --- Placeholder Image URL Generator ---
const getPlaceholderUrl = (width, height, text = "No Preview", bgColor = "e2e8f0", txtColor = "94a3b8") => {
    return `https://placehold.co/${width}x${height}/${bgColor}/${txtColor}?text=${encodeURIComponent(text)}`;
}

// --- SavedCardItem Component ---
const SavedCardItem = ({ item, index }) => {
    const dispatch = useDispatch();
    const [isRemoving, setIsRemoving] = useState(false);
    const [isLoved, setIsLoved] = useState(false);
    const [isSaved, setIsSaved] = useState(true);

    // Extract necessary details from the item prop
    const cardId = item.cardId?._id || item.card?._id || item._id;
    const cardTitle = item.cardId?.title || item.card?.title || 'Untitled Card';
    const cardShortLink = item.cardId?.shortLink || item.card?.shortLink;
    const designJson = item.cardId?.cardDesign?.designJson || item.card?.cardDesign?.designJson;
    const cardImageUrl = item.cardId?.cardDesign?.cardImageUrl || item.card?.cardDesign?.cardImageUrl;
    const views = item.cardId?.views || item.card?.views || 0;
    const loveCount = item.cardId?.loveCount || item.card?.loveCount || 0;

    // Handle Remove Button Click
    const handleRemove = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!cardId) {
            console.error("Cannot remove: Card ID is missing from library item.", item);
            alert("Error: Could not identify the card to remove.");
            return;
        }
        if (!window.confirm(`Are you sure you want to remove "${cardTitle}" from your library?`)) {
            return;
        }

        setIsRemoving(true);
        console.log(`Attempting to remove card ${cardId} from library...`);
        try {
            await new Promise(resolve => setTimeout(resolve, 700));
            console.log(`Card ${cardId} removed from library (simulated).`);
        } catch (err) {
            console.error("Error removing from library:", err);
            alert(`Failed to remove card: ${err?.message || 'Unknown error'}`);
            setIsRemoving(false);
        }
    };

    const handleLove = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const response = await fetch(`/api/cards/${cardId}/love`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                setIsLoved(!isLoved);
            }
        } catch (error) {
            console.error('Error toggling love:', error);
        }
    };

    const handleShare = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const shareUrl = `${window.location.origin}/view/${cardId}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: cardTitle,
                    text: 'Check out this digital business card!',
                    url: shareUrl
                });
            } catch (error) {
                console.log('Share cancelled');
            }
        } else {
            await navigator.clipboard.writeText(shareUrl);
            alert('Link copied to clipboard!');
        }
    };

    const linkUrl = cardShortLink ? `/c/${cardShortLink}` : `/view/${cardId}`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="group"
        >
            <Link
                to={linkUrl}
                className="block bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                title={`View card: ${cardTitle}`}
            >
                {/* Card Image/Preview */}
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                    {cardImageUrl ? (
                        <img
                            src={cardImageUrl}
                            alt={cardTitle}
                            className="w-full h-full object-cover"
                        />
                    ) : designJson ? (
                        <div className="w-full h-full flex items-center justify-center p-2">
                            <div className="transform scale-75">
                                <KonvaRenderer jsonString={designJson} />
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <FiImage className="text-white text-4xl" />
                        </div>
                    )}
                    
                    {/* Overlay with action buttons */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute top-3 right-3 flex space-x-2">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleLove}
                                className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                            >
                                {isLoved ? (
                                    <FaHeart className="text-red-500 text-sm" />
                                ) : (
                                    <FaRegHeart className="text-white text-sm" />
                                )}
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleShare}
                                className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                            >
                                <FiShare className="text-white text-sm" />
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors">
                        {cardTitle}
                    </h3>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                                <FiEye className="mr-1" />
                                {views}
                            </span>
                            <span className="flex items-center">
                                <FiHeart className="mr-1" />
                                {loveCount}
                            </span>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            Saved
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleRemove}
                            disabled={isRemoving}
                            className="flex items-center text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                            {isRemoving ? (
                                <FiLoader className="animate-spin mr-1" />
                            ) : (
                                <FiTrash2 className="mr-1" />
                            )}
                            {isRemoving ? 'Removing...' : 'Remove'}
                        </motion.button>
                        
                        <div className="flex items-center space-x-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                <FiEye className="mr-1" />
                                View
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center text-green-600 hover:text-green-700 text-sm font-medium"
                            >
                                <FiDownload className="mr-1" />
                                Download
                            </motion.button>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

// --- CardList Component ---
const CardList = () => {
    const dispatch = useDispatch();
    const { items: savedCards, isLoading, error } = useSelector((state) => state.library);
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch library items on mount
    useEffect(() => {
        dispatch(fetchSavedCards());
        return () => {
            dispatch(clearLibraryError());
        };
    }, [dispatch]);

    // Ensure savedCards is always an array
    const cardsArray = Array.isArray(savedCards) ? savedCards : [];
    
    const filteredCards = cardsArray.filter(card => {
        const title = card.cardId?.title || card.card?.title || '';
        return title.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Library</h1>
                            <p className="text-gray-600">Your saved digital business cards</p>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                            <Link
                                to="/discover"
                                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Discover More
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search and Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-lg p-6 mb-8"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search your library..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-colors ${
                                    viewMode === 'grid' 
                                        ? 'bg-blue-100 text-blue-600' 
                                        : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                <FiGrid className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors ${
                                    viewMode === 'list' 
                                        ? 'bg-blue-100 text-blue-600' 
                                        : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                <FiList className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Loading State */}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col justify-center items-center py-20"
                    >
                        <FiLoader className="animate-spin h-12 w-12 mb-4 text-blue-600" />
                        <span className="text-lg text-gray-600">Loading your library...</span>
                    </motion.div>
                )}

                {/* Error State */}
                {!isLoading && error && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-16 bg-red-50 rounded-2xl border border-red-200"
                    >
                        <FiAlertCircle className="h-16 w-16 mb-4 text-red-500" />
                        <p className="text-xl font-semibold mb-2 text-red-900">Failed to load library</p>
                        <p className="text-sm text-center mb-5 text-red-700">{error}</p>
                        <button
                            onClick={() => dispatch(fetchSavedCards())}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            Retry Loading
                        </button>
                    </motion.div>
                )}

                {/* Success State */}
                {!isLoading && !error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={viewMode === 'grid' 
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                            : "space-y-4"
                        }
                    >
                        {filteredCards.map((item, index) => (
                            <SavedCardItem key={item._id || item.cardId?._id || item.card?._id} item={item} index={index} />
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default CardList;
