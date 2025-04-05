const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { WebSocketServer, WebSocket } = require('ws');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const playerRoutes = require('./routes/player');
const gameRoutes = require('./routes/game');

// Import database initialization
const { initializeDatabase } = require('./db');
const { initializeSampleData } = require('./seed');

// Create Express app
const app = express();
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });

// Attach WebSocket server to the server object for use in other modules
server.wss = wss;

// WebSocket connections
wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'Connected to Chess Club WebSocket Server'
  }));
  
  // Handle messages from clients
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received WebSocket message:', data);
      
      // Handle different message types
      switch (data.type) {
        case 'game_update':
          // Broadcast game update to all connected clients
          broadcast({
            type: 'game_update',
            data: data.data
          });
          break;
          
        case 'player_update':
          // Broadcast player update to all connected clients
          broadcast({
            type: 'player_update',
            data: data.data
          });
          break;
          
        case 'ping':
          // Respond to ping with pong
          ws.send(JSON.stringify({
            type: 'pong',
            timestamp: Date.now()
          }));
          break;
          
        default:
          console.log(`Unknown message type: ${data.type}`);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  });
  
  // Handle disconnection
  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Broadcast to all connected clients
function broadcast(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// Middleware
app.use(cors({
  origin: ['http://localhost:5000', 'https://localhost:5000', '*'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control']
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/games', gameRoutes);

// Production - Serve static files
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../web/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../web/dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Initialize the database
    await initializeDatabase();
    
    // Seed database with sample data if needed
    if (process.env.NODE_ENV === 'development') {
      await initializeSampleData();
    }
    
    // Start listening
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`WebSocket server running at ws://localhost:${PORT}/ws`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Export server and WebSocket server for use in other modules
module.exports = { server, wss };
