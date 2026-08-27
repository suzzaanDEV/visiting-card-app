require('./env');

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { suppressReconnect } = require('../src/utils/mongoose');

let mongoServer;

const setupIntegrationDb = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  process.env.DATABASE_URL = uri;
  await mongoose.connect(uri);
};

const teardownIntegrationDb = async () => {
  suppressReconnect();
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
      await collections[key].deleteMany({});
    }
    await mongoose.disconnect();
  }
  if (mongoServer) await mongoServer.stop();
};

module.exports = { setupIntegrationDb, teardownIntegrationDb };
