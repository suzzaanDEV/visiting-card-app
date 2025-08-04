import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiShare2, FiHeart, FiBookmark, FiMail, FiPhone, FiGlobe, FiMapPin } from 'react-icons/fi';
import { FaQrcode, FaHeart, FaShareAlt, FaDownload, FaBookmark, FaMobile } from 'react-icons/fa';
import toast from 'react-hot-toast';

const TestCardFeatures = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [isLoved, setIsLoved] = useState(false);

  // Mock card data
  const card = {
    _id: '688f9c53d98543f6eb3d27d9',
    fullName: 'Hari KC',
    jobTitle: 'Marketing Manager',
    company: 'Digital Marketing Nepal',
    email: 'hari.kc@gmail.com',
    phone: '+977-9843456789',
    website: 'www.harikec.com',
    address: 'Patan, Lalitpur, Nepal',
    bio: 'Marketing professional with expertise in digital marketing and brand strategy.',
    backgroundColor: '#4facfe',
    textColor: '#ffffff',
    fontFamily: 'Arial',
    shortLink: 'mea8awqz',
    privacy: 'public',
    views: 39,
    loveCount: 1,
    shares: 9,
    downloads: 6
  };

  const handleLove = () => {
    setIsLoved(!isLoved);
    toast.success(isLoved ? 'Removed from loves' : 'Added to loves');
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

  const handleDownloadCard = async () => {
    setIsDownloading(true);
    try {
      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Card downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download card');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveToContacts = async () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Card Features Test</h1>
          <p className="text-xl text-gray-600">Testing all card functionality</p>
        </div>

        {/* Card Preview */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Card Preview</h2>
          
          <div className="flex justify-center mb-6">
            <div 
              className="w-80 h-48 rounded-xl p-6 flex flex-col justify-between"
              style={{
                background: card.backgroundColor,
                color: card.textColor,
                fontFamily: card.fontFamily
              }}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">
                  {card.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <h3 className="text-xl font-bold mb-1">{card.fullName}</h3>
                <p className="text-sm opacity-90 mb-1">{card.jobTitle}</p>
                <p className="text-xs opacity-80">{card.company}</p>
              </div>
              
              <div className="text-xs space-y-1">
                {card.email && <div>📧 {card.email}</div>}
                {card.phone && <div>📞 {card.phone}</div>}
                {card.website && <div>🌐 {card.website}</div>}
                {card.address && <div>📍 {card.address}</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Features Test */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Features Test</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {/* Love Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLove}
              className={`flex items-center justify-center p-4 rounded-xl transition-all ${
                isLoved 
                  ? 'bg-red-600 text-white shadow-red-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
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

            {/* Download Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownloadCard}
              disabled={isDownloading}
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
              disabled={isSavingContact}
              className="flex items-center justify-center p-4 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition-all disabled:opacity-50"
            >
              <FaMobile className="h-5 w-5 mr-2" />
              <span className="font-medium">{isSavingContact ? 'Saving...' : 'Save Contact'}</span>
            </motion.button>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
              
              {card.email && (
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <FiMail className="h-5 w-5 mr-3 text-green-500" />
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
                  <FiPhone className="h-5 w-5 mr-3 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Phone</p>
                    <a 
                      href={`tel:${card.phone}`}
                      className="text-orange-700 hover:text-orange-800 transition-colors font-medium"
                    >
                      {card.phone}
                    </a>
                  </div>
                </div>
              )}

              {card.website && (
                <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                  <FiGlobe className="h-5 w-5 mr-3 text-purple-500" />
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
                  <FiMapPin className="h-5 w-5 mr-3 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Address</p>
                    <p className="text-red-700 font-medium">{card.address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Statistics */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Card Statistics</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <FaDownload className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-blue-600">{card.views}</p>
                  <p className="text-xs text-gray-600">Views</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <FaHeart className="h-5 w-5 text-red-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-red-600">{card.loveCount}</p>
                  <p className="text-xs text-gray-600">Loves</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <FaShareAlt className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-green-600">{card.shares}</p>
                  <p className="text-xs text-gray-600">Shares</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <FaDownload className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-purple-600">{card.downloads}</p>
                  <p className="text-xs text-gray-600">Downloads</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCardFeatures; 