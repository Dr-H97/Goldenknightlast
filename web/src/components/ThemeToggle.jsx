import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ mobile = false, large = false, showText = false }) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div 
      className={`theme-toggle ${mobile ? 'theme-toggle-mobile' : ''} ${large ? 'theme-toggle-large' : ''} ${showText ? 'theme-toggle-with-text' : ''}`}
      onClick={toggleTheme}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        // Moon icon for light mode (click to switch to dark)
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width={large ? "24" : "20"} height={large ? "24" : "20"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
          {showText && <span className="theme-text">Dark Mode</span>}
        </>
      ) : (
        // Sun icon for dark mode (click to switch to light)
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width={large ? "24" : "20"} height={large ? "24" : "20"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          {showText && <span className="theme-text">Light Mode</span>}
        </>
      )}
    </div>
  );
};

export default ThemeToggle;