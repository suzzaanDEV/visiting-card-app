import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMail, FiPhone, FiMapPin, FiHeart, FiShare, FiDownload,
  FiEye, FiUser, FiBriefcase, FiFileText, FiSave, FiUserPlus, FiLock,
  FiShare2, FiBookmark, FiSmartphone, FiCalendar, FiClock, FiStar,
  FiEyeOff, FiShield, FiSend, FiCheck, FiX, FiGlobe
} from 'react-icons/fi';
import { FaQrcode, FaHeart, FaShareAlt, FaDownload, FaEye, FaSave, FaUserPlus, FaBookmark, FaMobile, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { saveCardToLibrary } from '../../features/library/libraryThunks';
import { toggleCardLove } from '../../features/cards/cardsThunks';
import toast from 'react-hot-toast';
import QRCodeDisplay from '../QRCodeDisplay';
import SimpleCardTemplate from '../SimpleCardTemplate';
import html2canvas from 'html2canvas';

const CardViewer = ({ card, onLove, onShare, onDownload, isLoved = false }) => {
  const dispatch = useDispatch();
  const { items: savedCards } = useSelector(state => state.library);
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [showFullInfo, setShowFullInfo] = useState(true); // Always show full info for public cards
  const [accessRequested, setAccessRequested] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Check if the current card is already in the library
  const isCardInLibrary = savedCards?.some(savedCard => savedCard.cardId?._id === card._id);

  useEffect(() => {
    if (card?.cardImage) {
      const img = new Image();
      img.onload = () => setIsImageLoaded(true);
      img.src = card.cardImage;
    } else {
      setIsImageLoaded(true);
    }
  }, [card]);

  // Check if user has access to private card
  const hasAccess = () => {
    if (card.privacy === 'public') return true;
    if (!isAuthenticated) return false;
    if (card.ownerUserId?._id === user?.id) return true;
    // Check if user has approved access request
    return card.hasApprovedAccess || false;
  };

  // For public cards or approved access, show full information
  const shouldShowFullInfo = () => {
    return card.privacy === 'public' || hasAccess();
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const handleLove = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to love cards');
      return;
    }

    if (!hasAccess()) {
      toast.error('Please request access to interact with this card');
      return;
    }

    try {
      setIsAnimating(true);
      await dispatch(toggleCardLove(card._id)).unwrap();
      toast.success(isLoved ? 'Removed from loves' : 'Added to loves');
    } catch (error) {
      toast.error('Failed to update love status');
    } finally {
      setIsAnimating(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: `${card.fullName} - Digital Business Card`,
        text: `Check out ${card.fullName}'s digital business card`,
        url: `${window.location.origin}/c/${card.shortLink}`
      };

      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share card');
    }
  };

  const handleSaveCard = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save cards to library');
      return;
    }

    if (!hasAccess()) {
      toast.error('Please request access to save this card');
      return;
    }

    try {
      await dispatch(saveCardToLibrary({ cardId: card._id })).unwrap();
      toast.success('Card saved to library!');
    } catch (error) {
      console.error('Save card error:', error);
      toast.error('Failed to save card');
    }
  };

  const handleDownloadCard = async () => {
    if (!hasAccess()) {
      toast.error('Please request access to download this card');
      return;
    }

    setIsDownloading(true);
    try {
      // Create a canvas to combine card image and QR code
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 800;
      canvas.height = 600;

      // Create card template
      const cardDiv = document.createElement('div');
      cardDiv.style.width = '400px';
      cardDiv.style.height = '250px';
      cardDiv.style.position = 'absolute';
      cardDiv.style.left = '-9999px';
      document.body.appendChild(cardDiv);

      // Render card template
      const cardElement = document.createElement('div');
      cardElement.innerHTML = `
        <div style="
          width: 400px; 
          height: 250px; 
          background: ${card.backgroundColor || '#667eea'}; 
          color: ${card.textColor || '#ffffff'}; 
          border-radius: 16px; 
          padding: 20px; 
          display: flex; 
          flex-direction: column; 
          justify-content: space-between;
          font-family: ${card.fontFamily || 'Arial'};
        ">
          <div style="text-align: center;">
            <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold;">
              ${card.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <h2 style="margin: 0 0 5px; font-size: 24px;">${card.fullName}</h2>
            <p style="margin: 0 0 3px; opacity: 0.9; font-size: 16px;">${card.jobTitle}</p>
            <p style="margin: 0; opacity: 0.8; font-size: 14px;">${card.company}</p>
          </div>
          <div style="font-size: 12px;">
            ${card.email ? `<div style="margin-bottom: 5px;">📧 ${card.email}</div>` : ''}
            ${card.phone ? `<div style="margin-bottom: 5px;">📞 ${card.phone}</div>` : ''}
            ${card.website ? `<div style="margin-bottom: 5px;">🌐 ${card.website}</div>` : ''}
            ${card.address ? `<div>📍 ${card.address}</div>` : ''}
          </div>
        </div>
      `;
      cardDiv.appendChild(cardElement);

      // Convert card to image
      const cardImage = await html2canvas(cardElement.firstChild);
      
      // Draw card on canvas
      ctx.drawImage(cardImage, 50, 50, 400, 250);

      // Generate QR code
      const qrCanvas = document.createElement('canvas');
      const qrCtx = qrCanvas.getContext('2d');
      qrCanvas.width = 200;
      qrCanvas.height = 200;
      
      // Simple QR code generation (you might want to use a proper QR library)
      qrCtx.fillStyle = '#000';
      qrCtx.fillRect(0, 0, 200, 200);
      qrCtx.fillStyle = '#fff';
      qrCtx.fillRect(10, 10, 180, 180);
      
      // Draw QR code on canvas
      ctx.drawImage(qrCanvas, 550, 50, 200, 200);

      // Add text
      ctx.fillStyle = '#333';
      ctx.font = '16px Arial';
      ctx.fillText('Digital Business Card', 50, 30);
      ctx.font = '12px Arial';
      ctx.fillText('Scan QR code to view online', 550, 280);

      // Download the image
      const link = document.createElement('a');
      link.download = `${card.fullName?.replace(/\s+/g, '_')}_Digital_Card.png`;
      link.href = canvas.toDataURL();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      document.body.removeChild(cardDiv);

      toast.success('Card downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download card');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveToContacts = async () => {
    if (!hasAccess()) {
      toast.error('Please request access to save this contact');
      return;
    }

    setIsSavingContact(true);
    try {
      // Create vCard format
      const vCard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${card.fullName}`,
        `ORG:${card.company || ''}`,
        `TITLE:${card.jobTitle || ''}`,
        `EMAIL:${card.email || ''}`,
        `TEL:${card.phone || ''}`,
        `URL:${card.website || ''}`,
        `ADR:;;${card.address || ''}`,
        `NOTE:${card.bio || ''}`,
        'END:VCARD'
      ].join('\n');

      // Create blob and download
      const blob = new Blob([vCard], { type: 'text/vcard' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${card.fullName?.replace(/\s+/g, '_')}.vcf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Contact saved to device!');
    } catch (error) {
      console.error('Save contact error:', error);
      toast.error('Failed to save contact');
    } finally {
      setIsSavingContact(false);
    }
  };

  const handleRequestAccess = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to request access');
      return;
    }

    try {
      const response = await fetch(`/api/cards/${card._id}/request-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: requestMessage })
      });

      const data = await response.json();

      if (response.ok) {
        setAccessRequested(true);
        setShowRequestModal(false);
        toast.success(data.message);
      } else {
        toast.error(data.error || 'Failed to request access');
      }
    } catch (error) {
      console.error('Request access error:', error);
      toast.error('Failed to request access');
    }
  };

  const handleToggleInfo = () => {
    setShowFullInfo(!showFullInfo);
  };

  if (!card) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading card...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Digital Business Card</h1>
          <p className="text-xl text-gray-600">Professional contact information</p>
        </motion.div>

        {/* Private Card Access Notice */}
        {card.privacy === 'private' && !hasAccess() && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-orange-100 p-3 rounded-full mr-4">
                  <FiLock className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-orange-800 mb-1">Private Card</h3>
                  <p className="text-orange-700 text-sm">
                    This is a private card. You need to request access to view full details.
                  </p>
                </div>
              </div>
              {isAuthenticated && !accessRequested && (
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <FiSend className="w-4 h-4" />
                  Request Access
                </button>
              )}
              {accessRequested && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                  <FiCheck className="w-4 h-4" />
                  Access Requested
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Card Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Card Preview */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Card Preview</h2>
                <div className="flex items-center gap-2">
                  {card.privacy === 'public' ? (
                    <span className="flex items-center text-green-600 text-sm">
                      <FiGlobe className="w-4 h-4 mr-1" />
                      Public
                    </span>
                  ) : (
                    <span className="flex items-center text-orange-600 text-sm">
                      <FiLock className="w-4 h-4 mr-1" />
                      Private
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <div className="w-full max-w-sm h-80">
                  <SimpleCardTemplate 
                    card={card} 
                    className="w-full h-full"
                  />
                </div>
              </div>

              {/* QR Code Modal */}
              <AnimatePresence>
                <QRCodeDisplay 
                  card={card} 
                  isOpen={showQR} 
                  onClose={() => setShowQR(false)} 
                />
              </AnimatePresence>

              {/* QR Toggle Button */}
              <button
                onClick={() => setShowQR(!showQR)}
                className="absolute top-6 right-6 bg-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-10"
              >
                <FaQrcode className="h-8 w-8 text-gray-600" />
              </button>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
          >
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <FiStar className="h-6 w-6 mr-3 text-yellow-600" />
              Quick Actions
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Love Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLove}
                disabled={!isAuthenticated || !hasAccess()}
                className={`flex items-center justify-center p-4 rounded-xl transition-all ${
                  isLoved 
                    ? 'bg-red-600 text-white shadow-red-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${!isAuthenticated || !hasAccess() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FaHeart className="h-5 w-5 mr-2" />
                <span className="font-medium">{isLoved ? 'Loved' : 'Love'}</span>
              </motion.button>

              {/* Share Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="flex items-center justify-center p-4 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all"
              >
                <FaShareAlt className="h-5 w-5 mr-2" />
                <span className="font-medium">Share</span>
              </motion.button>

              {/* Save to Library */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveCard}
                disabled={!isAuthenticated || isCardInLibrary || !hasAccess()}
                className={`flex items-center justify-center p-4 rounded-xl transition-all ${
                  isCardInLibrary 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                } ${!isAuthenticated || !hasAccess() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FaBookmark className="h-5 w-5 mr-2" />
                <span className="font-medium">{isCardInLibrary ? 'Saved' : 'Save'}</span>
              </motion.button>

              {/* Download */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadCard}
                disabled={isDownloading || !hasAccess()}
                className="flex items-center justify-center p-4 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-all disabled:opacity-50"
              >
                <FaDownload className="h-5 w-5 mr-2" />
                <span className="font-medium">{isDownloading ? 'Downloading...' : 'Download'}</span>
              </motion.button>

              {/* Save to Contacts */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveToContacts}
                disabled={isSavingContact || !hasAccess()}
                className="flex items-center justify-center p-4 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition-all disabled:opacity-50 col-span-2"
              >
                <FaMobile className="h-5 w-5 mr-2" />
                <span className="font-medium">{isSavingContact ? 'Saving...' : 'Save to Contacts'}</span>
              </motion.button>
            </div>

            {/* Authentication Notice */}
            {!isAuthenticated && (
              <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <p className="text-sm text-yellow-800 flex items-center">
                  <FiLock className="w-4 h-4 mr-2" />
                  Login to access all features and interact with cards
                </p>
              </div>
            )}

            {/* Access Notice */}
            {!hasAccess() && isAuthenticated && (
              <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
                <p className="text-sm text-orange-800 flex items-center">
                  <FiShield className="w-4 h-4 mr-2" />
                  Request access to interact with this private card
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Complete Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-gray-900 flex items-center">
              <FiUser className="h-6 w-6 mr-3 text-blue-600" />
              Complete Contact Information
            </h3>
            
            {isAuthenticated && hasAccess() && (
              <button
                onClick={handleToggleInfo}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                {showFullInfo ? <FiEyeOff className="w-4 h-4 mr-1" /> : <FiEye className="w-4 h-4 mr-1" />}
                {showFullInfo ? 'Hide Details' : 'Show Details'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h4>
              
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <FiUser className="h-5 w-5 mr-3 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Full Name</p>
                    <p className="text-blue-700 font-semibold">{card.fullName}</p>
                  </div>
                </div>

                {card.jobTitle && (
                  <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                    <FiBriefcase className="h-5 w-5 mr-3 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Job Title</p>
                      <p className="text-purple-700 font-semibold">{card.jobTitle}</p>
                    </div>
                  </div>
                )}

                {card.company && (
                  <div className="flex items-center p-3 bg-indigo-50 rounded-lg">
                    <FiBriefcase className="h-5 w-5 mr-3 text-indigo-500" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Company</p>
                      <p className="text-indigo-700 font-semibold">{card.company}</p>
                    </div>
                  </div>
                )}

                {card.bio && (
                  <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                    <FiFileText className="h-5 w-5 mr-3 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Bio</p>
                      <p className="text-gray-700 leading-relaxed">{card.bio}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Contact Details</h4>
              
              <div className="space-y-3">
                {card.email && (
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <FaEnvelope className="h-5 w-5 mr-3 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Email</p>
                      <a 
                        href={`mailto:${card.email}`}
                        className="text-green-700 hover:text-green-800 transition-colors font-medium"
                      >
                        {card.email}
                      </a>
                    </div>
                  </div>
                )}

                {card.phone && (
                  <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                    <FaPhone className="h-5 w-5 mr-3 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Phone</p>
                      <a 
                        href={`tel:${card.phone}`}
                        className="text-orange-700 hover:text-orange-800 transition-colors font-medium"
                      >
                        {formatPhone(card.phone)}
                      </a>
                    </div>
                  </div>
                )}

                {card.website && (
                  <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                    <FaGlobe className="h-5 w-5 mr-3 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Website</p>
                      <a 
                        href={card.website.startsWith('http') ? card.website : `https://${card.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-700 hover:text-purple-800 transition-colors font-medium"
                      >
                        {card.website}
                      </a>
                    </div>
                  </div>
                )}

                {card.address && (
                  <div className="flex items-center p-3 bg-red-50 rounded-lg">
                    <FaMapMarkerAlt className="h-5 w-5 mr-3 text-red-500" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Address</p>
                      <p className="text-red-700 font-medium">{card.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Public Card Notice */}
          {card.privacy === 'public' && (
            <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center">
                <FiGlobe className="h-5 w-5 mr-3 text-green-600" />
                <div>
                  <h4 className="text-sm font-semibold text-green-800 mb-1">Public Card</h4>
                  <p className="text-sm text-green-700">
                    This is a public card. All contact information is visible to everyone.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Card Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-8"
        >
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <FiEye className="h-6 w-6 mr-3 text-green-600" />
            Card Statistics
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <FaShareAlt className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{card.shares || 0}</p>
              <p className="text-xs text-gray-600 font-medium">Shares</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
              <FaDownload className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">{card.downloads || 0}</p>
              <p className="text-xs text-gray-600 font-medium">Downloads</p>
            </div>
          </div>
        </motion.div>

        {/* Access Request Modal */}
        <AnimatePresence>
          {showRequestModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowRequestModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Request Access</h3>
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    This is a private card. Send a request to the card owner to view full contact information.
                  </p>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message (optional)
                    </label>
                    <textarea
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      placeholder="Tell the card owner why you'd like access..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestAccess}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FiSend className="w-4 h-4" />
                    Send Request
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CardViewer; 