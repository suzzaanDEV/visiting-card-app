// cloudinary.js (or cloudinaryConfig.js)
const cloudinary = require('cloudinary').v2;

// Enhanced Cloudinary configuration with error handling
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo',
};

// Configure Cloudinary
cloudinary.config(cloudinaryConfig);

// Validate configuration
const validateCloudinaryConfig = () => {
  const { cloud_name, api_key, api_secret } = cloudinaryConfig;
  
  if (!cloud_name || cloud_name === 'demo') {
    console.warn('⚠️  Cloudinary cloud_name not configured, using demo mode');
  }
  
  if (!api_key || api_key === 'demo') {
    console.warn('⚠️  Cloudinary api_key not configured, using demo mode');
  }
  
  if (!api_secret || api_secret === 'demo') {
    console.warn('⚠️  Cloudinary api_secret not configured, using demo mode');
  }
  
  return cloud_name !== 'demo' && api_key !== 'demo' && api_secret !== 'demo';
};

// Enhanced upload function with error handling
const uploadToCloudinary = async (file, options = {}) => {
  try {
    const isConfigured = validateCloudinaryConfig();
    
    if (!isConfigured) {
      console.warn('⚠️  Cloudinary not properly configured, returning demo URL');
      return {
        secure_url: 'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Demo+Image',
        public_id: 'demo-image',
        width: 400,
        height: 300,
        format: 'jpg'
      };
    }

    const uploadOptions = {
      folder: 'cardly',
      resource_type: 'auto',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      ...options
    };

    const result = await cloudinary.uploader.upload(file, uploadOptions);
    
    console.log(`✅ Image uploaded to Cloudinary: ${result.public_id}`);
    return result;
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error.message);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

// Enhanced delete function
const deleteFromCloudinary = async (publicId) => {
  try {
    const isConfigured = validateCloudinaryConfig();
    
    if (!isConfigured) {
      console.warn('⚠️  Cloudinary not configured, skipping delete');
      return { result: 'ok' };
    }

    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`✅ Image deleted from Cloudinary: ${publicId}`);
    return result;
  } catch (error) {
    console.error('❌ Cloudinary delete error:', error.message);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

// Add image optimization settings
const optimizationSettings = {
  quality: 'auto',
  fetch_format: 'auto',
  crop: 'scale',
  width: 800,
  height: 600
};

// Get optimized URL
const getOptimizedUrl = (publicId, options = {}) => {
  const defaultOptions = {
    quality: 'auto:good',
    fetch_format: 'auto',
    ...options
  };
  
  return cloudinary.url(publicId, defaultOptions);
};

// Get optimized Image URL
const getOptimizedImageUrl = (publicId, options = {}) => {
  const settings = { ...optimizationSettings, ...options };
  return cloudinary.url(publicId, settings);
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  getOptimizedUrl,
  validateCloudinaryConfig
};
