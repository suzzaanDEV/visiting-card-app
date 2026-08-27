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
import html2canvas from 'html2canvas';
import CardRenderer from './CardRenderer';

const CardViewer = ({ card, isLoved = false }) => {
  const dispatch = useDispatch();
  const { items: savedCards } = useSelector(state => state.library);
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const [, setIsImageLoaded] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [, setIsAnimating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [showFullInfo, setShowFullInfo] = useState(true);
  const [accessRequested, setAccessRequested] = useState(false);
  const [accessStatus, setAccessStatus] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);

  const isCardInLibrary = savedCards?.some(savedCard => savedCard.cardId?._id === card._id);

  useEffect(() => {
    checkAccessStatus();
  }, [card, isAuthenticated]);

  useEffect(() => {
    if (card?.cardImage) {
      const img = new Image();
      img.onload = () => setIsImageLoaded(true);
      img.src = card.cardImage;
    } else {
      setIsImageLoaded(true);
    }
  }, [card]);

  const checkAccessStatus = async () => {
    if (!isAuthenticated || !card || card.privacy !== 'private') return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/cards/access/check/${card._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAccessStatus(data);

        if (data.access) {
          setAccessRequested(true);
        } else if (data.reason === 'pending_request') {
          setAccessRequested(true);
        } else {
          setAccessRequested(false);
        }
      }
    } catch (error) {
      console.error('Failed to check access status:', error);
    }
  };

  const hasAccess = () => {
    if (card.privacy === 'public') return true;
    if (!isAuthenticated) return false;
    if (card.ownerUserId?._id === user?.id) return true;
    return accessStatus?.access || card.hasApprovedAccess || false;
  };

  const _shouldShowFullInfo = () => {
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
    } catch {
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
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 800;
      canvas.height = 600;

      const cardDiv = document.createElement('div');
      cardDiv.style.width = '400px';
      cardDiv.style.height = '250px';
      cardDiv.style.position = 'absolute';
      cardDiv.style.left = '-9999px';
      document.body.appendChild(cardDiv);

      const cardElement = document.createElement('div');
      cardElement.innerHTML = `
        <div style="
          width: 400px;
          height: 250px;
          background: ${card.backgroundColor || '#10B981'};
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

      const cardImage = await html2canvas(cardElement.firstChild);

      ctx.drawImage(cardImage, 50, 50, 400, 250);

      const qrCanvas = document.createElement('canvas');
      const qrCtx = qrCanvas.getContext('2d');
      qrCanvas.width = 200;
      qrCanvas.height = 200;

      qrCtx.fillStyle = '#000';
      qrCtx.fillRect(0, 0, 200, 200);
      qrCtx.fillStyle = '#fff';
      qrCtx.fillRect(10, 10, 180, 180);

      ctx.drawImage(qrCanvas, 550, 50, 200, 200);

      ctx.fillStyle = '#333';
      ctx.font = '16px Arial';
      ctx.fillText('Digital Business Card', 50, 30);
      ctx.font = '12px Arial';
      ctx.fillText('Scan QR code to view online', 550, 280);

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

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!card) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-background dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400">Loading card...</p>
        </div>
      </div>
    );
  }

  const statItems = [
    { label: 'Views', value: card.views || 0, icon: FaEye, gradient: 'from-emerald-500 to-emerald-600', bgLight: 'bg-emerald-50', bgDark: 'dark:bg-emerald-950/40', textLight: 'text-emerald-700', textDark: 'dark:text-emerald-400', ringColor: 'ring-emerald-500/20' },
    { label: 'Loves', value: card.loveCount || 0, icon: FaHeart, gradient: 'from-rose-500 to-pink-600', bgLight: 'bg-rose-50', bgDark: 'dark:bg-rose-950/40', textLight: 'text-rose-700', textDark: 'dark:text-rose-400', ringColor: 'ring-rose-500/20' },
    { label: 'Shares', value: card.shares || 0, icon: FaShareAlt, gradient: 'from-green-500 to-emerald-600', bgLight: 'bg-green-50', bgDark: 'dark:bg-green-950/40', textLight: 'text-green-700', textDark: 'dark:text-green-400', ringColor: 'ring-green-500/20' },
    { label: 'Downloads', value: card.downloads || 0, icon: FaDownload, gradient: 'from-violet-500 to-purple-600', bgLight: 'bg-violet-50', bgDark: 'dark:bg-violet-950/40', textLight: 'text-violet-700', textDark: 'dark:text-violet-400', ringColor: 'ring-violet-500/20' },
  ];

  const contactFields = [
    card.email && { label: 'Email', value: card.email, icon: FaEnvelope, accentColor: 'border-emerald-500', link: `mailto:${card.email}`, textColor: 'text-emerald-600 dark:text-emerald-400', hoverColor: 'hover:text-emerald-700 dark:hover:text-emerald-300' },
    card.phone && { label: 'Phone', value: formatPhone(card.phone), icon: FaPhone, accentColor: 'border-blue-500', link: `tel:${card.phone}`, textColor: 'text-blue-600 dark:text-blue-400', hoverColor: 'hover:text-blue-700 dark:hover:text-blue-300' },
    card.website && { label: 'Website', value: card.website, icon: FaGlobe, accentColor: 'border-violet-500', link: card.website.startsWith('http') ? card.website : `https://${card.website}`, textColor: 'text-violet-600 dark:text-violet-400', hoverColor: 'hover:text-violet-700 dark:hover:text-violet-300' },
    card.address && { label: 'Address', value: card.address, icon: FaMapMarkerAlt, accentColor: 'border-rose-500', link: null, textColor: 'text-rose-600 dark:text-rose-400', hoverColor: 'hover:text-rose-700 dark:hover:text-rose-300' },
  ].filter(Boolean);

  const personalFields = [
    card.jobTitle && { label: 'Job Title', value: card.jobTitle, icon: FiBriefcase, accentColor: 'border-green-500', textColor: 'text-green-600 dark:text-green-400' },
    card.company && { label: 'Company', value: card.company, icon: FiBriefcase, accentColor: 'border-teal-500', textColor: 'text-teal-600 dark:text-teal-400' },
    card.bio && { label: 'Bio', value: card.bio, icon: FiFileText, accentColor: 'border-slate-400 dark:border-slate-500', textColor: 'text-slate-600 dark:text-slate-400' },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/80 via-green-50/60 to-teal-50/80 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 transition-colors duration-300">
      <div className="min-h-screen bg-gradient-to-b from-transparent via-emerald-50/30 to-green-50/50 dark:via-transparent dark:to-transparent">

        {/* Hero Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 dark:from-emerald-700 dark:via-green-700 dark:to-teal-700" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wOCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />

            <div className="relative max-w-7xl mx-auto px-4 py-10 sm:py-14">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center text-white text-3xl sm:text-4xl font-extrabold shadow-2xl shadow-emerald-900/30"
                >
                  {getInitials(card.fullName)}
                </motion.div>

                <div className="text-center sm:text-left flex-1">
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg"
                  >
                    {card.fullName}
                  </motion.h1>
                  {card.jobTitle && (
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-lg sm:text-xl text-emerald-100 font-medium mt-1"
                    >
                      {card.jobTitle}
                    </motion.p>
                  )}
                  {card.company && (
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-sm sm:text-base text-emerald-200/80 font-medium mt-0.5"
                    >
                      {card.company}
                    </motion.p>
                  )}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center justify-center sm:justify-start gap-2 mt-3"
                  >
                    {card.privacy === 'public' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold text-white border border-white/20">
                        <FiGlobe className="w-3.5 h-3.5" />
                        Public Card
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 backdrop-blur-sm text-xs font-semibold text-orange-100 border border-orange-300/20">
                        <FiLock className="w-3.5 h-3.5" />
                        Private Card
                      </span>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 -mt-4 relative z-10 pb-12">

          {/* Private Card Access Notice */}
          {card.privacy === 'private' && !hasAccess() && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/40 dark:to-red-950/30 border border-orange-200 dark:border-orange-800/60 rounded-2xl p-6 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-orange-100 dark:bg-orange-900/50 p-3 rounded-2xl">
                    <FiLock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-orange-800 dark:text-orange-300 mb-0.5">Private Card</h3>
                    <p className="text-orange-700 dark:text-orange-400/80 text-sm">
                      You need to request access to view full details.
                    </p>
                  </div>
                </div>
                {isAuthenticated && !accessRequested && !accessStatus?.access && (
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all font-semibold text-sm shadow-lg shadow-orange-600/20"
                  >
                    <FiSend className="w-4 h-4" />
                    Request Access
                  </button>
                )}
                {accessRequested && (
                  <div className="flex items-center gap-2 px-5 py-2.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-xl font-semibold text-sm">
                    <FiCheck className="w-4 h-4" />
                    {accessStatus?.access ? 'Access Granted' : 'Access Requested'}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Card Display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-10">
            {/* Card Preview */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/30 p-8 border border-white/60 dark:border-slate-700/50 hover:border-emerald-300/50 dark:hover:border-emerald-500/30 transition-all duration-500 group">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">Card Preview</h2>
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="bg-emerald-100 dark:bg-emerald-900/40 p-3 rounded-2xl hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-all hover:scale-110 group/qr"
                  >
                    <FaQrcode className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </button>
                </div>

                <div className="flex justify-center">
                  <div className="w-full max-w-sm h-80 rounded-2xl overflow-hidden shadow-inner">
                    <CardRenderer
                      card={card}
                      mode="public"
                      className="w-full h-full"
                    />
                  </div>
                </div>

                <AnimatePresence>
                  <QRCodeDisplay
                    card={card}
                    isOpen={showQR}
                    onClose={() => setShowQR(false)}
                  />
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/30 p-8 border border-white/60 dark:border-slate-700/50 h-full flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6 tracking-tight flex items-center gap-3">
                  <div className="bg-amber-100 dark:bg-amber-900/40 p-2.5 rounded-xl">
                    <FiStar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  Quick Actions
                </h3>

                <div className="grid grid-cols-2 gap-3 flex-1">
                  {/* Love Button */}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleLove}
                    disabled={!isAuthenticated || !hasAccess()}
                    className={`relative flex items-center justify-center gap-2.5 py-4 px-4 rounded-2xl font-semibold text-sm transition-all overflow-hidden ${
                      isLoved
                        ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30'
                        : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-100 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                    } ${!isAuthenticated || !hasAccess() ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {isLoved && (
                      <span className="absolute inset-0 bg-white/10 animate-ping rounded-2xl" />
                    )}
                    <FaHeart className={`h-5 w-5 ${isLoved ? 'relative z-10' : ''}`} />
                    <span className="relative z-10">{isLoved ? 'Loved' : 'Love'}</span>
                  </motion.button>

                  {/* Share Button */}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2.5 py-4 px-4 rounded-2xl font-semibold text-sm bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
                  >
                    <FaShareAlt className="h-5 w-5" />
                    Share
                  </motion.button>

                  {/* Save to Library */}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSaveCard}
                    disabled={!isAuthenticated || isCardInLibrary || !hasAccess()}
                    className={`flex items-center justify-center gap-2.5 py-4 px-4 rounded-2xl font-semibold text-sm transition-all ${
                      isCardInLibrary
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40'
                    } ${!isAuthenticated || !hasAccess() ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <FaBookmark className="h-5 w-5" />
                    <span>{isCardInLibrary ? 'Saved' : 'Save'}</span>
                  </motion.button>

                  {/* Download */}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleDownloadCard}
                    disabled={isDownloading || !hasAccess()}
                    className="flex items-center justify-center gap-2.5 py-4 px-4 rounded-2xl font-semibold text-sm bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <FaDownload className="h-5 w-5" />
                    <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
                  </motion.button>
                </div>

                {/* Save to Contacts - Full width */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveToContacts}
                  disabled={isSavingContact || !hasAccess()}
                  className="flex items-center justify-center gap-2.5 w-full py-4 px-4 mt-3 rounded-2xl font-semibold text-sm bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FaMobile className="h-5 w-5" />
                  <span>{isSavingContact ? 'Saving...' : 'Save to Contacts'}</span>
                </motion.button>

                {/* Authentication Notice */}
                {!isAuthenticated && (
                  <div className="mt-5 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200/80 dark:border-amber-800/40">
                    <p className="text-sm text-amber-800 dark:text-amber-300 flex items-center font-medium">
                      <FiLock className="w-4 h-4 mr-2 flex-shrink-0" />
                      Login to access all features and interact with cards
                    </p>
                  </div>
                )}

                {/* Access Notice */}
                {!hasAccess() && isAuthenticated && (
                  <div className="mt-5 p-4 bg-orange-50 dark:bg-orange-950/30 rounded-2xl border border-orange-200/80 dark:border-orange-800/40">
                    <p className="text-sm text-orange-800 dark:text-orange-300 flex items-center font-medium">
                      <FiShield className="w-4 h-4 mr-2 flex-shrink-0" />
                      Request access to interact with this private card
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Complete Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/30 p-8 border border-white/60 dark:border-slate-700/50 mb-8"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-3 tracking-tight">
                <div className="bg-emerald-100 dark:bg-emerald-900/40 p-2.5 rounded-xl">
                  <FiUser className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                Contact Information
              </h3>

              {isAuthenticated && hasAccess() && (
                <button
                  onClick={handleToggleInfo}
                  className="flex items-center text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  {showFullInfo ? <FiEyeOff className="w-4 h-4 mr-1.5" /> : <FiEye className="w-4 h-4 mr-1.5" />}
                  {showFullInfo ? 'Hide' : 'Show'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4">Personal</h4>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-4 p-3.5 bg-white dark:bg-slate-800/80 rounded-2xl border-l-4 border-emerald-500 border border-gray-100 dark:border-slate-700/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all group">
                    <div className="bg-emerald-100 dark:bg-emerald-900/40 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                      <FiUser className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Full Name</p>
                      <p className="text-gray-900 dark:text-slate-100 font-bold truncate">{card.fullName}</p>
                    </div>
                  </div>

                  {personalFields.map((field, idx) => (
                    <div key={idx} className={`flex items-start gap-4 p-3.5 bg-white dark:bg-slate-800/80 rounded-2xl border-l-4 ${field.accentColor} border border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all group`}>
                      <div className="bg-gray-100 dark:bg-slate-700/50 p-2.5 rounded-xl group-hover:scale-110 transition-transform flex-shrink-0">
                        <field.icon className="h-4 w-4 text-gray-600 dark:text-slate-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold uppercase tracking-wide">{field.label}</p>
                        <p className={`font-bold ${field.textColor} leading-relaxed ${field.label === 'Bio' ? 'text-sm' : 'text-gray-900 dark:text-slate-100'}`}>{field.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4">Contact Details</h4>

                <div className="space-y-2.5">
                  {contactFields.map((field, idx) => {
                    const ValueWrapper = field.link ? 'a' : 'div';
                    const linkProps = field.link ? { href: field.link, target: field.link.startsWith('mailto:') || field.link.startsWith('tel:') ? undefined : '_blank', rel: field.link.startsWith('http') ? 'noopener noreferrer' : undefined } : {};

                    return (
                      <div key={idx} className={`flex items-center gap-4 p-3.5 bg-white dark:bg-slate-800/80 rounded-2xl border-l-4 ${field.accentColor} border border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all group`}>
                        <div className="bg-gray-100 dark:bg-slate-700/50 p-2.5 rounded-xl group-hover:scale-110 transition-transform flex-shrink-0">
                          <field.icon className="h-4 w-4 text-gray-600 dark:text-slate-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold uppercase tracking-wide">{field.label}</p>
                          <ValueWrapper
                            {...linkProps}
                            className={`font-bold text-sm ${field.link ? `${field.textColor} ${field.hoverColor} cursor-pointer` : 'text-gray-900 dark:text-slate-100'} transition-colors truncate block`}
                          >
                            {field.value}
                          </ValueWrapper>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Public Card Notice */}
            {card.privacy === 'public' && (
              <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-xl">
                    <FiGlobe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Public Card</h4>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400/80">
                      All contact information is visible to everyone.
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
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/30 p-8 border border-white/60 dark:border-slate-700/50 mb-8"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-8 flex items-center gap-3 tracking-tight">
              <div className="bg-green-100 dark:bg-green-900/40 p-2.5 rounded-xl">
                <FiEye className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              Card Statistics
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statItems.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className={`${stat.bgLight} ${stat.bgDark} rounded-2xl p-5 border border-white/60 dark:border-slate-700/30 text-center hover:scale-105 transition-transform duration-300 ring-1 ${stat.ringColor}`}
                >
                  <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} text-white mb-3 shadow-lg`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <p className={`text-3xl font-extrabold ${stat.textLight} ${stat.textDark} tracking-tight`}>
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Visual bar representation */}
            <div className="mt-6 space-y-3">
              {statItems.map((stat, idx) => {
                const maxVal = Math.max(...statItems.map(s => s.value), 1);
                const pct = (stat.value / maxVal) * 100;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-500 dark:text-slate-400 w-20 text-right uppercase tracking-wide">{stat.label}</span>
                    <div className="flex-1 h-3 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(pct, 2)}%` }}
                        transition={{ duration: 1, delay: 0.6 + idx * 0.15, ease: 'easeOut' }}
                        className={`h-full rounded-full bg-gradient-to-r ${stat.gradient}`}
                      />
                    </div>
                    <span className={`text-sm font-extrabold ${stat.textLight} ${stat.textDark} w-12 text-right`}>{stat.value}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center py-8"
          >
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400 dark:text-slate-500 font-medium">
              <span>Powered by</span>
              <a
                href="/"
                className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent font-bold hover:from-emerald-500 hover:to-green-400 transition-all"
              >
                Cardly
              </a>
            </div>
            <p className="text-xs text-gray-300 dark:text-slate-400 mt-1">Digital business cards, reimagined</p>
          </motion.div>
        </div>
      </div>

      {/* Access Request Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowRequestModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-slate-700/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">Request Access</h3>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 dark:text-slate-400 mb-4 text-sm leading-relaxed">
                  This is a private card. Send a request to the card owner to view full contact information.
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                    Message (optional)
                  </label>
                  <textarea
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="Tell the card owner why you'd like access..."
                    className="w-full p-3.5 border border-gray-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm transition-all"
                    rows="3"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestAccess}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all flex items-center justify-center gap-2 font-semibold text-sm shadow-lg shadow-emerald-600/20"
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
  );
};

export default CardViewer;
