import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { FiDownload, FiX, FiShare2, FiEye, FiUser, FiBriefcase, FiMail, FiPhone, FiGlobe, FiMapPin } from 'react-icons/fi';
import { FaQrcode, FaMobile, FaBookmark } from 'react-icons/fa';
import html2canvas from 'html2canvas';

const QRCodeDisplay = ({ card, isOpen, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);

  if (!isOpen || !card) return null;

  const cardUrl = `${window.location.origin}/c/${card.shortLink}`;

  const handleDownloadQR = () => {
    setIsDownloading(true);
    try {
      // Create a temporary canvas to get the QR code as image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 300;
      canvas.height = 300;

      // Create QR code data URL
      const qrCanvas = document.querySelector('#qr-code-canvas');
      if (qrCanvas) {
        ctx.drawImage(qrCanvas, 0, 0, 300, 300);
        
        // Download the image
        const link = document.createElement('a');
        link.download = `${card.fullName || 'card'}_QR.png`;
        link.href = canvas.toDataURL();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Failed to download QR code:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadCardWithQR = async () => {
    setIsDownloading(true);
    try {
      // Create a canvas to combine card image and QR code
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 800;
      canvas.height = 600;

      // Create card template
      const cardDiv = document.createElement('div');
      cardDiv.style.width = '400px';
      cardDiv.style.height = '250px';
      cardDiv.style.position = 'absolute';
      cardDiv.style.left = '-9999px';
      document.body.appendChild(cardDiv);

      // Render card template
      const cardElement = document.createElement('div');
      cardElement.innerHTML = `
        <div style="
          width: 400px; 
          height: 250px; 
          background: ${card.backgroundColor || '#667eea'}; 
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

      // Convert card to image
      const cardImage = await html2canvas(cardElement.firstChild);
      
      // Draw card on canvas
      ctx.drawImage(cardImage, 50, 50, 400, 250);

      // Generate QR code
      const qrCanvas = document.createElement('canvas');
      const qrCtx = qrCanvas.getContext('2d');
      qrCanvas.width = 200;
      qrCanvas.height = 200;
      
      // Simple QR code generation (you might want to use a proper QR library)
      qrCtx.fillStyle = '#000';
      qrCtx.fillRect(0, 0, 200, 200);
      qrCtx.fillStyle = '#fff';
      qrCtx.fillRect(10, 10, 180, 180);
      
      // Draw QR code on canvas
      ctx.drawImage(qrCanvas, 550, 50, 200, 200);

      // Add text
      ctx.fillStyle = '#333';
      ctx.font = '16px Arial';
      ctx.fillText('Digital Business Card', 50, 30);
      ctx.font = '12px Arial';
      ctx.fillText('Scan QR code to view online', 550, 280);

      // Download the image
      const link = document.createElement('a');
      link.download = `${card.fullName?.replace(/\s+/g, '_')}_Digital_Card.png`;
      link.href = canvas.toDataURL();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      document.body.removeChild(cardDiv);

    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${card.fullName} - Digital Business Card`,
          text: `Check out ${card.fullName}'s digital business card`,
          url: cardUrl
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(cardUrl);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to share:', error);
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

    } catch (error) {
      console.error('Failed to save contact:', error);
    } finally {
      setIsSavingContact(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">QR Code & Card Info</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - QR Code */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-900 mb-4">QR Code</h4>
              
              {/* QR Code */}
              <div className="flex justify-center mb-6">
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  <QRCodeCanvas
                    id="qr-code-canvas"
                    value={cardUrl}
                    size={200}
                    level="H"
                    includeMargin={true}
                    style={{
                      background: 'white',
                      borderRadius: '8px'
                    }}
                  />
                </div>
              </div>

              {/* Card Info */}
              <div className="text-center mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  {card.fullName}
                </h4>
                {card.jobTitle && (
                  <p className="text-gray-600 mb-1">{card.jobTitle}</p>
                )}
                {card.company && (
                  <p className="text-gray-500 text-sm">{card.company}</p>
                )}
              </div>

              {/* Privacy Notice */}
              {card.privacy === 'private' && (
                <div className="mb-6 p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-700 text-center">
                    <strong>Private Card:</strong> This card is only accessible via QR code
                  </p>
                </div>
              )}

              {/* QR Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleDownloadQR}
                  disabled={isDownloading}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <FiDownload className="w-4 h-4" />
                  {isDownloading ? 'Downloading...' : 'Download QR'}
                </button>
                
                <button
                  onClick={handleDownloadCardWithQR}
                  disabled={isDownloading}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <FaQrcode className="w-4 h-4" />
                  {isDownloading ? 'Creating...' : 'Download Card + QR'}
                </button>
              </div>
            </div>

            {/* Right Column - Contact Info */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h4>
              
              <div className="space-y-3 mb-6">
                {card.email && (
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <FiMail className="h-5 w-5 mr-3 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Email</p>
                      <a 
                        href={`mailto:${card.email}`}
                        className="text-blue-700 hover:text-blue-800 transition-colors font-medium"
                      >
                        {card.email}
                      </a>
                    </div>
                  </div>
                )}

                {card.phone && (
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <FiPhone className="h-5 w-5 mr-3 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Phone</p>
                      <a 
                        href={`tel:${card.phone}`}
                        className="text-green-700 hover:text-green-800 transition-colors font-medium"
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
                  <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                    <FiMapPin className="h-5 w-5 mr-3 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Address</p>
                      <p className="text-orange-700 font-medium">{card.address}</p>
                    </div>
                  </div>
                )}

                {card.bio && (
                  <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                    <FiUser className="h-5 w-5 mr-3 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Bio</p>
                      <p className="text-gray-700 leading-relaxed">{card.bio}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <FiShare2 className="w-4 h-4" />
                  Share Card
                </button>
                
                <button
                  onClick={handleSaveToContacts}
                  disabled={isSavingContact}
                  className="w-full flex items-center justify-center gap-2 bg-orange-100 text-orange-700 py-3 px-4 rounded-lg hover:bg-orange-200 transition-colors disabled:opacity-50"
                >
                  <FaMobile className="w-4 h-4" />
                  {isSavingContact ? 'Saving...' : 'Save to Contacts'}
                </button>
              </div>
            </div>
          </div>

          {/* URL Display */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Card URL:</p>
            <p className="text-sm text-gray-700 break-all">{cardUrl}</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QRCodeDisplay; 