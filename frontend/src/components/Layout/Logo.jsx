import React from 'react';

const Logo = ({ className = "", color = "#1a3a63" }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle with gradient */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>
      
      {/* Main card shape */}
      <rect 
        x="8" 
        y="12" 
        width="32" 
        height="24" 
        rx="3" 
        fill="url(#logoGradient)"
        stroke={color}
        strokeWidth="1"
      />
      
      {/* Card lines representing text */}
      <rect x="12" y="16" width="16" height="2" rx="1" fill="white" opacity="0.9" />
      <rect x="12" y="20" width="12" height="1.5" rx="0.75" fill="white" opacity="0.7" />
      <rect x="12" y="23" width="14" height="1.5" rx="0.75" fill="white" opacity="0.7" />
      
      {/* Decorative elements */}
      <circle cx="28" cy="18" r="2" fill="white" opacity="0.8" />
      <rect x="26" y="26" width="8" height="6" rx="1" fill="white" opacity="0.6" />
      
      {/* Subtle shadow */}
      <rect 
        x="10" 
        y="14" 
        width="32" 
        height="24" 
        rx="3" 
        fill="black" 
        opacity="0.1"
      />
    </svg>
  );
};

export default Logo; 