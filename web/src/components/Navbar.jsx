import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import WebSocketStatus from './WebSocketStatus';

// SVG Icons for the navbar
const ChessLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C11.5 2 11 2.19 10.59 2.59L7 6.17L7.03 6.14C7 6.14 7 6.16 7 6.17V6.17L9.72 8.9L9 9.62L8.28 8.9V8.91L7.56 8.19L5 10.76V11.59L7.5 14.09L8.21 13.38L10.59 15.76L10.76 15.93C10.76 15.93 10.79 15.95 10.76 15.93C10.76 15.93 10.76 15.93 10.76 15.93V17.59L12.41 19.24V22H13.59V19.31L14.12 18.78L15.31 20L15.6 20.26L19 23.68L20.68 22L17.43 18.72L16 17.28V17.28L14.12 15.38L13.71 14.97L11.63 12.9L9.51 10.78L10.94 9.35L10.97 9.38L13.07 11.5L15.31 13.72L16.94 15.35L18.5 16.93L20.84 19.26L22.5 17.59V16.76L19.86 14.12L19.88 14.09L19.28 13.5L18.25 12.47L12.41 6.62V6.63L11 5.21L12.71 3.5H14.5V2.09C14.5 2.09 14.5 2 14.5 2H12ZM7.78 15.06L5.25 17.59V18.5H6.16L8.69 15.97L7.78 15.06Z" fill="currentColor" />
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z" fill="currentColor" />
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor" />
  </svg>
);

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Don't show navbar on login page
  if (location.pathname === '/login') {
    return null;
  }
  
  return (
    <nav className="app-navbar">
      <div className="app-navbar-container">
        <div className="app-navbar-logo">
          <ChessLogo />
          <h2>{t('appTitle')}</h2>
        </div>
        
        <div className={`app-navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link 
            to="/dashboard" 
            className={location.pathname === '/dashboard' ? 'active' : ''}
            onClick={() => setMenuOpen(false)}
          >
            {t('dashboard')}
          </Link>
          <Link 
            to="/rankings" 
            className={location.pathname === '/rankings' ? 'active' : ''}
            onClick={() => setMenuOpen(false)}
          >
            {t('rankings')}
          </Link>
          <Link 
            to="/games" 
            className={location.pathname === '/games' ? 'active' : ''}
            onClick={() => setMenuOpen(false)}
          >
            {t('allGames') || 'Games'}
          </Link>
          <Link 
            to="/submit-game" 
            className={location.pathname === '/submit-game' ? 'active' : ''}
            onClick={() => setMenuOpen(false)}
          >
            {t('submitGame')}
          </Link>
          <Link 
            to="/profile" 
            className={location.pathname === '/profile' ? 'active' : ''}
            onClick={() => setMenuOpen(false)}
          >
            {t('profile')}
          </Link>
          {currentUser?.isAdmin && (
            <Link 
              to="/admin" 
              className={location.pathname.startsWith('/admin') ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              {t('adminNav')}
            </Link>
          )}
        </div>
        
        <div className="app-navbar-actions">
          {currentUser && (
            <>
              <button 
                className="theme-toggle"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? t('switchToLight') : t('switchToDark')}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              
              <div className="app-navbar-user">
                <span>{currentUser.name}</span>
              </div>
              
              <WebSocketStatus className="app-navbar-ws-status" />
              
              <button 
                className="app-btn-secondary app-btn-sm"
                onClick={handleLogout}
              >
                {t('logout')}
              </button>
              
              <button 
                className="app-navbar-menu-toggle"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
              >
                {menuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;