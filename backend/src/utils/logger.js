const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../../config/enterprise.config');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for structured logging
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: customFormat,
  defaultMeta: {
    service: 'cardly-backend',
    environment: config.env,
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: [
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logsDir, 'app.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    }),
    
    // Error file transport
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    }),
    
    // Access log for HTTP requests
    new winston.transports.File({
      filename: path.join(logsDir, 'access.log'),
      level: 'info',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    })
  ],
  
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5
    })
  ],
  
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5
    })
  ]
});

// Add console transport for development
if (config.isDevelopment) {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  }));
}

// Add console transport for staging/production if needed
if (config.isStaging || config.isProduction) {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
    level: 'warn'
  }));
}

// Custom logging methods
const customLogger = {
  // Standard logging methods
  error: (message, meta = {}) => {
    logger.error(message, { ...meta, timestamp: new Date().toISOString() });
  },
  
  warn: (message, meta = {}) => {
    logger.warn(message, { ...meta, timestamp: new Date().toISOString() });
  },
  
  info: (message, meta = {}) => {
    logger.info(message, { ...meta, timestamp: new Date().toISOString() });
  },
  
  debug: (message, meta = {}) => {
    logger.debug(message, { ...meta, timestamp: new Date().toISOString() });
  },
  
  // HTTP request logging
  http: (req, res, responseTime) => {
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.userId || 'anonymous'
    };
    
    logger.info('HTTP Request', logData);
  },
  
  // Database operation logging
  db: (operation, collection, duration, meta = {}) => {
    logger.info('Database Operation', {
      operation,
      collection,
      duration: `${duration}ms`,
      ...meta
    });
  },
  
  // Security event logging
  security: (event, details = {}) => {
    logger.warn('Security Event', {
      event,
      ...details,
      timestamp: new Date().toISOString()
    });
  },
  
  // Performance logging
  performance: (operation, duration, meta = {}) => {
    logger.info('Performance', {
      operation,
      duration: `${duration}ms`,
      ...meta
    });
  },
  
  // Business logic logging
  business: (event, details = {}) => {
    logger.info('Business Event', {
      event,
      ...details,
      timestamp: new Date().toISOString()
    });
  },
  
  // Error with context
  errorWithContext: (error, context = {}) => {
    logger.error(error.message, {
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
  },
  
  // Structured logging for analytics
  analytics: (event, data = {}) => {
    logger.info('Analytics Event', {
      event,
      data,
      timestamp: new Date().toISOString()
    });
  }
};

// Export both the winston logger and custom logger
module.exports = {
  ...customLogger,
  winston: logger,
  
  // Utility functions
  getLogFiles: () => {
    return fs.readdirSync(logsDir).filter(file => file.endsWith('.log'));
  },
  
  clearLogs: () => {
    const files = fs.readdirSync(logsDir).filter(file => file.endsWith('.log'));
    files.forEach(file => {
      fs.unlinkSync(path.join(logsDir, file));
    });
    logger.info('Logs cleared');
  },
  
  getLogStats: () => {
    const files = fs.readdirSync(logsDir).filter(file => file.endsWith('.log'));
    const stats = {};
    
    files.forEach(file => {
      const filePath = path.join(logsDir, file);
      const stat = fs.statSync(filePath);
      stats[file] = {
        size: stat.size,
        modified: stat.mtime,
        created: stat.birthtime
      };
    });
    
    return stats;
  }
};