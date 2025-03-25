import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiSearch, FiFilter, FiGrid, FiList, FiHeart, FiShare, FiSave, FiEye,
  FiTrendingUp, FiClock, FiStar, FiUser, FiMail, FiPhone, FiGlobe,
  FiArrowUp, FiArrowDown, FiShuffle, FiCalendar
} from 'react-icons/fi';
import { FaHeart, FaShareAlt, FaSave, FaEye, FaRegClock } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const RecentCards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const [sortOrder, setSortOrder] = useState('desc');
  const [timeFilter, setTimeFilter] = useState('all');

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'business', name: 'Business' },
    { id: 'creative', name: 'Creative' },
    { id: 'minimal', name: 'Minimal' },
    { id: 'design', name: 'Design' }
  ];

  const timeFilters = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Most Recent', icon: FaRegClock },
    { value: 'created', label: 'Recently Created', icon: FiCalendar },
    { value: 'updated', label: 'Recently Updated', icon: FiClock },
    { value: 'trending', label: 'Trending Recent', icon: FiTrendingUp },
    { value: 'popular', label: 'Recent Popular', icon: FiHeart }
  ];

  useEffect(() => {
    fetchRecentCards();
  }, [searchQuery, selectedCategory, sortBy, sortOrder, timeFilter]);

  const fetchRecentCards = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sortBy,
        sortOrder,
        timeFilter
      });

      if (searchQuery) {
        params.append('q', searchQuery);
      }

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`/api/search/recent?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (page === 1) {
          setCards(data.cards || data);
        } else {
          setCards(prev => [...prev, ...(data.cards || data)]);
        }
        setHasMore(data.hasMore !== undefined ? data.hasMore : (data.cards || data).length === 12);
        setCurrentPage(data.currentPage || page);
      }
    } catch (error) {
      console.error('Error fetching recent cards:', error);
      toast.error('Failed to fetch recent cards');
    } finally {
      setLoading(false);
    }
  };

  const saveToLibrary = async (cardId) => {
    try {
      const response = await fetch('/api/library', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ cardId })
      });

      if (response.ok) {
        setCards(prev => prev.map(card => 
          card._id === cardId ? { ...card, isSaved: true } : card
        ));
        toast.success('Card saved to library!');
      }
    } catch (error) {
      console.error('Error saving card:', error);
      toast.error('Failed to save card');
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchRecentCards(currentPage + 1);
    }
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (optionValue) => {
    if (sortBy === optionValue) {
      return sortOrder === 'desc' ? <FiArrowDown className="h-4 w-4" /> : <FiArrowUp className="h-4 w-4" />;
    }
    return null;
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <FaRegClock className="inline-block mr-3 text-blue-600" />
            Recent Cards
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the latest and most recently created visiting cards from our community
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search recent cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Time Filter */}
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {timeFilters.map(filter => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>

            {/* Sort Options */}
            <div className="flex gap-2">
              {sortOptions.map(option => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                      sortBy === option.value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="hidden sm:inline">{option.label}</span>
                    {getSortIcon(option.value)}
                  </button>
                );
              })}
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600'
                }`}
              >
                <FiGrid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'
                }`}
              >
                <FiList className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Cards Grid */}
        {loading && cards.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1'
              }`}
            >
              {cards.map((card, index) => (
                <CardItem
                  key={card._id}
                  card={card}
                  index={index}
                  onSave={saveToLibrary}
                />
              ))}
            </motion.div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Loading...' : 'Load More Recent Cards'}
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && cards.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <FaRegClock className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No recent cards found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or check back later for new cards.
            </p>
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiShuffle className="h-5 w-5" />
              Explore All Cards
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const CardItem = ({ card, index, onSave }) => {
  const [isLoved, setIsLoved] = useState(card.isLoved || false);

  const handleSave = () => {
    onSave(card._id);
  };

  const handleLove = async () => {
    try {
      const response = await fetch(`/api/cards/${card._id}/love`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setIsLoved(!isLoved);
        toast.success(isLoved ? 'Card unliked!' : 'Card loved!');
      }
    } catch (error) {
      console.error('Error loving card:', error);
      toast.error('Failed to love card');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${card.fullName} - ${card.jobTitle}`,
          text: `Check out ${card.fullName}'s digital business card`,
          url: `${window.location.origin}/view/${card._id}`
        });
        toast.success('Shared successfully!');
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/view/${card._id}`);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to share');
    }
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
            {getInitials(card.fullName || card.title)}
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-500">{card.views || 0}</span>
            <FiEye className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title || card.fullName}</h3>
        <p className="text-gray-600 mb-4">{card.jobTitle}</p>
        
        <div className="space-y-2 mb-4">
          {card.email && (
            <div className="flex items-center text-sm text-gray-600">
              <FiMail className="h-4 w-4 mr-2" />
              <span className="truncate">{card.email}</span>
            </div>
          )}
          {card.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <FiPhone className="h-4 w-4 mr-2" />
              <span>{card.phone}</span>
            </div>
          )}
          {card.website && (
            <div className="flex items-center text-sm text-gray-600">
              <FiGlobe className="h-4 w-4 mr-2" />
              <span className="truncate">{card.website}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-2">
            <span>by {card.ownerUserId?.name || 'Unknown'}</span>
            <span className="text-blue-600">•</span>
            <span>{formatTimeAgo(card.createdAt)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>{card.loveCount || 0}</span>
            <FaHeart className="h-4 w-4 text-red-400" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Link
              to={`/view/${card._id}`}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <FiEye className="h-5 w-5" />
            </Link>
            <button
              onClick={handleLove}
              className={`p-2 rounded-lg transition-colors ${
                isLoved 
                  ? 'text-red-600 bg-red-50' 
                  : 'text-red-600 hover:bg-red-50'
              }`}
            >
              <FaHeart className={`h-5 w-5 ${isLoved ? 'text-red-600' : 'text-red-400'}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <FaShareAlt className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={handleSave}
            className={`p-2 rounded-lg transition-colors ${
              card.isSaved 
                ? 'text-purple-600 bg-purple-50' 
                : 'text-purple-600 hover:bg-purple-50'
            }`}
          >
            <FaSave className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default RecentCards; 