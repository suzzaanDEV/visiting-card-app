import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPublicCard, fetchCardByShortLink } from '../features/cards/cardsThunks';
import CardViewer from '../components/CardViewer';
import { motion } from 'framer-motion';

const ViewCard = () => {
  const { cardId, shortLink } = useParams();
  const dispatch = useDispatch();
  const { currentCard, isLoading, error } = useSelector((state) => state.cards);
  const [card, setCard] = useState(null);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        if (cardId) {
          await dispatch(fetchPublicCard(cardId)).unwrap();
        } else if (shortLink) {
          await dispatch(fetchCardByShortLink(shortLink)).unwrap();
        }
      } catch (error) {
        console.error('Error fetching card:', error);
      }
    };

    fetchCard();
  }, [cardId, shortLink, dispatch]);

  useEffect(() => {
    if (currentCard) {
      setCard(currentCard.card || currentCard);
    }
  }, [currentCard]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading card...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center max-w-md mx-auto p-6"
        >
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Card Not Found</h1>
          <p className="text-gray-600">
            The card you're looking for doesn't exist or may have been removed.
          </p>
        </motion.div>
      </div>
    );
  }

  return <CardViewer card={card} />;
};

export default ViewCard;