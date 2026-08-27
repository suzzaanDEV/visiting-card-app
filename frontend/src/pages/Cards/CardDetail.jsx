import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiHeart, FiShare, FiDownload, FiSave, FiEye, FiAlertCircle, FiCheck, FiEdit, FiTrash2 } from 'react-icons/fi';
import { FaHeart, FaShareAlt, FaDownload, FaSave, FaQrcode } from 'react-icons/fa';
import toast from 'react-hot-toast';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import { fetchCard, deleteCard } from '../../features/cards/cardsThunks';
import { saveCardToLibrary, fetchSavedCards } from '../../features/library/libraryThunks';
import { toggleCardLove } from '../../features/cards/cardsThunks';
import TemplateCardRenderer from '../../components/TemplateCardRenderer';
import PrivacyToggle from '../../components/Cards/PrivacyToggle';

const CardDetail = () => {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { items: savedCards } = useSelector(state => state.library);
  const { currentCard, isLoading, error } = useSelector(state => state.cards);
  
  const [copied, setCopied] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [template, setTemplate] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [showTemplateView, setShowTemplateView] = useState(false);



  // Check if the current card is already in the library
  const isCardInLibrary = savedCards?.some(savedCard => savedCard.cardId?._id === cardId);

  useEffect(() => {
    // Fetch saved cards to check if current card is in library
    dispatch(fetchSavedCards({}));
  }, [dispatch]);

  useEffect(() => {
    if (cardId) {
      dispatch(fetchCard(cardId));
    }
  }, [cardId, dispatch]);

  useEffect(() => {
    if (currentCard?.templateId) {
      fetchTemplate();
    }
  }, [currentCard?.templateId]);

  const fetchTemplate = async () => {
    if (!currentCard?.templateId) return;
    
    setIsLoadingTemplate(true);
    try {
      const response = await fetch(`/api/templates/${currentCard.templateId}`);
      if (response.ok) {
        const templateData = await response.json();
        setTemplate(templateData);
      }
    } catch {
      console.error('Failed to fetch template:');
    } finally {
      setIsLoadingTemplate(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this card?')) {
      return;
    }

    try {
      await dispatch(deleteCard(cardId)).unwrap();
      toast.success('Card deleted successfully!');
      navigate('/cards');
    } catch {
      toast.error('Failed to delete card');
    }
  };

  const handleLove = async () => {
    try {
      await dispatch(toggleCardLove(cardId)).unwrap();
      toast.success('Card loved!');
    } catch {
      toast.error('Failed to love card');
    }
  };

  const handleSave = async () => {
    try {
      if (isCardInLibrary) {
        toast.error('Card is already in your library!');
        return;
      }
      
      await dispatch(saveCardToLibrary({ cardId })).unwrap();
      toast.success('Card saved to library!');
    } catch {
      toast.error('Failed to save card');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${currentCard?.fullName} - ${currentCard?.jobTitle}`,
          text: `Check out ${currentCard?.fullName}'s digital business card`,
          url: window.location.href
        });
        toast.success('Shared successfully!');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      toast.error('Failed to share');
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 dark:from-slate-950 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400">Loading card...</p>
        </div>
      </div>
    );
  }

  if (error || !currentCard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 dark:from-slate-950 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Card Not Found</h2>
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'The card you\'re looking for doesn\'t exist.'}</p>
          <button 
            onClick={() => navigate('/cards')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const card = currentCard.card || currentCard;
  const isOwner = user?.userId === card.ownerUserId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 dark:from-slate-950 dark:to-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/cards')}
              className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            >
              <FiArrowLeft className="mr-2" />
              Back to Cards
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">{card.fullName}</h1>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card Display */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Card Preview</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowTemplateView(!showTemplateView)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    showTemplateView 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {showTemplateView ? 'Template View' : 'Design View'}
                </button>
              </div>
            </div>

            <div className="relative">
              {showTemplateView && template && !isLoadingTemplate ? (
                <div className="w-full h-96 bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                  <TemplateCardRenderer 
                    card={card} 
                    template={template}
                    className="w-full h-full"
                  />
                </div>
              ) : isLoadingTemplate ? (
                <div className="w-full h-96 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Loading template...</p>
                  </div>
                </div>
              ) : (
                <div 
                  className="w-full h-96 rounded-xl flex items-center justify-center text-9xl font-bold text-white"
                  style={{
                    background: card.backgroundColor || 'linear-gradient(135deg, #10B981 0%, #047857 100%)'
                  }}
                >
                  {card.fullName?.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)}
                </div>
              )}
            </div>
          </motion.div>

          {/* Card Information */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Basic Information */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-6">Card Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-slate-400">Title</label>
                  <p className="text-lg font-medium text-gray-900 dark:text-slate-100">{card.title || 'Untitled'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-slate-400">Full Name</label>
                  <p className="text-lg font-medium text-gray-900 dark:text-slate-100">{card.fullName}</p>
                </div>
                
                {card.jobTitle && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-400">Job Title</label>
                    <p className="text-lg font-medium text-gray-900 dark:text-slate-100">{card.jobTitle}</p>
                  </div>
                )}
                
                {card.company && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-400">Company</label>
                    <p className="text-lg font-medium text-gray-900 dark:text-slate-100">{card.company}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-6">Contact Information</h3>
              
              <div className="space-y-4">
                {card.email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-400">Email</label>
                    <a 
                      href={`mailto:${card.email}`}
                      className="text-lg font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:text-emerald-300 transition-colors"
                    >
                      {card.email}
                    </a>
                  </div>
                )}
                
                {card.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-400">Phone</label>
                    <a 
                      href={`tel:${card.phone}`}
                      className="text-lg font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:text-green-300 transition-colors"
                    >
                      {formatPhone(card.phone)}
                    </a>
                  </div>
                )}
                
                {card.website && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-400">Website</label>
                    <a 
                      href={card.website.startsWith('http') ? card.website : `https://${card.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:text-green-300 transition-colors"
                    >
                      {card.website}
                    </a>
                  </div>
                )}
                
                {card.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-400">Address</label>
                    <p className="text-lg font-medium text-gray-900 dark:text-slate-100">{card.address}</p>
                  </div>
                )}
                
                {card.bio && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-400">Bio</label>
                    <p className="text-lg font-medium text-gray-900 dark:text-slate-100">{card.bio}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-6">Actions</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleLove}
                  className="flex items-center justify-center px-4 py-3 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:bg-red-900/40 transition-colors"
                >
                  <FaHeart className="mr-2" />
                  Love
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={isCardInLibrary}
                  className={`flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${
                    isCardInLibrary 
                      ? 'bg-gray-300 text-gray-500 dark:text-slate-400 cursor-not-allowed' 
                      : 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 hover:bg-green-100 dark:bg-green-900/40'
                  }`}
                >
                  <FiSave className="mr-2" />
                  {isCardInLibrary ? 'Already Saved' : 'Save'}
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center px-4 py-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:bg-emerald-900/40 transition-colors"
                >
                  {copied ? <FiCheck className="mr-2" /> : <FaShareAlt className="mr-2" />}
                  {copied ? 'Copied!' : 'Share'}
                </button>
                
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="flex items-center justify-center px-4 py-3 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:bg-green-900/40 transition-colors"
                >
                  <FaQrcode className="mr-2" />
                  QR Code
                </button>
              </div>

              {isOwner && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                  {/* Privacy Toggle for Card Owner */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Card Privacy</span>
                      <PrivacyToggle
                        cardId={cardId}
                        initialPrivacy={card.isPublic ? 'public' : 'private'}
                                                 onPrivacyChange={() => {
                           // Update the card state locally
                         }}
                        showLabel={false}
                        size="md"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => navigate(`/cards/edit/${cardId}`)}
                      className="flex items-center justify-center px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <FiEdit className="mr-2" />
                      Edit
                    </button>
                    
                    <button
                      onClick={handleDelete}
                      className="flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <FiTrash2 className="mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Premium QR Code Modal */}
      <QRCodeDisplay
        card={card}
        isOpen={showQR}
        onClose={() => setShowQR(false)}
      />
    </div>
  );
};

export default CardDetail;
