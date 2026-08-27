import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiTrendingUp, FiX, FiUsers, FiBriefcase, FiHeart, FiEye, FiExternalLink, FiZap, FiTarget, FiSliders, FiMapPin, FiCalendar, FiTag } from 'react-icons/fi';
import { FaRegHeart, FaHeart, FaRegBookmark, FaBookmark } from 'react-icons/fa';
import { API_BASE_URL } from '../services/apiService';
import { getToken } from '../utils/authStorage';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

const ALGORITHM_LABELS = {
  hybrid: 'Hybrid Smart',
  bm25: 'BM25 Precise',
  tfidf: 'TF-IDF',
  fuzzy: 'Fuzzy Match',
  basic: 'Basic',
};

const SEARCH_TYPES = [
  { id: 'smart', label: 'Smart Search', algorithm: 'hybrid', icon: FiZap, description: 'AI-powered hybrid ranking' },
  { id: 'quick', label: 'Quick Search', algorithm: 'basic', icon: FiSliders, description: 'Fast keyword matching' },
  { id: 'precise', label: 'Precise', algorithm: 'bm25', icon: FiTarget, description: 'Statistical relevance' },
];

const CATEGORIES = [
  { id: 'all', name: 'All Categories' },
  { id: 'business', name: 'Business' },
  { id: 'technology', name: 'Technology' },
  { id: 'creative', name: 'Creative' },
  { id: 'healthcare', name: 'Healthcare' },
  { id: 'education', name: 'Education' },
  { id: 'personal', name: 'Personal' },
  { id: 'finance', name: 'Finance' },
  { id: 'real-estate', name: 'Real Estate' },
  { id: 'legal', name: 'Legal' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'food-hospitality', name: 'Food & Hospitality' },
  { id: 'other', name: 'Other' },
];

const SORT_OPTIONS = [
  { id: 'relevance', name: 'Most Relevant' },
  { id: 'recent', name: 'Most Recent' },
  { id: 'popular', name: 'Most Popular' },
  { id: 'views', name: 'Most Viewed' },
  { id: 'loves', name: 'Most Loved' },
  { id: 'trending', name: 'Trending' },
];

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Marketing',
  'Legal', 'Real Estate', 'Creative', 'Hospitality', 'Manufacturing', 'Other',
];

