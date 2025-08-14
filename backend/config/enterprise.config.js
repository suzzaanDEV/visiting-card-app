const path = require('path');

// Environment configuration
const environments = {
  development: {
    port: process.env.PORT || 5050,
    database: {
      url: process.env.DATABASE_URL || 'mongodb://localhost:27017/cardly-dev',
      options: {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
      }
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'dev-super-secret-jwt-key-change-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      refreshExpiresIn: '30d'
    },
    cors: {
      origins: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
      credentials: true
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
      message: 'Too many requests from this IP, please try again later.'
    },
    logging: {
      level: 'debug',
      file: path.join(__dirname, '../logs/app.log')
    },
    security: {
      bcryptRounds: 12,
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      maxLoginAttempts: 5,
      lockoutDuration: 15 * 60 * 1000 // 15 minutes
    }
  },
  
  staging: {
    port: process.env.PORT || 5050,
    database: {
      url: process.env.DATABASE_URL,
      options: {
        maxPoolSize: 20,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
      }
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      refreshExpiresIn: '30d'
    },
    cors: {
      origins: process.env.ALLOWED_ORIGINS?.split(',') || [],
      credentials: true
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 500,
      message: 'Too many requests from this IP, please try again later.'
    },
    logging: {
      level: 'info',
      file: path.join(__dirname, '../logs/app.log')
    },
    security: {
      bcryptRounds: 12,
      sessionTimeout: 24 * 60 * 60 * 1000,
      maxLoginAttempts: 5,
      lockoutDuration: 15 * 60 * 1000
    }
  },
  
  production: {
    port: process.env.PORT || 5050,
    database: {
      url: process.env.DATABASE_URL,
      options: {
        maxPoolSize: 50,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
      }
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      refreshExpiresIn: '30d'
    },
    cors: {
      origins: process.env.ALLOWED_ORIGINS?.split(',') || [],
      credentials: true
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests from this IP, please try again later.'
    },
    logging: {
      level: 'warn',
      file: path.join(__dirname, '../logs/app.log')
    },
    security: {
      bcryptRounds: 12,
      sessionTimeout: 24 * 60 * 60 * 1000,
      maxLoginAttempts: 3,
      lockoutDuration: 30 * 60 * 1000
    }
  }
};

// Get current environment
const env = process.env.NODE_ENV || 'development';
const config = environments[env];

// Validation
if (!config.database.url) {
  throw new Error(`Database URL is required for ${env} environment`);
}

if (!config.jwt.secret || config.jwt.secret === 'dev-super-secret-jwt-key-change-in-production') {
  console.warn('⚠️  Warning: Using default JWT secret. Please set JWT_SECRET environment variable.');
}

module.exports = {
  ...config,
  env,
  isDevelopment: env === 'development',
  isStaging: env === 'staging',
  isProduction: env === 'production',
  
  // Additional enterprise features
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    metrics: {
      enabled: process.env.METRICS_ENABLED === 'true',
      port: process.env.METRICS_PORT || 9090
    },
    healthCheck: {
      enabled: true,
      path: '/health',
      interval: 30000 // 30 seconds
    }
  },
  
  cache: {
    redis: {
      enabled: process.env.REDIS_ENABLED === 'true',
      url: process.env.REDIS_URL,
      ttl: 3600 // 1 hour
    }
  },
  
  email: {
    enabled: process.env.EMAIL_ENABLED === 'true',
    provider: process.env.EMAIL_PROVIDER || 'smtp',
    smtp: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    }
  },
  
  fileUpload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    storage: {
      type: process.env.STORAGE_TYPE || 'local', // local, s3, cloudinary
      cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET
      }
    }
  },
  
  analytics: {
    enabled: true,
    retention: {
      days: 90,
      autoCleanup: true
    },
    realTime: {
      enabled: true,
      interval: 30000 // 30 seconds
    }
  }
};
