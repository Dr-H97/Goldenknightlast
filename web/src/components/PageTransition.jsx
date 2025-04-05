import React, { useState, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';

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

  // Apply appropriate transition class based on type
  let transitionClass = 'page-transition';
  
  if (initialLoad) {
    return (
      <div className="chess-board-reveal">
        <CSSTransition
          in={show}
          timeout={300}
          classNames={transitionClass}
          unmountOnExit
        >
          <div className="chess-piece-fade-in">
            {children}
          </div>
        </CSSTransition>
      </div>
    );
  }

  return (
    <CSSTransition
      in={show}
      timeout={300}
      classNames={transitionClass}
      unmountOnExit
    >
      <div>
        {children}
      </div>
    </CSSTransition>
  );
};

export default PageTransition;