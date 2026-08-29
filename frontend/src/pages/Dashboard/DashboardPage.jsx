import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchUserCards, deleteCard } from '../../features/cards/cardsThunks';
import { 
  FiPlus, FiEye, FiEdit, FiTrash2, FiShare, 
  FiUsers, FiHeart, FiDownload,
  FiCreditCard, FiGrid, FiList, FiSearch
} from 'react-icons/fi';
import { FaQrcode } from 'react-icons/fa';
import { motion } from 'framer-motion';
import CardPreview from '../../components/Cards/CardPreview';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Skeleton from '../../components/ui/Skeleton';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
    if (isAuthenticated) {
      dispatch(fetchUserCards({ page: 1, limit: 50 }));
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
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
      try {
        await dispatch(deleteCard(cardId)).unwrap();
        dispatch(fetchUserCards());
      } catch (err) {
        alert(`Failed to delete card: ${err?.message || 'Unknown error'}`);
      }
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
    <div className="min-h-screen bg-brand-background dark:bg-slate-950 transition-colors duration-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-brand-text dark:text-white tracking-tight mb-2">
            Welcome back, {user?.name || user?.username || 'User'}!
          </h1>
          <p className="text-brand-textMuted text-sm">
            Manage your digital business cards and track their performance
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-brand-danger/10 border border-brand-danger/20 rounded-xl text-brand-danger">
            <h3 className="font-bold mb-1">Error Loading Data</h3>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
          {[
            { label: 'Total Cards', val: stats.totalCards, icon: FiCreditCard, color: 'text-brand-primary bg-brand-primary/10' },
            { label: 'Total Views', val: stats.totalViews, icon: FiEye, color: 'text-emerald-500 bg-emerald-500/10' },
            { label: 'Total Loves', val: stats.totalLoves, icon: FiHeart, color: 'text-brand-danger bg-brand-danger/10' },
            { label: 'Total Shares', val: stats.totalShares, icon: FiShare, color: 'text-brand-secondary bg-brand-secondary/10' },
            { label: 'Downloads', val: stats.totalDownloads, icon: FiDownload, color: 'text-brand-accent bg-brand-accent/10' }
          ].map((stat, idx) => (
            <Card key={idx} elevation="sm" className="p-5 flex items-center gap-4 hover-lift bg-brand-surface dark:bg-slate-900 border border-brand-border/40 dark:border-slate-800/80">
              <div className={`p-3 rounded-xl ${stat.color} flex-shrink-0`}>
                <stat.icon className="text-xl" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-brand-textMuted truncate uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-brand-text dark:text-white mt-0.5">{stat.val}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card elevation="sm" className="p-6 mb-8 bg-brand-surface dark:bg-slate-900 border border-brand-border/40 dark:border-slate-800/80">
          <h2 className="text-lg font-bold text-brand-text dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button onClick={() => navigate('/cards/add')} variant="primary" className="justify-center py-3.5 shadow-md">
              <FiPlus className="mr-2 text-lg" />
              Create New Card
            </Button>
            <Button onClick={() => navigate('/discover')} variant="secondary" className="justify-center py-3.5 shadow-md">
              <FiEye className="mr-2 text-lg" />
              Discover Cards
            </Button>
            <Button onClick={() => navigate('/search')} variant="outline" className="justify-center py-3.5 border-brand-primary text-brand-primary">
              <FiSearch className="mr-2 text-lg" />
              Advanced Search
            </Button>
            <Button onClick={() => navigate('/library')} variant="ghost" className="justify-center py-3.5 bg-brand-background dark:bg-slate-800 hover:bg-brand-border">
              <FiUsers className="mr-2 text-lg" />
              My Library
            </Button>
          </div>
        </Card>

        {/* Cards Management */}
        <Card elevation="sm" className="bg-brand-surface dark:bg-slate-900 border border-brand-border/40 dark:border-slate-800/80">
          <div className="p-6 border-b border-brand-border/40 dark:border-slate-800/80">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-brand-text dark:text-white">
                My Visiting Cards ({filteredCards.length})
              </h2>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="w-full sm:w-60">
                  <Input
                    type="text"
                    placeholder="Search cards..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={FiSearch}
                    className="!gap-0"
                  />
                </div>

                {/* Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-brand-surface dark:bg-slate-800 border border-brand-border dark:border-slate-700 rounded-xl text-sm font-medium text-brand-text outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all cursor-pointer h-11"
                >
                  <option value="all">All Cards</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex border border-brand-border dark:border-slate-700 rounded-xl overflow-hidden h-11">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 flex items-center justify-center transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-brand-primary text-white' : 'bg-transparent text-brand-textMuted hover:text-brand-primary'}`}
                    aria-label="Grid View"
                  >
                    <FiGrid className="text-lg" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 flex items-center justify-center transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-brand-primary text-white' : 'bg-transparent text-brand-textMuted hover:text-brand-primary'}`}
                    aria-label="List View"
                  >
                    <FiList className="text-lg" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cards Grid/List */}
          <div className="p-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <Card key={n} elevation="none" className="p-4 flex flex-col gap-3">
                    <Skeleton variant="card" className="h-44" />
                    <Skeleton variant="title" />
                    <Skeleton variant="text" />
                    <div className="flex gap-2 mt-2">
                      <Skeleton variant="button" className="flex-1" />
                      <Skeleton variant="button" className="w-10" />
                      <Skeleton variant="button" className="w-10" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredCards.length === 0 ? (
              <div className="text-center py-16 px-4">
                <FiCreditCard className="text-6xl text-brand-textMuted mx-auto mb-4 animate-bounce" />
                <h3 className="text-xl font-bold text-brand-text dark:text-white mb-2">No Cards Found</h3>
                <p className="text-sm text-brand-textMuted max-w-sm mx-auto mb-6">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Adjust your filters or query and try searching again.'
                    : 'Create your digital visiting card to display it on your personal dashboard.'
                  }
                </p>
                {!searchTerm && filterStatus === 'all' && (
                  <Button onClick={() => navigate('/cards/add')} variant="primary" className="shadow-md">
                    <FiPlus className="mr-2" />
                    Create Your First Card
                  </Button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCards.map((card) => (
                  <motion.div
                    key={card._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card elevation="sm" className="hover-lift bg-brand-surface dark:bg-slate-900 border border-brand-border/40 dark:border-slate-800/80 flex flex-col h-full">
                      {/* Card Preview Container */}
                      <div className="h-48 overflow-hidden bg-brand-background dark:bg-slate-950 border-b border-brand-border/40 dark:border-slate-800/80 relative">
                        <CardPreview 
                          card={card} 
                          template={card.template || null}
                          className="h-full w-full object-cover"
                          showActions={false}
                        />
                      </div>

                      {/* Details */}
                      <div className="p-5 flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="font-bold text-brand-text dark:text-white truncate text-base">
                              {card.title}
                            </h3>
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                              card.isPublic 
                                ? 'bg-brand-success/10 text-brand-success' 
                                : 'bg-brand-textMuted/10 text-brand-textMuted'
                            }`}>
                              {card.isPublic ? 'Public' : 'Private'}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 py-3 border-y border-brand-border/30 dark:border-slate-800/60 my-4 text-center text-xs text-brand-textMuted">
                            <div>
                              <p className="font-bold text-brand-text dark:text-white text-sm">{card.views || 0}</p>
                              <p className="text-[10px] uppercase font-semibold tracking-wide mt-0.5">Views</p>
                            </div>
                            <div>
                              <p className="font-bold text-brand-text dark:text-white text-sm">{card.loveCount || 0}</p>
                              <p className="text-[10px] uppercase font-semibold tracking-wide mt-0.5">Loves</p>
                            </div>
                            <div>
                              <p className="font-bold text-brand-text dark:text-white text-sm">{card.downloads || 0}</p>
                              <p className="text-[10px] uppercase font-semibold tracking-wide mt-0.5">Downloads</p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-2">
                          <Link
                            to={`/c/${card.shortLink}`}
                            className="flex-1 bg-brand-primary hover:bg-brand-primaryHover text-white font-bold text-xs py-2 px-3 rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <FiEye />
                            View
                          </Link>
                          
                          <button
                            onClick={() => handleShareCard(card)}
                            className="bg-brand-background dark:bg-slate-800 hover:bg-brand-border dark:hover:bg-slate-700 text-brand-textMuted p-2.5 rounded-xl transition-colors cursor-pointer"
                            title="Share Card"
                          >
                            <FiShare />
                          </button>
                          
                          <Link
                            to={`/cards/edit/${card._id}`}
                            className="bg-brand-background dark:bg-slate-800 hover:bg-brand-border dark:hover:bg-slate-700 text-brand-textMuted p-2.5 rounded-xl transition-colors inline-flex items-center justify-center"
                            title="Edit Card"
                          >
                            <FiEdit />
                          </Link>
                          
                          <button
                            onClick={() => handleDeleteCard(card._id)}
                            className="bg-brand-danger/10 hover:bg-brand-danger/25 text-brand-danger p-2.5 rounded-xl transition-colors cursor-pointer"
                            title="Delete Card"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {filteredCards.map((card) => (
                  <motion.div
                    key={card._id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-brand-background dark:bg-slate-800/40 border border-brand-border/40 dark:border-slate-800/60 rounded-xl hover:bg-brand-background/60 dark:hover:bg-slate-800/60 transition-all"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary flex-shrink-0">
                        <FiCreditCard className="text-xl" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-brand-text dark:text-white truncate text-base">{card.title}</h3>
                        <p className="text-xs text-brand-textMuted font-mono truncate">{card.shortLink}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 self-end sm:self-center">
                      <div className="flex gap-4 text-xs font-semibold text-brand-textMuted">
                        <span className="flex items-center gap-1">
                          <FiEye />
                          {card.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiHeart />
                          {card.loveCount || 0}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${
                          card.isPublic ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-textMuted/10 text-brand-textMuted'
                        }`}>
                          {card.isPublic ? 'Public' : 'Private'}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          to={`/c/${card.shortLink}`}
                          className="bg-brand-primary hover:bg-brand-primaryHover text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleShareCard(card)}
                          className="bg-brand-border/40 dark:bg-slate-700 hover:bg-brand-border dark:hover:bg-slate-650 text-brand-textMuted px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          Share
                        </button>
                        <Link
                          to={`/cards/edit/${card._id}`}
                          className="bg-brand-border/40 dark:bg-slate-700 hover:bg-brand-border dark:hover:bg-slate-650 text-brand-textMuted px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteCard(card._id)}
                          className="bg-brand-danger/10 hover:bg-brand-danger/20 text-brand-danger px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
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
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;