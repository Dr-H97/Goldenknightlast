import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { authenticateWithPin, logout, getCurrentPlayer } from '../firebase/authService';

// Create the context
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen for auth state changes when the component mounts
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const player = await getCurrentPlayer(user.uid);
          setCurrentPlayer(player);
        } catch (err) {
          console.error('Error getting player data:', err);
          setError('Failed to retrieve player data');
        }
      } else {
        setCurrentPlayer(null);
      }
      
      setLoading(false);
    });

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  // Login with player name and PIN
  const login = async (playerName, pin) => {
    try {
      setError(null);
      setLoading(true);
      
      const player = await authenticateWithPin(playerName, pin);
      setCurrentPlayer(player);
      
      return player;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const signOut = async () => {
    try {
      setLoading(true);
      await logout();
      setCurrentUser(null);
      setCurrentPlayer(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message || 'Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => setError(null);

  // Value object to provide through the context
  const value = {
    currentUser,
    currentPlayer,
    isAdmin: currentPlayer?.is_admin || false,
    loading,
    error,
    login,
    logout: signOut,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};