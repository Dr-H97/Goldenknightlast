/**
 * Simple Express server for serving the built Vite app
 * This file is used for deployment purposes
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Serve the static files
app.use(express.static(path.join(__dirname, 'web/dist')));

// Default route handler
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'web/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});