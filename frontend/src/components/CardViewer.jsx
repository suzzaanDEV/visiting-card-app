import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMail, FiPhone, FiGlobe, FiMapPin, FiHeart, FiShare, FiDownload,
  FiEye, FiUser, FiBriefcase, FiFileText, FiSave, FiUserPlus, FiLock
} from 'react-icons/fi';
import { FaQrcode, FaHeart, FaShareAlt, FaDownload, FaEye, FaSave, FaUserPlus } from 'react-icons/fa';
import { QRCodeCanvas } from 'qrcode.react';
import { useDispatch, useSelector } from 'react-redux';
import { saveCardToLibrary } from '../features/library/libraryThunks';
import { toggleCardLove, toggleCardSave } from '../features/cards/cardsThunks';
import toast from 'react-hot-toast';
import TemplateCardRenderer from './TemplateCardRenderer';

const CardViewer = ({ card, onLove, onShare, onDownload, isLoved = false }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [showQR, setShowQR] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [qrCodeRef, setQrCodeRef] = useState(null);
  const [template, setTemplate] = useState(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);

  useEffect(() => {
    // Check if template data is already available in the card response
    if (card?.template) {
      setTemplate(card.template);
    } else if (card?.templateId) {
      fetchTemplate();
    }
  }, [card]);

  const fetchTemplate = async () => {
    if (!card?.templateId) return;
    
    setIsLoadingTemplate(true);
    try {
      const response = await fetch(`/api/templates/${card.templateId}`);
      if (response.ok) {
        const templateData = await response.json();
        setTemplate(templateData);
      }
    } catch (error) {
      console.error('Failed to fetch template:', error);
    } finally {
      setIsLoadingTemplate(false);
    }
  };

  const handleLove = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    try {
      await dispatch(toggleCardLove(card._id)).unwrap();
      toast.success('Card loved!');
    } catch (error) {
      toast.error('Failed to love card');
    }
    setTimeout(() => setIsAnimating(false), 1000);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${card.fullName} - ${card.jobTitle}`,
          text: `Check out ${card.fullName}'s digital business card`,
          url: window.location.href
        });
        toast.success('Shared successfully!');
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to share');
    }
  };

  const handleSaveContact = () => {
    if (!isAuthenticated) {
      toast.error('Please login to save contact information');
      return;
    }

    try {
      // Parse the full name into first and last name
      const nameParts = (card.fullName || '').trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Create vCard format
      const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${card.fullName}
N:${lastName};${firstName};;;
ORG:${card.company || ''}
TITLE:${card.jobTitle || ''}
TEL:${card.phone || ''}
EMAIL:${card.email || ''}
URL:${card.website || ''}
ADR:;;${card.address || ''}
END:VCARD`;

      const blob = new Blob([vCard], { type: 'text/vcard' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${card.fullName.replace(/\s+/g, '_')}.vcf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Contact saved!');
    } catch (error) {
      toast.error('Failed to save contact');
    }
  };

  const handleSaveCard = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save cards to your library');
      return;
    }

    try {
      await dispatch(toggleCardSave(card._id)).unwrap();
      toast.success('Card saved to library!');
    } catch (error) {
      toast.error('Failed to save card');
    }
  };

  const handleDownloadQR = () => {
    if (!isAuthenticated) {
      toast.error('Please login to download QR code');
      return;
    }

    try {
      if (qrCodeRef) {
        const canvas = qrCodeRef.querySelector('canvas');
        if (canvas) {
          const link = document.createElement('a');
          link.download = `${card.fullName.replace(/\s+/g, '_')}_QR.png`;
          link.href = canvas.toDataURL();
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success('QR code downloaded!');
        }
      }
    } catch (error) {
      toast.error('Failed to download QR code');
    }
  };

  const handleDownloadCard = () => {
    if (!isAuthenticated) {
      toast.error('Please login to download card');
      return;
    }

    try {
      // Create a canvas to draw the card
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 1200;
      canvas.height = 800;

      // Draw card background
      const gradient = ctx.createLinearGradient(0, 0, 1200, 800);
      gradient.addColorStop(0, card.backgroundColor || '#667eea');
      gradient.addColorStop(1, card.backgroundColor || '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1200, 800);

      // Draw card content
      ctx.fillStyle = card.textColor || '#ffffff';
      ctx.font = 'bold 72px Arial';
      ctx.fillText(card.fullName, 80, 160);

      if (card.jobTitle) {
        ctx.font = '36px Arial';
        ctx.fillText(card.jobTitle, 80, 240);
      }

      if (card.company) {
        ctx.font = '30px Arial';
        ctx.fillText(card.company, 80, 290);
      }

      if (card.email) {
        ctx.font = '28px Arial';
        ctx.fillText(card.email, 80, 360);
      }

      if (card.phone) {
        ctx.font = '28px Arial';
        ctx.fillText(card.phone, 80, 420);
      }

      // Download the canvas as image
      const link = document.createElement('a');
      link.download = `${card.fullName.replace(/\s+/g, '_')}_card.png`;
      link.href = canvas.toDataURL();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Card downloaded!');
    } catch (error) {
      toast.error('Failed to download card');
    }
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  // Function to mask sensitive information for non-authenticated users
  const maskSensitiveInfo = (text, type = 'default') => {
    if (isAuthenticated) return text;
    
    if (!text) return '';
    
    // Check if the data is already masked by the backend
    if (text.includes('***') || text.includes('hidden for privacy')) {
      return text;
    }
    
    switch (type) {
      case 'email':
        const [localPart, domain] = text.split('@');
        if (localPart && domain) {
          const maskedLocal = localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1);
          return `${maskedLocal}@${domain}`;
        }
        return text;
      case 'phone':
        const cleaned = text.replace(/\D/g, '');
        if (cleaned.length >= 4) {
          return `***-***-${cleaned.slice(-4)}`;
        }
        return '***-***-****';
      case 'address':
        return 'Address hidden for privacy';
      case 'website':
        return 'Website hidden for privacy';
      default:
        return text;
    }
  };

  if (!card) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading card...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Privacy Notice for Non-Authenticated Users */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4"
          >
            <div className="flex items-center">
              <FiLock className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="text-yellow-800 text-sm">
                <strong>Privacy Notice:</strong> Some contact information is hidden for privacy. 
                <a href="/login" className="text-yellow-700 underline ml-1 hover:text-yellow-900">
                  Login to view full details
                </a>
              </p>
            </div>
          </motion.div>
        )}

        {/* Card Preview Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="relative">
              {/* Card Content */}
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                      {card.fullName}
                    </h1>
                    {card.jobTitle && (
                      <p className="text-xl text-gray-600 mb-1">{card.jobTitle}</p>
                    )}
                    {card.company && (
                      <p className="text-lg text-gray-500">{card.company}</p>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLove}
                      disabled={isAnimating}
                      className={`p-3 rounded-full shadow-lg transition-all ${
                        isLoved 
                          ? 'bg-red-500 text-white hover:bg-red-600' 
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <FaHeart className={`h-5 w-5 ${isAnimating ? 'animate-pulse' : ''}`} />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleShare}
                      className="p-3 bg-white rounded-full shadow-lg text-gray-600 hover:bg-gray-50 transition-all"
                    >
                      <FaShareAlt className="h-5 w-5" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveCard}
                      className="p-3 bg-white rounded-full shadow-lg text-gray-600 hover:bg-gray-50 transition-all"
                    >
                      <FaSave className="h-5 w-5" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveContact}
                      className="p-3 bg-white rounded-full shadow-lg text-gray-600 hover:bg-gray-50 transition-all"
                    >
                      <FaUserPlus className="h-5 w-5" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDownloadCard}
                      className="p-3 bg-white rounded-full shadow-lg text-gray-600 hover:bg-gray-50 transition-all"
                    >
                      <FaDownload className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="relative">
                  <AnimatePresence>
                    {showQR && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute top-0 right-0 bg-white p-4 rounded-lg shadow-lg z-10"
                      >
                        <div ref={setQrCodeRef}>
                          <QRCodeCanvas
                            value={window.location.href}
                            size={200}
                            level="M"
                            includeMargin={true}
                          />
                        </div>
                        <div className="mt-2 text-center">
                          <button
                            onClick={handleDownloadQR}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Download QR
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="absolute top-6 right-6 bg-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-20"
                  >
                    <FaQrcode className="h-8 w-8 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card Details in Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
          >
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <FiUser className="h-6 w-6 mr-3 text-blue-600" />
              Contact Information
            </h3>
            
            <div className="space-y-6">
              {card.email && (
                <div className="flex items-center p-4 bg-blue-50 rounded-xl">
                  <FiMail className="h-6 w-6 mr-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Email</p>
                    {isAuthenticated ? (
                      <a 
                        href={`mailto:${card.email}`}
                        className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                      >
                        {card.email}
                      </a>
                    ) : (
                      <span className="text-gray-400 font-medium">
                        {maskSensitiveInfo(card.email, 'email')}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {card.phone && (
                <div className="flex items-center p-4 bg-green-50 rounded-xl">
                  <FiPhone className="h-6 w-6 mr-4 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Phone</p>
                    {isAuthenticated ? (
                      <a 
                        href={`tel:${card.phone}`}
                        className="text-green-600 hover:text-green-800 transition-colors font-medium"
                      >
                        {formatPhone(card.phone)}
                      </a>
                    ) : (
                      <span className="text-gray-400 font-medium">
                        {maskSensitiveInfo(card.phone, 'phone')}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {card.website && (
                <div className="flex items-center p-4 bg-purple-50 rounded-xl">
                  <FiGlobe className="h-6 w-6 mr-4 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Website</p>
                    {isAuthenticated ? (
                      <a 
                        href={card.website.startsWith('http') ? card.website : `https://${card.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-800 transition-colors font-medium"
                      >
                        {card.website}
                      </a>
                    ) : (
                      <span className="text-gray-400 font-medium">
                        {maskSensitiveInfo(card.website, 'website')}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {card.address && (
                <div className="flex items-center p-4 bg-orange-50 rounded-xl">
                  <FiMapPin className="h-6 w-6 mr-4 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Address</p>
                    {isAuthenticated ? (
                      <p className="text-orange-600 font-medium">{card.address}</p>
                    ) : (
                      <span className="text-gray-400 font-medium">
                        {maskSensitiveInfo(card.address, 'address')}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Professional Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
          >
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <FiBriefcase className="h-6 w-6 mr-3 text-purple-600" />
              Professional Information
            </h3>
            
            <div className="space-y-6">
              {card.jobTitle && (
                <div className="flex items-center p-4 bg-purple-50 rounded-xl">
                  <FiUser className="h-6 w-6 mr-4 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Position</p>
                    <p className="text-purple-600 font-semibold text-lg">{card.jobTitle}</p>
                  </div>
                </div>
              )}

              {card.company && (
                <div className="flex items-center p-4 bg-indigo-50 rounded-xl">
                  <FiBriefcase className="h-6 w-6 mr-4 text-indigo-500" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Company</p>
                    <p className="text-indigo-600 font-semibold text-lg">{card.company}</p>
                  </div>
                </div>
              )}

              {card.bio && (
                <div className="flex items-start p-4 bg-gray-50 rounded-xl">
                  <FiFileText className="h-6 w-6 mr-4 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Bio</p>
                    <p className="text-gray-700 leading-relaxed">{card.bio}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Enhanced Card Statistics */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
          >
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <FiEye className="h-6 w-6 mr-3 text-green-600" />
              Card Statistics
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                <FaEye className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{card.views || 0}</p>
                <p className="text-xs text-gray-600 font-medium">Views</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl border border-red-100">
                <FaHeart className="h-6 w-6 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">{card.loveCount || 0}</p>
                <p className="text-xs text-gray-600 font-medium">Loves</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                <FaDownload className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{card.downloadCount || 0}</p>
                <p className="text-xs text-gray-600 font-medium">Downloads</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                <FaShareAlt className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">{card.shareCount || 0}</p>
                <p className="text-xs text-gray-600 font-medium">Shares</p>
              </div>
            </div>

            {/* Login Prompt for Non-Authenticated Users */}
            {!isAuthenticated && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div className="text-center">
                  <FiLock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="text-lg font-semibold text-blue-900 mb-2">
                    Unlock Full Access
                  </h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Login to view complete contact information and download the card
                  </p>
                  <a
                    href="/login"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Login Now
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CardViewer; 