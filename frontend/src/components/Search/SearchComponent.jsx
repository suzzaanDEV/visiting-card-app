import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiX, FiTrendingUp, FiClock, FiStar } from 'react-icons/fi';
import { useDebounce } from '../../hooks/useDebounce';
import apiService from '../../services/apiService';
import toast from 'react-hot-toast';

const SearchComponent = ({ 
  onSearch, 
  placeholder = "Search cards...", 
  showFilters = true,
  className = "" 
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    sortBy: 'relevance',
    searchType: 'hybrid'
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  // Fetch suggestions
  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await apiService.get(`/api/search/suggestions?query=${encodeURIComponent(searchQuery)}`);
      setSuggestions(response.data.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  }, []);

  // Handle search
  const handleSearch = useCallback(async (searchQuery = query, searchFilters = filters) => {
    if (!searchQuery.trim()) {
      onSearch({ results: [], total: 0 });
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        category: searchFilters.category,
        sortBy: searchFilters.sortBy,
        searchType: searchFilters.searchType,
        page: 1,
        limit: 20
      });

      const response = await apiService.get(`/api/search?${params}`);
      onSearch(response.data);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [query, filters, onSearch]);

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  // Handle advanced search
  const handleAdvancedSearch = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.post('/api/search/advanced', {
        query,
        category: filters.category !== 'all' ? filters.category : undefined,
        sortBy: filters.sortBy,
        searchType: filters.searchType,
        limit: 20,
        page: 1
      });
      onSearch(response.data);
    } catch (error) {
      console.error('Advanced search error:', error);
      toast.error('Advanced search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    if (debouncedQuery) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery, fetchSuggestions]);

  useEffect(() => {
    if (debouncedQuery) {
      handleSearch();
    }
  }, [debouncedQuery, handleSearch]);

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={placeholder}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiX className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        {showFilters && (
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FiFilter className="h-5 w-5" />
          </button>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Algorithm
                </label>
                <select
                  value={filters.searchType}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="hybrid">Hybrid (Recommended)</option>
                  <option value="fuzzy">Fuzzy Search</option>
                  <option value="exact">Exact Match</option>
                  <option value="semantic">Semantic Search</option>
                  <option value="fulltext">Full Text</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="relevance">Relevance</option>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="popular">Most Popular</option>
                  <option value="name">Name</option>
                  <option value="company">Company</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="business">Business</option>
                  <option value="creative">Creative</option>
                  <option value="minimal">Minimal</option>
                  <option value="modern">Modern</option>
                  <option value="elegant">Elegant</option>
                </select>
              </div>
            </div>

            {/* Advanced Search Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleAdvancedSearch}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Searching...' : 'Advanced Search'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Suggestions */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <div className="flex items-center">
                  <FiSearch className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-gray-700">{suggestion}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Tips */}
      {!query && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <h4 className="text-sm font-medium text-blue-900 mb-2">Search Tips:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-blue-700">
            <div className="flex items-center">
              <FiTrendingUp className="h-3 w-3 mr-1" />
              Try searching by name, company, or job title
            </div>
            <div className="flex items-center">
              <FiClock className="h-3 w-3 mr-1" />
              Use exact matches for better results
            </div>
            <div className="flex items-center">
              <FiStar className="h-3 w-3 mr-1" />
              Filter by category for specific results
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SearchComponent; 