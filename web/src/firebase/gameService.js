// Firebase Game Service
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
import { getPlayerById, updatePlayer } from './playerService';
import { calculateElo } from '../utils/eloCalculator';

const GAMES_COLLECTION = 'games';
const PLAYERS_COLLECTION = 'players';

/**
 * Get all games with optional filters and sorting
 */
export const getAllGames = async (filters = {}, sortBy = 'date', order = 'desc') => {
  try {
    const gamesRef = collection(db, GAMES_COLLECTION);
    
    // Build query
    let q = query(gamesRef);
    
    // Apply filters
    if (filters.playerId) {
      q = query(q, 
        where('white_player_id', '==', filters.playerId),
        where('black_player_id', '==', filters.playerId)
      );
    }
    
    if (filters.verified !== undefined) {
      q = query(q, where('verified', '==', filters.verified));
    }
    
    // Apply sorting
    // Convert sortBy to the actual field name in Firestore
    const sortField = sortBy === 'date' ? 'date' : sortBy;
    q = query(q, orderBy(sortField, order));
    
    // Execute query
    const querySnapshot = await getDocs(q);
    
    // Process results
    const games = [];
    querySnapshot.forEach((doc) => {
      games.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return games;
  } catch (error) {
    console.error('Error getting games:', error);
    throw error;
  }
};

/**
 * Get a game by ID with player information
 */
export const getGameById = async (gameId) => {
  try {
    const gameRef = doc(db, GAMES_COLLECTION, gameId);
    const gameDoc = await getDoc(gameRef);
    
    if (!gameDoc.exists()) {
      throw new Error(`Game with ID ${gameId} not found`);
    }
    
    const gameData = gameDoc.data();
    
    // Get player details
    const whitePlayer = await getPlayerById(gameData.white_player_id);
    const blackPlayer = await getPlayerById(gameData.black_player_id);
    
    return {
      id: gameDoc.id,
      ...gameData,
      white_player: whitePlayer,
      black_player: blackPlayer
    };
  } catch (error) {
    console.error('Error getting game:', error);
    throw error;
  }
};

/**
 * Create a new game and update player ratings
 */
export const createGame = async (gameData) => {
  try {
    // Validate game data
    if (!gameData.white_player_id || !gameData.black_player_id || !gameData.result) {
      throw new Error('Invalid game data. Required fields: white_player_id, black_player_id, result');
    }
    
    // Get player data for ELO calculation
    const whitePlayer = await getPlayerById(gameData.white_player_id);
    const blackPlayer = await getPlayerById(gameData.black_player_id);
    
    // Format game data
    const newGame = {
      white_player_id: gameData.white_player_id,
      black_player_id: gameData.black_player_id,
      white_player_name: whitePlayer.name,
      black_player_name: blackPlayer.name,
      white_elo_before: whitePlayer.elo,
      black_elo_before: blackPlayer.elo,
      result: gameData.result,
      date: gameData.date || serverTimestamp(),
      verified: false, // Games are unverified when first created
      event: gameData.event || 'Club Game',
      time_control: gameData.time_control || 'Standard',
      moves: gameData.moves || '',
      notes: gameData.notes || '',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
    
    // Calculate new ELO ratings
    const { whiteNewElo, blackNewElo, whiteEloDiff, blackEloDiff } = 
      calculateElo(whitePlayer.elo, blackPlayer.elo, newGame.result);
    
    // Add ELO data to game
    newGame.white_elo_after = whiteNewElo;
    newGame.black_elo_after = blackNewElo;
    newGame.white_elo_change = whiteEloDiff;
    newGame.black_elo_change = blackEloDiff;
    
    // Add game to database
    const docRef = await addDoc(collection(db, GAMES_COLLECTION), newGame);
    
    return {
      id: docRef.id,
      ...newGame
    };
  } catch (error) {
    console.error('Error creating game:', error);
    throw error;
  }
};

/**
 * Verify a game and update player ratings
 */
export const verifyGame = async (gameId) => {
  try {
    const gameRef = doc(db, GAMES_COLLECTION, gameId);
    const gameDoc = await getDoc(gameRef);
    
    if (!gameDoc.exists()) {
      throw new Error(`Game with ID ${gameId} not found`);
    }
    
    const gameData = gameDoc.data();
    
    // Check if game is already verified
    if (gameData.verified) {
      return {
        id: gameDoc.id,
        ...gameData
      };
    }
    
    // Get player data for updating
    const whitePlayer = await getPlayerById(gameData.white_player_id);
    const blackPlayer = await getPlayerById(gameData.black_player_id);
    
    // Update game to verified
    await updateDoc(gameRef, {
      verified: true,
      updated_at: serverTimestamp()
    });
    
    // Update player ratings and stats
    const whitePlayerUpdate = { elo: gameData.white_elo_after, games_played: whitePlayer.games_played + 1 };
    const blackPlayerUpdate = { elo: gameData.black_elo_after, games_played: blackPlayer.games_played + 1 };
    
    // Update win/loss/draw counts
    if (gameData.result === '1-0') {
      whitePlayerUpdate.wins = (whitePlayer.wins || 0) + 1;
      blackPlayerUpdate.losses = (blackPlayer.losses || 0) + 1;
    } else if (gameData.result === '0-1') {
      whitePlayerUpdate.losses = (whitePlayer.losses || 0) + 1;
      blackPlayerUpdate.wins = (blackPlayer.wins || 0) + 1;
    } else {
      // Draw
      whitePlayerUpdate.draws = (whitePlayer.draws || 0) + 1;
      blackPlayerUpdate.draws = (blackPlayer.draws || 0) + 1;
    }
    
    // Update players
    await updatePlayer(gameData.white_player_id, whitePlayerUpdate);
    await updatePlayer(gameData.black_player_id, blackPlayerUpdate);
    
    // Return updated game data
    const updatedGameDoc = await getDoc(gameRef);
    return {
      id: updatedGameDoc.id,
      ...updatedGameDoc.data()
    };
  } catch (error) {
    console.error('Error verifying game:', error);
    throw error;
  }
};

/**
 * Delete a game and revert player ratings if game was verified
 */
export const deleteGame = async (gameId) => {
  try {
    const gameRef = doc(db, GAMES_COLLECTION, gameId);
    const gameDoc = await getDoc(gameRef);
    
    if (!gameDoc.exists()) {
      throw new Error(`Game with ID ${gameId} not found`);
    }
    
    const gameData = gameDoc.data();
    
    // If game was verified, revert player ratings
    if (gameData.verified) {
      // Get player data for updating
      const whitePlayer = await getPlayerById(gameData.white_player_id);
      const blackPlayer = await getPlayerById(gameData.black_player_id);
      
      // Prepare player updates
      const whitePlayerUpdate = { 
        elo: gameData.white_elo_before,
        games_played: Math.max(0, whitePlayer.games_played - 1)
      };
      
      const blackPlayerUpdate = { 
        elo: gameData.black_elo_before,
        games_played: Math.max(0, blackPlayer.games_played - 1)
      };
      
      // Update win/loss/draw counts
      if (gameData.result === '1-0') {
        whitePlayerUpdate.wins = Math.max(0, (whitePlayer.wins || 0) - 1);
        blackPlayerUpdate.losses = Math.max(0, (blackPlayer.losses || 0) - 1);
      } else if (gameData.result === '0-1') {
        whitePlayerUpdate.losses = Math.max(0, (whitePlayer.losses || 0) - 1);
        blackPlayerUpdate.wins = Math.max(0, (blackPlayer.wins || 0) - 1);
      } else {
        // Draw
        whitePlayerUpdate.draws = Math.max(0, (whitePlayer.draws || 0) - 1);
        blackPlayerUpdate.draws = Math.max(0, (blackPlayer.draws || 0) - 1);
      }
      
      // Update players
      await updatePlayer(gameData.white_player_id, whitePlayerUpdate);
      await updatePlayer(gameData.black_player_id, blackPlayerUpdate);
    }
    
    // Delete the game
    await deleteDoc(gameRef);
    
    return true;
  } catch (error) {
    console.error('Error deleting game:', error);
    throw error;
  }
};

/**
 * Update a game result and recalculate ELO ratings
 */
export const updateGameResult = async (gameId, newResult) => {
  try {
    const gameRef = doc(db, GAMES_COLLECTION, gameId);
    const gameDoc = await getDoc(gameRef);
    
    if (!gameDoc.exists()) {
      throw new Error(`Game with ID ${gameId} not found`);
    }
    
    const gameData = gameDoc.data();
    
    // Check if result actually changed
    if (gameData.result === newResult) {
      return {
        id: gameDoc.id,
        ...gameData
      };
    }
    
    // Get player data for ELO calculation
    const whitePlayer = await getPlayerById(gameData.white_player_id);
    const blackPlayer = await getPlayerById(gameData.black_player_id);
    
    // Calculate new ELO ratings based on new result
    const { whiteNewElo, blackNewElo, whiteEloDiff, blackEloDiff } = 
      calculateElo(gameData.white_elo_before, gameData.black_elo_before, newResult);
    
    // Update game
    const updates = {
      result: newResult,
      white_elo_after: whiteNewElo,
      black_elo_after: blackNewElo,
      white_elo_change: whiteEloDiff,
      black_elo_change: blackEloDiff,
      updated_at: serverTimestamp()
    };
    
    await updateDoc(gameRef, updates);
    
    // If game was verified, update player ratings
    if (gameData.verified) {
      // Revert previous result stats
      const whitePrevStats = {};
      const blackPrevStats = {};
      
      if (gameData.result === '1-0') {
        whitePrevStats.wins = Math.max(0, (whitePlayer.wins || 0) - 1);
        blackPrevStats.losses = Math.max(0, (blackPlayer.losses || 0) - 1);
      } else if (gameData.result === '0-1') {
        whitePrevStats.losses = Math.max(0, (whitePlayer.losses || 0) - 1);
        blackPrevStats.wins = Math.max(0, (blackPlayer.wins || 0) - 1);
      } else {
        // Draw
        whitePrevStats.draws = Math.max(0, (whitePlayer.draws || 0) - 1);
        blackPrevStats.draws = Math.max(0, (blackPlayer.draws || 0) - 1);
      }
      
      // Add new result stats
      if (newResult === '1-0') {
        whitePrevStats.wins = (whitePrevStats.wins || whitePlayer.wins || 0) + 1;
        blackPrevStats.losses = (blackPrevStats.losses || blackPlayer.losses || 0) + 1;
      } else if (newResult === '0-1') {
        whitePrevStats.losses = (whitePrevStats.losses || whitePlayer.losses || 0) + 1;
        blackPrevStats.wins = (blackPrevStats.wins || blackPlayer.wins || 0) + 1;
      } else {
        // Draw
        whitePrevStats.draws = (whitePrevStats.draws || whitePlayer.draws || 0) + 1;
        blackPrevStats.draws = (blackPrevStats.draws || blackPlayer.draws || 0) + 1;
      }
      
      // Update player ELO and stats
      await updatePlayer(gameData.white_player_id, {
        elo: whiteNewElo,
        ...whitePrevStats
      });
      
      await updatePlayer(gameData.black_player_id, {
        elo: blackNewElo,
        ...blackPrevStats
      });
    }
    
    // Return updated game data
    const updatedGameDoc = await getDoc(gameRef);
    return {
      id: updatedGameDoc.id,
      ...updatedGameDoc.data()
    };
  } catch (error) {
    console.error('Error updating game result:', error);
    throw error;
  }
};

/**
 * Get recent games
 */
export const getRecentGames = async (count = 5) => {
  try {
    const gamesRef = collection(db, GAMES_COLLECTION);
    const q = query(
      gamesRef, 
      where('verified', '==', true),
      orderBy('date', 'desc'), 
      limit(count)
    );
    
    const querySnapshot = await getDocs(q);
    
    const games = [];
    querySnapshot.forEach((doc) => {
      games.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return games;
  } catch (error) {
    console.error('Error getting recent games:', error);
    throw error;
  }
};

/**
 * Get player game history
 */
export const getPlayerGames = async (playerId, count = 10) => {
  try {
    const gamesRef = collection(db, GAMES_COLLECTION);
    const q = query(
      gamesRef,
      where('verified', '==', true),
      orderBy('date', 'desc'),
      limit(count)
    );
    
    const querySnapshot = await getDocs(q);
    
    const games = [];
    querySnapshot.forEach((doc) => {
      const gameData = doc.data();
      if (gameData.white_player_id === playerId || gameData.black_player_id === playerId) {
        games.push({
          id: doc.id,
          ...gameData
        });
      }
    });
    
    return games;
  } catch (error) {
    console.error('Error getting player games:', error);
    throw error;
  }
};