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
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log(`Connecting to WebSocket at ${wsUrl}`);
    socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log('WebSocket connection established');
      statusChangeCallback?.(SOCKET_STATUS.CONNECTED);
      
      // Reset reconnection attempts on successful connection
      reconnectAttempts = 0;
      
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
// Keep track of reconnection attempts
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY = 1000;

const scheduleReconnect = () => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }
  
  // Exponential backoff with jitter
  reconnectAttempts += 1;
  const delay = Math.min(
    30000, // Max delay of 30 seconds
    BASE_RECONNECT_DELAY * Math.pow(1.5, Math.min(reconnectAttempts, 10))
  ) * (0.9 + (0.2 * Math.random())); // Add jitter
  
  console.log(`Attempting to reconnect WebSocket after ${delay.toFixed(1)}ms...`);
  
  reconnectTimeout = setTimeout(() => {
    initWebSocket();
  }, delay);
  
  // Reset reconnect attempts when too many failures
  if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
    console.log('Too many reconnection attempts, will try again later');
    reconnectAttempts = 0;
    // Try again after a longer delay
    setTimeout(() => {
      reconnectAttempts = 0;
      initWebSocket();
    }, 60000);
  }
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