import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

// SVG Icons for a more consistent, professional look
const DashboardIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Dashboard with chess statistics */}
    <rect x="3" y="3" width="18" height="18" rx="2" 
      stroke={active ? "var(--primary)" : "currentColor"} fill="none" strokeWidth="1.5" />
    
    {/* Chart elements */}
    <path d="M7 14v4M11 11v7M15 8v10M19 5v13" 
      stroke={active ? "var(--primary)" : "currentColor"} strokeWidth="1.5" strokeLinecap="round" />
    
    {/* Small chess piece (rook) on top of the dashboard */}
    <path d="M6 5v2h1v1h-1v1h1v-1h2v1h1v-1h-1v-1h1v-2z" 
      fill={active ? "var(--primary)" : "currentColor"} />
  </svg>
);

const RankingsIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Trophy base */}
    <path d="M8 21h8M12 17v4" 
      stroke={active ? "var(--primary)" : "currentColor"} strokeWidth="1.5" strokeLinecap="round" />
    
    {/* Trophy cup */}
    <path d="M17 11c1 0 3-1 3-5H4c0 4 2 5 3 5" 
      stroke={active ? "var(--primary)" : "currentColor"} strokeWidth="1.5" />
    
    <path d="M7 11v2c0 2.2 2.2 4 5 4s5-1.8 5-4v-2" 
      stroke={active ? "var(--primary)" : "currentColor"} strokeWidth="1.5" />
    
    {/* Crown on top */}
    <path d="M8.5 5L12 3l3.5 2-1 3h-5l-1-3z" 
      fill={active ? "var(--primary)" : "currentColor"} fillOpacity="0.6" stroke={active ? "var(--primary)" : "currentColor"} strokeWidth="1" />
  </svg>
);

const GamesIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Chess board base with elegant border */}
    <rect x="3" y="3" width="18" height="18" rx="2" 
      stroke={active ? "var(--primary)" : "currentColor"} 
      strokeWidth="1.5"
      fill={active ? "rgba(201, 169, 106, 0.1)" : "rgba(200, 200, 200, 0.05)"} />
    
    {/* Alternating chess board pattern */}
    <path d="M5 5h4v4H5zM13 5h4v4h-4zM5 13h4v4H5zM13 13h4v4h-4z" 
      fill={active ? "rgba(201, 169, 106, 0.25)" : "rgba(200, 200, 200, 0.15)"} />
    <path d="M9 9h4v4H9zM17 9h2v4h-2zM9 17h4v2H9zM17 17h2v2h-2z" 
      fill={active ? "rgba(201, 169, 106, 0.25)" : "rgba(200, 200, 200, 0.15)"} />
      
    {/* Chess pieces - Knight */}
    <path d="M6.5 6.5c0 0.5 0.5 1 1 1.25v0.75h1v-0.5h0.5v-1h-1c0-0.25-0.5-0.5-0.5-0.5h-1z" 
      fill={active ? "var(--primary)" : "currentColor"} stroke="none" />
    
    {/* Chess pieces - Bishop */}
    <path d="M14 6l1 1v1h1v-1l-1-1h-1z" 
      fill={active ? "var(--primary)" : "currentColor"} stroke="none" />
      
    {/* Chess pieces - Rook */}
    <path d="M6 14v0.5h0.5v0.5h1v-0.5h0.5v-0.5z" 
      fill={active ? "var(--primary)" : "currentColor"} stroke="none" />
      
    {/* Chess pieces - Queen */}
    <path d="M14.5 14c0 0.5 0.5 1 1 1s1-0.5 1-1h-2z" 
      fill={active ? "var(--primary)" : "currentColor"} stroke="none" />
      
    {/* Chess pieces - Pawn */}
    <circle cx="11" cy="11" r="0.85" 
      fill={active ? "var(--primary)" : "currentColor"} />
  </svg>
);

const SubmitGameIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Knight chess piece - using golden color for the piece */}
    <path 
      d="M11.4 3C9.6 3 8.4 4.05 8.4 5.7C8.4 6.45 8.7 7.05 9.3 7.5C8.7 7.8 8.1 8.25 7.5 8.7C6.9 9.15 6.3 9.75 5.7 10.5C4.8 11.7 3.9 13.35 3 15.5C2.7 16.5 2.85 17.4 3.6 18C4.35 18.6 5.1 18.75 6 18.75H18.3V17.25H6C5.7 17.25 5.4 17.2 5.1 17.05C4.8 16.9 4.5 16.55 4.5 16.1C5.4 14 6 12.5 6.9 11.5C7.2 11.05 7.5 10.65 7.8 10.35C8.4 9.75 9 9.15 9.6 8.85C9.9 9.45 10.2 9.9 10.5 10.35C10.8 10.8 11.1 11.25 11.4 11.8C11.1 11.95 10.8 12.25 10.65 12.55C10.5 12.85 10.5 13.15 10.5 13.5C10.5 14 10.75 14.5 11 14.8C11.25 15.1 11.65 15.4 12.3 15.4C12.95 15.4 13.4 15.2 13.7 14.8C14 14.4 14.1 13.9 14.1 13.5C14.1 13.1 14 12.75 13.8 12.5C13.5 12.2 13.2 12 12.9 11.85C12.6 11.25 12.3 10.8 12 10.35C11.7 9.9 11.4 9.45 11.1 8.85H12.3C12.6 8.85 12.9 8.8 13.2 8.75C13.8 8.6 14.4 8.4 15 8.1C15.9 7.8 16.5 7.2 16.8 6.45C17.1 5.7 17.1 4.9 17.1 4.25V4.2C17.1 3.75 16.8 3.4 16.5 3.4H11.4Z" 
      fill={active ? "var(--primary)" : "currentColor"} 
      fillOpacity={active ? "1" : "0.6"} 
    />
    
    {/* "Plus" sign for adding a game */}
    <circle cx="19" cy="19" r="4" 
      fill={active ? "var(--primary)" : "currentColor"} 
      fillOpacity="0.2" 
      stroke={active ? "var(--primary)" : "currentColor"} 
      strokeWidth="0.8" />
    <path d="M19 17v4M17 19h4" 
      stroke={active ? "var(--primary)" : "currentColor"} 
      strokeWidth="1" 
      strokeLinecap="round" />
  </svg>
);

const AdminIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Chess queen - representing the most powerful piece */}
    <path d="M12 2L12 5" 
      stroke={active ? "var(--primary)" : "currentColor"} strokeWidth="1.5" strokeLinecap="round" />
    
    {/* Crown points */}
    <path d="M12 5L8 8L4 5L7 15H17L20 5L16 8L12 5Z" 
      stroke={active ? "var(--primary)" : "currentColor"} strokeWidth="1.5" strokeLinejoin="round" 
      fill={active ? "rgba(201, 169, 106, 0.2)" : "rgba(200, 200, 200, 0.1)"} />
    
    {/* Base */}
    <path d="M7 15v3c0 0.5 2.5 2 5 2s5-1.5 5-2v-3" 
      stroke={active ? "var(--primary)" : "currentColor"} strokeWidth="1.5" />
    
    {/* Settings gear for admin */}
    <circle cx="19" cy="19" r="4" 
      fill={active ? "var(--primary)" : "currentColor"} fillOpacity="0.2" 
      stroke={active ? "var(--primary)" : "currentColor"} strokeWidth="0.8" />
    <path d="M19 17v4M17 19h4" 
      stroke={active ? "var(--primary)" : "currentColor"} strokeWidth="1" strokeLinecap="round" />
  </svg>
);

const ProfileIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Chess pawn - representing the individual player */}
    <circle cx="12" cy="7" r="3" 
      stroke={active ? "var(--primary)" : "currentColor"} strokeWidth="1.5" 
      fill={active ? "rgba(201, 169, 106, 0.2)" : "rgba(200, 200, 200, 0.1)"} />
    
    {/* Pawn body */}
    <path d="M8.5 10C7.5 11 7 12 7 13C7 14.5 9 16 12 16C15 16 17 14.5 17 13C17 12 16.5 11 15.5 10" 
      stroke={active ? "var(--primary)" : "currentColor"} strokeWidth="1.5" />
    
    {/* Base */}
    <path d="M8 16l-1 4h10l-1-4" 
      stroke={active ? "var(--primary)" : "currentColor"} strokeWidth="1.5" strokeLinejoin="round" 
      fill={active ? "rgba(201, 169, 106, 0.2)" : "rgba(200, 200, 200, 0.1)"} />
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
  
  // Determine if the user is playing (non-admin) or admin
  const isAdmin = currentUser?.isAdmin;
  
  return (
    <nav className="mobile-nav">
      <div className={`mobile-nav-container ${!isAdmin ? 'player-nav' : ''}`}>
        {/* First group: Dashboard and Rankings */}
        <div className="nav-group">
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
        </div>
        
        {/* Central "Submit Game" button, prominent for players */}
        <Link 
          to="/submit-game" 
          className={`mobile-nav-item submit-game-button ${location.pathname === '/submit-game' ? 'active' : ''} ${!isAdmin ? 'centered-button' : ''}`}
        >
          <div className="mobile-nav-icon">
            <SubmitGameIcon active={location.pathname === '/submit-game'} />
          </div>
          <span>{t('submitGame')}</span>
        </Link>
        
        {/* Last group: Games, Admin (if applicable), and Profile */}
        <div className="nav-group">
          <Link 
            to="/games" 
            className={`mobile-nav-item ${location.pathname === '/games' ? 'active' : ''}`}
          >
            <div className="mobile-nav-icon">
              <GamesIcon active={location.pathname === '/games'} />
            </div>
            <span>{t('allGames') || 'Games'}</span>
          </Link>
          
          {isAdmin && (
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
      </div>
    </nav>
  );
};

export default MobileNav;