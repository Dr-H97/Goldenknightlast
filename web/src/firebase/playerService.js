// Firebase Player Service
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { hashPin, verifyPin } from '../utils/pinHasher';

const PLAYERS_COLLECTION = 'players';

/**
 * Get all players with optional sorting
 */
export const getAllPlayers = async (sortBy = 'elo', order = 'desc') => {
  try {
    const playersRef = collection(db, PLAYERS_COLLECTION);
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
    console.error('Error getting players:', error);
    throw error;
  }
};

/**
 * Get a player by ID
 */
export const getPlayerById = async (playerId) => {
  try {
    const playerRef = doc(db, PLAYERS_COLLECTION, playerId);
    const playerDoc = await getDoc(playerRef);
    
    if (!playerDoc.exists()) {
      throw new Error(`Player with ID ${playerId} not found`);
    }
    
    return {
      id: playerDoc.id,
      ...playerDoc.data()
    };
  } catch (error) {
    console.error('Error getting player:', error);
    throw error;
  }
};

/**
 * Get a player by name
 */
export const getPlayerByName = async (playerName) => {
  try {
    const playersRef = collection(db, PLAYERS_COLLECTION);
    const q = query(playersRef, where('name', '==', playerName));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error(`Player with name ${playerName} not found`);
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
    const pin_hash = await hashPin(playerData.pin);
    
    // Add timestamp and format player data
    const newPlayer = {
      name: playerData.name,
      elo: playerData.elo || 1200, // Default ELO
      pin_hash,
      is_admin: playerData.is_admin || false,
      games_played: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, PLAYERS_COLLECTION), newPlayer);
    
    return {
      id: docRef.id,
      ...newPlayer
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
    const playerRef = doc(db, PLAYERS_COLLECTION, playerId);
    
    // Prepare data for update
    const updateData = {
      ...playerData,
      updated_at: serverTimestamp()
    };
    
    // If a new PIN is provided, hash it
    if (playerData.pin) {
      updateData.pin_hash = await hashPin(playerData.pin);
      delete updateData.pin; // Remove unhashed PIN
    }
    
    await updateDoc(playerRef, updateData);
    
    // Get updated document
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
    const playerRef = doc(db, PLAYERS_COLLECTION, playerId);
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
    // Get player by name
    const player = await getPlayerByName(name);
    
    // Verify PIN
    const isPinValid = await verifyPin(pin, player.pin_hash);
    
    if (!isPinValid) {
      throw new Error('Incorrect PIN');
    }
    
    return player;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

/**
 * Get top players by ELO
 */
export const getTopPlayers = async (count = 10) => {
  try {
    const playersRef = collection(db, PLAYERS_COLLECTION);
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