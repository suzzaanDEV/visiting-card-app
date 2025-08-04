import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const QRCodeGenerator = ({ value, size = 200, level = 'H', includeMargin = true, className = '' }) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <QRCodeCanvas
        value={value}
        size={size}
        level={level}
        includeMargin={includeMargin}
        style={{ 
          background: 'white',
          borderRadius: '8px',
          padding: '8px'
        }}
      />
    </div>
  );
};

export default QRCodeGenerator; 