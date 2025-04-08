// Game Service for Firebase
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
import { calculateElo } from '../utils/eloCalculator';
import { getPlayerById, updatePlayer } from './playerService';
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
 * Get all games with optional filters and sorting
 */
export const getAllGames = async (filters = {}, sortBy = 'date', order = 'desc') => {
  try {
    if (useMockData()) {
      // Initialize mock data if needed
      initializeMockData();
      
      // Get games from session storage
      let games = getSessionMockData('games', []);
      
      // Apply filters
      if (filters.playerId) {
        games = games.filter(g => 
          g.white_player_id === filters.playerId || 
          g.black_player_id === filters.playerId
        );
      }
      
      if (filters.verified !== undefined) {
        games = games.filter(g => g.verified === filters.verified);
      }
      
      if (filters.dateFrom) {
        const dateFrom = new Date(filters.dateFrom);
        games = games.filter(g => new Date(g.date) >= dateFrom);
      }
      
      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo);
        games = games.filter(g => new Date(g.date) <= dateTo);
      }
      
      // Sort games
      games.sort((a, b) => {
        if (sortBy === 'date') {
          return order === 'desc' 
            ? new Date(b.date) - new Date(a.date)
            : new Date(a.date) - new Date(b.date);
        } else {
          return order === 'desc'
            ? b[sortBy] - a[sortBy]
            : a[sortBy] - b[sortBy];
        }
      });
      
      return games;
    }

    // Use Firebase
    const gamesRef = collection(db, 'games');
    let q = query(gamesRef);
    
    // Apply filters
    if (filters.playerId) {
      q = query(
        q, 
        where('white_player_id', '==', filters.playerId), 
        where('black_player_id', '==', filters.playerId)
      );
    }
    
    if (filters.verified !== undefined) {
      q = query(q, where('verified', '==', filters.verified));
    }
    
    // Note: Firebase requires special handling for date ranges
    
    // Apply sorting
    q = query(q, orderBy(sortBy, order));
    
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
    console.error('Error getting games:', error);
    throw error;
  }
};

/**
 * Get a game by ID with player information
 */
export const getGameById = async (gameId) => {
  try {
    if (useMockData()) {
      // Initialize mock data if needed
      initializeMockData();
      
      // Get games from session storage
      const games = getSessionMockData('games', []);
      
      // Find game by ID
      const game = games.find(g => g.id === gameId);
      
      if (!game) {
        throw new Error(`Game with ID ${gameId} not found`);
      }
      
      return game;
    }

    // Use Firebase
    const gameRef = doc(db, 'games', gameId);
    const gameDoc = await getDoc(gameRef);
    
    if (!gameDoc.exists()) {
      throw new Error(`Game with ID ${gameId} not found`);
    }
    
    return {
      id: gameDoc.id,
      ...gameDoc.data()
    };
  } catch (error) {
    console.error('Error getting game by ID:', error);
    throw error;
  }
};

/**
 * Create a new game and update player ratings
 */
export const createGame = async (gameData) => {
  try {
    // Get player data for ELO calculation
    const whitePlayer = await getPlayerById(gameData.white_player_id);
    const blackPlayer = await getPlayerById(gameData.black_player_id);
    
    // Calculate ELO changes based on result
    const whiteElo = whitePlayer.elo;
    const blackElo = blackPlayer.elo;
    const { whiteNewElo, blackNewElo } = calculateElo(whiteElo, blackElo, gameData.result);
    
    // Create game object
    const newGame = {
      white_player_id: gameData.white_player_id,
      black_player_id: gameData.black_player_id,
      white_player_name: whitePlayer.username,
      black_player_name: blackPlayer.username,
      result: gameData.result,
      date: new Date().toISOString(),
      white_elo_before: whiteElo,
      black_elo_before: blackElo,
      white_elo_after: whiteNewElo,
      black_elo_after: blackNewElo,
      verified: false,
      verifier_id: null,
      verifier_name: null
    };
    
    if (useMockData()) {
      // Initialize mock data if needed
      initializeMockData();
      
      // Get games from session storage
      const games = getSessionMockData('games', []);
      
      // Generate a unique ID
      const newId = 'game-' + Date.now();
      
      // Add new game to the array
      const gameWithId = {
        id: newId,
        ...newGame
      };
      
      // Update storage
      setSessionMockData('games', [...games, gameWithId]);
      
      return gameWithId;
    }

    // Use Firebase
    const gamesRef = collection(db, 'games');
    
    // Add new game to Firestore
    const docRef = await addDoc(gamesRef, newGame);
    
    // Get the created game
    const gameDoc = await getDoc(docRef);
    
    return {
      id: gameDoc.id,
      ...gameDoc.data()
    };
  } catch (error) {
    console.error('Error creating game:', error);
    throw error;
  }
};

