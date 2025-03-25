import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchUserCards } from '../../features/cards/cardsThunks';
import { 
  FiPlus, FiEye, FiEdit, FiTrash2, FiShare, 
  FiTrendingUp, FiUsers, FiHeart, FiDownload,
  FiBarChart, FiSettings, FiUser, FiCreditCard,
  FiGrid, FiList, FiSearch, FiFilter
} from 'react-icons/fi';
import { FaQrcode, FaEye, FaHeart, FaShare, FaDownload } from 'react-icons/fa';
import { motion } from 'framer-motion';
import CardPreview from '../../components/Cards/CardPreview';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cards, isLoading, error } = useSelector((state) => state.cards);
  
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    totalCards: 0,
    totalViews: 0,
    totalLoves: 0,
    totalShares: 0,
    totalDownloads: 0
  });

  useEffect(() => {
    // Fetch user's cards when component mounts
    if (isAuthenticated) {
      dispatch(fetchUserCards({ page: 1, limit: 50 }));
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    // Calculate stats from cards
    if (cards && cards.length > 0) {
      const totalViews = cards.reduce((sum, card) => sum + (card.views || 0), 0);
      const totalLoves = cards.reduce((sum, card) => sum + (card.loveCount || 0), 0);
      const totalShares = cards.reduce((sum, card) => sum + (card.shares || 0), 0);
      const totalDownloads = cards.reduce((sum, card) => sum + (card.downloads || 0), 0);
      
      setStats({
        totalCards: cards.length,
        totalViews,
        totalLoves,
        totalShares,
        totalDownloads
      });
    }
  }, [cards]);

  const filteredCards = cards?.filter(card => {
    const matchesSearch = card.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'public' && card.isPublic) ||
      (filterStatus === 'private' && !card.isPublic);
    
    return matchesSearch && matchesFilter;
  }) || [];

  const handleDeleteCard = async (cardId) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      // Implement delete functionality
      console.log('Delete card:', cardId);
    }
  };

  const handleShareCard = (card) => {
    const shareUrl = `${window.location.origin}/c/${card.shortLink}`;
    if (navigator.share) {
      navigator.share({
        title: card.title,
        text: 'Check out my digital business card!',
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || user?.username || 'User'}!
          </h1>
          <p className="text-gray-600">
            Manage your digital business cards and track their performance
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg">
            <h3 className="text-red-800 font-semibold mb-2">Error:</h3>
            <p className="text-red-700">{error}</p>
            <div className="mt-2 text-sm text-red-600">
              <p>Auth State: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
              <p>Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
              <p>User: {user ? 'Present' : 'Missing'}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiCreditCard className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Cards</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCards}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FiEye className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <FiHeart className="text-red-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Loves</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLoves}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiShare className="text-purple-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Shares</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalShares}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FiDownload className="text-orange-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Downloads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDownloads}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              to="/cards/add"
              className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiPlus className="mr-2" />
              Create New Card
            </Link>
            <Link
              to="/discover"
              className="flex items-center justify-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiEye className="mr-2" />
              Discover Cards
            </Link>
            <Link
              to="/search"
              className="flex items-center justify-center p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FiSearch className="mr-2" />
              Search Cards
            </Link>
            <Link
              to="/library"
              className="flex items-center justify-center p-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <FiUser className="mr-2" />
              My Library
            </Link>
          </div>
        </div>

        {/* Cards Management */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">
                My Cards ({filteredCards.length})
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search cards..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Cards</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>

                {/* View Mode */}
                <div className="flex border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                  >
                    <FiGrid />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                  >
                    <FiList />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cards Grid/List */}
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your cards...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="p-8 text-center">
              <FiCreditCard className="text-6xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No cards found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Create your first digital business card to get started'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Link
                  to="/cards/add"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiPlus className="mr-2" />
                  Create Your First Card
                </Link>
              )}
            </div>
          ) : (
            <div className="p-6">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCards.map((card) => (
                    <motion.div
                      key={card._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                      {/* Card Preview */}
                      <div className="h-48 overflow-hidden rounded-t-lg">
                        <CardPreview 
                          card={card} 
                          template={card.templateId ? { id: card.templateId } : null}
                          className="h-full"
                          showActions={false}
                        />
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {card.title}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            card.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {card.isPublic ? 'Public' : 'Private'}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <FiEye className="mr-2" />
                            {card.views || 0} views
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <FiHeart className="mr-2" />
                            {card.loveCount || 0} loves
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <FaQrcode className="mr-2" />
                            {card.shortLink}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Link
                            to={`/c/${card.shortLink}`}
                            className="flex-1 bg-blue-600 text-white text-sm py-2 px-3 rounded hover:bg-blue-700 transition-colors text-center"
                          >
                            <FiEye className="mr-1" />
                            View
                          </Link>
                          <button
                            onClick={() => handleShareCard(card)}
                            className="bg-gray-100 text-gray-700 p-2 rounded hover:bg-gray-200 transition-colors"
                          >
                            <FiShare />
                          </button>
                          <Link
                            to={`/cards/${card._id}/edit`}
                            className="bg-gray-100 text-gray-700 p-2 rounded hover:bg-gray-200 transition-colors"
                          >
                            <FiEdit />
                          </Link>
                          <button
                            onClick={() => handleDeleteCard(card._id)}
                            className="bg-red-100 text-red-700 p-2 rounded hover:bg-red-200 transition-colors"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCards.map((card) => (
                    <motion.div
                      key={card._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FiCreditCard className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{card.title}</h3>
                          <p className="text-sm text-gray-600">{card.shortLink}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <FiEye className="mr-1" />
                            {card.views || 0}
                          </span>
                          <span className="flex items-center">
                            <FiHeart className="mr-1" />
                            {card.loveCount || 0}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            card.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {card.isPublic ? 'Public' : 'Private'}
                          </span>
                        </div>

                        <div className="flex space-x-2">
                          <Link
                            to={`/c/${card.shortLink}`}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleShareCard(card)}
                            className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300 transition-colors"
                          >
                            Share
                          </button>
                          <Link
                            to={`/cards/edit/${card._id}`}
                            className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300 transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteCard(card._id)}
                            className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;