import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiEye, FiEyeOff, FiGlobe, FiUsers, FiShield, FiGrid, FiLogIn, FiStar, FiMapPin, FiBriefcase } from 'react-icons/fi';
import { fetchSuggestions, fetchDiscover } from '../../features/cards/cardsThunks';
import DiscoverCardItem from '../../components/Cards/DiscoverCardItem';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';

const PAGE_BUTTON_LIMIT = 7;

const getPageNumbers = (currentPage, totalPages) => {
  if (totalPages <= PAGE_BUTTON_LIMIT) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = [];
  pages.push(1);
  let start = Math.max(2, currentPage - 2);
  let end = Math.min(totalPages - 1, currentPage + 2);
  if (currentPage <= 3) {
    end = Math.min(totalPages - 1, 5);
  }
  if (currentPage >= totalPages - 2) {
    start = Math.max(2, totalPages - 4);
  }
  if (start > 2) pages.push('...');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push('...');
  if (totalPages > 1) pages.push(totalPages);
  return pages;
};

const DiscoverCards = () => {
  const dispatch = useDispatch();
  const { pagination, isLoading, error, discover, suggestions } = useSelector((state) => state.cards);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const feedCards = discover.data || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(!isAuthenticated);
  const [viewMode, setViewMode] = useState('grid');
  const [privacyFilter, setPrivacyFilter] = useState('public');
  const [sortBy, setSortBy] = useState('newest');
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(true);

  const debounceRef = useRef(null);
  const prevSearchRef = useRef('');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (res.ok) setCategories(data.categories || data || []);
      } catch { /* ignore */ }
    };
    loadCategories();
    dispatch(fetchSuggestions({ limit: 6 }));
  }, [dispatch]);

  const loadCards = useCallback(async () => {
    try {
      await dispatch(fetchDiscover({
        page: currentPage,
        limit: 12,
        search: searchTerm,
        category: selectedCategory,
        industry: selectedIndustry,
        location: locationFilter,
        sortBy
      })).unwrap();
    } catch {
      toast.error('Failed to load cards');
    }
  }, [dispatch, currentPage, searchTerm, selectedCategory, selectedIndustry, locationFilter, sortBy]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (val !== prevSearchRef.current) {
        prevSearchRef.current = val;
        setCurrentPage(1);
      }
    }, 300);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    prevSearchRef.current = searchTerm;
    setCurrentPage(1);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    setCurrentPage(1);
  };

  const handleIndustryChange = (e) => {
    setSelectedIndustry(e.target.value);
    setCurrentPage(1);
  };

  const handleLocationChange = (e) => {
    setLocationFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getFilteredCards = () => {
    if (!feedCards.length) return [];
    let filtered = [...feedCards];
    if (!isAuthenticated) {
      filtered = filtered.filter(card => card.privacy === 'public');
    }
    if (privacyFilter !== 'all') {
      filtered = filtered.filter(card => card.privacy === privacyFilter);
    }
    if (selectedIndustry) {
      filtered = filtered.filter(card => card.industry === selectedIndustry);
    }
    if (locationFilter) {
      const loc = locationFilter.toLowerCase();
      filtered = filtered.filter(card => {
        const fields = [card.location, card.address, card.city, card.state, card.country, card.ownerUserId?.location];
        return fields.some((f) => f && String(f).toLowerCase().includes(loc));
      });
    }
    return filtered;
  };

  const filteredCards = getFilteredCards();
  const totalPages = pagination?.pages || 1;
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="min-h-screen bg-brand-background dark:bg-slate-950 transition-colors duration-200">
      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 select-none">Discover Amazing Cards</h1>
            <p className="text-base sm:text-lg opacity-90 max-w-2xl mx-auto mb-8 font-medium">
              Explore digital visiting cards from certified professionals and business contacts.
            </p>

            <div className="flex justify-center gap-6 text-sm font-semibold select-none">
              <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/15">
                <span className="font-extrabold text-lg mr-1">{pagination?.total || 0}</span> Total Cards
              </div>
              <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/15">
                <span className="font-extrabold text-lg mr-1">{categories.length}</span> Categories
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

        {/* Privacy Alert */}
        {showPrivacyNotice && !isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between p-5 bg-brand-warning/10 border border-brand-warning/20 rounded-2xl text-brand-warning">
              <div className="flex items-center gap-4">
                <div className="bg-brand-warning/10 p-2.5 rounded-full">
                  <FiShield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Privacy Protection Enabled</h3>
                  <p className="text-xs text-brand-textMuted mt-0.5">
                    Sensitive info is hidden.
                    <Link to="/login" className="underline font-bold text-brand-warning hover:text-amber-600 ml-1">
                      Login to view full profiles.
                    </Link>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPrivacyNotice(false)}
                className="text-brand-warning/60 hover:text-brand-warning cursor-pointer"
              >
                <FiEyeOff className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Search & Filters Controls */}
        <Card elevation="sm" className="p-6 mb-8 bg-brand-surface dark:bg-slate-900 border border-brand-border/40 dark:border-slate-800/80">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            <form onSubmit={handleSearchSubmit} className="flex-grow w-full flex gap-3">
              <div className="flex-grow">
                <Input
                  type="text"
                  placeholder="Search by name, title, or company..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  icon={FiSearch}
                  className="!gap-0"
                />
              </div>
              <Button type="submit" isLoading={isLoading} className="px-6 h-12 shadow-sm font-bold">
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </form>

            <div className="flex items-center gap-2">
              {/* Filter Toggle (mobile) */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 px-3 h-12 border border-brand-border dark:border-slate-700 rounded-xl text-sm font-semibold text-brand-textMuted hover:text-brand-primary transition-colors lg:hidden"
              >
                <FiFilter className="h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Filters'}
              </button>

              {/* Layout Toggle */}
              <div className="flex border border-brand-border dark:border-slate-700 rounded-xl overflow-hidden h-12 flex-shrink-0 select-none">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 flex items-center justify-center cursor-pointer transition-all ${viewMode === 'grid' ? 'bg-brand-primary text-white' : 'text-brand-textMuted hover:text-brand-primary'}`}
                >
                  <FiGrid className="text-lg" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 flex items-center justify-center cursor-pointer transition-all ${viewMode === 'list' ? 'bg-brand-primary text-white' : 'text-brand-textMuted hover:text-brand-primary'}`}
                >
                  <FiUsers className="text-lg" />
                </button>
              </div>
            </div>
          </div>

          {/* Filters content (collapsible on mobile) */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
            {/* Industry & Location Filters */}
            <div className="mt-5 border-t border-brand-border/30 dark:border-slate-800/40 pt-4">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-textMuted uppercase tracking-wide mb-3">
                <FiFilter />
                <span>Filters</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <select
                  value={selectedIndustry}
                  onChange={handleIndustryChange}
                  className="px-3 py-2 bg-brand-surface dark:bg-slate-800 border border-brand-border dark:border-slate-700 rounded-xl text-xs font-semibold text-brand-text outline-none focus:ring-2 focus:ring-brand-primary/20 h-10 cursor-pointer"
                >
                  <option value="">All Industries</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Education">Education</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Legal">Legal</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Creative">Creative</option>
                  <option value="Other">Other</option>
                </select>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-textMuted h-4 w-4" />
                  <input
                    type="text"
                    value={locationFilter}
                    onChange={handleLocationChange}
                    placeholder="Location..."
                    className="w-full pl-9 pr-3 py-2 bg-brand-surface dark:bg-slate-800 border border-brand-border dark:border-slate-700 rounded-xl text-xs font-semibold text-brand-text outline-none focus:ring-2 focus:ring-brand-primary/20 h-10"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                  className="px-3 py-2 bg-brand-surface dark:bg-slate-800 border border-brand-border dark:border-slate-700 rounded-xl text-xs font-semibold text-brand-text outline-none focus:ring-2 focus:ring-brand-primary/20 h-10 cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="views">Most Viewed</option>
                  <option value="loveCount">Most Loved</option>
                  <option value="trending">Trending</option>
                </select>
                {(selectedIndustry || locationFilter || sortBy !== 'newest') && (
                  <Button
                    onClick={() => { setSelectedIndustry(''); setLocationFilter(''); setSortBy('newest'); setCurrentPage(1); }}
                    variant="ghost"
                    size="sm"
                    className="text-brand-textMuted hover:text-brand-danger"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            {/* Category Filters */}
            <div className="mt-5 border-t border-brand-border/30 dark:border-slate-800/40 pt-4">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-textMuted uppercase tracking-wide mb-3">
                <FiBriefcase />
                <span>Categories</span>
              </div>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto custom-scrollbar p-0.5">
                {categories.map((cat) => (
                  <Button
                    key={cat._id || cat.slug}
                    onClick={() => handleCategoryChange(cat.slug || cat.name)}
                    variant={selectedCategory === (cat.slug || cat.name) ? 'secondary' : 'ghost'}
                    size="sm"
                    className={selectedCategory === (cat.slug || cat.name) ? 'text-white' : 'bg-brand-background dark:bg-slate-850 hover:bg-brand-border text-xs'}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Results Info */}
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-brand-text dark:text-white">
              {discover.personalized ? 'Recommended for you' : 'Professionals found'}
            </h2>
            {discover.personalized && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wide">
                <FiStar className="h-3 w-3" />
                Personalized
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-brand-textMuted uppercase">
            {filteredCards.length} results · Page {currentPage} of {totalPages}
          </span>
        </div>

        {/* Loading / Error / Data List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 4, 8].map((n) => (
              <Card key={n} elevation="none" className="p-4 bg-brand-surface dark:bg-slate-900 border border-brand-border/40 dark:border-slate-800/80 flex flex-col gap-3">
                <Skeleton variant="card" className="h-40" />
                <Skeleton variant="title" />
                <Skeleton variant="text" />
                <Skeleton variant="button" className="w-full mt-2" />
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <Card elevation="sm" className="p-8 max-w-md mx-auto bg-brand-surface dark:bg-slate-900 border border-brand-danger/20">
              <h3 className="text-lg font-bold text-brand-danger mb-2">Failed to Load Content</h3>
              <p className="text-xs text-brand-textMuted mb-6">{error}</p>
              <Button onClick={loadCards} variant="danger">
                Try Again
              </Button>
            </Card>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="text-center py-16">
            <Card elevation="sm" className="p-10 max-w-md mx-auto bg-brand-surface dark:bg-slate-900 border border-brand-border/40 dark:border-slate-800/80">
              <FiGlobe className="h-14 w-14 text-brand-textMuted mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-bold text-brand-text dark:text-white mb-2">No Profiles Found</h3>
              <p className="text-xs text-brand-textMuted mb-6">
                Adjust search query keywords or filter combinations and search directory again.
              </p>
              {(searchTerm || selectedCategory || selectedIndustry || locationFilter || privacyFilter !== 'all') && (
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setSelectedIndustry('');
                    setLocationFilter('');
                    setPrivacyFilter('all');
                    setSortBy('newest');
                    setCurrentPage(1);
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              )}
            </Card>
          </div>
        ) : (
          <>
            {/* Cards Display */}
            <div className={`grid gap-6 ${viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
              }`}>
              <AnimatePresence>
                {filteredCards.map((card, idx) => (
                  <motion.div
                    key={card._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                  >
                    <DiscoverCardItem
                      card={card}
                      viewMode={viewMode}
                      showTimeAgo={true}
                      timeAgo="Active recently"
                      isAuthenticated={isAuthenticated}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center select-none">
                <div className="flex gap-2">
                  {pageNumbers.map((page, idx) =>
                    page === '...' ? (
                      <span key={`ellipsis-${idx}`} className="flex items-center px-2 text-brand-textMuted text-sm">...</span>
                    ) : (
                      <Button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        variant={currentPage === page ? 'primary' : 'ghost'}
                        className={currentPage === page ? 'shadow-md' : 'bg-brand-surface border border-brand-border hover:bg-brand-background text-sm'}
                        size="sm"
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Suggested for You (guests — personalized feed is shown above for members) */}
            {!discover.personalized && suggestions.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center gap-2 mb-6">
                  <FiStar className="text-amber-500" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Suggested for You</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {suggestions.map(card => (
                    <DiscoverCardItem key={card._id} card={card} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DiscoverCards;
