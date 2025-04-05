import React from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { SOCKET_STATUS } from '../utils/websocket';

/**
 * Component to display WebSocket connection status
 */
const WebSocketStatus = ({ className = '', showLabel = true }) => {
  const { connectionStatus, reconnect } = useWebSocket();
  
  // Define status styles
  const getStatusStyles = () => {
    switch (connectionStatus) {
      case SOCKET_STATUS.CONNECTED:
        return {
          color: 'var(--success)',
          icon: '●',
          label: 'Connected'
        };
      case SOCKET_STATUS.CONNECTING:
        return {
          color: 'var(--warning)',
          icon: '◌',
          label: 'Connecting...'
        };
      case SOCKET_STATUS.ERROR:
        return {
          color: 'var(--error)',
          icon: '✕',
          label: 'Connection Error'
        };
      case SOCKET_STATUS.DISCONNECTED:
      default:
        return {
          color: 'var(--error)',
          icon: '○',
          label: 'Disconnected'
        };
    }
  };
  
  const statusStyles = getStatusStyles();
  
  return (
    <div 
      className={`ws-status ${className}`} 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px',
        fontSize: showLabel ? '14px' : '12px',
        padding: '4px',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
      onClick={reconnect}
      title="Click to reconnect"
    >
      <span 
        style={{ 
          color: statusStyles.color,
          fontSize: showLabel ? '16px' : '14px',
          lineHeight: 1
        }}
      >
        {statusStyles.icon}
      </span>
      
      {showLabel && (
        <span style={{ whiteSpace: 'nowrap' }}>
          {statusStyles.label}
        </span>
      )}
    </div>
  );
};

export default WebSocketStatus;