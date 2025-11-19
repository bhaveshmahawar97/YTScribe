// Entry point for the backend server
// This file loads environment variables, connects to MongoDB, and starts Express

import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

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
