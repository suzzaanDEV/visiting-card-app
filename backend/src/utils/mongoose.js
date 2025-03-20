const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Server will start without database connection');
    console.log('💡 To fix this, install and start MongoDB:');
    console.log('   brew tap mongodb/brew');
    console.log('   brew install mongodb-community');
    console.log('   brew services start mongodb-community');
    console.log('🔧 For now, the server will run with limited functionality');
  }
};

connectDB();

module.exports = mongoose;
