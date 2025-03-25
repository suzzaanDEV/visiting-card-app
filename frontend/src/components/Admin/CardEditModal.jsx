import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCreditCard, FiEdit, FiSave, FiX, FiEye, FiHeart, FiShare, FiDownload,
  FiStar, FiTrendingUp, FiBarChart, FiCalendar, FiUser, FiLink
} from 'react-icons/fi';
import { FaQrcode, FaHeart, FaShareAlt, FaDownload } from 'react-icons/fa';

const CardEditModal = ({ card, isOpen, onClose, onSave, onFeature, onDelete, onAnalytics }) => {
  const [formData, setFormData] = useState({
    title: '',
    isPublic: true,
    isActive: true,
    featured: false
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    if (card) {
      setFormData({
        title: card.title || '',
        isPublic: card.isPublic !== false,
        isActive: card.isActive !== false,
        featured: card.featured || false
      });
    }
  }, [card]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    try {
      await onSave(card._id, formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving card:', error);
    }
  };

  const handleFeature = async () => {
    try {
      await onFeature(card._id, !card.featured);
    } catch (error) {
      console.error('Error featuring card:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(card._id);
      setShowDeleteModal(false);
      onClose();
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const handleAnalytics = async () => {
    try {
      const data = await onAnalytics(card._id);
      setAnalytics(data);
      setShowAnalytics(true);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (!isOpen || !card) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <FiCreditCard className="h-6 w-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Edit Card' : 'Card Details'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Card Info */}
              <div className="space-y-6">
                {/* Card Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FiTrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                    <span className="font-medium">Status</span>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      card.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {card.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      card.isPublic 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {card.isPublic ? 'Public' : 'Private'}
                    </span>
                    {card.featured && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isPublic"
                        checked={formData.isPublic}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Public</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Featured</span>
                    </label>
                  </div>
                </div>

                {/* Card Stats */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-purple-900 mb-3">Card Statistics</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <FiEye className="h-4 w-4 text-purple-600 mr-2" />
                      <span className="text-purple-600 font-medium">Views:</span>
                      <span className="ml-1 text-gray-700">{formatNumber(card.views || 0)}</span>
                    </div>
                    <div className="flex items-center">
                      <FaHeart className="h-4 w-4 text-red-600 mr-2" />
                      <span className="text-red-600 font-medium">Loves:</span>
                      <span className="ml-1 text-gray-700">{formatNumber(card.loveCount || 0)}</span>
                    </div>
                    <div className="flex items-center">
                      <FaShareAlt className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-green-600 font-medium">Shares:</span>
                      <span className="ml-1 text-gray-700">{formatNumber(card.shares || 0)}</span>
                    </div>
                    <div className="flex items-center">
                      <FaDownload className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-blue-600 font-medium">Downloads:</span>
                      <span className="ml-1 text-gray-700">{formatNumber(card.downloads || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Card Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Card Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Card ID:</span>
                      <span className="font-mono text-xs text-gray-700">{card._id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Short Link:</span>
                      <span className="font-mono text-xs text-gray-700">{card.shortLink}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Template:</span>
                      <span className="text-gray-700">{card.templateId || 'Custom'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="text-gray-700">{new Date(card.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Updated:</span>
                      <span className="text-gray-700">{new Date(card.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Owner Info & Actions */}
              <div className="space-y-6">
                {/* Owner Information */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-3">Owner Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <FiUser className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-blue-600 font-medium">Name:</span>
                      <span className="ml-1 text-gray-700">{card.ownerUserId?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center">
                      <FiUser className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-blue-600 font-medium">Username:</span>
                      <span className="ml-1 text-gray-700">{card.ownerUserId?.username || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center">
                      <FiUser className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-blue-600 font-medium">User ID:</span>
                      <span className="ml-1 font-mono text-xs text-gray-700">{card.ownerUserId?._id || 'Unknown'}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={handleAnalytics}
                      className="w-full flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FiBarChart className="h-4 w-4 mr-2" />
                      View Analytics
                    </button>
                    <button
                      onClick={handleFeature}
                      className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                        card.featured
                          ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                          : 'bg-gray-600 text-white hover:bg-gray-700'
                      }`}
                    >
                      <FiStar className="h-4 w-4 mr-2" />
                      {card.featured ? 'Remove from Featured' : 'Mark as Featured'}
                    </button>
                    <a
                      href={`http://localhost:5173/c/${card.shortLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FiEye className="h-4 w-4 mr-2" />
                      View Card
                    </a>
                  </div>
                </div>

                {/* QR Code */}
                {card.qrCode && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">QR Code</h3>
                    <div className="flex justify-center">
                      <img 
                        src={card.qrCode} 
                        alt="QR Code" 
                        className="w-24 h-24 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <div className="flex space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <FiEdit className="h-4 w-4 mr-2" />
                  Edit Card
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FiSave className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
              )}

              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FiX className="h-4 w-4 mr-2" />
                Delete Card
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>

        {/* Delete Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg p-6 w-full max-w-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Delete Card
                </h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete this card? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete Card
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analytics Modal */}
        <AnimatePresence>
          {showAnalytics && analytics && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Card Analytics
                  </h3>
                  <button
                    onClick={() => setShowAnalytics(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatNumber(analytics.totalViews || 0)}</div>
                    <div className="text-sm text-blue-600">Total Views</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{formatNumber(analytics.totalLoves || 0)}</div>
                    <div className="text-sm text-red-600">Total Loves</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{formatNumber(analytics.totalShares || 0)}</div>
                    <div className="text-sm text-green-600">Total Shares</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{formatNumber(analytics.totalDownloads || 0)}</div>
                    <div className="text-sm text-purple-600">Total Downloads</div>
                  </div>
                </div>

                {analytics.trends && analytics.trends.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Recent Activity</h4>
                    <div className="space-y-2">
                      {analytics.trends.slice(0, 7).map((trend, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <FiCalendar className="h-4 w-4 text-gray-600 mr-2" />
                            <span className="text-sm text-gray-700">{trend._id}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Views: {trend.views || 0}</span>
                            <span>Loves: {trend.loves || 0}</span>
                            <span>Shares: {trend.shares || 0}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default CardEditModal; 