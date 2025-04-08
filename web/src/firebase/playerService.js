// Player Service for Firebase
import { 
  addDoc, 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from './firebase';
import { verifyPin, hashPin } from '../utils/pinHasher';
import {
  getSessionMockData,
  setSessionMockData,
  initializeMockData
} from './mockData';

// Check if we should use mock data
const useMockData = () => {
  const mockMode = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  return mockMode || apiKey === 'your-api-key' || !apiKey;
};

/**
 * Get all players with optional sorting
 */
export const getAllPlayers = async (sortBy = 'elo', order = 'desc') => {
  try {
    if (useMockData()) {
      // Initialize mock data if needed
      initializeMockData();
      
      // Get players from session storage
      const players = getSessionMockData('players', []);
      
      // Sort the players
      const sortedPlayers = [...players].sort((a, b) => {
        if (order === 'desc') {
          return b[sortBy] - a[sortBy];
        } else {
          return a[sortBy] - b[sortBy];
        }
      });
      
      return sortedPlayers;
    }

    // Use Firebase
    const playersRef = collection(db, 'players');
    const q = query(playersRef, orderBy(sortBy, order));
    const querySnapshot = await getDocs(q);
    
    const players = [];
    querySnapshot.forEach((doc) => {
      players.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return players;
  } catch (error) {
    console.error('Error getting all players:', error);
    throw error;
  }
};

/**
 * Get a player by ID
 */
export const getPlayerById = async (playerId) => {
  try {
    if (useMockData()) {
      // Initialize mock data if needed
      initializeMockData();
      
      // Get players from session storage
      const players = getSessionMockData('players', []);
      
      // Find player by ID
      const player = players.find(p => p.id === playerId);
      
      if (!player) {
        throw new Error(`Player with ID ${playerId} not found`);
      }
      
      return player;
    }

    // Use Firebase
    const playerRef = doc(db, 'players', playerId);
    const playerDoc = await getDoc(playerRef);
    
    if (!playerDoc.exists()) {
      throw new Error(`Player with ID ${playerId} not found`);
    }
    
    return {
      id: playerDoc.id,
      ...playerDoc.data()
    };
  } catch (error) {
    console.error('Error getting player by ID:', error);
    throw error;
  }
};

/**
 * Get a player by name
 */
export const getPlayerByName = async (playerName) => {
  try {
    if (useMockData()) {
      // Initialize mock data if needed
      initializeMockData();
      
      // Get players from session storage
      const players = getSessionMockData('players', []);
      
      // Find player by name
      const player = players.find(p => p.username.toLowerCase() === playerName.toLowerCase());
      
      if (!player) {
        throw new Error(`Player ${playerName} not found`);
      }
      
      return player;
    }

    // Use Firebase
    const playersRef = collection(db, 'players');
    const q = query(playersRef, where('username', '==', playerName));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error(`Player ${playerName} not found`);
    }
    
    const playerDoc = querySnapshot.docs[0];
    return {
      id: playerDoc.id,
      ...playerDoc.data()
    };
  } catch (error) {
    console.error('Error getting player by name:', error);
    throw error;
  }
};

/**
 * Create a new player
 */
export const createPlayer = async (playerData) => {
  try {
    // Hash the PIN
    const pinHash = await hashPin(playerData.pin);
    
    // Create player object
    const newPlayer = {
      username: playerData.username,
      full_name: playerData.full_name || playerData.username,
      pin_hash: pinHash,
      elo: 1500, // Default ELO rating
      games_played: 0,
      games_won: 0,
      games_lost: 0,
      games_drawn: 0,
      is_admin: playerData.is_admin || false,
      created_at: new Date().toISOString()
    };
    
    if (useMockData()) {
      // Initialize mock data if needed
      initializeMockData();
      
      // Get players from session storage
      const players = getSessionMockData('players', []);
      
      // Check for duplicate username
      const existingPlayer = players.find(p => p.username.toLowerCase() === playerData.username.toLowerCase());
      if (existingPlayer) {
        throw new Error(`Player with username ${playerData.username} already exists`);
      }
      
      // Generate a unique ID
      const newId = 'player-' + Date.now();
      
      // Add new player to the array
      const playerWithId = {
        id: newId,
        ...newPlayer
      };
      
      // Update storage
      setSessionMockData('players', [...players, playerWithId]);
      
      return playerWithId;
    }

    // Use Firebase
    const playersRef = collection(db, 'players');
    
    // Check for duplicate username
    const q = query(playersRef, where('username', '==', playerData.username));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      throw new Error(`Player with username ${playerData.username} already exists`);
    }
    
    // Add new player to Firestore
    const docRef = await addDoc(playersRef, newPlayer);
    
    // Get the created player
    const playerDoc = await getDoc(docRef);
    
    return {
      id: playerDoc.id,
      ...playerDoc.data()
    };
  } catch (error) {
    console.error('Error creating player:', error);
    throw error;
  }
};

/**
 * Update a player by ID
 */
export const updatePlayer = async (playerId, playerData) => {
  try {
    // Prepare update data
    const updateData = { ...playerData };
    
    // Hash the PIN if it's being updated
    if (updateData.pin) {
      updateData.pin_hash = await hashPin(updateData.pin);
      delete updateData.pin;
    }
    
    if (useMockData()) {
      // Initialize mock data if needed
      initializeMockData();
      
      // Get players from session storage
      const players = getSessionMockData('players', []);
      
      // Find player by ID
      const playerIndex = players.findIndex(p => p.id === playerId);
      
      if (playerIndex === -1) {
        throw new Error(`Player with ID ${playerId} not found`);
      }
      
      // Create updated player
      const updatedPlayer = {
        ...players[playerIndex],
        ...updateData,
        id: playerId // Ensure ID doesn't change
      };
      
      // Update array
      const updatedPlayers = [...players];
      updatedPlayers[playerIndex] = updatedPlayer;
      
      // Update storage
      setSessionMockData('players', updatedPlayers);
      
      return updatedPlayer;
    }

    // Use Firebase
    const playerRef = doc(db, 'players', playerId);
    
    // Check if player exists
    const playerDoc = await getDoc(playerRef);
    if (!playerDoc.exists()) {
      throw new Error(`Player with ID ${playerId} not found`);
    }
    
    // Update player
    await updateDoc(playerRef, updateData);
    
    // Get updated player
    const updatedDoc = await getDoc(playerRef);
    
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
    };
  } catch (error) {
    console.error('Error updating player:', error);
    throw error;
  }
};

