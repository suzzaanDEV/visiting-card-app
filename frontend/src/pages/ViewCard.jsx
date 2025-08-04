import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPublicCard, fetchCardByShortLink } from '../features/cards/cardsThunks';
import CardViewer from '../components/Cards/CardViewer';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiHome } from 'react-icons/fi';

const ViewCard = () => {
  const { cardId, shortLink } = useParams();
  const dispatch = useDispatch();
  const { currentCard, isLoading, error } = useSelector((state) => state.cards);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [card, setCard] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        setFetchError(null);
        if (cardId) {
          await dispatch(fetchPublicCard(cardId)).unwrap();
        } else if (shortLink) {
          await dispatch(fetchCardByShortLink(shortLink)).unwrap();
        }
      } catch (error) {
        console.error('Error fetching card:', error);
        setFetchError(error.message || 'Failed to fetch card');
      }
    };

    fetchCard();
  }, [cardId, shortLink, dispatch]);

  useEffect(() => {
    if (currentCard) {
      // Handle both direct card object and nested card object
      const cardData = currentCard.card || currentCard;
      setCard(cardData);
    }
  }, [currentCard]);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading card...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait while we fetch the card details</p>
        </motion.div>
      </div>
    );
  }

  if (fetchError || error || !card) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg"
        >
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Card Not Found</h1>
          <p className="text-gray-600 mb-6">
            {fetchError || error || "The card you're looking for doesn't exist or may have been removed."}
          </p>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={handleGoHome}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FiHome className="w-4 h-4" />
              Go Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return <CardViewer card={card} />;
};

export default ViewCard;