import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiSearch, FiFilter, FiGrid, FiList, FiHeart, FiShare, FiSave, FiEye,
  FiTrendingUp, FiClock, FiStar, FiUser, FiMail, FiPhone, FiGlobe,
  FiArrowUp, FiArrowDown, FiShuffle
} from 'react-icons/fi';
import { FaHeart, FaShareAlt, FaSave, FaEye, FaChartLine } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import CardRenderer from '../../components/Cards/CardRenderer';

const PopularCards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('popular');
  const [sortOrder, setSortOrder] = useState('desc');

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'business', name: 'Business' },
    { id: 'creative', name: 'Creative' },
    { id: 'minimal', name: 'Minimal' },
    { id: 'design', name: 'Design' }
  ];

  const sortOptions = [
    { value: 'popular', label: 'Most Popular', icon: FaChartLine },
    { value: 'views', label: 'Most Viewed', icon: FiEye },
    { value: 'loves', label: 'Most Loved', icon: FiHeart },
    { value: 'recent', label: 'Recently Popular', icon: FiClock },
    { value: 'trending', label: 'Trending Now', icon: FiTrendingUp }
  ];

  useEffect(() => {
    fetchPopularCards();
  }, [searchQuery, selectedCategory, sortBy, sortOrder]);

  const fetchPopularCards = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sortBy,
        sortOrder
      });

      if (searchQuery) {
        params.append('q', searchQuery);
      }

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`/api/search/popular?${params}`);
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
      console.error('Error fetching popular cards:', error);
      toast.error('Failed to fetch popular cards');
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
      fetchPopularCards(currentPage + 1);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100 mb-4">
            <FaChartLine className="inline-block mr-3 text-emerald-600 dark:text-emerald-400" />
            Popular Cards
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
            Discover the most popular and trending visiting cards from our community
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 h-5 w-5" />
              <input
                type="text"
                placeholder="Search popular cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-200 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-200 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
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
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:border-emerald-500'
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
            <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white dark:bg-slate-800 shadow-sm' : 'text-gray-600 dark:text-slate-400'
                }`}
              >
                <FiGrid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white dark:bg-slate-800 shadow-sm' : 'text-gray-600 dark:text-slate-400'
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
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
                  className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Loading...' : 'Load More Popular Cards'}
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
            <FiTrendingUp className="mx-auto h-16 w-16 text-gray-400 dark:text-slate-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">
              No popular cards found
            </h3>
            <p className="text-gray-600 dark:text-slate-400 mb-6">
              Try adjusting your search criteria or check back later for trending cards.
            </p>
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
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
          url: card.shortLink ? `${window.location.origin}/c/${card.shortLink}` : `${window.location.origin}/view/${card._id}`
        });
        toast.success('Shared successfully!');
      } else {
        await navigator.clipboard.writeText(card.shortLink ? `${window.location.origin}/c/${card.shortLink}` : `${window.location.origin}/view/${card._id}`);
        toast.success('Link copied to clipboard!');
      }
    } catch {
      toast.error('Failed to share');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-shadow overflow-hidden"
    >
      {/* Real card design preview */}
      <Link
        to={card.shortLink ? `/c/${card.shortLink}` : `/view/${card._id}`}
        className="block h-48 overflow-hidden border-b border-gray-100 dark:border-slate-700"
      >
        <CardRenderer card={card} className="w-full h-full" />
      </Link>
      <div className="p-6">
        <div className="flex items-center justify-end mb-4">
          <span className="text-sm text-gray-500 dark:text-slate-400">{card.views || 0}</span>
          <FiEye className="h-4 w-4 text-gray-400 dark:text-slate-500 ml-1.5" />
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
          <span>by {card.ownerUserId?.name || 'Unknown'}</span>
          <div className="flex items-center space-x-2">
            <span>{card.loveCount || 0}</span>
            <FaHeart className="h-4 w-4 text-red-400" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Link
              to={card.shortLink ? `/c/${card.shortLink}` : `/view/${card._id}`}
              className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:bg-emerald-900/40 rounded-lg transition-colors"
            >
              <FiEye className="h-5 w-5" />
            </Link>
            <button
              onClick={handleLove}
              className={`p-2 rounded-lg transition-colors ${
                isLoved 
                  ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40' 
                  : 'text-red-600 dark:text-red-400 hover:bg-red-100 dark:bg-red-900/40'
              }`}
            >
              <FaHeart className={`h-5 w-5 ${isLoved ? 'text-red-600 dark:text-red-400' : 'text-red-400'}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:bg-green-900/40 rounded-lg transition-colors"
            >
              <FaShareAlt className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={handleSave}
            className={`p-2 rounded-lg transition-colors ${
              card.isSaved 
                ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40' 
                : 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:bg-green-900/40'
            }`}
          >
            <FaSave className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PopularCards; 