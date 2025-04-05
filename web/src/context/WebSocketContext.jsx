import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  initWebSocket,
  closeWebSocket,
  addMessageListener,
  isWebSocketConnected,
  sendMessage,
  SOCKET_STATUS
} from '../utils/websocket';

// Create context
const WebSocketContext = createContext(null);

/**
 * Provider component for WebSocket functionality
 */
export const WebSocketProvider = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState(SOCKET_STATUS.DISCONNECTED);
  const [messages, setMessages] = useState([]);

  // Initialize WebSocket
  useEffect(() => {
    const handleStatusChange = (status) => {
      setConnectionStatus(status);
    };

    const handleMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    // Initialize the connection
    initWebSocket(handleStatusChange);

    // Add message listener
    const removeListener = addMessageListener(handleMessage);

    // Clean up on unmount
    return () => {
      removeListener();
      closeWebSocket();
    };
  }, []);

  /**
   * Force reconnection of the WebSocket
   */
  const reconnect = useCallback(() => {
    closeWebSocket();
    initWebSocket(setConnectionStatus);
  }, []);

  /**
   * Send a message through the WebSocket
   * @param {Object} data - The data to send
   */
  const send = useCallback((data) => {
    sendMessage(data);
  }, []);

  // Provide WebSocket context to children
  return (
    <WebSocketContext.Provider
      value={{
        connectionStatus,
        isConnected: isWebSocketConnected(),
        messages,
        send,
        reconnect
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

/**
 * Hook for using WebSocket functionality in components
 */
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};