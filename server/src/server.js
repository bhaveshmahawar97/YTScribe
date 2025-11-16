// Entry point for the backend server
// This file loads environment variables, connects to MongoDB, and starts Express

const dotenv = require('dotenv');
// Load variables from .env file into process.env BEFORE requiring app
dotenv.config();

const app = require('./app');
const { connectDB } = require('./config/db');

async function startServer() {
  try {
    await connectDB();

    const port = process.env.PORT || 5000;

    app.listen(port, () => {
      console.log(`✅ Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message || error);
    process.exit(1);
  }
}

startServer();
