import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiEye, FiEyeOff, FiLock, FiGlobe, FiUsers, FiTrendingUp, FiShield, FiGrid, FiLogIn } from 'react-icons/fi';
import { fetchPublicCards } from '../../features/cards/cardsThunks';
import DiscoverCardItem from '../../components/Cards/DiscoverCardItem';
import toast from 'react-hot-toast';

const DiscoverCards = () => {
  const dispatch = useDispatch();
  const { cards, pagination, isLoading, error } = useSelector((state) => state.cards);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(!isAuthenticated);
  const [viewMode, setViewMode] = useState('grid');
  const [privacyFilter, setPrivacyFilter] = useState('all'); // 'all', 'public', 'private'

  const categories = [
    'Software Engineer',
    'Designer',
    'Manager',
    'Consultant',
    'Entrepreneur',
    'Developer',
    'Analyst',
    'Specialist',
    'Architect',
    'Chef',
    'Lawyer',
    'HR Specialist'
  ];

  useEffect(() => {
    loadCards();
  }, [currentPage, searchTerm, selectedCategory, privacyFilter]);

  const loadCards = async () => {
    try {
      await dispatch(fetchPublicCards({
        page: currentPage,
        limit: 12,
        search: searchTerm,
        category: selectedCategory,
        privacy: privacyFilter
      })).unwrap();
    } catch (error) {
      toast.error('Failed to load cards');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCards();
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    setCurrentPage(1);
  };

  const handlePrivacyFilterChange = (filter) => {
    setPrivacyFilter(filter);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Filter cards based on authentication and privacy settings
  const getFilteredCards = () => {
    if (!cards) return [];

    let filtered = [...cards];

    // If not authenticated, only show public cards
    if (!isAuthenticated) {
      filtered = filtered.filter(card => card.privacy === 'public');
    }

    // Apply privacy filter
    if (privacyFilter !== 'all') {
      filtered = filtered.filter(card => card.privacy === privacyFilter);
    }

    return filtered;
  };

  const filteredCards = getFilteredCards();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-4">Discover Amazing Cards</h1>
            <p className="text-xl opacity-90 mb-8">Explore digital business cards from professionals around Nepal</p>
            
            {/* Authentication Status */}
            <div className="mb-8">
              {isAuthenticated ? (
                <div className="inline-flex items-center px-4 py-2 bg-green-500 bg-opacity-20 rounded-full">
                  <FiEye className="w-4 h-4 mr-2" />
                  <span>Logged in as {user?.name || user?.email}</span>
                </div>
              ) : (
                <div className="inline-flex items-center px-4 py-2 bg-yellow-500 bg-opacity-20 rounded-full">
                  <FiLock className="w-4 h-4 mr-2" />
                  <span>Viewing public cards only</span>
                </div>
              )}
            </div>
            
            {/* Stats */}
            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold">{pagination?.total || 0}</div>
                <div className="text-sm opacity-80">Total Cards</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{filteredCards.length}</div>
                <div className="text-sm opacity-80">Showing</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{categories.length}</div>
                <div className="text-sm opacity-80">Categories</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Privacy Notice for Non-Authenticated Users */}
        {showPrivacyNotice && !isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-full mr-4">
                  <FiShield className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-1">Privacy Protection</h3>
                  <p className="text-yellow-700 text-sm">
                    Some contact information is hidden for privacy. 
                    <button
                      onClick={() => setShowPrivacyNotice(false)}
                      className="text-yellow-800 underline ml-1 hover:text-yellow-900 font-medium"
                    >
                      Login to view full details
                    </button>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPrivacyNotice(false)}
                className="text-yellow-600 hover:text-yellow-800 p-2 rounded-full hover:bg-yellow-100"
              >
                <FiEyeOff className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, job title, or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                >
                  Search
                </button>
              </form>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FiGrid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FiUsers className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Privacy Filter */}
          {isAuthenticated && (
            <div className="mt-6">
              <div className="flex items-center mb-4">
                <FiFilter className="mr-2 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filter by privacy:</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: 'all', label: 'All Cards', icon: FiGlobe },
                  { value: 'public', label: 'Public Only', icon: FiEye },
                  { value: 'private', label: 'Private Only', icon: FiLock }
                ].map((filter) => (
                  <motion.button
                    key={filter.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePrivacyFilterChange(filter.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                      privacyFilter === filter.value
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                    }`}
                  >
                    <filter.icon className="w-4 h-4" />
                    {filter.label}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Category Filters */}
          <div className="mt-6">
            <div className="flex items-center mb-4">
              <FiFilter className="mr-2 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filter by category:</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Cards Grid */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-16"
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading amazing cards...</p>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-red-900 mb-2">Failed to Load Cards</h3>
              <p className="text-red-700 mb-6">{error}</p>
              <button
                onClick={loadCards}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        ) : filteredCards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 max-w-md mx-auto">
              <FiGlobe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Cards Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedCategory || privacyFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : !isAuthenticated 
                    ? 'Login to view private cards'
                    : 'No cards available at the moment'
                }
              </p>
              {(searchTerm || selectedCategory || privacyFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setPrivacyFilter('all');
                    setCurrentPage(1);
                  }}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
              {!isAuthenticated && (
                <button
                  onClick={() => window.location.href = '/login'}
                  className="ml-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FiLogIn className="w-4 h-4" />
                  Login
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Showing {filteredCards.length} cards
                {privacyFilter !== 'all' && ` (${privacyFilter})`}
              </h2>
              <div className="text-sm text-gray-600">
                Page {currentPage} of {pagination?.pages || 1}
              </div>
            </div>

            {/* Cards Grid */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              <AnimatePresence>
                {filteredCards.map((card, index) => (
                  <motion.div
                    key={card._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <DiscoverCardItem 
                      card={card} 
                      viewMode={viewMode}
                      showTimeAgo={true}
                      timeAgo="2 hours ago"
                      isAuthenticated={isAuthenticated}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-12 flex justify-center"
              >
                <div className="flex space-x-2">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <motion.button
                      key={page}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:shadow-md'
                      }`}
                    >
                      {page}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DiscoverCards;
