import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the Authentication Context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component to wrap the app and provide auth context
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // On mount, check if user is already logged in from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('chessClubUser');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading user data from localStorage:', error);
      localStorage.removeItem('chessClubUser');
    } finally {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = async (name, pin) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, pin }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to login');
      }

      // Save user in state and localStorage
      setCurrentUser(data.player);
      localStorage.setItem('chessClubUser', JSON.stringify(data.player));
      return data.player;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('chessClubUser');
  };

  // Verify PIN for game submission or other actions
  const verifyPin = async (playerId, pin) => {
    try {
      const response = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerId, pin }),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('PIN verification error:', error);
      return false;
    }
  };

  // Value to be provided to consumers of this context
  const value = {
    currentUser,
    loading,
    login,
    logout,
    verifyPin,
    isAdmin: currentUser?.isAdmin || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};