const DATE_RANGES = [
  { id: 'all', name: 'Any Time' },
  { id: 'today', name: 'Today' },
  { id: 'week', name: 'This Week' },
  { id: 'month', name: 'This Month' },
  { id: 'year', name: 'This Year' },
];

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

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeAlgorithm, setActiveAlgorithm] = useState('hybrid');
  const [searchType, setSearchType] = useState('smart');
  const [filters, setFilters] = useState({ category: 'all', industry: '', location: '', sortBy: 'relevance' });
  const [showFilters, setShowFilters] = useState(true);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [relatedCards, setRelatedCards] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [advFilters, setAdvFilters] = useState({
    jobTitle: '', company: '', skills: '', industry: '', dateRange: 'all',
  });

  const debounceRef = useRef(null);
  const isAuthenticated = !!getToken();

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try { setRecentSearches(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  // Fetch related cards when search results arrive
  useEffect(() => {
    if (searchResults.length > 0 && searchResults[0]?._id) {
      setRelatedLoading(true);
      fetch(`${API_BASE_URL}/search/recommendations/${searchResults[0]._id}?limit=4`)
        .then((res) => res.json())
        .then((data) => {
          const recs = data.recommendations || [];
          setRelatedCards(recs.filter((c) => !searchResults.some((r) => r._id === c._id)));
        })
        .catch(() => setRelatedCards([]))
        .finally(() => setRelatedLoading(false));
    } else {
      setRelatedCards([]);
    }
  }, [searchResults]);

  const fetchSuggestions = useCallback(async (query) => {
    if (query.length < 2) { setSearchSuggestions([]); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/search/suggestions?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (res.ok) setSearchSuggestions(data.suggestions || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchSuggestions(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchSuggestions]);

  const performSearch = useCallback(async (overrides = {}) => {
    const query = overrides.query ?? searchQuery;
    if (!query.trim()) return;

    const algorithm = SEARCH_TYPES.find((t) => t.id === (overrides.searchType ?? searchType))?.algorithm || 'hybrid';
    setActiveAlgorithm(algorithm);
    setHasSearched(true);

    setLoading(true);
    setShowSuggestions(false);

    const recent = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5);
    setRecentSearches(recent);
    localStorage.setItem('recentSearches', JSON.stringify(recent));

    try {
      const useAdvanced = advancedMode || overrides.advanced;
      let data;

      if (useAdvanced) {
        const adv = { ...advFilters, ...overrides.advFilters };
        const body = {
          query,
          category: (overrides.category ?? filters.category) === 'all' ? undefined : (overrides.category ?? filters.category),
          industry: adv.industry || undefined,
            location: (overrides.location ?? filters.location) || undefined,
          jobTitle: adv.jobTitle || undefined,
          company: adv.company || undefined,
          skills: adv.skills || undefined,
          dateRange: adv.dateRange || undefined,
          sortBy: overrides.sortBy ?? filters.sortBy,
          searchType: algorithm,
          page: overrides.page ?? 1,
          limit: 20,
        };
        Object.keys(body).forEach((k) => body[k] === undefined && delete body[k]);
        const res = await fetch(`${API_BASE_URL}/search/advanced`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Advanced search failed');
      } else {
        const params = new URLSearchParams({
          q: query,
          category: (overrides.category ?? filters.category) === 'all' ? '' : (overrides.category ?? filters.category),
          industry: overrides.industry ?? filters.industry,
          location: overrides.location ?? filters.location,
          sortBy: overrides.sortBy ?? filters.sortBy,
          algorithm,
          page: String(overrides.page ?? 1),
          limit: '20',
        });
        const res = await fetch(`${API_BASE_URL}/search?${params}`);
        data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Search failed');
      }

      setSearchResults(data.cards || []);
      setTotalResults(data.total || 0);
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast.error(err.message || 'Unable to connect to search service');
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, searchType, filters, recentSearches, advancedMode, advFilters]);

  const handleSearchQueryChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setShowSuggestions(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (val.trim()) {
        performSearch({ query: val, page: 1 });
      }
    }, 300);
  };

  const handleSuggestionClick = (term) => {
    const text = typeof term === 'string' ? term : (term?.text || String(term));
    setSearchQuery(text);
    setShowSuggestions(false);
    performSearch({ query: text, searchType, page: 1 });
  };

  const handleFilterChange = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    if (hasSearched || searchQuery.trim()) {
      performSearch({ [key]: value, page: 1 });
    }
  };

  const handleSearchTypeToggle = (id) => {
    setSearchType(id);
    if (searchQuery.trim()) {
      performSearch({ searchType: id, page: 1 });
    }
  };

  const clearAll = () => {
    setSearchQuery('');
    setSearchResults([]);
    setTotalResults(0);
    setFilters({ category: 'all', industry: '', location: '', sortBy: 'relevance' });
    setAdvFilters({ jobTitle: '', company: '', skills: '', industry: '', dateRange: 'all' });
    setSearchType('smart');
    setActiveAlgorithm('hybrid');
    setHasSearched(false);
    setRelatedCards([]);
    setAdvancedMode(false);
  };

  const handleLove = async (cardId) => {
    if (!isAuthenticated) { toast.error('Please log in to love cards'); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/cards/${cardId}/love`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        setSearchResults((prev) =>
          prev.map((c) =>
            c._id === cardId
              ? { ...c, isLoved: !c.isLoved, loveCount: c.isLoved ? (c.loveCount || 1) - 1 : (c.loveCount || 0) + 1 }
              : c
          )
        );
        toast.success('Updated');
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to update');
      }
    } catch { toast.error('Failed to update love status'); }
  };

  const handleSave = async (cardId) => {
    if (!isAuthenticated) { toast.error('Please log in to save cards'); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/library`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId }),
      });
      if (res.ok) {
        setSearchResults((prev) =>
          prev.map((c) => (c._id === cardId ? { ...c, isSaved: !c.isSaved } : c))
        );
        toast.success('Card saved to library');
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to save');
      }
    } catch { toast.error('Failed to save card'); }
  };

  const handlePageChange = (page) => {
    performSearch({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="min-h-screen bg-brand-background dark:bg-slate-950 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 shadow-sm border-b border-neutral-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                Search Cards
              </h1>
              <p className="text-neutral-600 dark:text-slate-400 mt-1">Find and connect with professionals</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
              <FiFilter className="mr-1.5" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className={`lg:col-span-1 space-y-6 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            {/* Quick vs Advanced Toggle */}
            <Card elevation="sm" className="p-5">
              <h3 className="text-xs font-bold text-brand-textMuted dark:text-slate-400 uppercase tracking-wide mb-3">Search Mode</h3>
              <div className="flex rounded-xl bg-brand-surface dark:bg-slate-800 border border-brand-border dark:border-slate-700 p-1">
                <button
                  onClick={() => setAdvancedMode(false)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    !advancedMode ? 'bg-brand-primary text-white shadow-md' : 'text-brand-textMuted dark:text-slate-400 hover:text-brand-text'
                  }`}
                >
                  <FiSliders className="h-3.5 w-3.5" /> Quick
                </button>
                <button
                  onClick={() => setAdvancedMode(true)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    advancedMode ? 'bg-brand-primary text-white shadow-md' : 'text-brand-textMuted dark:text-slate-400 hover:text-brand-text'
                  }`}
                >
                  <FiZap className="h-3.5 w-3.5" /> Advanced
                </button>
              </div>
              {!advancedMode && (
                <div className="mt-3 space-y-1.5">
                  {SEARCH_TYPES.map((type) => {
                    const Icon = type.icon;
                    const active = searchType === type.id;
                    return (
                      <button
                        key={type.id}
                        onClick={() => handleSearchTypeToggle(type.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                          active
                            ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/30 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700/40'
                            : 'text-brand-textMuted dark:text-slate-400 hover:bg-brand-surface dark:hover:bg-slate-800/50 border border-transparent'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <Card elevation="sm" className="p-5">
                <h3 className="text-xs font-bold text-brand-textMuted dark:text-slate-400 uppercase tracking-wide mb-3">Recent</h3>
                <div className="space-y-1">
                  {recentSearches.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(term)}
                      className="text-sm text-brand-text dark:text-slate-300 hover:text-brand-primary dark:hover:text-emerald-400 transition-colors w-full text-left px-2 py-1.5 rounded-lg hover:bg-brand-surface dark:hover:bg-slate-800"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <Card elevation="sm" className="p-5 space-y-5">
                    {/* Category */}
                    <div>
                      <label className="block text-xs font-bold text-brand-textMuted dark:text-slate-400 uppercase tracking-wide mb-2">Category</label>
                      <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="w-full px-4 py-3 bg-brand-surface dark:bg-slate-800 text-brand-text border rounded-xl transition-all duration-200 outline-none border-brand-border dark:border-slate-700 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 text-sm"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-xs font-bold text-brand-textMuted dark:text-slate-400 uppercase tracking-wide mb-2">Location</label>
                      <div className="relative">
                        <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-textMuted h-4 w-4" />
                        <input
                          type="text"
                          value={filters.location}
                          onChange={(e) => handleFilterChange('location', e.target.value)}
                          placeholder="e.g. Kathmandu, Pokhara"
                          className="w-full pl-9 pr-4 py-3 bg-brand-surface dark:bg-slate-800 text-brand-text border rounded-xl transition-all duration-200 outline-none border-brand-border dark:border-slate-700 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 text-sm"
                        />
                      </div>
                    </div>

                    {/* ── Advanced-only fields ── */}
                    {advancedMode && (
                      <>
                        <div className="border-t border-brand-border dark:border-slate-700 pt-4">
                          <h4 className="text-[11px] font-bold text-brand-primary dark:text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <FiTarget className="h-3 w-3" /> Advanced Filters
                          </h4>
                        </div>

                        {/* Industry */}
                        <div>
                          <label className="block text-xs font-bold text-brand-textMuted dark:text-slate-400 uppercase tracking-wide mb-2">Industry</label>
                          <select
                            value={advFilters.industry}
                            onChange={(e) => setAdvFilters((p) => ({ ...p, industry: e.target.value }))}
                            className="w-full px-4 py-3 bg-brand-surface dark:bg-slate-800 text-brand-text border rounded-xl transition-all duration-200 outline-none border-brand-border dark:border-slate-700 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 text-sm"
                          >
                            <option value="">All Industries</option>
                            {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                          </select>
                        </div>

                        {/* Job Title */}
                        <div>
                          <label className="block text-xs font-bold text-brand-textMuted dark:text-slate-400 uppercase tracking-wide mb-2">Job Title</label>
                          <input
                            type="text"
                            value={advFilters.jobTitle}
                            onChange={(e) => setAdvFilters((p) => ({ ...p, jobTitle: e.target.value }))}
                            placeholder="e.g. Software Engineer at Leapfrog"
                            className="w-full px-4 py-3 bg-brand-surface dark:bg-slate-800 text-brand-text border rounded-xl transition-all duration-200 outline-none border-brand-border dark:border-slate-700 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 text-sm"
                          />
                        </div>

                        {/* Company */}
                        <div>
                          <label className="block text-xs font-bold text-brand-textMuted dark:text-slate-400 uppercase tracking-wide mb-2">Company</label>
                          <input
                            type="text"
                            value={advFilters.company}
                            onChange={(e) => setAdvFilters((p) => ({ ...p, company: e.target.value }))}
                            placeholder="e.g. Leapfrog Technology"
                            className="w-full px-4 py-3 bg-brand-surface dark:bg-slate-800 text-brand-text border rounded-xl transition-all duration-200 outline-none border-brand-border dark:border-slate-700 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 text-sm"
                          />
                        </div>

                        {/* Skills */}
                        <div>
                          <label className="block text-xs font-bold text-brand-textMuted dark:text-slate-400 uppercase tracking-wide mb-2">Skills</label>
                          <div className="relative">
                            <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-textMuted h-4 w-4" />
                            <input
                              type="text"
                              value={advFilters.skills}
                              onChange={(e) => setAdvFilters((p) => ({ ...p, skills: e.target.value }))}
                              placeholder="e.g. React, Node.js, Python"
                              className="w-full pl-9 pr-4 py-3 bg-brand-surface dark:bg-slate-800 text-brand-text border rounded-xl transition-all duration-200 outline-none border-brand-border dark:border-slate-700 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 text-sm"
                            />
                          </div>
                        </div>

                        {/* Date Range */}
                        <div>
                          <label className="block text-xs font-bold text-brand-textMuted dark:text-slate-400 uppercase tracking-wide mb-2">Date Range</label>
                          <div className="relative">
                            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-textMuted h-4 w-4" />
                            <select
                              value={advFilters.dateRange}
                              onChange={(e) => setAdvFilters((p) => ({ ...p, dateRange: e.target.value }))}
                              className="w-full pl-9 pr-4 py-3 bg-brand-surface dark:bg-slate-800 text-brand-text border rounded-xl transition-all duration-200 outline-none border-brand-border dark:border-slate-700 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 text-sm"
                            >
                              {DATE_RANGES.map((dr) => <option key={dr.id} value={dr.id}>{dr.name}</option>)}
                            </select>
                          </div>
                        </div>

                        {/* Apply Advanced */}
                        <Button
                          onClick={() => performSearch({ advanced: true, page: 1 })}
                          className="w-full"
                          size="sm"
                        >
                          <FiSearch className="mr-1.5 h-3.5 w-3.5" /> Apply Advanced Filters
                        </Button>
                      </>
                    )}

                    {/* Sort */}
                    <div>
                      <label className="block text-xs font-bold text-brand-textMuted dark:text-slate-400 uppercase tracking-wide mb-2">Sort By</label>
                      <select
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        className="w-full px-4 py-3 bg-brand-surface dark:bg-slate-800 text-brand-text border rounded-xl transition-all duration-200 outline-none border-brand-border dark:border-slate-700 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 text-sm"
                      >
                        {SORT_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>{opt.name}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={clearAll}
                      className="text-sm text-brand-textMuted hover:text-brand-danger transition-colors font-medium"
                    >
                      Reset all
                    </button>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Input
                  type="text"
                  placeholder={advancedMode ? 'Advanced search — add filters on the left, then search...' : 'Search by name, title, company... (e.g. Ram, Kathmandu)'}
                  value={searchQuery}
                  onChange={handleSearchQueryChange}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); performSearch({ page: 1, advanced: advancedMode }); } }}
                  icon={FiSearch}
                  rightElement={
                    searchQuery ? (
                      <button onClick={() => { setSearchQuery(''); setSearchSuggestions([]); }} className="text-brand-textMuted hover:text-brand-text dark:hover:text-slate-200">
                        <FiX className="h-4 w-4" />
                      </button>
                    ) : null
                  }
                  className="!text-base"
                />
                {advancedMode && (
                  <span className="absolute right-12 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
                    Advanced
                  </span>
                )}
              </div>

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && searchSuggestions.length > 0 && searchQuery.length >= 2 && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                    <Card elevation="md" className="absolute z-30 w-full mt-1 p-2">
                      {searchSuggestions.map((s, i) => {
                        const text = typeof s === 'string' ? s : (s?.text || String(s));
                        const type = typeof s === 'object' ? s?.type : null;
                        return (
                          <button
                            key={i}
                            onClick={() => { handleSuggestionClick(s); setShowSuggestions(false); }}
                            className="w-full text-left px-3 py-2 text-sm text-brand-text dark:text-slate-300 hover:bg-brand-surface dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <FiSearch className="inline mr-2 h-3 w-3 text-brand-textMuted" />{text}
                            {type && <span className="ml-2 text-[10px] uppercase tracking-wide text-brand-textMuted/60 dark:text-slate-500 font-medium">{type}</span>}
                          </button>
                        );
                      })}
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Results Header */}
            {searchQuery.trim() && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
                <div>
                  <h2 className="text-xl font-bold text-brand-text dark:text-white">
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-5 w-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                        Searching...
                      </span>
                    ) : (
                      <>Found <span className="text-brand-primary">{totalResults}</span> cards for "<span className="text-brand-primary">{searchQuery}</span>"</>
                    )}
                  </h2>
                  {activeAlgorithm !== 'basic' && (
                    <span className="inline-flex items-center mt-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-brand-primary/10 text-brand-primary dark:bg-emerald-900/40 dark:text-emerald-400">
                      {ALGORITHM_LABELS[activeAlgorithm] || activeAlgorithm}
                    </span>
                  )}
                </div>

                {/* Inline Sort */}
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-brand-textMuted dark:text-slate-400">Sort:</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="px-3 py-1.5 bg-brand-surface dark:bg-slate-800 text-brand-text border rounded-lg text-sm transition-all outline-none border-brand-border dark:border-slate-700 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Loading Skeletons */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} elevation="none" className="p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <Skeleton variant="title" />
                        <Skeleton variant="text" className="w-2/3" />
                      </div>
                      <Skeleton variant="avatar" className="!h-8 !w-8" />
                    </div>
                    <Skeleton variant="text" />
                    <Skeleton variant="text" className="w-1/2" />
                    <Skeleton variant="button" className="w-full mt-2" />
                  </Card>
                ))}
              </div>
            )}

            {/* Results Grid */}
            {!loading && searchResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <AnimatePresence>
                  {searchResults.map((card, idx) => (
                    <motion.div
                      key={card._id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{ duration: 0.2, delay: idx * 0.04 }}
                    >
                      <Card elevation="sm" hoverLift className="flex flex-col h-full">
                        {/* Card top section */}
                        <div className="p-5 border-b border-brand-border/30 dark:border-slate-700/60">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-brand-text dark:text-slate-200 truncate group-hover:text-brand-primary transition-colors">
                                {card.title || card.fullName || 'Untitled Card'}
                              </h3>
                              {card.fullName && card.title !== card.fullName && (
                                <p className="text-sm text-brand-textMuted dark:text-slate-400 mt-0.5 truncate">{card.fullName}</p>
                              )}
                              {card.jobTitle && (
                                <p className="text-xs text-brand-textMuted dark:text-slate-400 mt-0.5 flex items-center gap-1">
                                  <FiBriefcase className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{card.jobTitle}{card.company ? ` at ${card.company}` : ''}</span>
                                </p>
                              )}
                              {card.industry && (
                                <p className="text-xs text-brand-textMuted dark:text-slate-400 mt-0.5 flex items-center gap-1">
                                  <FiBriefcase className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{card.industry}</span>
                                </p>
                              )}
                              {card.address && (
                                <p className="text-xs text-brand-textMuted dark:text-slate-400 mt-0.5 flex items-center gap-1">
                                  <FiMapPin className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{card.address}</span>
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                              <button
                                onClick={() => handleLove(card._id)}
                                className="p-1.5 text-brand-textMuted dark:text-slate-500 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                title={isAuthenticated ? (card.isLoved ? 'Unlike' : 'Like') : 'Log in to like'}
                              >
                                {card.isLoved ? <FaHeart className="h-4 w-4 text-red-500" /> : <FaRegHeart className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => handleSave(card._id)}
                                className="p-1.5 text-brand-textMuted dark:text-slate-500 hover:text-brand-primary transition-colors rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                title={isAuthenticated ? (card.isSaved ? 'Unsave' : 'Save') : 'Log in to save'}
                              >
                                {card.isSaved ? <FaBookmark className="h-4 w-4 text-brand-primary" /> : <FaRegBookmark className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Card body */}
                        <div className="p-5 flex flex-col flex-grow">
                          {card.bio && (
                            <p className="text-sm text-brand-textMuted dark:text-slate-400 line-clamp-2 mb-4">{card.bio}</p>
                          )}

                          <div className="flex items-center gap-3 text-xs text-brand-textMuted dark:text-slate-500 mb-4">
                            {card.views != null && (
                              <span className="flex items-center gap-1">
                                <FiEye className="h-3 w-3" />
                                {card.views}
                              </span>
                            )}
                            {card.loveCount != null && (
                              <span className="flex items-center gap-1">
                                <FiHeart className="h-3 w-3" />
                                {card.loveCount}
                              </span>
                            )}
                            {card.shortLink && (
                              <span className="ml-auto font-mono text-[10px] text-brand-textMuted/50 dark:text-slate-400">{card.shortLink}</span>
                            )}
                          </div>

                          <div className="mt-auto">
                            <a
                              href={`/c/${card.shortLink}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              View Card <FiExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Empty state: no query yet */}
            {!loading && !hasSearched && searchResults.length === 0 && (
              <div className="text-center py-20">
                <Card elevation="sm" className="p-10 max-w-lg mx-auto">
                  <FiSearch className="h-14 w-14 text-brand-textMuted/30 dark:text-slate-700 mx-auto mb-5" />
                  <h3 className="text-lg font-bold text-brand-text dark:text-white mb-2">What are you looking for?</h3>
                  <p className="text-sm text-brand-textMuted dark:text-slate-400 mb-6">
                    Search by name, title, company, or switch to <strong>Advanced</strong> to filter by industry, skills, job title, and more.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Button onClick={() => setAdvancedMode(true)} variant="outline" size="sm">
                      <FiZap className="mr-1.5 h-3.5 w-3.5" /> Try Advanced Search
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Empty state: no results */}
            {!loading && hasSearched && searchResults.length === 0 && (
              <div className="text-center py-16">
                <Card elevation="sm" className="p-10 max-w-md mx-auto">
                  <FiSearch className="h-14 w-14 text-brand-textMuted/30 dark:text-slate-700 mx-auto mb-5 animate-pulse" />
                  <h3 className="text-lg font-bold text-brand-text dark:text-white mb-2">No results found</h3>
                  <p className="text-sm text-brand-textMuted dark:text-slate-400 mb-6">
                    No cards match "{searchQuery}". Try different keywords or adjust your filters.
                  </p>
                  <Button onClick={clearAll} variant="outline" size="sm">Clear Search</Button>
                </Card>
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <div className="flex gap-1.5">
                  {pageNumbers.map((page, idx) =>
                    page === '...' ? (
                      <span key={`ellipsis-${idx}`} className="flex items-center px-2 text-brand-textMuted text-sm">...</span>
                    ) : (
                      <Button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        variant={currentPage === page ? 'primary' : 'ghost'}
                        size="sm"
                        className={currentPage === page ? 'shadow-md' : 'bg-brand-surface dark:bg-slate-800 border border-brand-border dark:border-slate-700'}
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Related Cards (from recommendation engine) */}
            {!loading && searchResults.length > 0 && (relatedCards.length > 0 || relatedLoading) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="mt-10"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="bg-emerald-100 dark:bg-emerald-900/40 p-2 rounded-xl">
                    <FiTrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brand-text dark:text-white">Related Cards</h3>
                    <p className="text-xs text-brand-textMuted dark:text-slate-400">Based on "{searchResults[0]?.fullName || searchResults[0]?.title || searchQuery}"</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                  {relatedLoading && relatedCards.length === 0 && Array(4).fill(0).map((_, i) => (
                    <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                  ))}
                  {relatedCards.map((card, idx) => (
                    <motion.div
                      key={card._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                    >
                      <Card elevation="sm" hoverLift className="flex flex-col h-full">
                        <div className="p-4 border-b border-brand-border/30 dark:border-slate-700/60">
                          <h4 className="font-semibold text-brand-text dark:text-slate-200 text-sm truncate">
                            {card.fullName || card.title || 'Untitled'}
                          </h4>
                          {(card.jobTitle || card.company) && (
                            <p className="text-xs text-brand-textMuted dark:text-slate-400 mt-0.5 truncate">
                              {[card.jobTitle, card.company].filter(Boolean).join(' at ')}
                            </p>
                          )}
                          {card.similarityScore != null && card.similarityScore > 0 && (
                            <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                              {Math.round(card.similarityScore)}% match
                            </span>
                          )}
                        </div>
                        <div className="p-4 mt-auto">
                          <a
                            href={`/c/${card.shortLink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-sm font-medium py-2 px-3 rounded-xl transition-all duration-200"
                          >
                            View <FiExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
