import React from 'react';
import { motion } from 'framer-motion';
import CardPreview from './CardPreview';

const VisitingCard3D = ({ card, template, className = "" }) => {
  if (!card) {
    return (
      <div className={`flex justify-center ${className}`}>
        <div className="relative w-full max-w-5xl">
          <div className="relative w-full h-96 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 transform perspective-1000">
            <div className="w-full h-full flex items-center justify-center text-9xl font-bold text-white bg-gradient-to-br from-blue-500 to-purple-600">
              ?
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get initials from full name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(card.fullName || card.ownerUserId?.name);

  return (
    <div className={`flex justify-center ${className}`}>
      <div className="relative w-full max-w-5xl">
        <motion.div 
          className="relative w-full h-96 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 transform perspective-1000"
          style={{ transform: 'none' }}
          whileHover={{ 
            rotateY: 5,
            rotateX: 2,
            scale: 1.02
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Card Content */}
          <div className="w-full h-full">
            <CardPreview 
              card={card} 
              template={template}
              className="w-full h-full rounded-3xl"
              showActions={false}
            />
          </div>

          {/* QR Code Button */}
          <button className="absolute top-6 right-6 bg-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110">
            <svg 
              stroke="currentColor" 
              fill="currentColor" 
              strokeWidth="0" 
              viewBox="0 0 448 512" 
              className="h-8 w-8 text-gray-600" 
              height="1em" 
              width="1em" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 224h192V32H0v192zM64 96h64v64H64V96zm192-64v192h192V32H256zm128 128h-64V96h64v64zM0 480h192V288H0v192zm64-128h64v64H64v-64zm352-64h32v128h-96v-32h-32v96h-64V288h96v32h64v-32zm0 160h32v32h-32v-32zm-64 0h32v32h-32v-32z"></path>
            </svg>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default VisitingCard3D;
