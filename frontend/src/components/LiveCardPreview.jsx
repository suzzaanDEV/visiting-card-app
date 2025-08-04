import React from 'react';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff, FiLock, FiGlobe, FiMail, FiPhone, FiGlobe as FiWebsite, FiMapPin } from 'react-icons/fi';
import SimpleCardTemplate from './SimpleCardTemplate';

const LiveCardPreview = ({ formData, selectedTemplate }) => {
  if (!formData) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
            Live Preview
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            This is exactly how your card will appear to others
          </p>
          <div className="flex items-center justify-center h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <div className="text-gray-400 mb-2">
                <FiGlobe className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-500 text-sm">Start filling the form to see preview</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Create card data from form
  const cardData = {
    fullName: formData.fullName || 'Your Name',
    jobTitle: formData.jobTitle || 'Job Title',
    company: formData.company || 'Company Name',
    email: formData.email || 'email@example.com',
    phone: formData.phone || '+977-XXXXXXXXX',
    website: formData.website || 'www.example.com',
    address: formData.address || 'Kathmandu, Nepal',
    bio: formData.bio || 'Professional bio goes here...',
    backgroundColor: formData.backgroundColor || '#667eea',
    textColor: formData.textColor || '#ffffff',
    fontFamily: formData.fontFamily || 'Arial',
    privacy: formData.privacy || 'public'
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Live Preview
          </h3>
          <div className="flex items-center gap-2">
            {cardData.privacy === 'public' ? (
              <span className="flex items-center text-green-600 text-sm">
                <FiEye className="w-4 h-4 mr-1" />
                Public
              </span>
            ) : (
              <span className="flex items-center text-orange-600 text-sm">
                <FiLock className="w-4 h-4 mr-1" />
                Private
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          This is exactly how your card will appear to others
        </p>
        
        {/* Card Preview */}
        <div className="flex justify-center">
          <div className="w-full max-w-sm h-80">
            <SimpleCardTemplate 
              card={cardData} 
              template={selectedTemplate}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Privacy:</strong> {cardData.privacy === 'public' 
              ? 'This card will be visible in the discovery section and searchable by others.' 
              : 'This card will only be accessible via direct link or QR code, not visible in discovery.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveCardPreview; 