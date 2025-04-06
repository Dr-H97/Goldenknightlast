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
    {/* Elegant chess board base */}
    <rect x="4" y="15" width="16" height="6" rx="1" 
      fill={active ? "rgba(201, 169, 106, 0.15)" : "rgba(200, 200, 200, 0.1)"} 
      stroke={active ? "var(--primary)" : "currentColor"} 
      strokeWidth="0.75" />
    
    {/* Chess knight - classic piece for submission */}
    <path d="M8 15C8 11 9 9 10 8.5C10 8 10 7 10 6C7 6 6 11 6 13C6 14 7 15 8 15Z" 
      fill={active ? "var(--primary)" : "currentColor"} 
      fillOpacity="0.9" 
      stroke={active ? "var(--primary)" : "currentColor"} 
      strokeWidth="0.75" />
      
    <path d="M9.5 8.5C10 8 11 7.5 12 7.5C15 7.5 16 10 16 13C16 14 15 15 14 15" 
      stroke={active ? "var(--primary)" : "currentColor"} 
      strokeWidth="1.25"
      strokeLinecap="round" />
      
    <path d="M10 6C10 5 10.5 4 12 3C13.5 4 14 5 14 6C14 7.5 13 8.5 12 8.5C11 8.5 10 7.5 10 6Z" 
      fill={active ? "rgba(201, 169, 106, 0.5)" : "rgba(200, 200, 200, 0.3)"} 
      stroke={active ? "var(--primary)" : "currentColor"} 
      strokeWidth="0.75" />
      
    {/* Movement indicators */}
    <path d="M10 12L14 12" 
      stroke={active ? "var(--primary)" : "currentColor"} 
      strokeWidth="1.5" 
      strokeLinecap="round"
      strokeDasharray="1 1" />
      
    {/* Chess timer/clock suggestion */}
    <circle cx="18" cy="6" r="3" 
      fill={active ? "rgba(201, 169, 106, 0.2)" : "rgba(200, 200, 200, 0.15)"} 
      stroke={active ? "var(--primary)" : "currentColor"} 
      strokeWidth="0.75" />
      
    {/* Clock hands */}
    <path d="M18 4v2h1.5" 
      stroke={active ? "var(--primary)" : "currentColor"} 
      strokeWidth="0.75" 
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