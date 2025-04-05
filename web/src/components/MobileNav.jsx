import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

// SVG Icons for a more consistent, professional look
const DashboardIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 13H10C10.55 13 11 12.55 11 12V4C11 3.45 10.55 3 10 3H4C3.45 3 3 3.45 3 4V12C3 12.55 3.45 13 4 13ZM4 21H10C10.55 21 11 20.55 11 20V16C11 15.45 10.55 15 10 15H4C3.45 15 3 15.45 3 16V20C3 20.55 3.45 21 4 21ZM14 21H20C20.55 21 21 20.55 21 20V12C21 11.45 20.55 11 20 11H14C13.45 11 13 11.45 13 12V20C13 20.55 13.45 21 14 21ZM13 4V8C13 8.55 13.45 9 14 9H20C20.55 9 21 8.55 21 8V4C21 3.45 20.55 3 20 3H14C13.45 3 13 3.45 13 4Z" 
      fill={active ? "var(--primary)" : "currentColor"} />
  </svg>
);

const RankingsIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 5H17V3H7V5H5C3.9 5 3 5.9 3 7V8C3 10.55 4.92 12.63 7.39 12.94C8.02 14.44 9.37 15.57 11 15.9V19H7V21H17V19H13V15.9C14.63 15.57 15.98 14.44 16.61 12.94C19.08 12.63 21 10.55 21 8V7C21 5.9 20.1 5 19 5ZM5 8V7H7V10.82C5.84 10.4 5 9.3 5 8ZM12 14C10.35 14 9 12.65 9 11V5H15V11C15 12.65 13.65 14 12 14ZM19 8C19 9.3 18.16 10.4 17 10.82V7H19V8Z" 
      fill={active ? "var(--primary)" : "currentColor"} />
  </svg>
);

const GamesIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 12C20 10.9 19.1 10 18 10H13V8.41C13.75 7.89 14.17 7.04 14.05 6.13C13.87 4.79 12.66 3.79 11.32 4.03C10.32 4.2 9.55 5.05 9.5 6.08C9.45 7.13 10 8.03 10.84 8.49C10.37 8.9 10.04 9.47 10 10.1V15C10 16.1 10.9 17 12 17H12.5V21H14.5V17H16.5L20 21V12ZM11.5 6C11.5 5.73 11.73 5.5 12 5.5C12.27 5.5 12.5 5.73 12.5 6C12.5 6.27 12.27 6.5 12 6.5C11.73 6.5 11.5 6.27 11.5 6ZM11.5 11.5H10.5V10.5H11.5V11.5ZM11.5 9.5H10.5V8.5H11.5V9.5ZM13.5 11.5H12.5V10.5H13.5V11.5ZM13.5 9.5H12.5V8.5H13.5V9.5ZM18 12.5V14.3L17 13.3V12.5H18Z" 
      fill={active ? "var(--primary)" : "currentColor"} />
  </svg>
);

const SubmitGameIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 14H9C9.55 14 10 13.55 10 13V11H8V13H6V11C6 10.45 6.45 10 7 10H9C9.55 10 10 9.55 10 9V7C10 6.45 9.55 6 9 6H5V8H8V9H6C5.45 9 5 9.45 5 10V14C5 14.55 5.45 15 6 15H11V14ZM15.88 15L17.3 11.4C17.42 11.12 17.3 10.8 17.03 10.66C16.76 10.5 16.43 10.56 16.23 10.78L15 12.3L13.77 10.78C13.57 10.55 13.23 10.5 12.96 10.66C12.7 10.8 12.57 11.12 12.7 11.4L14.12 15H15.88ZM19 6H17V16H19V6ZM21 19H3V21H21V19Z" 
      fill={active ? "var(--primary)" : "currentColor"} />
  </svg>
);

const AdminIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06C19.73 10.57 20.23 9.99 20.6 9.35C19.67 7.03 17.72 5.28 15.29 4.58C15.4 5 15.46 5.49 15.45 6C15.45 6.2 15.44 6.4 15.42 6.61C16.94 7.18 18.21 8.22 19.03 9.58C18.81 9.96 18.54 10.31 18.24 10.62L19.14 12.94ZM12 4.03C11.51 4.01 11.03 4.06 10.55 4.17C10.52 4.51 10.46 4.85 10.39 5.18C10.92 5.07 11.45 5 12 5C17.15 5 21.31 9.75 19.79 14.83L20.69 17.14C23.23 11.11 18.53 4 12 4.03ZM14.09 14.09C14.09 14.92 13.42 15.58 12.59 15.58C11.76 15.58 11.09 14.92 11.09 14.09C11.09 13.26 11.76 12.59 12.59 12.59C13.42 12.59 14.09 13.26 14.09 14.09ZM12 1C5.93 1 1 5.93 1 12C1 18.07 5.93 23 12 23C18.07 23 23 18.07 23 12C23 5.93 18.07 1 12 1ZM12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12C21 16.97 16.97 21 12 21ZM7.84 9.73H8.97L10.95 13.26L11.47 14.23L12 13.26L9.5 8.73H12V7.62L7.5 7.62V8.73H7.84V9.73Z" 
      fill={active ? "var(--primary)" : "currentColor"} />
  </svg>
);

const ProfileIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 6C13.1 6 14 6.9 14 8C14 9.1 13.1 10 12 10C10.9 10 10 9.1 10 8C10 6.9 10.9 6 12 6ZM12 13C9.33 13 4 14.34 4 17V20H20V17C20 14.34 14.67 13 12 13ZM18 18H6V17.01C6.2 16.29 9.3 15 12 15C14.7 15 17.8 16.29 18 17V18Z" 
      fill={active ? "var(--primary)" : "currentColor"} />
  </svg>
);

// Enhanced mobile-friendly bottom navigation with app-like experience
const MobileNav = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  
  // Don't show nav on login page
  if (location.pathname === '/login') {
    return null;
  }
  
  return (
    <nav className="mobile-nav">
      <div className="mobile-nav-container">
        <Link 
          to="/dashboard" 
          className={`mobile-nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
        >
          <div className="mobile-nav-icon">
            <DashboardIcon active={location.pathname === '/dashboard'} />
          </div>
          <span>{t('dashboard')}</span>
        </Link>
        
        <Link 
          to="/rankings" 
          className={`mobile-nav-item ${location.pathname === '/rankings' ? 'active' : ''}`}
        >
          <div className="mobile-nav-icon">
            <RankingsIcon active={location.pathname === '/rankings'} />
          </div>
          <span>{t('rankings')}</span>
        </Link>
        
        <Link 
          to="/submit-game" 
          className={`mobile-nav-item ${location.pathname === '/submit-game' ? 'active' : ''}`}
        >
          <div className="mobile-nav-icon">
            <SubmitGameIcon active={location.pathname === '/submit-game'} />
          </div>
          <span>{t('submitGame')}</span>
        </Link>
        
        <Link 
          to="/games" 
          className={`mobile-nav-item ${location.pathname === '/games' ? 'active' : ''}`}
        >
          <div className="mobile-nav-icon">
            <GamesIcon active={location.pathname === '/games'} />
          </div>
          <span>{t('allGames') || 'Games'}</span>
        </Link>
        
        {currentUser?.isAdmin && (
          <Link 
            to="/admin" 
            className={`mobile-nav-item ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
          >
            <div className="mobile-nav-icon">
              <AdminIcon active={location.pathname.startsWith('/admin')} />
            </div>
            <span>{t('adminNav')}</span>
          </Link>
        )}
        
        <Link 
          to="/profile" 
          className={`mobile-nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
        >
          <div className="mobile-nav-icon">
            <ProfileIcon active={location.pathname === '/profile'} />
          </div>
          <span>{t('profile')}</span>
        </Link>
      </div>
    </nav>
  );
};

export default MobileNav;