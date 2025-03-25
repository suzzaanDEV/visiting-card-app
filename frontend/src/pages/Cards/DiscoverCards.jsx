import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiSearch, FiFilter, FiGrid, FiList, FiHeart, FiShare, FiSave, FiEye,
  FiTrendingUp, FiClock, FiStar, FiUser, FiMail, FiPhone, FiGlobe
} from 'react-icons/fi';
import { FaHeart, FaShareAlt, FaSave, FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const DiscoverCards = () => {
  const [cards, setCards] = useState([]);
  const [popularCards, setPopularCards] = useState([]);
  const [recentCards, setRecentCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'business', name: 'Business' },
    { id: 'creative', name: 'Creative' },
    { id: 'minimal', name: 'Minimal' },
    { id: 'design', name: 'Design' }
  ];

  useEffect(() => {
    fetchCards();
    fetchPopularCards();
    fetchRecentCards();
  }, [searchQuery, selectedCategory]);

  const fetchCards = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      });

      if (searchQuery) {
        params.append('q', searchQuery);
      }

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`/api/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (page === 1) {
          setCards(data.cards);
        } else {
          setCards(prev => [...prev, ...data.cards]);
        }
        setHasMore(data.hasMore);
        setCurrentPage(data.currentPage || page);
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
      toast.error('Failed to fetch cards');
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularCards = async () => {
    try {
      const response = await fetch('/api/search/popular?limit=6');
      if (response.ok) {
        const data = await response.json();
        setPopularCards(data.cards || data || []);
      }
    } catch (error) {
      console.error('Error fetching popular cards:', error);
      setPopularCards([]);
    }
  };

  const fetchRecentCards = async () => {
    try {
      const response = await fetch('/api/search/recent?limit=6');
      if (response.ok) {
        const data = await response.json();
        setRecentCards(data.cards || data || []);
      }
    } catch (error) {
      console.error('Error fetching recent cards:', error);
      setRecentCards([]);
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
      fetchCards(currentPage + 1);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCards(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Amazing Digital Cards
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Explore creative digital business cards from talented professionals
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Search for cards, names, or companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-gray-900 rounded-xl text-lg focus:ring-4 focus:ring-blue-300 focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Popular Cards */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <FiTrendingUp className="mr-2 text-orange-500" />
                Popular Cards
              </h2>
              <Link to="/discover/popular" className="text-blue-600 hover:text-blue-800 font-medium">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {popularCards.slice(0, 4).map((card, index) => (
                <CardItem key={card._id} card={card} index={index} onSave={saveToLibrary} />
              ))}
            </div>
          </motion.div>

          {/* Recent Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <FiClock className="mr-2 text-green-500" />
                Recent Cards
              </h2>
              <Link to="/discover/recent" className="text-blue-600 hover:text-blue-800 font-medium">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentCards.slice(0, 4).map((card, index) => (
                <CardItem key={card._id} card={card} index={index} onSave={saveToLibrary} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Filters and View Mode */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              
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
            
            <div className="text-gray-600">
              {cards.length} cards found
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        {cards.length === 0 && !loading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <FiSearch className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cards found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or browse different categories.
            </p>
          </motion.div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {cards.map((card, index) => (
              <CardItem key={card._id} card={card} index={index} onSave={saveToLibrary} />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
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
          <span>by {card.ownerUserId?.name || 'Unknown'}</span>
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
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
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

export default DiscoverCards;
