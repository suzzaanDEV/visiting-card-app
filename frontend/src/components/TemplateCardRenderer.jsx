import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const PLACEHOLDERS = {
  '{{fullName}}': (d) => d.fullName,
  '{{jobTitle}}': (d) => d.jobTitle,
  '{{company}}': (d) => d.company,
  '{{email}}': (d) => d.email,
  '{{phone}}': (d) => d.phone,
  '{{website}}': (d) => d.website,
  '{{address}}': (d) => d.address,
  '{{bio}}': (d) => d.bio
};

const resolveText = (text, cardData) => {
  if (!text) return '';
  return String(text).replace(/{{(\w+)}}/g, (match) => {
    const resolve = PLACEHOLDERS[match];
    return resolve ? resolve(cardData) : match;
  });
};

const TemplateCardRenderer = ({ card, template, className = "", style = {} }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!template || !card) {
      setError('Template or card data missing');
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
  }, [card, template]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-neutral-100 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
          <div className="text-sm text-neutral-500">Rendering card...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-neutral-100 rounded-lg ${className}`}>
        <div className="text-center text-neutral-500">
          <div className="text-lg font-semibold mb-2">Error</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className={`flex items-center justify-center bg-neutral-100 rounded-lg ${className}`}>
        <div className="text-center text-neutral-500">
          <div className="text-lg font-semibold mb-2">No Card Data</div>
          <div className="text-sm">Card information not available</div>
        </div>
      </div>
    );
  }

  // Get card data
  const cardData = {
    fullName: card.fullName || card.ownerUserId?.name || 'Your Name',
    jobTitle: card.jobTitle || card.ownerUserId?.jobTitle || 'Job Title',
    company: card.company || card.ownerUserId?.company || 'Company',
    email: card.email || card.ownerUserId?.email || 'email@example.com',
    phone: card.phone || card.ownerUserId?.phone || '+(977) 9xxxxxxxxx',
    website: card.website || card.ownerUserId?.website || 'www.example.com',
    address: card.address || card.ownerUserId?.location || 'Address',
    bio: card.bio || card.ownerUserId?.bio || 'Bio description'
  };

  // Get template design
  const design = template.design || template.preview || {};
  const backgroundColor = design.backgroundColor || '#ffffff';
  const elements = design.elements || [];

  // Render using HTML/CSS instead of canvas
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`relative w-full h-full overflow-hidden rounded-lg ${className}`}
      style={{
        backgroundColor,
        ...style
      }}
    >
      {design.backgroundImage && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${design.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}

      <div className="relative w-full h-full p-6">
        {/* Render elements using HTML/CSS */}
        {elements.length === 0 ? (
          // Default card layout if no elements
          <div className="h-full flex flex-col justify-center">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2 text-gray-800">
                {cardData.fullName}
              </h3>
              <p className="text-lg text-gray-600 mb-1">
                {cardData.jobTitle}
              </p>
              <p className="text-gray-500 mb-4">
                {cardData.company}
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                {cardData.email && <p>{cardData.email}</p>}
                {cardData.phone && <p>{cardData.phone}</p>}
                {cardData.website && <p>{cardData.website}</p>}
              </div>
            </div>
          </div>
        ) : (
          // Render template elements
          <div className="relative w-full h-full">
            {elements.map((element, index) => {
              const type = (element.type || '').toLowerCase();

              // Handle Text elements
              if (type === 'text') {
                return (
                  <div
                    key={index}
                    className="absolute"
                    style={{
                      left: `${element.x || 0}px`,
                      top: `${element.y || 0}px`,
                      fontSize: `${element.fontSize || 16}px`,
                      fontFamily: element.fontFamily || design.fontFamily || 'Arial',
                      fontWeight: element.fontWeight || 'normal',
                      color: element.fill || element.color || '#000000',
                      textAlign: element.textAlign || 'left',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {resolveText(element.text, cardData)}
                  </div>
                );
              }

              // Handle Rect elements
              if (type === 'rect') {
                return (
                  <div
                    key={index}
                    className="absolute"
                    style={{
                      left: `${element.x || 0}px`,
                      top: `${element.y || 0}px`,
                      width: `${element.width || 100}px`,
                      height: `${element.height || 100}px`,
                      backgroundColor: element.fill || '#ffffff',
                      border: element.strokeWidth ? `${element.strokeWidth}px solid ${element.stroke || '#000000'}` : 'none',
                      borderRadius: element.cornerRadius ? `${element.cornerRadius}px` : '0'
                    }}
                  />
                );
              }

              // Handle Circle elements
              if (type === 'circle') {
                return (
                  <svg
                    key={index}
                    className="absolute"
                    style={{
                      left: '0',
                      top: '0',
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none'
                    }}
                  >
                    <circle
                      cx={element.x || 0}
                      cy={element.y || 0}
                      r={element.radius || (element.width || 50) / 2}
                      fill={element.fill || '#ffffff'}
                      stroke={element.strokeWidth ? element.stroke || '#000000' : 'none'}
                      strokeWidth={element.strokeWidth || 0}
                    />
                  </svg>
                );
              }

              // Handle Line elements
              if (type === 'line') {
                const x1 = element.x1 ?? element.x ?? 0;
                const y1 = element.y1 ?? element.y ?? 0;
                const x2 = element.x2 ?? (x1 + (Array.isArray(element.points) ? element.points[2] : 0));
                const y2 = element.y2 ?? (y1 + (Array.isArray(element.points) ? element.points[3] : 0));

                return (
                  <svg
                    key={index}
                    className="absolute"
                    style={{
                      left: '0',
                      top: '0',
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none'
                    }}
                  >
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={element.stroke || element.fill || '#000000'}
                      strokeWidth={element.strokeWidth || 1}
                    />
                  </svg>
                );
              }

              return null;
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TemplateCardRenderer;