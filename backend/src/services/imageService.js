const { uploadToCloudinary, deleteFromCloudinary, getOptimizedUrl, validateCloudinaryConfig } = require('../utils/cloudinary');
const logger = require('../utils/logger');
const sharp = require('sharp');

class ImageService {
  constructor() {
    // Validate Cloudinary configuration on service initialization
    validateCloudinaryConfig();
  }

  /**
   * Upload and optimize image to Cloudinary
   * @param {Buffer} imageBuffer - Image buffer
   * @param {Object} options - Upload options
   * @returns {Promise<string>} - Image URL
   */
  async uploadImage(imageBuffer, options = {}) {
    try {
      // Validate image buffer
      if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
        throw new Error('Invalid image buffer provided');
      }

      // Optimize image before upload
      const optimizedBuffer = await this.optimizeImage(imageBuffer, options);

      // Upload to Cloudinary using enhanced function
      const uploadResult = await uploadToCloudinary(optimizedBuffer, {
        folder: options.folder || 'cardly_cards',
        resource_type: 'image',
        transformation: [
          { width: options.width || 800, height: options.height || 600, crop: 'limit' },
          { quality: 'auto:good' },
          { format: 'auto' }
        ],
        ...options.cloudinary
      });

      logger.info(`Image uploaded successfully: ${uploadResult.secure_url}`);
      return uploadResult.secure_url;
    } catch (error) {
      logger.error(`Image upload failed: ${error.message}`);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Optimize image using Sharp
   * @param {Buffer} imageBuffer - Original image buffer
   * @param {Object} options - Optimization options
   * @returns {Promise<Buffer>} - Optimized image buffer
   */
  async optimizeImage(imageBuffer, options = {}) {
    try {
      const {
        width = 800,
        height = 600,
        quality = 80,
        format = 'jpeg'
      } = options;

      let sharpInstance = sharp(imageBuffer);

      // Resize image
      sharpInstance = sharpInstance.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      });

      // Convert to specified format and optimize
      switch (format.toLowerCase()) {
        case 'jpeg':
        case 'jpg':
          sharpInstance = sharpInstance.jpeg({ quality });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({ quality });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality });
          break;
        default:
          sharpInstance = sharpInstance.jpeg({ quality });
      }

      return await sharpInstance.toBuffer();
    } catch (error) {
      logger.error(`Image optimization failed: ${error.message}`);
      // Return original buffer if optimization fails
      return imageBuffer;
    }
  }

  /**
   * Upload profile photo with specific optimizations
   * @param {Buffer} imageBuffer - Profile image buffer
   * @returns {Promise<string>} - Profile image URL
   */
  async uploadProfilePhoto(imageBuffer) {
    return this.uploadImage(imageBuffer, {
                  folder: 'cardly_profiles',
      width: 400,
      height: 400,
      quality: 85,
      format: 'jpeg',
      cloudinary: {
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto:good' }
        ]
      }
    });
  }

  /**
   * Upload card background image
   * @param {Buffer} imageBuffer - Background image buffer
   * @returns {Promise<string>} - Background image URL
   */
  async uploadCardBackground(imageBuffer) {
    return this.uploadImage(imageBuffer, {
                  folder: 'cardly_backgrounds',
      width: 800,
      height: 600,
      quality: 90,
      format: 'jpeg',
      cloudinary: {
        transformation: [
          { width: 800, height: 600, crop: 'fill' },
          { quality: 'auto:good' }
        ]
      }
    });
  }

  /**
   * Upload QR code image
   * @param {Buffer} qrCodeBuffer - QR code image buffer
   * @returns {Promise<string>} - QR code image URL
   */
  async uploadQRCode(qrCodeBuffer) {
    return this.uploadImage(qrCodeBuffer, {
                  folder: 'cardly_qr',
      width: 300,
      height: 300,
      quality: 100,
      format: 'png',
      cloudinary: {
        transformation: [
          { width: 300, height: 300, crop: 'fill' },
          { quality: 'auto:best' }
        ]
      }
    });
  }

  /**
   * Delete image from Cloudinary
   * @param {string} publicId - Cloudinary public ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteImage(publicId) {
    try {
      const result = await deleteFromCloudinary(publicId);
      logger.info(`Image deleted successfully: ${publicId}`);
      return result.result === 'ok';
    } catch (error) {
      logger.error(`Image deletion failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Generate image URL from public ID
   * @param {string} publicId - Cloudinary public ID
   * @param {Object} options - Transformation options
   * @returns {string} - Image URL
   */
  generateImageUrl(publicId, options = {}) {
    const {
      width = 800,
      height = 600,
      crop = 'limit',
      quality = 'auto:good'
    } = options;

    return getOptimizedUrl(publicId, {
      transformation: [
        { width, height, crop, quality }
      ]
    });
  }

  /**
   * Validate image file
   * @param {Object} file - Multer file object
   * @returns {boolean} - Validation result
   */
  validateImageFile(file) {
    if (!file) {
      return false;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return false;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return false;
    }

    return true;
  }

  /**
   * Get image dimensions
   * @param {Buffer} imageBuffer - Image buffer
   * @returns {Promise<Object>} - Image dimensions
   */
  async getImageDimensions(imageBuffer) {
    try {
      const metadata = await sharp(imageBuffer).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format
      };
    } catch (error) {
      logger.error(`Failed to get image dimensions: ${error.message}`);
      return null;
    }
  }

  /**
   * Create thumbnail from image
   * @param {Buffer} imageBuffer - Original image buffer
   * @param {Object} options - Thumbnail options
   * @returns {Promise<Buffer>} - Thumbnail buffer
   */
  async createThumbnail(imageBuffer, options = {}) {
    const {
      width = 200,
      height = 200,
      quality = 70
    } = options;

    try {
      return await sharp(imageBuffer)
        .resize(width, height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality })
        .toBuffer();
    } catch (error) {
      logger.error(`Thumbnail creation failed: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new ImageService();