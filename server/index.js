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

// Create WebSocket server with enhanced configuration for Replit
const wss = new WebSocketServer({ 
  server, 
  path: '/ws',
  // Add more robust error handling for Replit environment
  clientTracking: true,
  perMessageDeflate: {
    zlibDeflateOptions: {
      chunkSize: 1024,
      memLevel: 7,
      level: 3
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    concurrencyLimit: 10,
    threshold: 1024 // Only compress messages larger than 1KB
  }
});

// Attach WebSocket server to the server object for use in other modules
server.wss = wss;

// Handle server-level WebSocket errors
wss.on('error', (error) => {
  console.error('WebSocket server error:', error);
});

// WebSocket connections
wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`Client connected to WebSocket from ${clientIp}`);
  
  // Setup ping/pong to keep connection alive
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });
  
  // Send welcome message
  try {
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to Chess Club WebSocket Server',
      timestamp: Date.now()
    }));
  } catch (err) {
    console.error('Error sending welcome message:', err);
  }
  
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
          try {
            ws.send(JSON.stringify({
              type: 'pong',
              timestamp: Date.now()
            }));
          } catch (err) {
            console.error('Error sending pong response:', err);
          }
          break;
          
        default:
          console.log(`Unknown message type: ${data.type}`);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  });
  
  // Handle disconnection
  ws.on('close', (code, reason) => {
    console.log(`Client disconnected from WebSocket: ${code} - ${reason || 'No reason provided'}`);
    ws.isAlive = false;
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket client error:', error);
    // Try to close gracefully
    try {
      ws.close();
    } catch (err) {
      console.error('Error closing WebSocket after error:', err);
    }
  });
});

// Heartbeat interval to check for disconnected clients
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      return ws.terminate();
    }
    
    ws.isAlive = false;
    ws.ping();
  });
}, 30000); // Check every 30 seconds

// Clear interval when server closes
wss.on('close', () => {
  clearInterval(heartbeatInterval);
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
  origin: (origin, callback) => {
    // Allow any origin in development
    if (process.env.NODE_ENV !== 'production') {
      callback(null, true);
      return;
    }
    
    // In production, check against allowed origins
    const allowedOrigins = [
      'https://golden-knight-chess-club.onrender.com',
      'https://golden-knight-chess-db.onrender.com',
      'https://golden-knight-chess-club.up.railway.app'
    ];
    
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // For now, allow all origins in production too
    }
  },
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
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      const protocol = process.env.NODE_ENV === 'production' ? 'wss' : 'ws';
      // Use Railway app domain if available, otherwise fallback to Render
      const host = process.env.RAILWAY_STATIC_URL || process.env.NODE_ENV === 'production' 
        ? process.env.RAILWAY_STATIC_URL || 'golden-knight-chess-club.up.railway.app' 
        : `localhost:${PORT}`;
      console.log(`WebSocket server running at ${protocol}://${host}/ws`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Export server and WebSocket server for use in other modules
module.exports = { server, wss };
