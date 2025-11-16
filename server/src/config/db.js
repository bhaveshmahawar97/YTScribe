const mongoose = require('mongoose');

// Connect to MongoDB Atlas using the connection string from environment variables
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message || error);
    process.exit(1);
  }
}

module.exports = { connectDB };
