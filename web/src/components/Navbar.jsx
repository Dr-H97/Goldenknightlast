import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <nav style={{
      backgroundColor: 'var(--card-bg)',
      color: 'var(--text)',
      padding: '10px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      width: '100%',
      boxSizing: 'border-box',
      borderBottom: '1px solid var(--border)'
    }}>
      <div className="nav-left">
        <h2 style={{ margin: 0 }}>Chess Club</h2>
      </div>
      
      <div className="nav-middle" style={{
        display: 'flex',
        gap: '20px'
      }}>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/rankings">Rankings</Link>
        <Link to="/submit-game">Submit Game</Link>
        <Link to="/profile">Profile</Link>
        {isAdmin && <Link to="/admin">Admin</Link>}
      </div>
      
      <div className="nav-right" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <ThemeToggle />
        {currentUser && (
          <>
            <span>Hello, {currentUser.name}</span>
            <button 
              onClick={handleLogout}
              style={{
                padding: '5px 10px',
                backgroundColor: 'transparent',
                border: '1px solid var(--primary)',
                borderRadius: '4px',
                color: 'var(--primary)',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;