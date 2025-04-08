import React, { useState, useEffect } from 'react';
import '../styles/chessLoader.css';

/**
 * Component to provide smooth page transitions and loading states
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to display
 * @param {boolean} props.loading - Whether the content is loading
 * @param {string} props.loaderType - Type of loader to use ('chess', 'simple', 'knight')
 * @param {string} props.loadingText - Text to display during loading
 * @param {string} props.transitionType - Type of transition ('fade', 'slide', 'chess')
 */
const PageTransition = ({ 
  children, 
  loading = false, 
  loaderType = 'simple', 
  loadingText = 'Loading...',
  transitionType = 'chess'
}) => {
  const [show, setShow] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // On mount, trigger the enter animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
      setInitialLoad(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // If loading, show the appropriate loader
  if (loading) {
    return (
      <div className="loader-container" style={{ 
        width: '100%', 
        height: '250px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div className="loading-knight"></div>
        <p style={{ marginTop: '20px' }}>{loadingText}</p>
      </div>
    );
  }

  // Custom CSS classes for animation
  const fadeInClass = show ? 'opacity-100 transition-opacity duration-300' : 'opacity-0';
  
  if (initialLoad) {
    return (
      <div className="chess-board-reveal">
        {show && (
          <div className={`chess-piece-fade-in ${fadeInClass}`}>
            {children}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={fadeInClass}>
      {show && children}
    </div>
  );
};

export default PageTransition;