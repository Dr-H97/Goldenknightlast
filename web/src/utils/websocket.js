/**
 * WebSocket utility for managing real-time communication
 */

let socket = null;
let reconnectTimeout = null;
let statusChangeCallback = null;
const messageListeners = [];

// Socket connection status values
export const SOCKET_STATUS = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error'
};

/**
 * Initialize WebSocket connection
 * @param {Function} onStatusChange - Callback to handle connection status changes
 */
export const initWebSocket = (onStatusChange) => {
  if (socket && socket.readyState !== WebSocket.CLOSED) {
    console.log('WebSocket already initialized');
    return;
  }

  if (onStatusChange) {
    statusChangeCallback = onStatusChange;
  }
  
  statusChangeCallback?.(SOCKET_STATUS.CONNECTING);
  
  try {
    // Handle various deployment environments
    const isReplit = window.location.hostname.includes('replit');
    const isRailway = window.location.hostname.includes('railway.app');
    const isVercel = window.location.hostname.includes('vercel.app');
    
    // Get the appropriate WebSocket URL based on environment
    let wsUrl;
    
    // Check if we have a backend URL defined in environment variables
    const backendWsUrl = import.meta.env?.VITE_BACKEND_WS_URL;
    
    if (backendWsUrl) {
      // Use the environment variable if available (best for production)
      wsUrl = backendWsUrl;
    } else if (isVercel) {
      // For Vercel, WebSocket endpoints should be pointed to the backend (Railway)
      const backendHost = "chess-club-backend.railway.app"; // Update this to your actual backend host
      wsUrl = `wss://${backendHost}/ws`;
    } else if (isReplit || isRailway) {
      // For Replit and Railway, WebSockets are on the same domain
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${protocol}//${window.location.host}/ws`;
    } else {
      // Local development
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${protocol}//${window.location.hostname}:3000/ws`;
    }
    
    console.log(`Connecting to WebSocket at ${wsUrl}`);
    socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log('WebSocket connection established');
      statusChangeCallback?.(SOCKET_STATUS.CONNECTED);
      
      // Clear any pending reconnect timeouts
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        notifyListeners(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    socket.onclose = (event) => {
      console.log(`WebSocket connection closed: ${event.code} - ${event.reason}`);
      statusChangeCallback?.(SOCKET_STATUS.DISCONNECTED);
      
      // Schedule reconnection
      scheduleReconnect();
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      statusChangeCallback?.(SOCKET_STATUS.ERROR);
      
      // We will try to reconnect on close
    };
  } catch (error) {
    console.error('Error initializing WebSocket:', error);
    statusChangeCallback?.(SOCKET_STATUS.ERROR);
  }
};

/**
 * Send message to server
 * @param {Object} data - Message data
 */
export const sendMessage = (data) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('WebSocket not connected - cannot send message');
    return false;
  }
  
  try {
    socket.send(JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error sending WebSocket message:', error);
    return false;
  }
};

/**
 * Add message listener
 * @param {Function} callback - Function to call when message is received
 * @returns {Function} - Function to remove listener
 */
export const addMessageListener = (callback) => {
  if (typeof callback !== 'function') {
    console.error('Message listener must be a function');
    return () => {};
  }
  
  messageListeners.push(callback);
  
  // Return function to remove this listener
  return () => {
    const index = messageListeners.indexOf(callback);
    if (index !== -1) {
      messageListeners.splice(index, 1);
    }
  };
};

/**
 * Notify all listeners of a message
 * @param {Object} data - Message data
 */
const notifyListeners = (data) => {
  messageListeners.forEach(listener => {
    try {
      listener(data);
    } catch (error) {
      console.error('Error in WebSocket message listener:', error);
    }
  });
};

/**
 * Schedule reconnection attempt
 */
const scheduleReconnect = () => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }
  
  // Use exponential backoff for reconnection attempts
  const backoffTime = Math.min(30000, 3000 * (1 + Math.random())); // Max 30 seconds
  
  // Reconnect after backoff time
  reconnectTimeout = setTimeout(() => {
    console.log(`Attempting to reconnect WebSocket after ${backoffTime}ms...`);
    initWebSocket();
  }, backoffTime);
};

/**
 * Check if WebSocket is connected
 * @returns {boolean}
 */
export const isWebSocketConnected = () => {
  return socket && socket.readyState === WebSocket.OPEN;
};

/**
 * Close WebSocket connection
 */
export const closeWebSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
  
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
};