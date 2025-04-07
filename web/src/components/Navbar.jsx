import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import WebSocketStatus from './WebSocketStatus';
import '../styles/navbar.css';

// Golden Knight Chess Logo
const ChessLogo = () => (
  <img 
    src="/images/golden-knight.svg" 
    alt="Golden Knight Chess Logo" 
    className="chess-logo-icon" 
    width="28" 
    height="28" 
  />
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