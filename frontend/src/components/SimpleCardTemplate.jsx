import React from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiGlobe, FiMapPin, FiUser, FiBriefcase } from 'react-icons/fi';

const SimpleCardTemplate = ({ card, template, className = "", style = {} }) => {
  if (!card) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-lg font-semibold mb-2">No Card Data</div>
          <div className="text-sm">Card information not available</div>
        </div>
      </div>
    );
  }

  // Get card data with fallbacks
  const cardData = {
    fullName: card.fullName || 'Your Name',
    jobTitle: card.jobTitle || 'Job Title',
    company: card.company || 'Company',
    email: card.email || 'email@example.com',
    phone: card.phone || '+977-XXXXXXXXX',
    website: card.website || 'www.example.com',
    address: card.address || 'Address',
    bio: card.bio || 'Bio description',
    backgroundColor: card.backgroundColor || '#667eea',
    textColor: card.textColor || '#ffffff',
    fontFamily: card.fontFamily || 'Arial'
  };

  // Generate initials for avatar
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate gradient background
  const generateGradient = () => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    ];
    
    const colorIndex = card._id ? parseInt(card._id.slice(-1), 16) % gradients.length : 0;
    return gradients[colorIndex];
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`relative w-full h-full overflow-hidden rounded-xl shadow-lg ${className}`}
      style={{
        background: cardData.backgroundColor || generateGradient(),
        color: cardData.textColor,
        fontFamily: cardData.fontFamily,
        ...style
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

      {/* Card Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-8">
        {/* Header Section */}
        <div className="text-center mb-6">
          {/* Avatar/Initials */}
          <div className="w-20 h-20 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
            {getInitials(cardData.fullName)}
          </div>
          
          {/* Name and Title */}
          <h2 className="text-3xl font-bold mb-2">{cardData.fullName}</h2>
          {cardData.jobTitle && (
            <p className="text-lg opacity-90 mb-1">{cardData.jobTitle}</p>
          )}
          {cardData.company && (
            <p className="text-base opacity-80">{cardData.company}</p>
          )}
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          {cardData.email && (
            <div className="flex items-center">
              <FiMail className="w-4 h-4 mr-3 opacity-80" />
              <span className="text-sm truncate">{cardData.email}</span>
            </div>
          )}
          
          {cardData.phone && (
            <div className="flex items-center">
              <FiPhone className="w-4 h-4 mr-3 opacity-80" />
              <span className="text-sm">{cardData.phone}</span>
            </div>
          )}
          
          {cardData.website && (
            <div className="flex items-center">
              <FiGlobe className="w-4 h-4 mr-3 opacity-80" />
              <span className="text-sm truncate">{cardData.website}</span>
            </div>
          )}
          
          {cardData.address && (
            <div className="flex items-center">
              <FiMapPin className="w-4 h-4 mr-3 opacity-80" />
              <span className="text-sm truncate">{cardData.address}</span>
            </div>
          )}
        </div>

        {/* Bio Section */}
        {cardData.bio && (
          <div className="mt-4 pt-4 border-t border-white border-opacity-20">
            <p className="text-xs opacity-90 leading-relaxed">{cardData.bio}</p>
          </div>
        )}

        {/* Privacy Badge */}
        <div className="absolute top-4 right-4">
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
            card.privacy === 'public' 
              ? 'bg-green-500 bg-opacity-20 text-green-100' 
              : 'bg-orange-500 bg-opacity-20 text-orange-100'
          }`}>
            {card.privacy === 'public' ? 'Public' : 'Private'}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SimpleCardTemplate; 