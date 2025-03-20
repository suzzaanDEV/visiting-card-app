const QRCode = require('qrcode');
const logger = require('../utils/logger');

exports.generate = async (url, options = {}) => {
  try {
    const defaultOptions = {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    };

    const qrOptions = { ...defaultOptions, ...options };
    
    const qrDataURL = await QRCode.toDataURL(url, qrOptions);
    
    logger.info(`QR code generated successfully for URL: ${url}`);
    return qrDataURL;
  } catch (error) {
    logger.error(`QR code generation error: ${error.message}`);
    throw new Error('Failed to generate QR code');
  }
};

exports.generateSVG = async (url, options = {}) => {
  try {
    const defaultOptions = {
      errorCorrectionLevel: 'M',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    };

    const qrOptions = { ...defaultOptions, ...options };
    
    const qrSVG = await QRCode.toString(url, { type: 'svg', ...qrOptions });
    
    logger.info(`QR SVG generated successfully for URL: ${url}`);
    return qrSVG;
  } catch (error) {
    logger.error(`QR SVG generation error: ${error.message}`);
    throw new Error('Failed to generate QR SVG');
  }
};

exports.generateWithLogo = async (url, logoPath, options = {}) => {
  try {
    // This would require additional image processing libraries
    // For now, we'll return the standard QR code
    logger.info(`QR code with logo requested for URL: ${url}`);
    return await exports.generate(url, options);
  } catch (error) {
    logger.error(`QR code with logo generation error: ${error.message}`);
    throw new Error('Failed to generate QR code with logo');
  }
};  