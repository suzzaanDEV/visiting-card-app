const mongoose = require('mongoose');
const config = require('../../config/enterprise.config');
const logger = require('./logger');

// Connection state tracking
let connectionState = 'disconnected';
let reconnectAttempts = 0;
const maxReconnectAttempts = 10;
const reconnectDelay = 5000; // 5 seconds
let intentionalDisconnect = false;
let monitoringInterval = null;

// Connection event handlers
mongoose.connection.on('connected', () => {
  connectionState = 'connected';
  reconnectAttempts = 0;
  logger.info('✅ MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  connectionState = 'error';
  logger.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  connectionState = 'disconnected';

  // Skip reconnect logic when the disconnect was intentional (shutdown/tests)
  if (intentionalDisconnect) {
    intentionalDisconnect = false;
    logger.info('ℹ️ MongoDB disconnected intentionally');
    return;
  }

  logger.warn('⚠️ MongoDB disconnected');
  
  // Auto-reconnect logic
  if (reconnectAttempts < maxReconnectAttempts) {
    reconnectAttempts++;
    logger.info(`🔄 Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`);
    setTimeout(() => {
      connect();
    }, reconnectDelay);
  } else {
    logger.error('❌ Max reconnection attempts reached');
  }
});

mongoose.connection.on('reconnected', () => {
  connectionState = 'connected';
  reconnectAttempts = 0;
  logger.info('✅ MongoDB reconnected successfully');
});

// Performance monitoring
if (config.isDevelopment) {
  mongoose.set('debug', true);
}

// Set global options
mongoose.set('strictQuery', false);

// Connection function
async function connect() {
  try {
    if (connectionState === 'connected') {
      logger.info('MongoDB already connected');
      return;
    }

    intentionalDisconnect = false;

    logger.info('🔌 Connecting to MongoDB...');
    
    // Modern MongoDB connection options
    const connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: config.database.options.maxPoolSize || 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: config.database.options.serverSelectionTimeoutMS || 5000,
      socketTimeoutMS: config.database.options.socketTimeoutMS || 45000,
      family: 4, // Use IPv4
      keepAlive: true,
      keepAliveInitialDelay: 300000, // 5 minutes
      autoIndex: !config.isProduction, // Disable auto-indexing in production
    };

    // Add SSL options for production/staging
    if (config.isProduction || config.isStaging) {
      connectionOptions.ssl = true;
      connectionOptions.sslValidate = config.isProduction;
      if (config.isProduction) {
        connectionOptions.retryWrites = true;
        connectionOptions.w = 'majority';
      }
    }

    await mongoose.connect(config.database.url, connectionOptions);

    // Set up connection monitoring
    if (config.monitoring.enabled) {
      monitoringInterval = setInterval(() => {
        const status = {
          state: connectionState,
          readyState: mongoose.connection.readyState,
          host: mongoose.connection.host,
          port: mongoose.connection.port,
          name: mongoose.connection.name,
          reconnectAttempts
        };
        
        if (config.isDevelopment) {
          logger.debug('📊 MongoDB Status:', status);
        }
      }, 60000); // Check every minute
    }

  } catch (error) {
    logger.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
}

// Graceful shutdown
async function disconnect() {
  try {
    intentionalDisconnect = true;
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
      monitoringInterval = null;
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      logger.info('✅ MongoDB disconnected gracefully');
    }
  } catch (error) {
    intentionalDisconnect = false;
    logger.error('❌ Error during MongoDB disconnect:', error);
  }
}

// Health check function
function getHealthStatus() {
  return {
    status: connectionState === 'connected' ? 'healthy' : 'unhealthy',
    state: connectionState,
    readyState: mongoose.connection.readyState,
    reconnectAttempts,
    timestamp: new Date().toISOString()
  };
}

// Suppress auto-reconnect (used by test teardown and graceful shutdown)
function suppressReconnect() {
  intentionalDisconnect = true;
}

// Export connection utilities
module.exports = {
  connect,
  disconnect,
  getHealthStatus,
  suppressReconnect,
  connection: mongoose.connection,
  // Export mongoose for models
  mongoose
};
