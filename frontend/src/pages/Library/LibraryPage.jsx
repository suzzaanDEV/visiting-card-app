import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiBookmark, FiInbox, FiExternalLink, FiGrid, FiSearch,
  FiRefreshCw, FiHeart, FiEye, FiTrash2, FiClock
} from 'react-icons/fi';
import CardPreview from '../../components/Cards/CardPreview';
import SavedCardViewer from '../../components/Library/SavedCardViewer';
import DeleteConfirmationModal from '../../components/Library/DeleteConfirmationModal';
import QuickViewModal from '../../components/Library/QuickViewModal';
import {
  fetchSavedCards,
  removeFromLibrary,
  fetchLibraryStats
} from '../../features/library/libraryThunks';
import { clearLibraryError } from '../../features/library/librarySlice';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Skeleton from '../../components/ui/Skeleton';

const LibraryPage = () => {
  const dispatch = useDispatch();
  const { items: savedCards, isLoading: loading, error, stats } = useSelector(state => state.library);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCard, setSelectedCard] = useState(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cardToQuickView, setCardToQuickView] = useState(null);
  const [showQuickViewModal, setShowQuickViewModal] = useState(false);

  useEffect(() => {
    dispatch(fetchSavedCards({}));
    dispatch(fetchLibraryStats());
  }, [dispatch]);

  const handleRemoveFromLibrary = async (cardId) => {
    try {
      setIsDeleting(true);
      await dispatch(removeFromLibrary(cardId));
      await dispatch(fetchSavedCards({}));
      await dispatch(fetchLibraryStats());
      toast.success('Card removed from library successfully!');
    } catch (error) {
      toast.error('Failed to remove card from library');
      console.error('Remove card error:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setCardToDelete(null);
    }
  };

  const handleDeleteClick = (card) => {
    setCardToDelete(card);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (cardToDelete) {
      await handleRemoveFromLibrary(cardToDelete._id);
    }
  };

  const handleViewCard = (card) => {
    setSelectedCard(card);
    setShowCardModal(true);
  };

  const handleQuickView = (card) => {
    setCardToQuickView(card);
    setShowQuickViewModal(true);
  };

  const handleViewFullFromQuick = () => {
    setSelectedCard(cardToQuickView);
    setShowCardModal(true);
    setShowQuickViewModal(false);
    setCardToQuickView(null);
  };

  const cardsArray = Array.isArray(savedCards) ? savedCards : [];
  
  const filteredCards = cardsArray.filter(card => {
    const matchesSearch = card.cardId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.cardId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || card.cardId?.templateId === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(cardsArray.map(card => card.cardId?.templateId).filter(Boolean)))];

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-background dark:bg-slate-950 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-brand-textMuted text-sm font-semibold">Loading your library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-background dark:bg-slate-950 flex items-center justify-center py-20 px-4">
        <Card elevation="sm" className="p-8 max-w-md mx-auto text-center bg-brand-surface dark:bg-slate-900 border border-brand-danger/20">
          <h3 className="text-lg font-bold text-brand-danger mb-2">Error Loading Library</h3>
          <p className="text-xs text-brand-textMuted mb-6">{error}</p>
          <Button
            onClick={() => {
              dispatch(clearLibraryError());
              dispatch(fetchSavedCards({}));
            }}
            variant="danger"
          >
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-background dark:bg-slate-950 transition-colors duration-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/40 dark:border-slate-800/80 pb-6 mb-8">
          <div className="flex items-center gap-3">
            <FiBookmark className="h-8 w-8 text-brand-primary" />
            <div>
              <h1 className="text-3xl font-extrabold text-brand-text dark:text-white tracking-tight">Saved Library</h1>
              <p className="text-xs text-brand-textMuted mt-0.5">Your personal catalog of digital business cards</p>
            </div>
          </div>
          <div className="text-sm font-bold text-brand-primary py-1 px-3 bg-brand-primary/10 rounded-full select-none self-start sm:self-center">
            {stats?.totalSaved || 0} saved cards
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Saved', val: stats?.totalSaved || 0, icon: FiBookmark, color: 'text-brand-primary bg-brand-primary/10' },
            { label: 'Recent Saves', val: stats?.recentSaves || 0, icon: FiClock, color: 'text-brand-success bg-brand-success/10' },
            { label: 'Saved Categories', val: stats?.categoryStats?.length || 0, icon: FiGrid, color: 'text-brand-secondary bg-brand-secondary/10' }
          ].map((stat, idx) => (
            <Card key={idx} elevation="sm" className="p-5 flex items-center gap-4 hover-lift bg-brand-surface dark:bg-slate-900 border border-brand-border/40 dark:border-slate-800/80">
              <div className={`p-3 rounded-xl ${stat.color} flex-shrink-0 flex items-center justify-center min-w-10 min-h-10`}>
                {typeof stat.icon === 'function' ? stat.icon() : <stat.icon className="text-xl" />}
              </div>
              <div>
                <p className="text-xs font-semibold text-brand-textMuted uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-brand-text dark:text-white mt-0.5">{stat.val}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Search & Filters */}
        <Card elevation="sm" className="p-5 mb-8 bg-brand-surface dark:bg-slate-900 border border-brand-border/40 dark:border-slate-800/80">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:flex-grow">
              <Input
                type="text"
                placeholder="Search saved cards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={FiSearch}
                className="!gap-0"
              />
            </div>
            
            <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 bg-brand-surface dark:bg-slate-800 border border-brand-border dark:border-slate-700 rounded-xl text-sm font-medium text-brand-text outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all cursor-pointer h-11"
              >
                {categories.map(category => (
                  <option key={category} value={category} className="bg-brand-surface dark:bg-slate-800">
                    {category === 'all' ? 'All Templates' : `Template: ${category}`}
                  </option>
                ))}
              </select>
              
              <div className="flex border border-brand-border dark:border-slate-700 rounded-xl overflow-hidden h-11 select-none">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 flex items-center justify-center cursor-pointer transition-colors ${viewMode === 'grid' ? 'bg-brand-primary text-white' : 'text-brand-textMuted hover:text-brand-primary'}`}
                >
                  <FiGrid className="text-lg" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 flex items-center justify-center cursor-pointer transition-colors ${viewMode === 'list' ? 'bg-brand-primary text-white' : 'text-brand-textMuted hover:text-brand-primary'}`}
                >
                  <FiInbox className="text-lg" />
                </button>
              </div>
              
              <Button
                onClick={() => dispatch(fetchSavedCards({}))}
                variant="outline"
                className="h-11 border-brand-border hover:bg-brand-background/60"
              >
                <FiRefreshCw className="mr-1.5" />
                Refresh
              </Button>
            </div>
          </div>
        </Card>

        {/* Empty State */}
        {filteredCards.length === 0 ? (
          <div className="text-center py-16">
            <Card elevation="sm" className="p-10 max-w-sm mx-auto bg-brand-surface dark:bg-slate-900 border border-brand-border/40 dark:border-slate-800/80">
              <FiBookmark className="h-14 w-14 text-brand-textMuted mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-bold text-brand-text dark:text-white mb-2">No Saved Cards</h3>
              <p className="text-xs text-brand-textMuted mb-6">
                Your directory query did not match any stored records.
              </p>
              {(searchTerm || filterCategory !== 'all') && (
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCategory('all');
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              )}
            </Card>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredCards.map((savedCard) => (
                <motion.div
                  key={savedCard._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card 
                    elevation="sm" 
                    className="hover-lift bg-brand-surface dark:bg-slate-900 border border-brand-border/40 dark:border-slate-800/80 flex flex-col h-full relative group"
                    onClick={() => handleQuickView(savedCard.cardId)}
                  >
                    {/* Card Preview Container */}
                    <div className="h-48 overflow-hidden bg-brand-background dark:bg-slate-950 border-b border-brand-border/40 dark:border-slate-800/80 relative">
                      <CardPreview
                        card={savedCard.cardId}
                        template={savedCard.cardId?.templateId ? { id: savedCard.cardId.templateId } : null}
                        className="h-full w-full object-cover"
                        showActions={false}
                      />
                      
                      {/* Action Overlays visible on hover */}
                      <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickView(savedCard.cardId);
                          }}
                          className="p-2 bg-brand-primary text-white rounded-lg shadow hover:bg-brand-primaryHover transition-colors cursor-pointer"
                          title="Quick View"
                        >
                          <FiEye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewCard(savedCard.cardId);
                          }}
                          className="p-2 bg-brand-secondary text-white rounded-lg shadow hover:bg-brand-secondaryHover transition-colors cursor-pointer"
                          title="View Full Details"
                        >
                          <FiExternalLink className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(savedCard.cardId);
                          }}
                          className="p-2 bg-brand-danger text-white rounded-lg shadow hover:bg-red-650 transition-colors cursor-pointer"
                          title="Remove from Library"
                        >
                          <FiTrash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <h3 className="font-bold text-brand-text dark:text-white truncate text-base">
                            {savedCard.cardId?.title || 'Untitled Card'}
                          </h3>
                          <span className="px-2 py-0.5 text-[9px] font-bold bg-brand-primary/10 text-brand-primary uppercase rounded-full select-none">
                            {savedCard.cardId?.templateId || 'Custom'}
                          </span>
                        </div>
                        
                        <p className="text-xs text-brand-textMuted font-semibold mb-4">
                          by {savedCard.cardId?.ownerUserId?.name || 'Unknown User'}
                        </p>

                        {savedCard.notes && (
                          <div className="mb-4 p-3 bg-brand-background dark:bg-slate-800 border border-brand-border/40 dark:border-slate-850 rounded-xl">
                            <p className="text-xs text-brand-text dark:text-brand-textMuted/95 line-clamp-2 leading-relaxed">{savedCard.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-brand-textMuted text-[10px] uppercase font-bold border-t border-brand-border/20 dark:border-slate-800/40 pt-3.5">
                        <span>Saved: {new Date(savedCard.savedAt).toLocaleDateString()}</span>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <FiEye />
                            {savedCard.cardId?.views || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiHeart />
                            {savedCard.cardId?.loveCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* List View */
          <Card elevation="sm" className="bg-brand-surface dark:bg-slate-900 border border-brand-border/40 dark:border-slate-800/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-brand-text border-collapse">
                <thead className="bg-brand-background dark:bg-slate-800 text-xs font-bold text-brand-textMuted uppercase tracking-wider border-b border-brand-border dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Card Profile</th>
                    <th className="px-6 py-4">Owner Name</th>
                    <th className="px-6 py-4">Template Layout</th>
                    <th className="px-6 py-4">Saved On</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40 dark:divide-slate-800/80">
                  {filteredCards.map((savedCard) => (
                    <tr key={savedCard._id} className="hover:bg-brand-background/40 dark:hover:bg-slate-850/40 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-8 bg-gradient-to-r from-brand-primary/30 to-brand-secondary/30 rounded-lg flex-shrink-0"></div>
                          <div className="min-w-0">
                            <div className="font-bold text-brand-text dark:text-white truncate">
                              {savedCard.cardId?.title || 'Untitled Card'}
                            </div>
                            <div className="text-xs text-brand-textMuted truncate">
                              {savedCard.cardId?.fullName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-brand-text/90">
                        {savedCard.cardId?.ownerUserId?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 text-[10px] font-bold bg-brand-primary/10 text-brand-primary uppercase rounded-full select-none">
                          {savedCard.cardId?.templateId || 'Custom'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-brand-textMuted text-xs font-semibold">
                        {new Date(savedCard.savedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleQuickView(savedCard.cardId)}
                            className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-colors cursor-pointer"
                            title="Quick View"
                          >
                            <FiEye className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => handleViewCard(savedCard.cardId)}
                            className="p-2 text-brand-secondary hover:bg-brand-secondary/10 rounded-xl transition-colors cursor-pointer"
                            title="View Full Details"
                          >
                            <FiExternalLink className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(savedCard.cardId)}
                            className="p-2 text-brand-danger hover:bg-brand-danger/10 rounded-xl transition-colors cursor-pointer"
                            title="Remove from Library"
                          >
                            <FiTrash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Enhanced Card Viewer */}
      <SavedCardViewer
        card={selectedCard}
        isOpen={showCardModal}
        onClose={() => setShowCardModal(false)}
        onRemove={handleRemoveFromLibrary}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCardToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        cardName={cardToDelete?.title || cardToDelete?.fullName || 'this card'}
        isLoading={isDeleting}
      />

      {/* Quick View Modal */}
      <QuickViewModal
        card={cardToQuickView}
        isOpen={showQuickViewModal}
        onClose={() => {
          setShowQuickViewModal(false);
          setCardToQuickView(null);
        }}
        onViewFull={handleViewFullFromQuick}
      />
    </div>
  );
};

export default LibraryPage;
