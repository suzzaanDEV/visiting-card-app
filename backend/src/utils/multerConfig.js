const multer = require('multer');
const logger = require('./logger');

// Configure multer with memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    fieldSize: 1 * 1024 * 1024, // 1MB for non-file fields
    fields: 20, // Increased to handle more form fields
    files: 1 // Max 1 file
  },
  fileFilter: (req, file, cb) => {
    logger.info(`Processing file: ${file.originalname}, mimetype: ${file.mimetype}, size: ${file.size}`);
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      logger.error(`Invalid file type: ${file.mimetype}`);
      return cb(new Error('Only PNG and JPEG images are allowed'));
    }
    cb(null, true);
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  const rawHeaders = JSON.stringify(req.headers);
  if (err instanceof multer.MulterError) {
    logger.error(`Multer error: ${err.message}, field: ${err.field}, headers: ${rawHeaders}`);
    return res.status(400).json({ error: `Multer error: ${err.message}` });
  }
  if (err) {
    logger.error(`Upload error: ${err.message}, headers: ${rawHeaders}`);
    return res.status(400).json({ error: err.message });
  }
  next();
};

module.exports = { upload, handleMulterError };