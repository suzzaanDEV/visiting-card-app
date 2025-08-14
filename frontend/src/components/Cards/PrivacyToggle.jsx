import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaLock, FaUnlock, FaGlobe, FaUsers } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const PrivacyToggle = ({ 
  cardId, 
  initialPrivacy = 'public', 
  onPrivacyChange, 
  showLabel = true,
  size = 'md',
  disabled = false 
}) => {
  const [privacy, setPrivacy] = useState(initialPrivacy);
  const [isLoading, setIsLoading] = useState(false);

  const handlePrivacyToggle = async () => {
    if (disabled || isLoading) return;

    const newPrivacy = privacy === 'public' ? 'private' : 'public';
    
    try {
      setIsLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`/api/cards/${cardId}/privacy`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ privacy: newPrivacy })
      });

      if (response.ok) {
        setPrivacy(newPrivacy);
        onPrivacyChange?.(newPrivacy);
        toast.success(`Card is now ${newPrivacy}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update privacy');
      }
    } catch (error) {
      console.error('Error updating privacy:', error);
      toast.error(error.message || 'Failed to update privacy');
    } finally {
      setIsLoading(false);
    }
  };

  const isPublic = privacy === 'public';
  const isPrivate = privacy === 'private';

  const sizeClasses = {
    sm: 'w-12 h-6',
    md: 'w-14 h-7',
    lg: 'w-16 h-8'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const labelSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="flex items-center space-x-3">
      {showLabel && (
        <div className="flex items-center space-x-2">
          {isPublic ? (
            <FaGlobe className={`${iconSizes[size]} text-green-600`} />
          ) : (
            <FaLock className={`${iconSizes[size]} text-red-600`} />
          )}
          <span className={`${labelSizes[size]} font-medium text-gray-700`}>
            {isPublic ? 'Public' : 'Private'}
          </span>
        </div>
      )}
      
      <motion.button
        onClick={handlePrivacyToggle}
        disabled={disabled || isLoading}
        className={`
          relative inline-flex items-center justify-center rounded-full transition-all duration-300
          ${sizeClasses[size]}
          ${isPublic 
            ? 'bg-green-500 hover:bg-green-600' 
            : 'bg-red-500 hover:bg-red-600'
          }
          ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        `}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className={`
            absolute left-1 bg-white rounded-full shadow-md
            ${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'}
          `}
          animate={{
            x: isPublic ? 0 : size === 'sm' ? 20 : size === 'md' ? 24 : 28
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <div className="flex items-center justify-center w-full h-full">
            {isLoading ? (
              <div className={`${iconSizes[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`} />
            ) : isPublic ? (
              <FaEye className={`${iconSizes[size]} text-green-600`} />
            ) : (
              <FaEyeSlash className={`${iconSizes[size]} text-red-600`} />
            )}
          </div>
        </motion.div>
      </motion.button>

      {/* Privacy Info Tooltip */}
      <div className="relative group">
        <div className="cursor-help">
          <FaUsers className={`${iconSizes[size]} text-gray-400`} />
        </div>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          {isPublic 
            ? 'Anyone can view this card' 
            : 'Only you and approved users can view this card'
          }
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyToggle;
