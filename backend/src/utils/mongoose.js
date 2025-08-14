const mongoose = require('mongoose');
const config = require('../../config/enterprise.config');
const logger = require('./logger');

// Connection state tracking
let connectionState = 'disconnected';
let reconnectAttempts = 0;
const maxReconnectAttempts = 10;
const reconnectDelay = 5000; // 5 seconds

// Connection event handlers
mongoose.connection.on('connected', () => {
  connectionState = 'connected';
  reconnectAttempts = 0;
  logger.info('✅ MongoDB connected successfully');
  console.log('✅ MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  connectionState = 'error';
  logger.error('❌ MongoDB connection error:', err);
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  connectionState = 'disconnected';
  logger.warn('⚠️ MongoDB disconnected');
  console.warn('⚠️ MongoDB disconnected');
  
  // Auto-reconnect logic
  if (reconnectAttempts < maxReconnectAttempts) {
    reconnectAttempts++;
    logger.info(`🔄 Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`);
    setTimeout(() => {
      connect();
    }, reconnectDelay);
  } else {
    logger.error('❌ Max reconnection attempts reached');
    console.error('❌ Max reconnection attempts reached');
  }
});

mongoose.connection.on('reconnected', () => {
  connectionState = 'connected';
  reconnectAttempts = 0;
  logger.info('✅ MongoDB reconnected successfully');
  console.log('✅ MongoDB reconnected successfully');
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

    logger.info('🔌 Connecting to MongoDB...');
    console.log('🔌 Connecting to MongoDB...');
    
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
      setInterval(() => {
        const status = {
          state: connectionState,
          readyState: mongoose.connection.readyState,
          host: mongoose.connection.host,
          port: mongoose.connection.port,
          name: mongoose.connection.name,
          reconnectAttempts
        };
        
        if (config.isDevelopment) {
          console.log('📊 MongoDB Status:', status);
        }
      }, 60000); // Check every minute
    }

  } catch (error) {
    logger.error('❌ Failed to connect to MongoDB:', error);
    console.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
}

// Graceful shutdown
async function disconnect() {
  try {
    if (connectionState === 'connected') {
      await mongoose.connection.close();
      logger.info('✅ MongoDB disconnected gracefully');
      console.log('✅ MongoDB disconnected gracefully');
    }
  } catch (error) {
    logger.error('❌ Error during MongoDB disconnect:', error);
    console.error('❌ Error during MongoDB disconnect:', error);
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

// Export connection utilities
module.exports = {
  connect,
  disconnect,
  getHealthStatus,
  connection: mongoose.connection,
  // Export mongoose for models
  mongoose
};
