// Enterprise-level Express application
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

// Import configuration and utilities
const config = require('../config/enterprise.config');
const { connect, disconnect, getHealthStatus } = require('./utils/mongoose');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/authRoutes');
const cardRoutes = require('./routes/cardRoutes');
const savedCardRoutes = require('./routes/savedCardRoutes');
const searchRoutes = require('./routes/searchRoutes');
const adminRoutes = require('./routes/adminRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const templateRoutes = require('./routes/templateRoutes');
const contactRoutes = require('./routes/contactRoutes');
const policyRoutes = require('./routes/policyRoutes');
const auditRoutes = require('./routes/auditRoutes');
const crmRoutes = require('./routes/crmRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const broadcastRoutes = require('./routes/broadcastRoutes');
const notificationTemplateRoutes = require('./routes/notificationTemplateRoutes');

// Import middleware
const errorMiddleware = require('./middleware/errorMiddleware');

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (config.cors.origins.includes(origin)) {
      callback(null, true);
    } else {
      logger.security('CORS blocked origin', { origin, allowedOrigins: config.cors.origins });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
}));

// Compression middleware
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    error: config.rateLimit.message,
    retryAfter: Math.ceil(config.rateLimit.windowMs / 1000 / 60)
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.security('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url
    });
    res.status(429).json({
      error: config.rateLimit.message,
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000 / 60),
      message: 'Rate limit exceeded. Please wait before making more requests.'
    });
  }
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({
  extended: true,
  limit: '10mb'
}));

// Input sanitization middleware (after body parsing, before routes)
const sanitize = require('./middleware/sanitize');
app.use(sanitize);

// Request logging middleware
if (config.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => {
        logger.info(message.trim());
      }
    }
  }));
}

// Request timing middleware
app.use((req, res, next) => {
  req.startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    logger.http(req, res, duration);
  });
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = getHealthStatus();
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'cardly-backend',
      version: process.env.npm_package_version || '1.0.0',
      environment: config.env,
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024)
      },
      database: dbHealth,
      endpoints: {
        auth: '/api/auth',
        cards: '/api/cards',
        admin: '/api/admin',
        analytics: '/api/analytics'
      }
    };

    // Check if database is healthy
    if (dbHealth.status !== 'healthy') {
      health.status = 'degraded';
      health.database = dbHealth;
    }

    res.status(200).json(health);
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/library', savedCardRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin/broadcasts', broadcastRoutes);
app.use('/api/admin/notification-templates', notificationTemplateRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Cardly API',
    version: process.env.npm_package_version || '1.0.0',
    description: 'Digital Visiting Card Platform API',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        logout: 'POST /api/auth/logout'
      },
      cards: {
        create: 'POST /api/cards',
        list: 'GET /api/cards',
        get: 'GET /api/cards/:id',
        update: 'PUT /api/cards/:id',
        delete: 'DELETE /api/cards/:id'
      },
      admin: {
        dashboard: 'GET /api/admin/dashboard',
        analytics: 'GET /api/admin/analytics',
        users: 'GET /api/admin/users',
        cards: 'GET /api/admin/cards'
      },
      health: 'GET /health'
    },
    documentation: '/api/docs'
  });
});

// 404 handler
app.use('*', (req, res) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorMiddleware);

// Global error handler
app.use((err, req, res, next) => {
  logger.errorWithContext(err, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.userId || 'anonymous'
  });

  // Don't leak error details in production
  const errorResponse = {
    error: config.isProduction ? 'Internal server error' : err.message,
    timestamp: new Date().toISOString()
  };

  if (config.isDevelopment) {
    errorResponse.stack = err.stack;
  }

  res.status(err.status || 500).json(errorResponse);
});

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await gracefulShutdown();
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await gracefulShutdown();
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown function
async function gracefulShutdown() {
  try {
    logger.info('Starting graceful shutdown...');

    // Close database connection
    await disconnect();

    // Close server
    if (server) {
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    } else {
      process.exit(0);
    }
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
}

// Start server
let server;
async function startServer() {
  try {
    // Connect to database
    await connect();

    // Bootstrap default admin in development when collection is empty
    if (process.env.SEED_ADMIN_ON_START !== 'false') {
      try {
        const { seedAdmin } = require('./seeds/adminSeed');
        await seedAdmin();
      } catch (seedError) {
        logger.warn(`Admin auto-seed skipped: ${seedError.message}`);
      }
    }

    // Seed default templates if collection is empty
    try {
      const seedTemplates = require('./seeds/templateSeed');
      await seedTemplates();
    } catch (seedError) {
      logger.warn(`Template auto-seed skipped: ${seedError.message}`);
    }

    // Seed categories if collection is empty
    try {
      const categoryService = require('./services/categoryService');
      await categoryService.seed();
    } catch (seedError) {
      logger.warn(`Category auto-seed skipped: ${seedError.message}`);
    }

    // Start HTTP server
    server = app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`);
      logger.info(`📊 Environment: ${config.env}`);
      logger.info(`🌐 CORS Origins: ${config.cors.origins.join(', ')}`);
      logger.info(`⚡ Rate Limit: ${config.rateLimit.max} requests per ${config.rateLimit.windowMs / 1000 / 60} minutes`);
      logger.info(`🔒 Security: ${config.isProduction ? 'Production' : 'Development'} mode`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof config.port === 'string' ? 'Pipe ' + config.port : 'Port ' + config.port;

      switch (error.code) {
        case 'EACCES':
          logger.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Export for testing
// Background jobs: skip scheduled intervals in test environment to avoid open handles
if (process.env.NODE_ENV !== 'test') {
  // Clean up expired notifications every 24 hours
  const notificationService = require('./services/notificationService');
  setInterval(() => {
    notificationService.cleanupExpiredNotifications().catch(err => {
      logger.warn(`Notification cleanup failed: ${err.message}`);
    });
  }, 24 * 60 * 60 * 1000);

  // Broadcast scheduler — check for due scheduled broadcasts every minute
  const broadcastService = require('./services/broadcastService');
  setInterval(async () => {
    try {
      const Broadcast = require('./models/broadcastModel');
      const due = await Broadcast.find({ status: 'scheduled', scheduledAt: { $lte: new Date() } });
      for (const b of due) {
        broadcastService.sendBroadcast(b._id).catch(err => logger.error(`Broadcast send failed: ${err.message}`));
      }
    } catch (err) { /* ignore */ }
  }, 60000);
}

module.exports = { app, startServer, gracefulShutdown };

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}