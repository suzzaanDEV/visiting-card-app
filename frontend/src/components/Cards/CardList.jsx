import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiHeart, FiShare, FiDownload, FiEye, FiUser, FiBriefcase,
  FiMail, FiPhone, FiGlobe, FiMapPin
} from 'react-icons/fi';
import { FaHeart, FaShareAlt, FaDownload, FaEye, FaQrcode } from 'react-icons/fa';

const CardList = ({ cards, onLove, onShare, onDownload, lovedCards = [] }) => {

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const handleLove = async (cardId, e) => {
    e.preventDefault();
    e.stopPropagation();
    await onLove(cardId);
  };

  const handleShare = async (card, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${card.fullName} - ${card.jobTitle}`,
          text: `Check out ${card.fullName}'s digital business card`,
          url: `${window.location.origin}/c/${card.shortLink}`
        });
      } catch {
        // Share cancelled by user
      }
    } else {
      await onShare(card.shortLink);
    }
  };

  const handleDownload = async (card, e) => {
    e.preventDefault();
    e.stopPropagation();
    await onDownload(card._id);
  };

  if (!cards || cards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 dark:from-slate-950 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUser className="h-12 w-12 text-gray-400 dark:text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">No Cards Found</h3>
          <p className="text-gray-600 dark:text-slate-400">Create your first digital business card to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-green-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Digital Business Cards
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-400">
            Discover beautiful digital business cards from professionals around the world
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {cards.map((card, index) => {
              const isLoved = lovedCards.includes(card._id);
              
              return (
                <motion.div
                  key={card._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <Link to={`/c/${card.shortLink}`}>
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-slate-700 hover:shadow-2xl transition-all duration-300">
                      {/* Card Preview */}
                      <div className="relative h-48 overflow-hidden">
                        {card.cardImage ? (
                          <img
                            src={card.cardImage}
                            alt={card.fullName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div 
                            className="w-full h-full flex items-center justify-center text-4xl font-bold text-white"
                            style={{
                              background: `linear-gradient(135deg, ${card.backgroundColor || '#10B981'} 0%, ${card.backgroundColor || '#22C55E'} 100%)`
                            }}
                          >
                            {getInitials(card.fullName)}
                          </div>
                        )}
                        
                        {/* Overlay with card info */}
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-4">
                          <div className="text-white">
                            <h3 className="text-lg font-bold mb-1">{card.fullName}</h3>
                            {card.jobTitle && (
                              <p className="text-sm opacity-90">{card.jobTitle}</p>
                            )}
                            {card.company && (
                              <p className="text-xs opacity-75">{card.company}</p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute top-3 right-3 flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handleLove(card._id, e)}
                            className={`p-2 rounded-full shadow-lg transition-colors ${
                              isLoved 
                                ? 'bg-red-600 text-white' 
                                : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/40'
                            }`}
                          >
                            <FaHeart className={`h-4 w-4 ${isLoved ? 'text-white' : 'text-red-500'}`} />
                          </motion.button>
                        </div>

                        {/* Stats Badge */}
                        <div className="absolute top-3 left-3 bg-white dark:bg-slate-800 bg-opacity-90 rounded-full px-3 py-1">
                          <div className="flex items-center space-x-2 text-xs">
                            <FaEye className="h-3 w-3 text-emerald-600" />
                            <span className="font-medium">{card.views || 0}</span>
                            <FaHeart className="h-3 w-3 text-red-600" />
                            <span className="font-medium">{card.loveCount || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Details */}
                      <div className="p-4">
                        <div className="space-y-3">
                          {/* Contact Info */}
                          {card.email && (
                            <div className="flex items-center text-sm">
                              <FiMail className="h-4 w-4 mr-2 text-gray-500 dark:text-slate-400" />
                              <span className="text-gray-700 dark:text-slate-300 truncate">{card.email}</span>
                            </div>
                          )}

                          {card.phone && (
                            <div className="flex items-center text-sm">
                              <FiPhone className="h-4 w-4 mr-2 text-gray-500 dark:text-slate-400" />
                              <span className="text-gray-700 dark:text-slate-300">{formatPhone(card.phone)}</span>
                            </div>
                          )}

                          {card.website && (
                            <div className="flex items-center text-sm">
                              <FiGlobe className="h-4 w-4 mr-2 text-gray-500 dark:text-slate-400" />
                              <span className="text-gray-700 dark:text-slate-300 truncate">{card.website}</span>
                            </div>
                          )}

                          {card.address && (
                            <div className="flex items-center text-sm">
                              <FiMapPin className="h-4 w-4 mr-2 text-gray-500 dark:text-slate-400" />
                              <span className="text-gray-700 dark:text-slate-300 truncate">{card.address}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                          <div className="flex space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => handleShare(card, e)}
                              className="p-2 text-gray-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                              title="Share"
                            >
                              <FaShareAlt className="h-4 w-4" />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => handleDownload(card, e)}
                              className="p-2 text-gray-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                              title="Download"
                            >
                              <FaDownload className="h-4 w-4" />
                            </motion.button>
                          </div>

                          <div className="flex items-center text-xs text-gray-500 dark:text-slate-400">
                            <FaQrcode className="h-3 w-3 mr-1" />
                            <span>QR Code</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Load More Button */}
        {cards.length >= 20 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-12"
          >
            <button className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-full font-semibold hover:from-emerald-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl">
              Load More Cards
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CardList; 