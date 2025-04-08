/**
 * Mock data for development without Firebase
 */

// Current authenticated user - default to null (not logged in)
let mockCurrentUser = null;
let mockPlayers = [];
let mockGames = [];

// Mock authentication functions
export const mockSignIn = (userData) => {
  mockCurrentUser = userData;
  return userData;
};

export const mockSignOut = () => {
  mockCurrentUser = null;
  return true;
};

export const mockGetCurrentUser = () => {
  return mockCurrentUser;
};

// Mock data storage (memory-based with sessionStorage fallback)
export const getSessionMockData = (key, defaultValue) => {
  if (key === 'players') {
    if (mockPlayers.length > 0) {
      return mockPlayers;
    }
  }
  
  if (key === 'games') {
    if (mockGames.length > 0) {
      return mockGames;
    }
  }
  
  try {
    const storedValue = window.sessionStorage && sessionStorage.getItem(key);
    if (storedValue) {
      const parsed = JSON.parse(storedValue);
      if (key === 'players') mockPlayers = parsed;
      if (key === 'games') mockGames = parsed;
      return parsed;
    }
    return defaultValue;
  } catch (error) {
    console.error("Error retrieving mock data from session:", error);
    return defaultValue;
  }
};

export const setSessionMockData = (key, value) => {
  try {
    // Store in memory
    if (key === 'players') mockPlayers = value;
    if (key === 'games') mockGames = value;
    
    // Also try to store in sessionStorage if available
    if (window.sessionStorage) {
      sessionStorage.setItem(key, JSON.stringify(value));
    }
    return true;
  } catch (error) {
    console.error("Error storing mock data:", error);
    // Store in memory only
    if (key === 'players') mockPlayers = value;
    if (key === 'games') mockGames = value;
    return true;
  }
};

// Initialize mock data - will be called from initData.js
export const initializeMockData = () => {
  // Check if data already exists
  if (getSessionMockData('players', []).length === 0) {
    console.log("No player data found, initializing from initData.js");
  }
  
  if (getSessionMockData('games', []).length === 0) {
    console.log("No game data found, initializing from initData.js");
  }
};