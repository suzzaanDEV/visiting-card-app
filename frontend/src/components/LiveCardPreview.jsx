import React from 'react';
import TemplateCardRenderer from './TemplateCardRenderer';

const LiveCardPreview = ({ formData, selectedTemplate }) => {
  if (!selectedTemplate) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
            Live Preview
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            This is exactly how your card will appear to others
          </p>
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">Select a template to see preview</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Use all form fields as card data
  const cardData = {
            fullName: formData.fullName || 'Suzan Ghimire',
    jobTitle: formData.jobTitle || 'Software Engineer',
    company: formData.company || 'Company Name',
            email: formData.email || 'ram.thapa@cardly.com',
    phone: formData.phone || '+(977) 9xxxxxxxxx',
    website: formData.website || 'www.example.com',
          address: formData.address || '123 Thamel Marg, Kathmandu',
    bio: formData.bio || 'Short bio goes here.'
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
          Live Preview
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          This is exactly how your card will appear to others
        </p>
        <div className="flex justify-center">
          <TemplateCardRenderer card={cardData} template={selectedTemplate} className="w-full max-w-md" />
        </div>
      </div>
    </div>
  );
};

export default LiveCardPreview; 