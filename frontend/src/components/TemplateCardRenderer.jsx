import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TemplateCardRenderer = ({ card, template, className = "", style = {} }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!template || !card) {
      setError('Template or card data missing');
      setIsLoading(false);
      return;
    }

    // Simple timeout to simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
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
              // Handle Text elements
              if (element.type === 'Text') {
                let text = element.text;
                if (text === '{{fullName}}') text = cardData.fullName;
                else if (text === '{{jobTitle}}') text = cardData.jobTitle;
                else if (text === '{{company}}') text = cardData.company;
                else if (text === '{{email}}') text = cardData.email;
                else if (text === '{{phone}}') text = cardData.phone;
                else if (text === '{{website}}') text = cardData.website;
                else if (text === '{{address}}') text = cardData.address;
                else if (text === '{{bio}}') text = cardData.bio;

                return (
                  <div
                    key={index}
                    className="absolute"
                    style={{
                      left: `${element.x || 0}px`,
                      top: `${element.y || 0}px`,
                      fontSize: `${element.fontSize || 16}px`,
                      fontFamily: element.fontFamily || 'Arial',
                      fontWeight: element.fontWeight || 'normal',
                      color: element.fill || element.color || '#000000',
                      textAlign: element.textAlign || 'left'
                    }}
                  >
                    {text}
                  </div>
                );
              }

              // Handle Rect elements
              if (element.type === 'Rect') {
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
              if (element.type === 'Circle') {
                return (
                  <div
                    key={index}
                    className="absolute rounded-full"
                    style={{
                      left: `${element.x || 0}px`,
                      top: `${element.y || 0}px`,
                      width: `${(element.radius || 50) * 2}px`,
                      height: `${(element.radius || 50) * 2}px`,
                      backgroundColor: element.fill || '#ffffff',
                      border: element.strokeWidth ? `${element.strokeWidth}px solid ${element.stroke || '#000000'}` : 'none',
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                );
              }

              // Handle Line elements
              if (element.type === 'Line') {
                const points = element.points || [0, 0, 100, 0];
                const x1 = element.x || 0;
                const y1 = element.y || 0;
                const x2 = x1 + points[2];
                const y2 = y1 + points[3];

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
                      stroke={element.stroke || '#000000'}
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