import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  FiPlus, FiSearch, FiGrid, FiList, FiTrash2, FiCopy, FiEye, FiEdit, FiShare, FiDownload,
  FiHeart, FiUser, FiMail, FiPhone, FiGlobe, FiMapPin, FiCalendar, FiBarChart
} from 'react-icons/fi';
import { FaHeart, FaShareAlt, FaDownload, FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { fetchUserCards, deleteCard } from '../../features/cards/cardsThunks';
import CardRenderer from '../../components/Cards/CardRenderer';
import toast from 'react-hot-toast';

const CardsPage = () => {
  const dispatch = useDispatch();
  const { cards, isLoading, error } = useSelector((state) => state.cards);
  const { user } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [stats, setStats] = useState({
    totalCards: 0,
    activeCards: 0,
    totalViews: 0,
    totalShares: 0
  });



  useEffect(() => {

    if (user && localStorage.getItem('token')) {
      dispatch(fetchUserCards({ page: 1, limit: 50 }));
    } else {
      // No authenticated session — nothing to load
    }
  }, [dispatch, user]);

  useEffect(() => {

    if (cards.length > 0 || !isLoading) {
      fetchStats();
    }
  }, [cards, isLoading]);

  const fetchStats = async () => {
    try {
      // For demo, just count cards. For more, call analytics endpoint per card or implement /api/cards/stats in backend.
      setStats({
        totalCards: cards.length,
        activeCards: cards.filter(c => c.isActive).length,
        totalViews: cards.reduce((sum, c) => sum + (c.views || 0), 0),
        totalShares: cards.reduce((sum, c) => sum + (c.shares || 0), 0)
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('Are you sure you want to delete this card?')) return;

    try {
      await dispatch(deleteCard(cardId)).unwrap();
      toast.success('Card deleted successfully!');
      fetchStats();
    } catch {
      toast.error('Failed to delete card');
    }
  };

  const copyCardLink = (card) => {
    const link = card?.shortLink
      ? `${window.location.origin}/c/${card.shortLink}`
      : `${window.location.origin}/view/${card._id}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  const filteredCards = cards.filter(card =>
    card.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [
    { id: 'all', name: 'All Cards' },
    { id: 'business', name: 'Business' },
    { id: 'personal', name: 'Personal' },
    { id: 'creative', name: 'Creative' },
    { id: 'minimal', name: 'Minimal' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-slate-400">Loading your cards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 dark:bg-red-900/40 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error loading cards</p>
            <p>{error}</p>
          </div>
          <button 
            onClick={() => dispatch(fetchUserCards({ page: 1, limit: 50 }))}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user || !localStorage.getItem('token')) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-400 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded mb-4">
            <p className="font-bold">Authentication Required</p>
            <p>Please log in to view your cards.</p>
          </div>
          <Link 
            to="/login"
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">My Cards</h1>
              <p className="mt-1 text-gray-600 dark:text-slate-400">Manage your digital business cards</p>
            </div>
            <Link
              to="/cards/add"
              className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <FiPlus className="mr-2" />
              Create New Card
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-slate-700"
          >
            <div className="flex items-center">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                <FiBarChart className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total Cards</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{stats.totalCards}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-slate-700"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-lg">
                <FiEye className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total Views</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{stats.totalViews}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-slate-700"
          >
            <div className="flex items-center">
              <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-lg">
                <FaHeart className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total Loves</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  {cards.reduce((sum, c) => sum + (c.loveCount || 0), 0)}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-slate-700"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-lg">
                <FaShareAlt className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total Shares</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{stats.totalShares}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-slate-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Search cards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-800 dark:text-slate-200"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-800 dark:text-slate-200"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' 
                    : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
                }`}
              >
                <FiGrid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' 
                    : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
                }`}
              >
                <FiList className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Cards Grid/List */}
        {filteredCards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 dark:text-slate-500 mb-4">
              <FiUser className="h-16 w-16 mx-auto text-gray-300 dark:text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">No cards found</h3>
            <p className="text-gray-600 dark:text-slate-400 mb-6">
              {searchQuery ? 'Try adjusting your search terms.' : 'Create your first digital business card to get started.'}
            </p>
            {!searchQuery && (
              <Link
                to="/cards/add"
                className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <FiPlus className="mr-2" />
                Create Your First Card
              </Link>
            )}
          </motion.div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredCards.map((card, index) => (
              <CardItem
                key={card._id}
                card={card}
                index={index}
                viewMode={viewMode}
                onDelete={handleDeleteCard}
                onCopyLink={copyCardLink}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CardItem = ({ card, index, viewMode, onDelete, onCopyLink }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-slate-950 border border-gray-100 dark:border-slate-700">
              <CardRenderer card={card} className="w-full h-full" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{card.title || card.fullName}</h3>
              <p className="text-gray-600 dark:text-slate-400">{card.jobTitle}</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">Created {formatDate(card.createdAt)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link
              to={`/c/${card.shortLink}`}
              className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:bg-emerald-900/40 rounded-lg transition-colors"
            >
              <FiEye className="h-5 w-5" />
            </Link>
            <Link
              to={`/cards/edit/${card._id}`}
              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:bg-green-900/40 rounded-lg transition-colors"
            >
              <FiEdit className="h-5 w-5" />
            </Link>
            <button
              onClick={() => onCopyLink(card)}
              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:bg-green-900/40 rounded-lg transition-colors"
            >
              <FiCopy className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDelete(card._id)}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:bg-red-900/40 rounded-lg transition-colors"
            >
              <FiTrash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-shadow overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-16 h-11 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-950 border border-gray-100 dark:border-slate-700">
            <CardRenderer card={card} className="w-full h-full" />
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-500 dark:text-slate-400">{card.views || 0}</span>
            <FiEye className="h-4 w-4 text-gray-400 dark:text-slate-500" />
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">{card.title || card.fullName}</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{card.jobTitle}</p>
        
        <div className="space-y-2 mb-4">
          {card.email && (
            <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
              <FiMail className="h-4 w-4 mr-2" />
              <span className="truncate">{card.email}</span>
            </div>
          )}
          {card.phone && (
            <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
              <FiPhone className="h-4 w-4 mr-2" />
              <span>{card.phone}</span>
            </div>
          )}
          {card.website && (
            <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
              <FiGlobe className="h-4 w-4 mr-2" />
              <span className="truncate">{card.website}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-slate-400 mb-4">
          <span>Created {formatDate(card.createdAt)}</span>
          <div className="flex items-center space-x-2">
            <span>{card.loveCount || 0}</span>
            <FaHeart className="h-4 w-4 text-red-400" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Link
              to={`/c/${card.shortLink}`}
              className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:bg-emerald-900/40 rounded-lg transition-colors"
            >
              <FiEye className="h-5 w-5" />
            </Link>
            <Link
              to={`/cards/edit/${card._id}`}
              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:bg-green-900/40 rounded-lg transition-colors"
            >
              <FiEdit className="h-5 w-5" />
            </Link>
            <button
              onClick={() => onCopyLink(card)}
              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:bg-green-900/40 rounded-lg transition-colors"
            >
              <FiCopy className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={() => onDelete(card._id)}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:bg-red-900/40 rounded-lg transition-colors"
          >
            <FiTrash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CardsPage;
