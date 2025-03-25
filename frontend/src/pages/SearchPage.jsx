import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiMapPin, FiCalendar, FiTrendingUp, FiX, FiStar, FiUsers, FiBriefcase, FiHeart, FiEye, FiShare, FiDownload } from 'react-icons/fi';
import { FaQrcode, FaRegHeart, FaHeart, FaRegBookmark, FaBookmark, FaRegBookmark as FaBookmarkSolid } from 'react-icons/fa';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    location: '',
    dateRange: 'all',
    sortBy: 'relevance',
    template: 'all',
    isPublic: 'all',
    priceRange: 'all',
    tags: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([
    'Software Engineer', 'Designer', 'CEO', 'Marketing', 'Developer', 'Consultant', 'Freelancer', 'Entrepreneur'
  ]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([
    'Technology', 'Design', 'Business', 'Marketing', 'Finance', 'Healthcare', 'Education', 'Real Estate', 'Legal', 'Consulting'
  ]);

  const categories = [
    { id: 'all', name: 'All Categories', icon: FiUsers },
    { id: 'business', name: 'Business', icon: FiBriefcase },
    { id: 'creative', name: 'Creative', icon: FiStar },
    { id: 'technology', name: 'Technology', icon: FiTrendingUp },
    { id: 'healthcare', name: 'Healthcare', icon: FiUsers },
    { id: 'education', name: 'Education', icon: FiUsers },
    { id: 'finance', name: 'Finance', icon: FiBriefcase },
    { id: 'real-estate', name: 'Real Estate', icon: FiBriefcase },
    { id: 'legal', name: 'Legal', icon: FiBriefcase },
    { id: 'consulting', name: 'Consulting', icon: FiBriefcase }
  ];

  const sortOptions = [
    { id: 'relevance', name: 'Most Relevant' },
    { id: 'recent', name: 'Most Recent' },
    { id: 'popular', name: 'Most Popular' },
    { id: 'views', name: 'Most Viewed' },
    { id: 'loves', name: 'Most Loved' },
    { id: 'name', name: 'Name A-Z' }
  ];

  const templates = [
    { id: 'all', name: 'All Templates' },
    { id: 'modern', name: 'Modern' },
    { id: 'elegant', name: 'Elegant' },
    { id: 'minimal', name: 'Minimal' },
    { id: 'creative', name: 'Creative' },
    { id: 'business', name: 'Business' },
    { id: 'premium', name: 'Premium' },
    { id: 'tech', name: 'Tech' },
  ];

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        q: searchQuery,
        ...filters,
        tags: selectedTags.join(',')
      });

      const response = await fetch(`/api/search?${queryParams}`);
      const data = await response.json();
      
      if (response.ok) {
        setSearchResults(data.cards || []);
      } else {
        console.error('Search failed:', data.message);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSuggestions = async () => {
    try {
      const response = await fetch(`/api/search/suggestions?query=${searchQuery}`);
      const data = await response.json();
      if (response.ok) {
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Suggestions error:', error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setShowSuggestions(false);
    
    // Save to recent searches
    const newRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      location: '',
      dateRange: 'all',
      sortBy: 'relevance',
      template: 'all',
      isPublic: 'all',
      priceRange: 'all',
      tags: []
    });
    setSelectedTags([]);
  };

  const handleLove = async (cardId) => {
    try {
      const response = await fetch(`/api/cards/${cardId}/love`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        // Update the card in search results
        setSearchResults(prev => 
          prev.map(card => 
            card._id === cardId 
              ? { ...card, isLoved: !card.isLoved, loveCount: card.isLoved ? card.loveCount - 1 : card.loveCount + 1 }
              : card
          )
        );
      }
    } catch (error) {
      console.error('Error toggling love:', error);
    }
  };

  const handleSave = async (cardId) => {
    try {
      const response = await fetch('/api/library', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cardId })
      });
      if (response.ok) {
        // Update the card in search results
        setSearchResults(prev => 
          prev.map(card => 
            card._id === cardId 
              ? { ...card, isSaved: !card.isSaved }
              : card
          )
        );
      }
    } catch (error) {
      console.error('Error saving card:', error);
    }
  };

  useEffect(() => {
    if (searchQuery.length >= 2) {
      getSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">Discover Cards</h1>
              <p className="text-neutral-600 mt-1">Find and connect with professionals</p>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline flex items-center space-x-2"
            >
              <FiFilter className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Search Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-8">
              {/* Search Input */}
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search cards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                  className="input-field pl-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <FiX className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                  </button>
                )}
              </div>

              {/* Search Button */}
              <button
                onClick={performSearch}
                disabled={loading}
                className="btn-primary w-full mb-6"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <FiSearch className="h-5 w-5 mr-2" />
                    Search
                  </>
                )}
              </button>

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-neutral-700 mb-3">Recent Searches</h3>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(search)}
                        className="text-sm text-neutral-600 hover:text-primary-600 transition-colors w-full text-left"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-neutral-700 mb-3">Trending</h3>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="text-xs bg-neutral-100 hover:bg-primary-100 text-neutral-700 hover:text-primary-700 px-3 py-1 rounded-full transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Category</label>
                      <select
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        className="input-field"
                      >
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sort By */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Sort By</label>
                      <select
                        value={filters.sortBy}
                        onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                        className="input-field"
                      >
                        {sortOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {availableTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => handleTagToggle(tag)}
                            className={`text-xs px-3 py-1 rounded-full transition-colors ${
                              selectedTags.includes(tag)
                                ? 'bg-primary-100 text-primary-700'
                                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Clear Filters */}
                    <button
                      onClick={clearFilters}
                      className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
                    >
                      Clear all filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">
                  {loading ? 'Searching...' : `Found ${searchResults.length} cards`}
                </h2>
                {searchQuery && (
                  <p className="text-neutral-600 mt-1">
                    Results for "{searchQuery}"
                  </p>
                )}
              </div>
            </div>

            {/* Search Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {searchResults.map((card) => (
                  <motion.div
                    key={card._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="card group hover:shadow-xl transition-all duration-200"
                  >
                    {/* Card Header */}
                    <div className="p-6 border-b border-neutral-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                            {card.title}
                          </h3>
                          <p className="text-sm text-neutral-600 mt-1">
                            {card.fullName}
                          </p>
                          {card.jobTitle && (
                            <p className="text-sm text-neutral-500 mt-1">
                              {card.jobTitle}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleLove(card._id)}
                            className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                          >
                            {card.isLoved ? <FaHeart className="h-4 w-4 text-red-500" /> : <FaRegHeart className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleSave(card._id)}
                            className="p-2 text-neutral-400 hover:text-primary-600 transition-colors"
                          >
                            {card.isSaved ? <FaBookmark className="h-4 w-4 text-primary-600" /> : <FaRegBookmark className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6">
                      {card.company && (
                        <p className="text-sm text-neutral-600 mb-2">
                          <FiBriefcase className="inline h-4 w-4 mr-1" />
                          {card.company}
                        </p>
                      )}
                      
                      {card.email && (
                        <p className="text-sm text-neutral-600 mb-2">
                          {card.email}
                        </p>
                      )}

                      {card.phone && (
                        <p className="text-sm text-neutral-600 mb-2">
                          {card.phone}
                        </p>
                      )}

                      {card.bio && (
                        <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                          {card.bio}
                        </p>
                      )}

                      {/* Card Stats */}
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <FiEye className="h-3 w-3 mr-1" />
                            {card.views || 0}
                          </span>
                          <span className="flex items-center">
                            <FiHeart className="h-3 w-3 mr-1" />
                            {card.loveCount || 0}
                          </span>
                        </div>
                        
                        <a
                          href={`/c/${card.shortLink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          View Card
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* No Results */}
            {!loading && searchResults.length === 0 && searchQuery && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">No results found</h3>
                <p className="text-neutral-600">
                  Try adjusting your search terms or filters
                </p>
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && showSuggestions && (
              <div className="mt-4 p-4 bg-white rounded-lg shadow-md border border-neutral-200">
                <h4 className="text-sm font-medium text-neutral-700 mb-2">Suggestions</h4>
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(suggestion)}
                      className="text-sm text-neutral-600 hover:text-primary-600 transition-colors w-full text-left py-1 px-2 rounded hover:bg-neutral-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage; 