import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMail, FiPhone, FiGlobe, FiMapPin, FiHeart, FiShare, FiDownload,
  FiEye, FiUser, FiBriefcase, FiFileText, FiSave, FiUserPlus
} from 'react-icons/fi';
import { FaQrcode, FaHeart, FaShareAlt, FaDownload, FaEye, FaSave, FaUserPlus } from 'react-icons/fa';
import { QRCodeCanvas } from 'qrcode.react';
import { useDispatch, useSelector } from 'react-redux';
import { saveCardToLibrary } from '../../features/library/libraryThunks';
import { toggleCardLove, toggleCardSave } from '../../features/cards/cardsThunks';
import toast from 'react-hot-toast';
import TemplateCardRenderer from '../TemplateCardRenderer';

const CardViewer = ({ card, onLove, onShare, onDownload, isLoved = false }) => {
  const dispatch = useDispatch();
  const { items: savedCards } = useSelector(state => state.library);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showQR, setShowQR] = useState(false);
  // Add animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [qrCodeRef, setQrCodeRef] = useState(null);

  // Check if the current card is already in the library
  const isCardInLibrary = savedCards?.some(savedCard => savedCard.cardId?._id === card._id);

  useEffect(() => {
    if (card?.cardImage) {
      const img = new Image();
      img.onload = () => setIsImageLoaded(true);
      img.src = card.cardImage;
    }
  }, [card]);

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
    try {
      if (isCardInLibrary) {
        toast.error('Card is already in your library!');
        return;
      }
      
      await dispatch(toggleCardSave({ cardId: card._id })).unwrap();
      toast.success('Card saved to library!');
    } catch (error) {
      toast.error('Failed to save card');
    }
  };

  const handleDownloadQR = () => {
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

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  // Generate beautiful card design from database info
  const generateCardDesign = () => {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    ];
    
    const colorIndex = card._id ? parseInt(card._id.slice(-1), 16) % colors.length : 0;
    return colors[colorIndex];
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {card.fullName}
          </h1>
          <p className="text-xl text-gray-600">
            {card.jobTitle} {card.company && `at ${card.company}`}
          </p>
        </motion.div>

        {/* Full Width Card Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex justify-center">
            <div className="relative w-full max-w-5xl">
              {/* Enhanced Card Container - Full Width */}
              <motion.div
                whileHover={{ scale: 1.02, rotateY: 2 }}
                className="relative w-full h-96 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 transform perspective-1000"
                style={{
                  background: card.backgroundColor || generateCardDesign(),
                  color: card.textColor || '#ffffff',
                  fontFamily: card.fontFamily || 'Arial'
                }}
              >
                {/* Card Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-full h-full" 
                       style={{
                         background: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%),
                                     radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)`
                       }}>
                  </div>
                </div>

                {/* Card Image or Generated Design */}
                <div className="absolute inset-0">
                  {card.cardImage && isImageLoaded ? (
                    <img
                      src={card.cardImage}
                      alt={card.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center text-9xl font-bold text-white"
                      style={{
                        background: generateCardDesign()
                      }}
                    >
                      {getInitials(card.fullName)}
                    </div>
                  )}
                </div>

                {/* Card Content Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-end p-12">
                  <div className="text-white">
                    <h2 className="text-5xl font-bold mb-4">{card.fullName}</h2>
                    {card.jobTitle && (
                      <p className="text-2xl mb-2 opacity-90">{card.jobTitle}</p>
                    )}
                    {card.company && (
                      <p className="text-xl opacity-80 mb-4">{card.company}</p>
                    )}
                    {card.email && (
                      <p className="text-lg opacity-70">{card.email}</p>
                    )}
                    {card.phone && (
                      <p className="text-lg opacity-70 mt-2">{formatPhone(card.phone)}</p>
                    )}
                  </div>
                </div>

                {/* QR Code Inside Card */}
                <AnimatePresence>
                  {showQR && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute top-6 right-6 bg-white p-6 rounded-2xl shadow-2xl"
                      ref={setQrCodeRef}
                    >
                      <QRCodeCanvas
                        value={window.location.href}
                        size={150}
                        level="H"
                        includeMargin={true}
                      />
                      <button
                        onClick={handleDownloadQR}
                        className="mt-3 w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors font-medium"
                      >
                        Download QR
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* QR Toggle Button */}
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="absolute top-6 right-6 bg-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
                >
                  <FaQrcode className="h-8 w-8 text-gray-600" />
                </button>
              </motion.div>
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
                    <a 
                      href={`mailto:${card.email}`}
                      className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                    >
                      {card.email}
                    </a>
                  </div>
                </div>
              )}

              {card.phone && (
                <div className="flex items-center p-4 bg-green-50 rounded-xl">
                  <FiPhone className="h-6 w-6 mr-4 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Phone</p>
                    <a 
                      href={`tel:${card.phone}`}
                      className="text-green-600 hover:text-green-800 transition-colors font-medium"
                    >
                      {formatPhone(card.phone)}
                    </a>
                  </div>
                </div>
              )}

              {card.website && (
                <div className="flex items-center p-4 bg-purple-50 rounded-xl">
                  <FiGlobe className="h-6 w-6 mr-4 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Website</p>
                    <a 
                      href={card.website.startsWith('http') ? card.website : `https://${card.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 transition-colors font-medium"
                    >
                      {card.website}
                    </a>
                  </div>
                </div>
              )}

              {card.address && (
                <div className="flex items-center p-4 bg-orange-50 rounded-xl">
                  <FiMapPin className="h-6 w-6 mr-4 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Address</p>
                    <p className="text-orange-600 font-medium">{card.address}</p>
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
        </div>

        {/* Enhanced Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center space-x-6 mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLove}
            className={`flex items-center px-8 py-4 rounded-full shadow-lg transition-all ${
              isLoved 
                ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-200' 
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-gray-200'
            }`}
          >
            <FaHeart className={`h-6 w-6 mr-3 ${isLoved ? 'text-white' : 'text-red-500'}`} />
            <span className="font-semibold">{isLoved ? 'Loved' : 'Love'}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="flex items-center px-8 py-4 bg-white text-gray-700 rounded-full shadow-lg hover:bg-gray-50 transition-all shadow-gray-200"
          >
            <FaShareAlt className="h-6 w-6 mr-3 text-blue-500" />
            <span className="font-semibold">Share</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveContact}
            className="flex items-center px-8 py-4 bg-white text-gray-700 rounded-full shadow-lg hover:bg-gray-50 transition-all shadow-gray-200"
          >
            <FaUserPlus className="h-6 w-6 mr-3 text-green-500" />
            <span className="font-semibold">Save Contact</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveCard}
            className={`flex items-center px-8 py-4 rounded-full shadow-lg transition-all ${
              isCardInLibrary 
                ? 'bg-gray-400 text-white hover:bg-gray-500 shadow-gray-200 cursor-not-allowed' 
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-gray-200'
            }`}
            disabled={isCardInLibrary}
          >
            <FaSave className={`h-6 w-6 mr-3 ${isCardInLibrary ? 'text-white' : 'text-purple-500'}`} />
            <span className="font-semibold">{isCardInLibrary ? 'Already Saved' : 'Save Card'}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownloadCard}
            className="flex items-center px-8 py-4 bg-white text-gray-700 rounded-full shadow-lg hover:bg-gray-50 transition-all shadow-gray-200"
          >
            <FaDownload className="h-6 w-6 mr-3 text-blue-500" />
            <span className="font-semibold">Download</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default CardViewer; 