/**
 * Delete a player by ID
 */
export const deletePlayer = async (playerId) => {
  try {
    if (useMockData()) {
      // Initialize mock data if needed
      initializeMockData();
      
      // Get players from session storage
      const players = getSessionMockData('players', []);
      
      // Filter out the player
      const updatedPlayers = players.filter(p => p.id !== playerId);
      
      // Check if player was found
      if (updatedPlayers.length === players.length) {
        throw new Error(`Player with ID ${playerId} not found`);
      }
      
      // Update storage
      setSessionMockData('players', updatedPlayers);
      
      return true;
    }

    // Use Firebase
    const playerRef = doc(db, 'players', playerId);
    
    // Check if player exists
    const playerDoc = await getDoc(playerRef);
    if (!playerDoc.exists()) {
      throw new Error(`Player with ID ${playerId} not found`);
    }
    
    // Delete player
    await deleteDoc(playerRef);
    
    return true;
  } catch (error) {
    console.error('Error deleting player:', error);
    throw error;
  }
};

/**
 * Authenticate a player by name and PIN
 */
export const authenticatePlayer = async (name, pin) => {
  try {
    if (useMockData()) {
      // Initialize mock data if needed
      initializeMockData();
      
      // Get players from session storage
      const players = getSessionMockData('players', []);
      
      // Find player by name
      const player = players.find(p => p.username.toLowerCase() === name.toLowerCase());
      
      if (!player) {
        throw new Error(`Player ${name} not found`);
      }
      
      // Verify PIN
      const isPinValid = await verifyPin(pin, player.pin_hash);
      
      if (!isPinValid) {
        throw new Error('Incorrect PIN');
      }
      
      return player;
    }

    // Use Firebase
    const playersRef = collection(db, 'players');
    const q = query(playersRef, where('username', '==', name));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error(`Player ${name} not found`);
    }
    
    const playerDoc = querySnapshot.docs[0];
    const playerData = playerDoc.data();
    
    // Verify PIN
    const isPinValid = await verifyPin(pin, playerData.pin_hash);
    
    if (!isPinValid) {
      throw new Error('Incorrect PIN');
    }
    
    return {
      id: playerDoc.id,
      ...playerData
    };
  } catch (error) {
    console.error('Error authenticating player:', error);
    throw error;
  }
};

/**
 * Get top players by ELO
 */
export const getTopPlayers = async (count = 10) => {
  try {
    if (useMockData()) {
      // Initialize mock data if needed
      initializeMockData();
      
      // Get players from session storage
      const players = getSessionMockData('players', []);
      
      // Sort by ELO and limit
      return [...players]
        .sort((a, b) => b.elo - a.elo)
        .slice(0, count);
    }

    // Use Firebase
    const playersRef = collection(db, 'players');
    const q = query(playersRef, orderBy('elo', 'desc'), limit(count));
    const querySnapshot = await getDocs(q);
    
    const players = [];
    querySnapshot.forEach((doc) => {
      players.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return players;
  } catch (error) {
    console.error('Error getting top players:', error);
    throw error;
  }
};