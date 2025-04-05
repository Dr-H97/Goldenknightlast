import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

// Simple mobile-friendly bottom navigation
const MobileNav = () => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();
  
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
        <span>{t('dashboard')}</span>
      </Link>
      
      <Link 
        to="/rankings" 
        className={`mobile-nav-item ${location.pathname === '/rankings' ? 'active' : ''}`}
      >
        <div className="mobile-nav-icon">🏆</div>
        <span>{t('rankings')}</span>
      </Link>
      
      <Link 
        to="/submit-game" 
        className={`mobile-nav-item ${location.pathname === '/submit-game' ? 'active' : ''}`}
      >
        <div className="mobile-nav-icon">♟️</div>
        <span>{t('submitGame')}</span>
      </Link>
      
      {currentUser?.isAdmin && (
        <Link 
          to="/admin" 
          className={`mobile-nav-item ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
        >
          <div className="mobile-nav-icon">⚙️</div>
          <span>{t('adminNav')}</span>
        </Link>
      )}
      
      <Link 
        to="/profile" 
        className={`mobile-nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
      >
        <div className="mobile-nav-icon">👤</div>
        <span>{t('profile')}</span>
      </Link>
    </nav>
  );
};

export default MobileNav;