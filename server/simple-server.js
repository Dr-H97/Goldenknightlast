/**
 * Simple Express server for demonstration purposes
 * Note: With our Firebase implementation, this server is not required
 * for the main application functionality. It's included only as a reference.
 */

const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Parse JSON requests
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// Get server info
app.get('/api/info', (req, res) => {
  res.json({
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    message: 'Firebase-based Chess Club API reference server'
  });
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Reference server running on port ${port}`);
});