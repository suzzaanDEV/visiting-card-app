import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiCreditCard, FiSearch, FiFilter, FiEdit, FiTrash2, FiEye, FiStar,
  FiShare2, FiDownload, FiHeart, FiCalendar, FiUser, FiRefreshCw,
  FiMoreVertical, FiX, FiCheck, FiX as FiXIcon, FiTrendingUp, FiTrendingDown
} from 'react-icons/fi';
import { FaEye, FaHeart, FaShareAlt, FaDownload, FaCrown, FaUserShield } from 'react-icons/fa';
import AdminLayout from '../../components/Admin/AdminLayout';
import toast from 'react-hot-toast';

const CardManagement = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCards, setSelectedCards] = useState([]);
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    fetchCards();
  }, [currentPage, searchQuery, filterStatus, sortBy, sortOrder]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Admin authentication required');
        return;
      }

      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        search: searchQuery,
        sortBy,
        sortOrder,
        ...(filterStatus !== 'all' && { status: filterStatus })
      });

      const response = await fetch(`/api/admin/cards?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCards(data.cards || []);
        setTotalPages(data.totalPages || 1);
      } else {
        console.error('Failed to fetch cards:', response.status);
        toast.error('Failed to load cards');
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
      toast.error('Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  const handleCardAction = async (cardId, action, data = {}) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Admin authentication required');
        return;
      }

      let url = `/api/admin/cards/${cardId}`;
      let method = 'PUT';

      switch (action) {
        case 'feature':
          url += '/feature';
          method = 'POST';
          break;
        case 'delete':
          method = 'DELETE';
          break;
        case 'update':
          method = 'PUT';
          break;
        default:
          break;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: method !== 'DELETE' ? JSON.stringify(data) : undefined
      });

      if (response.ok) {
        toast.success(`Card ${action}ed successfully`);
        fetchCards();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || `Failed to ${action} card`);
      }
    } catch (error) {
      console.error(`Error ${action}ing card:`, error);
      toast.error(`Failed to ${action} card`);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedCards.length === 0) {
      toast.error('Please select cards first');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const promises = selectedCards.map(cardId => 
        handleCardAction(cardId, action)
      );

      await Promise.all(promises);
      setSelectedCards([]);
      toast.success(`Bulk ${action} completed`);
    } catch (error) {
      console.error(`Error bulk ${action}ing cards:`, error);
      toast.error(`Failed to bulk ${action} cards`);
    }
  };

  const CardItem = ({ card }) => {
    const isSelected = selectedCards.includes(card._id);
    
    // Safe data extraction with fallbacks
    const cardName = card.title || card.fullName || card.name || 'Untitled Card';
    const cardEmail = card.email || 'No email';
    const cardOwner = card.ownerUserId?.name || card.ownerUserId?.username || card.owner?.name || card.owner?.username || 'Unknown';
    const cardCompany = card.company || 'No company';
    const cardPhone = card.phone || 'No phone';
    const cardPosition = card.jobTitle || card.position || 'No position';
    
    // Safe date handling
    const createdDate = card.createdAt ? new Date(card.createdAt).toLocaleDateString() : 'Unknown';
    const updatedDate = card.updatedAt ? new Date(card.updatedAt).toLocaleDateString() : 'Unknown';
    
    // Safe stats with fallbacks
    const views = card.views || card.viewCount || 0;
    const loves = card.loveCount || card.loves || 0;
    const shares = card.shares || card.shareCount || 0;
    const downloads = card.downloads || card.downloadCount || 0;
    const templateName = card.template?.name || card.templateId?.name || 'Custom';
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 ${
          isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedCards([...selectedCards, card._id]);
                } else {
                  setSelectedCards(selectedCards.filter(id => id !== card._id));
                }
              }}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <FiCreditCard className="text-white h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {cardName}
                </h3>
                {card.isFeatured && (
                  <FiStar className="h-4 w-4 text-yellow-500" />
                )}
                {card.isActive !== false ? (
                  <FiCheck className="h-4 w-4 text-green-500" />
                ) : (
                  <FiXIcon className="h-4 w-4 text-red-500" />
                )}
              </div>
              <p className="text-gray-600 text-sm">{cardEmail}</p>
              <p className="text-gray-500 text-xs">{cardCompany} • {cardPosition}</p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <span>Created: {createdDate}</span>
                <span>Owner: {cardOwner}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSelectedCard(card);
                setShowCardModal(true);
              }}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View Details"
            >
              <FiEye className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleCardAction(card._id, 'feature')}
              className={`p-2 rounded-lg transition-colors ${
                card.isFeatured 
                  ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50' 
                  : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50'
              }`}
              title={card.isFeatured ? 'Unfeature' : 'Feature'}
            >
              <FiStar className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleCardAction(card._id, 'delete')}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Card"
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Card Stats */}
        <div className="mt-4 grid grid-cols-5 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{views}</div>
            <div className="text-xs text-gray-500">Views</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{loves}</div>
            <div className="text-xs text-gray-500">Loves</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{shares}</div>
            <div className="text-xs text-gray-500">Shares</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{downloads}</div>
            <div className="text-xs text-gray-500">Downloads</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{templateName}</div>
            <div className="text-xs text-gray-500">Template</div>
          </div>
        </div>
      </motion.div>
    );
  };

  const CardModal = ({ card, isOpen, onClose }) => {
    if (!card || !isOpen) return null;

    // Safe data extraction with fallbacks
    const cardName = card.title || card.fullName || card.name || 'Untitled Card';
    const cardEmail = card.email || 'No email';
    const cardPhone = card.phone || 'No phone';
    const cardCompany = card.company || 'No company';
    const cardPosition = card.jobTitle || card.position || 'No position';
    const cardWebsite = card.website || 'No website';
    const cardAddress = card.address || 'No address';
    const cardBio = card.bio || 'No bio';
    
    // Safe date handling
    const createdDate = card.createdAt ? new Date(card.createdAt).toLocaleDateString() : 'Unknown';
    const updatedDate = card.updatedAt ? new Date(card.updatedAt).toLocaleDateString() : 'Unknown';
    
    // Safe stats with fallbacks
    const views = card.views || card.viewCount || 0;
    const loves = card.loveCount || card.loves || 0;
    const shares = card.shares || card.shareCount || 0;
    const downloads = card.downloads || card.downloadCount || 0;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Card Details</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Card Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-gray-900">{cardName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{cardEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">{cardPhone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Company</label>
                    <p className="text-gray-900">{cardCompany}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Position</label>
                    <p className="text-gray-900">{cardPosition}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Website</label>
                    <p className="text-gray-900">{cardWebsite}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-gray-900">{cardAddress}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Bio</label>
                    <p className="text-gray-900">{cardBio}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      card.isActive !== false 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {card.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Featured</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      card.isFeatured 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {card.isFeatured ? 'Featured' : 'Not Featured'}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Privacy</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      card.privacy === 'private' || card.isPrivate
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {card.privacy === 'private' || card.isPrivate ? 'Private' : 'Public'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Views</span>
                    <span className="font-semibold">{views}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Loves</span>
                    <span className="font-semibold">{loves}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Shares</span>
                    <span className="font-semibold">{shares}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Downloads</span>
                    <span className="font-semibold">{downloads}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created</span>
                    <span className="font-semibold">{createdDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Updated</span>
                    <span className="font-semibold">{updatedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Short Link</span>
                    <span className="font-semibold text-blue-600">{card.shortLink || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => handleCardAction(card._id, 'feature')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  card.isFeatured
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                }`}
              >
                {card.isFeatured ? 'Unfeature' : 'Feature'}
              </button>
              <button
                onClick={() => handleCardAction(card._id, 'delete')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Delete Card
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout title="Card Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Card Management">
      {/* Header with Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Card Management</h1>
          <p className="text-gray-600">Manage all visiting cards and their settings</p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          {selectedCards.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('feature')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors"
              >
                Feature Selected ({selectedCards.length})
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Delete Selected ({selectedCards.length})
              </button>
              <button
                onClick={() => setSelectedCards([])}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear
              </button>
            </div>
          )}
          
          <button
            onClick={fetchCards}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiRefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Cards</option>
            <option value="active">Active Cards</option>
            <option value="inactive">Inactive Cards</option>
            <option value="featured">Featured Cards</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="createdAt">Created Date</option>
            <option value="name">Name</option>
            <option value="views">Views</option>
            <option value="loveCount">Loves</option>
            <option value="shares">Shares</option>
          </select>
          
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cards.map((card) => (
          <CardItem key={card._id} card={card} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-8">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg font-medium ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Card Modal */}
      <CardModal
        card={selectedCard}
        isOpen={showCardModal}
        onClose={() => {
          setShowCardModal(false);
          setSelectedCard(null);
        }}
      />
    </AdminLayout>
  );
};

export default CardManagement; 