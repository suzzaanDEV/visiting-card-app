import React from 'react';
import { FiEye, FiEyeOff, FiLock, FiGlobe } from 'react-icons/fi';
import CardRenderer from './Cards/CardRenderer';

const LiveCardPreview = ({ formData, selectedTemplate }) => {
  if (!formData) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4 flex items-center">
            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
            Live Preview
          </h3>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
            This is exactly how your card will appear to others
          </p>
          <div className="flex items-center justify-center h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600">
            <div className="text-center">
              <div className="text-gray-400 dark:text-slate-500 mb-2">
                <FiGlobe className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-500 dark:text-slate-400 text-sm">Start filling the form to see preview</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const td = (selectedTemplate && selectedTemplate.design) || {};
  const cardData = {
    fullName: formData.fullName || 'Your Name',
    jobTitle: formData.jobTitle || 'Job Title',
    company: formData.company || 'Company Name',
    email: formData.email,
    phone: formData.phone,
    mobile: formData.mobile,
    website: formData.website,
    address: formData.address,
    city: formData.city,
    state: formData.state,
    country: formData.country,
    bio: formData.bio,
    tagline: formData.tagline,
    companyTagline: formData.companyTagline,
    department: formData.department,
    socialLinks: formData.socialLinks || {},
    backgroundColor: td.backgroundColor || formData.backgroundColor || '#10B981',
    textColor: td.textColor || formData.textColor || '#ffffff',
    fontFamily: td.fontFamily || formData.fontFamily || 'Inter',
    privacy: formData.privacy || 'public',
    cardDesign: {
      backgroundColor: td.backgroundColor || formData.backgroundColor || '#10B981',
      textColor: td.textColor || formData.textColor || '#ffffff',
      accentColor: td.accentColor || formData.accentColor || '#047857',
      fontFamily: td.fontFamily || formData.fontFamily || 'Inter',
      backgroundImage: td.backgroundImage || formData.backgroundImage || '',
      borderRadius: td.borderRadius ? `${td.borderRadius}px` : (formData.borderRadius || '12px'),
      layout: td.layout || formData.layout || 'standard'
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Live Preview
          </h3>
          <div className="flex items-center gap-2">
            {cardData.privacy === 'public' ? (
              <span className="flex items-center text-green-600 dark:text-green-400 text-sm">
                <FiEye className="w-4 h-4 mr-1" />
                Public
              </span>
            ) : (
              <span className="flex items-center text-orange-600 dark:text-orange-400 text-sm">
                <FiLock className="w-4 h-4 mr-1" />
                Private
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
          This is exactly how your card will appear to others
        </p>

        <div className="flex justify-center">
          <div className="w-full max-w-sm h-80 rounded-xl overflow-hidden">
            <CardRenderer
              card={cardData}
              mode="preview"
              className="w-full h-full"
            />
          </div>
        </div>

        <div className="mt-4 p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
          <p className="text-xs text-emerald-700 dark:text-emerald-300">
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