/**
 * Verify a game and update player ratings
 */
export const verifyGame = async (gameId, verifierId, verifierName) => {
  try {
    // Get game data
    const game = await getGameById(gameId);
    
    if (game.verified) {
      throw new Error('Game is already verified');
    }
    
    if (useMockData()) {
      // Initialize mock data if needed
      initializeMockData();
      
      // Get games from session storage
      const games = getSessionMockData('games', []);
      const players = getSessionMockData('players', []);
      
      // Find game by ID
      const gameIndex = games.findIndex(g => g.id === gameId);
      
      if (gameIndex === -1) {
        throw new Error(`Game with ID ${gameId} not found`);
      }
      
      // Create verified game
      const verifiedGame = {
        ...games[gameIndex],
        verified: true,
        verifier_id: verifierId,
        verifier_name: verifierName
      };
      
      // Update games array
      const updatedGames = [...games];
      updatedGames[gameIndex] = verifiedGame;
      
      // Update storage
      setSessionMockData('games', updatedGames);
      
      // Find and update white player
      const whitePlayerIndex = players.findIndex(p => p.id === game.white_player_id);
      if (whitePlayerIndex !== -1) {
        const whitePlayer = players[whitePlayerIndex];
        const updatedWhitePlayer = {
          ...whitePlayer,
          elo: game.white_elo_after,
          games_played: whitePlayer.games_played + 1,
          games_won: game.result === '1-0' ? whitePlayer.games_won + 1 : whitePlayer.games_won,
          games_lost: game.result === '0-1' ? whitePlayer.games_lost + 1 : whitePlayer.games_lost,
          games_drawn: game.result === '1/2-1/2' ? whitePlayer.games_drawn + 1 : whitePlayer.games_drawn
        };
        
        const updatedPlayers = [...players];
        updatedPlayers[whitePlayerIndex] = updatedWhitePlayer;
        
        // Update black player
        const blackPlayerIndex = players.findIndex(p => p.id === game.black_player_id);
        if (blackPlayerIndex !== -1) {
          const blackPlayer = players[blackPlayerIndex];
          const updatedBlackPlayer = {
            ...blackPlayer,
            elo: game.black_elo_after,
            games_played: blackPlayer.games_played + 1,
            games_won: game.result === '0-1' ? blackPlayer.games_won + 1 : blackPlayer.games_won,
            games_lost: game.result === '1-0' ? blackPlayer.games_lost + 1 : blackPlayer.games_lost,
            games_drawn: game.result === '1/2-1/2' ? blackPlayer.games_drawn + 1 : blackPlayer.games_drawn
          };
          
          updatedPlayers[blackPlayerIndex] = updatedBlackPlayer;
        }
        
        // Save updated players
        setSessionMockData('players', updatedPlayers);
      }
      
      return verifiedGame;
    }

    // Use Firebase
    const gameRef = doc(db, 'games', gameId);
    
    // Update game
    await updateDoc(gameRef, {
      verified: true,
      verifier_id: verifierId,
      verifier_name: verifierName
    });
    
    // Update player ratings and stats
    const whitePlayer = await getPlayerById(game.white_player_id);
    const blackPlayer = await getPlayerById(game.black_player_id);
    
    // Update white player
    await updatePlayer(game.white_player_id, {
      elo: game.white_elo_after,
      games_played: whitePlayer.games_played + 1,
      games_won: game.result === '1-0' ? whitePlayer.games_won + 1 : whitePlayer.games_won,
      games_lost: game.result === '0-1' ? whitePlayer.games_lost + 1 : whitePlayer.games_lost,
      games_drawn: game.result === '1/2-1/2' ? whitePlayer.games_drawn + 1 : whitePlayer.games_drawn
    });
    
    // Update black player
    await updatePlayer(game.black_player_id, {
      elo: game.black_elo_after,
      games_played: blackPlayer.games_played + 1,
      games_won: game.result === '0-1' ? blackPlayer.games_won + 1 : blackPlayer.games_won,
      games_lost: game.result === '1-0' ? blackPlayer.games_lost + 1 : blackPlayer.games_lost,
      games_drawn: game.result === '1/2-1/2' ? blackPlayer.games_drawn + 1 : blackPlayer.games_drawn
    });
    
    // Get updated game
    const updatedDoc = await getDoc(gameRef);
    
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
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
    // Get game data
    const game = await getGameById(gameId);
    
    if (useMockData()) {
      // Initialize mock data if needed
      initializeMockData();
      
      // Get games from session storage
      const games = getSessionMockData('games', []);
      
      // Filter out the game
      const updatedGames = games.filter(g => g.id !== gameId);
      
      // Check if game was found
      if (updatedGames.length === games.length) {
        throw new Error(`Game with ID ${gameId} not found`);
      }
      
      // Update storage
      setSessionMockData('games', updatedGames);
      
      // If game was verified, revert player ratings
      if (game.verified) {
        const players = getSessionMockData('players', []);
        
        // Find and update white player
        const whitePlayerIndex = players.findIndex(p => p.id === game.white_player_id);
        if (whitePlayerIndex !== -1) {
          const whitePlayer = players[whitePlayerIndex];
          const updatedWhitePlayer = {
            ...whitePlayer,
            elo: game.white_elo_before,
            games_played: whitePlayer.games_played - 1,
            games_won: game.result === '1-0' ? whitePlayer.games_won - 1 : whitePlayer.games_won,
            games_lost: game.result === '0-1' ? whitePlayer.games_lost - 1 : whitePlayer.games_lost,
            games_drawn: game.result === '1/2-1/2' ? whitePlayer.games_drawn - 1 : whitePlayer.games_drawn
          };
          
          const updatedPlayers = [...players];
          updatedPlayers[whitePlayerIndex] = updatedWhitePlayer;
          
          // Update black player
          const blackPlayerIndex = players.findIndex(p => p.id === game.black_player_id);
          if (blackPlayerIndex !== -1) {
            const blackPlayer = players[blackPlayerIndex];
            const updatedBlackPlayer = {
              ...blackPlayer,
              elo: game.black_elo_before,
              games_played: blackPlayer.games_played - 1,
              games_won: game.result === '0-1' ? blackPlayer.games_won - 1 : blackPlayer.games_won,
              games_lost: game.result === '1-0' ? blackPlayer.games_lost - 1 : blackPlayer.games_lost,
              games_drawn: game.result === '1/2-1/2' ? blackPlayer.games_drawn - 1 : blackPlayer.games_drawn
            };
            
            updatedPlayers[blackPlayerIndex] = updatedBlackPlayer;
          }
          
          // Save updated players
          setSessionMockData('players', updatedPlayers);
        }
      }
      
      return true;
    }

    // Use Firebase
    const gameRef = doc(db, 'games', gameId);
    
    // If game was verified, revert player ratings
    if (game.verified) {
      const whitePlayer = await getPlayerById(game.white_player_id);
      const blackPlayer = await getPlayerById(game.black_player_id);
      
      // Update white player
      await updatePlayer(game.white_player_id, {
        elo: game.white_elo_before,
        games_played: whitePlayer.games_played - 1,
        games_won: game.result === '1-0' ? whitePlayer.games_won - 1 : whitePlayer.games_won,
        games_lost: game.result === '0-1' ? whitePlayer.games_lost - 1 : whitePlayer.games_lost,
        games_drawn: game.result === '1/2-1/2' ? whitePlayer.games_drawn - 1 : whitePlayer.games_drawn
      });
      
      // Update black player
      await updatePlayer(game.black_player_id, {
        elo: game.black_elo_before,
        games_played: blackPlayer.games_played - 1,
        games_won: game.result === '0-1' ? blackPlayer.games_won - 1 : blackPlayer.games_won,
        games_lost: game.result === '1-0' ? blackPlayer.games_lost - 1 : blackPlayer.games_lost,
        games_drawn: game.result === '1/2-1/2' ? blackPlayer.games_drawn - 1 : blackPlayer.games_drawn
      });
    }
    
    // Delete game
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
    // Get game data
    const game = await getGameById(gameId);
    
    // Get player data for ELO calculation
    const whitePlayer = await getPlayerById(game.white_player_id);
    const blackPlayer = await getPlayerById(game.black_player_id);
    
    // Calculate new ELO changes based on result
    const { whiteNewElo, blackNewElo } = calculateElo(
      game.white_elo_before, 
      game.black_elo_before, 
      newResult
    );
    
    if (useMockData()) {
      // Initialize mock data if needed
      initializeMockData();
      
      // Get games from session storage
      const games = getSessionMockData('games', []);
      
      // Find game by ID
      const gameIndex = games.findIndex(g => g.id === gameId);
      
      if (gameIndex === -1) {
        throw new Error(`Game with ID ${gameId} not found`);
      }
      
      // Create updated game
      const updatedGame = {
        ...games[gameIndex],
        result: newResult,
        white_elo_after: whiteNewElo,
        black_elo_after: blackNewElo
      };
      
      // Update games array
      const updatedGames = [...games];
      updatedGames[gameIndex] = updatedGame;
      
      // Update storage
      setSessionMockData('games', updatedGames);
      
      // If game was verified, update player ratings
      if (game.verified) {
        const players = getSessionMockData('players', []);
        
        // Find and update white player
        const whitePlayerIndex = players.findIndex(p => p.id === game.white_player_id);
        if (whitePlayerIndex !== -1) {
          const oldResult = game.result;
          const whitePlayer = players[whitePlayerIndex];
          
          // Adjust game stats based on old and new results
          let gamesWon = whitePlayer.games_won;
          let gamesLost = whitePlayer.games_lost;
          let gamesDrawn = whitePlayer.games_drawn;
          
          // Remove old result stats
          if (oldResult === '1-0') gamesWon--;
          else if (oldResult === '0-1') gamesLost--;
          else if (oldResult === '1/2-1/2') gamesDrawn--;
          
          // Add new result stats
          if (newResult === '1-0') gamesWon++;
          else if (newResult === '0-1') gamesLost++;
          else if (newResult === '1/2-1/2') gamesDrawn++;
          
          const updatedWhitePlayer = {
            ...whitePlayer,
            elo: whiteNewElo,
            games_won: gamesWon,
            games_lost: gamesLost,
            games_drawn: gamesDrawn
          };
          
          const updatedPlayers = [...players];
          updatedPlayers[whitePlayerIndex] = updatedWhitePlayer;
          
          // Update black player
          const blackPlayerIndex = players.findIndex(p => p.id === game.black_player_id);
          if (blackPlayerIndex !== -1) {
            const blackPlayer = players[blackPlayerIndex];
            
            // Adjust game stats based on old and new results
            let gamesWon = blackPlayer.games_won;
            let gamesLost = blackPlayer.games_lost;
            let gamesDrawn = blackPlayer.games_drawn;
            
            // Remove old result stats
            if (oldResult === '0-1') gamesWon--;
            else if (oldResult === '1-0') gamesLost--;
            else if (oldResult === '1/2-1/2') gamesDrawn--;
            
            // Add new result stats
            if (newResult === '0-1') gamesWon++;
            else if (newResult === '1-0') gamesLost++;
            else if (newResult === '1/2-1/2') gamesDrawn++;
            
            const updatedBlackPlayer = {
              ...blackPlayer,
              elo: blackNewElo,
              games_won: gamesWon,
              games_lost: gamesLost,
              games_drawn: gamesDrawn
            };
            
            updatedPlayers[blackPlayerIndex] = updatedBlackPlayer;
          }
          
          // Save updated players
          setSessionMockData('players', updatedPlayers);
        }
      }
      
      return updatedGame;
    }

    // Use Firebase
    const gameRef = doc(db, 'games', gameId);
    
    // Update game
    await updateDoc(gameRef, {
      result: newResult,
      white_elo_after: whiteNewElo,
      black_elo_after: blackNewElo
    });
    
    // If game was verified, update player ratings
    if (game.verified) {
      const oldResult = game.result;
      
      // Adjust white player stats
      let whiteGamesWon = whitePlayer.games_won;
      let whiteGamesLost = whitePlayer.games_lost;
      let whiteGamesDrawn = whitePlayer.games_drawn;
      
      // Remove old result stats
      if (oldResult === '1-0') whiteGamesWon--;
      else if (oldResult === '0-1') whiteGamesLost--;
      else if (oldResult === '1/2-1/2') whiteGamesDrawn--;
      
      // Add new result stats
      if (newResult === '1-0') whiteGamesWon++;
      else if (newResult === '0-1') whiteGamesLost++;
      else if (newResult === '1/2-1/2') whiteGamesDrawn++;
      
      await updatePlayer(game.white_player_id, {
        elo: whiteNewElo,
        games_won: whiteGamesWon,
        games_lost: whiteGamesLost,
        games_drawn: whiteGamesDrawn
      });
      
      // Adjust black player stats
      let blackGamesWon = blackPlayer.games_won;
      let blackGamesLost = blackPlayer.games_lost;
      let blackGamesDrawn = blackPlayer.games_drawn;
      
      // Remove old result stats
      if (oldResult === '0-1') blackGamesWon--;
      else if (oldResult === '1-0') blackGamesLost--;
      else if (oldResult === '1/2-1/2') blackGamesDrawn--;
      
      // Add new result stats
      if (newResult === '0-1') blackGamesWon++;
      else if (newResult === '1-0') blackGamesLost++;
      else if (newResult === '1/2-1/2') blackGamesDrawn++;
      
      await updatePlayer(game.black_player_id, {
        elo: blackNewElo,
        games_won: blackGamesWon,
        games_lost: blackGamesLost,
        games_drawn: blackGamesDrawn
      });
    }
    
    // Get updated game
    const updatedDoc = await getDoc(gameRef);
    
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
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
    if (useMockData()) {
      // Initialize mock data if needed
      initializeMockData();
      
      // Get games from session storage
      const games = getSessionMockData('games', []);
      
      // Sort by date (newest first) and limit
      return [...games]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, count);
    }

    // Use Firebase
    const gamesRef = collection(db, 'games');
    const q = query(gamesRef, orderBy('date', 'desc'), limit(count));
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
    if (useMockData()) {
      // Initialize mock data if needed
      initializeMockData();
      
      // Get games from session storage
      const games = getSessionMockData('games', []);
      
      // Filter games for player, sort by date (newest first), and limit
      return [...games]
        .filter(g => g.white_player_id === playerId || g.black_player_id === playerId)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, count);
    }

    // Use Firebase
    const gamesRef = collection(db, 'games');
    const q = query(
      gamesRef,
      where('white_player_id', '==', playerId),
      where('black_player_id', '==', playerId),
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
    console.error('Error getting player games:', error);
    throw error;
  }
};