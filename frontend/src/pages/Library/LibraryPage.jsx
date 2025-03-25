import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiBookmark, FiInbox, FiLoader, FiExternalLink, FiGrid, FiSearch,
  FiFilter, FiRefreshCw, FiHeart, FiShare2, FiDownload, FiEye,
  FiTrash2, FiEdit, FiStar, FiClock, FiUser, FiMapPin, FiMail,
  FiPhone, FiGlobe, FiAlertCircle, FiX
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

const LibraryPage = () => {
  const dispatch = useDispatch();
  const { items: savedCards, isLoading: loading, error, stats } = useSelector(state => state.library);
  const { user } = useSelector(state => state.auth);

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
    console.log('Delete clicked for card:', card);
    setCardToDelete(card);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (cardToDelete) {
      await handleRemoveFromLibrary(cardToDelete._id);
    }
  };

  const handleViewCard = (card) => {
    console.log('View card clicked for card:', card);
    setSelectedCard(card);
    setShowCardModal(true);
  };

  const handleQuickView = (card) => {
    console.log('Quick view clicked for card:', card);
    setCardToQuickView(card);
    setShowQuickViewModal(true);
  };

  const handleViewFullFromQuick = () => {
    console.log('View full from quick clicked');
    setSelectedCard(cardToQuickView);
    setShowCardModal(true);
    setShowQuickViewModal(false);
    setCardToQuickView(null);
  };

  // Ensure savedCards is always an array
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
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-lg">Loading Library...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <FiAlertCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
          <div className="text-lg mb-2">Error Loading Library</div>
          <div className="text-sm text-white/60">{error}</div>
          <button
            onClick={() => {
              dispatch(clearLibraryError());
              dispatch(fetchSavedCards({}));
            }}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <FiBookmark className="h-8 w-8 text-white mr-3" />
              <h1 className="text-2xl font-bold text-white">My Library</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-white/60 text-sm">
                {stats?.totalSaved || 0} saved cards
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <FiBookmark className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-white/60 text-sm">Total Saved</p>
                <p className="text-2xl font-bold text-white">{stats?.totalSaved || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <FiClock className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-white/60 text-sm">Recent Saves</p>
                <p className="text-2xl font-bold text-white">{stats?.recentSaves || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <FiGrid className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-white/60 text-sm">Categories</p>
                <p className="text-2xl font-bold text-white">{stats?.categoryStats?.length || 0}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
                <input
                  type="text"
                  placeholder="Search saved cards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category} className="bg-gray-800">
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              
              <div className="flex bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' ? 'bg-white text-blue-900' : 'text-white hover:bg-white/10'
                  }`}
                >
                  <FiGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' ? 'bg-white text-blue-900' : 'text-white hover:bg-white/10'
                  }`}
                >
                  <FiInbox className="h-4 w-4" />
                </button>
              </div>
              
              <button
                onClick={() => dispatch(fetchSavedCards({}))}
                className="flex items-center px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                <FiRefreshCw className="mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Cards Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredCards.map((savedCard, index) => (
                <motion.div
                  key={savedCard._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden hover:bg-white/20 transition-colors cursor-pointer"
                  onClick={() => handleQuickView(savedCard.cardId)}
                >
                  {/* Card Preview */}
                  <div className="h-48 relative group">
                    <CardPreview
                      card={savedCard.cardId}
                      template={savedCard.cardId?.templateId ? { id: savedCard.cardId.templateId } : null}
                      className="h-full"
                      showActions={false}
                    />
                    
                    {/* Actions Overlay */}
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickView(savedCard.cardId);
                        }}
                        className="p-1 bg-blue-500/90 rounded text-white hover:bg-blue-600 transition-colors"
                        title="Quick View"
                      >
                        <FiEye className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewCard(savedCard.cardId);
                        }}
                        className="p-1 bg-white/90 rounded text-gray-700 hover:bg-white transition-colors"
                        title="View Full Details"
                      >
                        <FiExternalLink className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(savedCard.cardId);
                        }}
                        className="p-1 bg-red-500/90 rounded text-white hover:bg-red-600 transition-colors"
                        title="Remove from Library"
                      >
                        <FiTrash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {savedCard.cardId?.title || 'Untitled Card'}
                      </h3>
                      <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                        {savedCard.cardId?.templateId || 'Custom'}
                      </span>
                    </div>
                    
                    <p className="text-white/60 text-sm mb-4">
                      by {savedCard.cardId?.ownerUserId?.name || 'Unknown'}
                    </p>

                    {savedCard.notes && (
                      <div className="mb-4 p-3 bg-white/5 rounded-lg">
                        <p className="text-white/80 text-sm">{savedCard.notes}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-white/40 text-xs">
                      <span>Saved: {new Date(savedCard.savedAt).toLocaleDateString()}</span>
                      <div className="flex items-center space-x-2">
                        <span className="flex items-center">
                          <FiEye className="mr-1" />
                          {savedCard.cardId?.views || 0}
                        </span>
                        <span className="flex items-center">
                          <FiHeart className="mr-1" />
                          {savedCard.cardId?.loveCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-white/60">Card</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-white/60">Owner</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-white/60">Template</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-white/60">Saved</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-white/60">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredCards.map((savedCard) => (
                    <tr key={savedCard._id} className="hover:bg-white/5">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-12 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded mr-3"></div>
                          <div>
                            <div className="text-white font-medium">
                              {savedCard.cardId?.title || 'Untitled Card'}
                            </div>
                            <div className="text-white/60 text-sm">
                              {savedCard.cardId?.fullName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/80">
                        {savedCard.cardId?.ownerUserId?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                          {savedCard.cardId?.templateId || 'Custom'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/60 text-sm">
                        {new Date(savedCard.savedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuickView(savedCard.cardId)}
                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                            title="Quick View"
                          >
                            <FiEye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleViewCard(savedCard.cardId)}
                            className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                            title="View Full Details"
                          >
                            <FiExternalLink className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(savedCard.cardId)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Remove from Library"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredCards.length === 0 && (
          <div className="text-center py-12">
            <FiBookmark className="h-16 w-16 text-white/40 mx-auto mb-4" />
            <p className="text-white/60 text-lg">No saved cards found</p>
            <p className="text-white/40 text-sm">Try adjusting your search or filters</p>
          </div>
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
