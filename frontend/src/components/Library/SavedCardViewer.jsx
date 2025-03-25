import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX, FiEye, FiHeart, FiShare2, FiDownload, FiMail, FiPhone, FiGlobe,
  FiMapPin, FiUser, FiBriefcase, FiCalendar, FiBookmark, FiExternalLink,
  FiCopy, FiCheck, FiStar, FiClock, FiTrendingUp
} from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import CardPreview from '../Cards/CardPreview';
import toast from 'react-hot-toast';

const SavedCardViewer = ({ card, isOpen, onClose, onRemove }) => {
  const [copiedField, setCopiedField] = useState(null);
  const [isLoving, setIsLoving] = useState(false);

  if (!card || !isOpen) return null;

  // Helper function to get card data with fallbacks
  const getCardData = (card) => {
    if (!card) return null;

    return {
      fullName: card.fullName || card.ownerUserId?.name || 'Your Name',
      jobTitle: card.jobTitle || card.ownerUserId?.jobTitle || 'Job Title',
      company: card.company || card.ownerUserId?.company || 'Company',
      email: card.email || card.ownerUserId?.email || 'email@example.com',
      phone: card.phone || card.ownerUserId?.phone || '+(977) 9xxxxxxxxx',
      website: card.website || card.ownerUserId?.website || 'www.example.com',
      address: card.address || card.ownerUserId?.location || 'Address',
      bio: card.bio || card.ownerUserId?.bio || 'Bio description',
      views: card.views || 0,
      loveCount: card.loveCount || 0,
      shares: card.shares || 0,
      downloads: card.downloads || 0
    };
  };

  const cardData = getCardData(card);

  const handleCopyField = async (field, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard!`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${cardData.fullName} - ${cardData.jobTitle}`,
          text: `Check out ${cardData.fullName}'s digital business card`,
          url: `${window.location.origin}/c/${card.shortLink}`
        });
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/c/${card.shortLink}`);
        toast.success('Card link copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to share card');
    }
  };

  const handleLove = async () => {
    setIsLoving(true);
    // Here you would typically call an API to love/unlove the card
    setTimeout(() => setIsLoving(false), 1000);
  };

  const handleDownload = () => {
    // Here you would implement card download functionality
    toast.success('Download feature coming soon!');
  };

  const handleVisitCard = () => {
    window.open(`/c/${card.shortLink}`, '_blank');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white rounded-t-2xl p-6 border-b border-gray-200 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiBookmark className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {card.title || `${cardData.fullName}'s Card`}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Saved on {new Date(card.savedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLove}
                  disabled={isLoving}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                >
                  <FiHeart className={`h-5 w-5 ${isLoving ? 'text-red-500 animate-pulse' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-400 hover:text-blue-500 rounded-lg transition-colors"
                >
                  <FiShare2 className="h-5 w-5" />
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 text-gray-400 hover:text-green-500 rounded-lg transition-colors"
                >
                  <FiDownload className="h-5 w-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Card Preview */}
              <div className="xl:col-span-1">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiEye className="h-5 w-5 mr-2 text-blue-600" />
                    Card Preview
                  </h3>
                  <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-lg">
                    <CardPreview
                      card={card}
                      template={{ id: card.templateId }}
                      className="w-full h-full"
                      showActions={false}
                    />
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={handleVisitCard}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <FiExternalLink className="h-4 w-4 mr-2" />
                      View Full Card
                    </button>
                    {onRemove && (
                      <button
                        onClick={() => onRemove(card._id)}
                        className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Details */}
              <div className="xl:col-span-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FiUser className="h-5 w-5 mr-2 text-green-600" />
                      Contact Information
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FiUser className="h-4 w-4 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm text-gray-500">Full Name</p>
                              <p className="font-medium text-gray-900">{cardData.fullName}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleCopyField('Name', cardData.fullName)}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded"
                          >
                            {copiedField === 'Name' ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FiBriefcase className="h-4 w-4 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm text-gray-500">Job Title</p>
                              <p className="font-medium text-gray-900">{cardData.jobTitle}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleCopyField('Job Title', cardData.jobTitle)}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded"
                          >
                            {copiedField === 'Job Title' ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FiBriefcase className="h-4 w-4 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm text-gray-500">Company</p>
                              <p className="font-medium text-gray-900">{cardData.company}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleCopyField('Company', cardData.company)}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded"
                          >
                            {copiedField === 'Company' ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FiMail className="h-4 w-4 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <p className="font-medium text-gray-900">{cardData.email}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleCopyField('Email', cardData.email)}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded"
                          >
                            {copiedField === 'Email' ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FiPhone className="h-4 w-4 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm text-gray-500">Phone</p>
                              <p className="font-medium text-gray-900">{cardData.phone}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleCopyField('Phone', cardData.phone)}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded"
                          >
                            {copiedField === 'Phone' ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FiGlobe className="h-4 w-4 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm text-gray-500">Website</p>
                              <p className="font-medium text-gray-900">{cardData.website}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleCopyField('Website', cardData.website)}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded"
                          >
                            {copiedField === 'Website' ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {cardData.address && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <FiMapPin className="h-4 w-4 text-gray-400 mr-3" />
                              <div>
                                <p className="text-sm text-gray-500">Address</p>
                                <p className="font-medium text-gray-900">{cardData.address}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleCopyField('Address', cardData.address)}
                              className="p-1 text-gray-400 hover:text-blue-600 rounded"
                            >
                              {copiedField === 'Address' ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      )}

                      {cardData.bio && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start">
                              <FiUser className="h-4 w-4 text-gray-400 mr-3 mt-1" />
                              <div>
                                <p className="text-sm text-gray-500">Bio</p>
                                <p className="font-medium text-gray-900">{cardData.bio}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleCopyField('Bio', cardData.bio)}
                              className="p-1 text-gray-400 hover:text-blue-600 rounded"
                            >
                              {copiedField === 'Bio' ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Stats & QR Code */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FiTrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                      Card Analytics
                    </h3>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                        <div className="flex items-center">
                          <FiEye className="h-5 w-5 text-blue-600 mr-2" />
                          <div>
                            <p className="text-sm text-blue-600 font-medium">Views</p>
                            <p className="text-xl font-bold text-blue-900">{cardData.views}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
                        <div className="flex items-center">
                          <FiHeart className="h-5 w-5 text-red-600 mr-2" />
                          <div>
                            <p className="text-sm text-red-600 font-medium">Loves</p>
                            <p className="text-xl font-bold text-red-900">{cardData.loveCount}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                        <div className="flex items-center">
                          <FiShare2 className="h-5 w-5 text-green-600 mr-2" />
                          <div>
                            <p className="text-sm text-green-600 font-medium">Shares</p>
                            <p className="text-xl font-bold text-green-900">{cardData.shares}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                        <div className="flex items-center">
                          <FiDownload className="h-5 w-5 text-purple-600 mr-2" />
                          <div>
                            <p className="text-sm text-purple-600 font-medium">Downloads</p>
                            <p className="text-xl font-bold text-purple-900">{cardData.downloads}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">QR Code</h4>
                      <div className="flex justify-center">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <QRCodeSVG
                            value={`${window.location.origin}/c/${card.shortLink}`}
                            size={120}
                            level="M"
                            includeMargin={true}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 text-center mt-3">
                        Scan to view the full card
                      </p>
                    </div>

                    {/* Card Metadata */}
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <FiCalendar className="h-4 w-4 mr-2" />
                        Created: {new Date(card.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <FiClock className="h-4 w-4 mr-2" />
                        Saved: {new Date(card.savedAt).toLocaleDateString()}
                      </div>
                      {card.templateId && (
                        <div className="flex items-center text-sm text-gray-500">
                          <FiStar className="h-4 w-4 mr-2" />
                          Template: {card.templateId}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SavedCardViewer; 