import React from 'react';

const PlayerSilhouette = ({ size = 24, className = "", style = {} }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={`player-silhouette-icon ${className}`}
    style={style}
  >
    <path 
      d="M12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4Z" 
      fill="currentColor"
    />
    <path 
      d="M12 13C9.33 13 4 14.34 4 17V20H20V17C20 14.34 14.67 13 12 13Z" 
      fill="currentColor"
    />
  </svg>
);

export default PlayerSilhouette;