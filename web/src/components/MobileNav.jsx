import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Simple mobile-friendly bottom navigation
const MobileNav = () => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  
  // Don't show nav on login page
  if (location.pathname === '/login') {
    return null;
  }
  
  return (
    <nav className="mobile-nav">
      <Link 
        to="/dashboard" 
        className={`mobile-nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
      >
        <div className="mobile-nav-icon">📊</div>
        <span>Home</span>
      </Link>
      
      <Link 
        to="/rankings" 
        className={`mobile-nav-item ${location.pathname === '/rankings' ? 'active' : ''}`}
      >
        <div className="mobile-nav-icon">🏆</div>
        <span>Rankings</span>
      </Link>
      
      <Link 
        to="/submit-game" 
        className={`mobile-nav-item ${location.pathname === '/submit-game' ? 'active' : ''}`}
      >
        <div className="mobile-nav-icon">♟️</div>
        <span>New Game</span>
      </Link>
      
      {currentUser?.isAdmin && (
        <Link 
          to="/admin" 
          className={`mobile-nav-item ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
        >
          <div className="mobile-nav-icon">⚙️</div>
          <span>Admin</span>
        </Link>
      )}
      
      <Link 
        to="/profile" 
        className={`mobile-nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
      >
        <div className="mobile-nav-icon">👤</div>
        <span>Profile</span>
      </Link>
    </nav>
  );
};

export default MobileNav;