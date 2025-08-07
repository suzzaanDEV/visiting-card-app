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
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [showQR, setShowQR] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [qrCodeRef, setQrCodeRef] = useState(null);
  const [template, setTemplate] = useState(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [accessStatus, setAccessStatus] = useState(null);
  const [isRequestingAccess, setIsRequestingAccess] = useState(false);
  const [showAccessRequest, setShowAccessRequest] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');

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

  // Check access status for private cards
  const checkAccessStatus = async () => {
    if (!isAuthenticated || !card || card.privacy !== 'private') {
      console.log('Skipping access check:', { isAuthenticated, cardPrivacy: card?.privacy });
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      console.log('Checking access status for card:', card._id);
      console.log('User ID:', user?._id);
      console.log('Card owner:', card.ownerUserId);
      
      const response = await fetch(`/api/cards/access/check/${card._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAccessStatus(data);
        console.log('Access status received:', data);
      } else {
        console.error('Failed to check access status:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to check access status:', error);
    }
  };

  // Request access to private card
  const requestAccess = async () => {
    if (!isAuthenticated || !card) return;
    
    setIsRequestingAccess(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/cards/access/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          cardId: card._id,
          message: requestMessage
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success('Access request sent successfully!');
        setShowAccessRequest(false);
        setRequestMessage('');
        checkAccessStatus(); // Refresh access status
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to send access request');
      }
    } catch (error) {
      console.error('Failed to request access:', error);
      toast.error('Failed to send access request');
    } finally {
      setIsRequestingAccess(false);
    }
  };

  // Check access status when component mounts or card changes
  useEffect(() => {
    checkAccessStatus();
  }, [card, isAuthenticated]);

  // Refresh card data when access status changes
  useEffect(() => {
    if (accessStatus && accessStatus.access && card.privacy === 'private') {
      console.log('Access granted, refreshing card data...');
      // Trigger a page reload to get fresh data from the server
      window.location.reload();
    }
  }, [accessStatus, card]);

  // Fallback: If user is authenticated and card is private, assume they have access
  // This helps when the access check fails but user should have access
  useEffect(() => {
    if (isAuthenticated && user && card.privacy === 'private' && !accessStatus && card.ownerUserId !== user._id) {
      console.log('Access status not loaded, assuming user has access for better UX');
      // Don't set accessStatus here, let the API call handle it
    }
  }, [isAuthenticated, user, card, accessStatus]);

  // Check if user can perform actions (owner or approved access)
  const canPerformActions = () => {
    if (!isAuthenticated) return false;
    if (card.ownerUserId === user?._id) return true; // Owner can always perform actions
    if (card.privacy === 'public') return true; // Public cards allow actions
    if (accessStatus && accessStatus.access) return true; // Approved users can perform actions
    return false; // Private card without access
  };

  // Check if user can view full details
  const canViewFullDetails = () => {
    if (!isAuthenticated) return false;
    if (card.ownerUserId === user?._id) return true; // Owner can always view full details
    if (card.privacy === 'public') return true; // Public cards show full details
    if (accessStatus && accessStatus.access) return true; // Approved users can view full details
    return false; // Private card without access
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
    if (!text) return '';
    
    // Check if the data is already masked by the backend
    if (text.includes('***') || text.includes('hidden for privacy')) {
      return text;
    }
    
    // If user can view full details, show full information
    if (canViewFullDetails()) {
      console.log(`Showing full ${type} for user with access:`, text);
      return text;
    }
    
    // If user is authenticated but no access status yet, show full info temporarily
    if (isAuthenticated && !accessStatus && card.privacy === 'private') {
      console.log(`Waiting for access status, showing full ${type}:`, text);
      return text;
    }
    
    // If user is authenticated but no access, mask the information
    if (isAuthenticated && accessStatus && !accessStatus.access) {
      console.log(`Masking ${type} for user without access`);
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
                {/* Access Status Banner */}
        {card.privacy === 'private' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 border rounded-lg p-4 ${
              accessStatus && accessStatus.access 
                ? 'bg-green-100 border-green-300' 
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {accessStatus && accessStatus.access ? (
                  <FiEye className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <FiLock className="h-5 w-5 text-blue-600 mr-2" />
                )}
                <div>
                  <p className={`text-sm font-medium ${
                    accessStatus && accessStatus.access 
                      ? 'text-green-800' 
                      : 'text-blue-800'
                  }`}>
                    <strong>
                      {accessStatus && accessStatus.access 
                        ? '✅ Approved Access' 
                        : accessStatus === null
                        ? '🔒 Checking Access...'
                        : '🔒 Private Card'
                      }
                    </strong>
                  </p>
                  <p className={`text-xs ${
                    accessStatus && accessStatus.access 
                      ? 'text-green-600' 
                      : 'text-blue-600'
                  }`}>
                    {accessStatus && accessStatus.access 
                      ? 'You have approved access to view and interact with this card'
                      : accessStatus === null
                      ? 'Verifying your access permissions...'
                      : 'This card is private. You need to request access to view full details.'
                    }
                  </p>
                </div>
              </div>
              
              {/* Show request button only if user doesn't have access and is not the owner */}
              {isAuthenticated && user && card.ownerUserId !== user._id && !accessStatus?.access && (
                <div className="flex items-center space-x-2">
                  {accessStatus && accessStatus.reason === 'pending_request' ? (
                    <span className="text-yellow-600 flex items-center text-sm">
                      <FiUserPlus className="mr-1" />
                      Request Pending
                    </span>
                  ) : accessStatus === null ? (
                    <span className="text-gray-500 flex items-center text-sm">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-1"></div>
                      Checking...
                    </span>
                  ) : (
                    <button
                      onClick={() => setShowAccessRequest(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <FiUserPlus className="mr-1" />
                      Request Access
                    </button>
                  )}
                </div>
              )}
              
              {/* Show approved status for approved users */}
              {isAuthenticated && user && card.ownerUserId !== user._id && accessStatus?.access && (
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 flex items-center text-sm">
                    <FiEye className="mr-1" />
                    Approved Access
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Access Request Modal */}
        {showAccessRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowAccessRequest(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Request Access</h3>
              <p className="text-gray-600 mb-4">
                Send a request to view the full contact information for this private card.
              </p>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Optional message to the card owner..."
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 resize-none"
                rows="3"
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAccessRequest(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={requestAccess}
                  disabled={isRequestingAccess}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isRequestingAccess ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Debug Panel (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-gray-100 border border-gray-300 rounded-lg p-4"
          >
            <h4 className="font-semibold text-gray-800 mb-2">🔧 Debug Info</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Card Privacy: {card.privacy}</div>
              <div>User Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
              <div>User ID: {user?._id || 'Not logged in'}</div>
              <div>Card Owner: {card.ownerUserId}</div>
              <div>Is Owner: {user?._id === card.ownerUserId ? 'Yes' : 'No'}</div>
              <div>Access Status: {accessStatus ? JSON.stringify(accessStatus) : 'Not checked'}</div>
              <div>Has Access: {accessStatus?.access ? 'Yes' : 'No'}</div>
              <div>Access Reason: {accessStatus?.reason || 'N/A'}</div>
              <div>Can View Full Details: {canViewFullDetails() ? 'Yes' : 'No'}</div>
              <div>Can Perform Actions: {canPerformActions() ? 'Yes' : 'No'}</div>
              <div>Email Masked: {card.email && card.email.includes('***') ? 'Yes' : 'No'}</div>
              <div>Phone Masked: {card.phone && card.phone.includes('***') ? 'Yes' : 'No'}</div>
              <div>Show Request Button: {isAuthenticated && user && card.ownerUserId !== user._id && !accessStatus?.access ? 'Yes' : 'No'}</div>
              <div>Show Approved Status: {isAuthenticated && user && card.ownerUserId !== user._id && accessStatus?.access ? 'Yes' : 'No'}</div>
              <div>Header Text: {accessStatus && accessStatus.access ? '✅ Approved Access' : accessStatus === null ? '🔒 Checking Access...' : '🔒 Private Card'}</div>
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
                  <div className="flex space-x-3 relative">
                    {canPerformActions() && card.privacy === 'private' && accessStatus?.access && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full z-10">
                        Full Access
                      </div>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLove}
                      disabled={isAnimating || !canPerformActions()}
                      className={`p-3 rounded-full shadow-lg transition-all ${
                        isLoved 
                          ? 'bg-red-500 text-white hover:bg-red-600' 
                          : canPerformActions()
                          ? 'bg-white text-gray-600 hover:bg-gray-50'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      title={canPerformActions() ? 'Love this card' : 'Login or request access to love this card'}
                    >
                      <FaHeart className={`h-5 w-5 ${isAnimating ? 'animate-pulse' : ''}`} />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleShare}
                      disabled={!canPerformActions()}
                      className={`p-3 rounded-full shadow-lg transition-all ${
                        canPerformActions()
                          ? 'bg-white text-gray-600 hover:bg-gray-50'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      title={canPerformActions() ? 'Share this card' : 'Login or request access to share this card'}
                    >
                      <FaShareAlt className="h-5 w-5" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveCard}
                      disabled={!canPerformActions()}
                      className={`p-3 rounded-full shadow-lg transition-all ${
                        canPerformActions()
                          ? 'bg-white text-gray-600 hover:bg-gray-50'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      title={canPerformActions() ? 'Save to library' : 'Login or request access to save this card'}
                    >
                      <FaSave className="h-5 w-5" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveContact}
                      disabled={!canPerformActions()}
                      className={`p-3 rounded-full shadow-lg transition-all ${
                        canPerformActions()
                          ? 'bg-white text-gray-600 hover:bg-gray-50'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      title={canPerformActions() ? 'Save contact' : 'Login or request access to save contact'}
                    >
                      <FaUserPlus className="h-5 w-5" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDownloadCard}
                      disabled={!canPerformActions()}
                      className={`p-3 rounded-full shadow-lg transition-all ${
                        canPerformActions()
                          ? 'bg-white text-gray-600 hover:bg-gray-50'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      title={canPerformActions() ? 'Download card' : 'Login or request access to download this card'}
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
                    disabled={!canPerformActions()}
                    className={`absolute top-6 right-6 p-4 rounded-full shadow-lg transition-all z-20 ${
                      canPerformActions()
                        ? 'bg-white hover:shadow-xl hover:scale-110'
                        : 'bg-gray-200 cursor-not-allowed'
                    }`}
                    title={canPerformActions() ? 'Show QR Code' : 'Login or request access to view QR code'}
                  >
                    <FaQrcode className={`h-8 w-8 ${
                      canPerformActions() ? 'text-gray-600' : 'text-gray-400'
                    }`} />
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
                    {card.email.includes('***') || card.email.includes('hidden for privacy') ? (
                      <span className="text-gray-400 font-medium">
                        {card.email}
                      </span>
                    ) : (
                      <a 
                        href={`mailto:${card.email}`}
                        className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                      >
                        {card.email}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {card.phone && (
                <div className="flex items-center p-4 bg-green-50 rounded-xl">
                  <FiPhone className="h-6 w-6 mr-4 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Phone</p>
                    {card.phone.includes('***') || card.phone.includes('hidden for privacy') ? (
                      <span className="text-gray-400 font-medium">
                        {card.phone}
                      </span>
                    ) : (
                      <a 
                        href={`tel:${card.phone}`}
                        className="text-green-600 hover:text-green-800 transition-colors font-medium"
                      >
                        {formatPhone(card.phone)}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {card.website && (
                <div className="flex items-center p-4 bg-purple-50 rounded-xl">
                  <FiGlobe className="h-6 w-6 mr-4 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Website</p>
                    {card.website.includes('***') || card.website.includes('hidden for privacy') ? (
                      <span className="text-gray-400 font-medium">
                        {card.website}
                      </span>
                    ) : (
                      <a 
                        href={card.website.startsWith('http') ? card.website : `https://${card.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-800 transition-colors font-medium"
                      >
                        {card.website}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {card.address && (
                <div className="flex items-center p-4 bg-orange-50 rounded-xl">
                  <FiMapPin className="h-6 w-6 mr-4 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Address</p>
                    {card.address.includes('***') || card.address.includes('hidden for privacy') ? (
                      <span className="text-gray-400 font-medium">
                        {card.address}
                      </span>
                    ) : (
                      <p className="text-orange-600 font-medium">{card.address}</p>
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