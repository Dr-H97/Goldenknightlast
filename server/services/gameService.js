const { db } = require('../db');
const { games, players } = require('../schema');
const { eq, and, desc, asc, or } = require('drizzle-orm');
const { calculateNewRatings } = require('../utils/eloCalculator');

/**
 * Get all games with optional filters and sorting
 */
const getAllGames = async (sortBy = 'date', order = 'desc', verified = null) => {
  try {
    // Build filtering conditions
    const conditions = [];
    
    if (verified !== null) {
      conditions.push(eq(games.verified, verified));
    }
    
    // Build query with filters - use aliases for player joins
    const wp = players.as('wp');
    const bp = players.as('bp');
    
    let query = db
      .select({
        ...games,
        whitePlayer: {
          id: wp.id,
          name: wp.name,
          currentElo: wp.currentElo
        },
        blackPlayer: {
          id: bp.id,
          name: bp.name,
          currentElo: bp.currentElo
        }
      })
      .from(games)
      .leftJoin(wp, eq(games.whitePlayerId, wp.id))
      .leftJoin(bp, eq(games.blackPlayerId, bp.id));
    
    // Add conditions if any
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Add sorting
    if (sortBy === 'date') {
      query = order === 'asc' 
        ? query.orderBy(asc(games.date))
        : query.orderBy(desc(games.date));
    } else {
      // Default to sorting by date if sortBy is not recognized
      query = order === 'asc'
        ? query.orderBy(asc(games.date))
        : query.orderBy(desc(games.date));
    }
    
    const result = await query;
    
    // Process the result to handle the joined data correctly
    return result.map(row => {
      const { whitePlayer, blackPlayer, ...gameData } = row;
      return {
        ...gameData,
        whitePlayer,
        blackPlayer
      };
    });
  } catch (error) {
    console.error('Error in getAllGames:', error);
    throw error;
  }
};

/**
 * Get a game by ID with player information
 */
const getGameById = async (id) => {
  try {
    const wp = players.as('wp');
    const bp = players.as('bp');
    
    const [result] = await db
      .select({
        ...games,
        whitePlayer: {
          id: wp.id,
          name: wp.name,
          currentElo: wp.currentElo
        },
        blackPlayer: {
          id: bp.id,
          name: bp.name,
          currentElo: bp.currentElo
        }
      })
      .from(games)
      .leftJoin(wp, eq(games.whitePlayerId, wp.id))
      .leftJoin(bp, eq(games.blackPlayerId, bp.id))
      .where(eq(games.id, id));
    
    if (!result) {
      return null;
    }
    
    // Process the result to handle the joined data correctly
    const { whitePlayer, blackPlayer, ...gameData } = result;
    return {
      ...gameData,
      whitePlayer,
      blackPlayer
    };
  } catch (error) {
    console.error(`Error in getGameById (${id}):`, error);
    throw error;
  }
};

/**
 * Get all games for a specific player
 */
const getGamesForPlayer = async (playerId, sortBy = 'date', order = 'desc') => {
  try {
    const wp = players.as('wp');
    const bp = players.as('bp');
    
    // Build query to find games where player is either white or black
    let query = db
      .select({
        ...games,
        whitePlayer: {
          id: wp.id,
          name: wp.name,
          currentElo: wp.currentElo
        },
        blackPlayer: {
          id: bp.id,
          name: bp.name,
          currentElo: bp.currentElo
        }
      })
      .from(games)
      .leftJoin(wp, eq(games.whitePlayerId, wp.id))
      .leftJoin(bp, eq(games.blackPlayerId, bp.id))
      .where(
        or(
          eq(games.whitePlayerId, playerId),
          eq(games.blackPlayerId, playerId)
        )
      );
    
    // Add sorting
    if (sortBy === 'date') {
      query = order === 'asc' 
        ? query.orderBy(asc(games.date))
        : query.orderBy(desc(games.date));
    } else {
      // Default to sorting by date
      query = order === 'asc'
        ? query.orderBy(asc(games.date))
        : query.orderBy(desc(games.date));
    }
    
    const result = await query;
    
    // Process the result to handle the joined data correctly
    return result.map(row => {
      const { whitePlayer, blackPlayer, ...gameData } = row;
      return {
        ...gameData,
        whitePlayer,
        blackPlayer
      };
    });
  } catch (error) {
    console.error(`Error in getGamesForPlayer (${playerId}):`, error);
    throw error;
  }
};

/**
 * Create a new game and update player ratings
 */
const createGame = async (gameData) => {
  // Start a transaction since we need to update multiple tables
  try {
    return await db.transaction(async (tx) => {
      // Get the players to calculate Elo changes
      const whitePlayer = await tx
        .select()
        .from(players)
        .where(eq(players.id, gameData.whitePlayerId))
        .then(rows => rows[0]);
      
      const blackPlayer = await tx
        .select()
        .from(players)
        .where(eq(players.id, gameData.blackPlayerId))
        .then(rows => rows[0]);
      
      if (!whitePlayer || !blackPlayer) {
        throw new Error('One or both players not found');
      }
      
      // Calculate new Elo ratings based on game result
      const { whiteNewElo, blackNewElo, whiteEloChange, blackEloChange } = calculateNewRatings(
        whitePlayer.currentElo,
        blackPlayer.currentElo,
        gameData.result
      );
      
      // Create game with Elo changes
      const [newGame] = await tx
        .insert(games)
        .values({
          ...gameData,
          whiteEloChange,
          blackEloChange
        })
        .returning();
      
      // If game is verified, update player ratings immediately
      if (gameData.verified) {
        // Update white player's rating
        await tx
          .update(players)
          .set({ currentElo: whiteNewElo })
          .where(eq(players.id, whitePlayer.id));
        
        // Update black player's rating
        await tx
          .update(players)
          .set({ currentElo: blackNewElo })
          .where(eq(players.id, blackPlayer.id));
      }
      
      return newGame;
    });
  } catch (error) {
    console.error('Error in createGame:', error);
    throw error;
  }
};

/**
 * Verify a game and update player ratings
 */
const verifyGame = async (id) => {
  // Start a transaction since we need to update multiple tables
  try {
    return await db.transaction(async (tx) => {
      // Get the game
      const [game] = await tx
        .select()
        .from(games)
        .where(eq(games.id, id));
      
      if (!game) {
        return null;
      }
      
      // If already verified, just return the game
      if (game.verified) {
        return game;
      }
      
      // Get the players to update ratings
      const whitePlayer = await tx
        .select()
        .from(players)
        .where(eq(players.id, game.whitePlayerId))
        .then(rows => rows[0]);
      
      const blackPlayer = await tx
        .select()
        .from(players)
        .where(eq(players.id, game.blackPlayerId))
        .then(rows => rows[0]);
      
      // Calculate new Elo ratings based on existing Elo changes
      const whiteNewElo = whitePlayer.currentElo + game.whiteEloChange;
      const blackNewElo = blackPlayer.currentElo + game.blackEloChange;
      
      // Update white player's rating
      await tx
        .update(players)
        .set({ currentElo: whiteNewElo })
        .where(eq(players.id, whitePlayer.id));
      
      // Update black player's rating
      await tx
        .update(players)
        .set({ currentElo: blackNewElo })
        .where(eq(players.id, blackPlayer.id));
      
      // Mark game as verified
      const [updatedGame] = await tx
        .update(games)
        .set({ verified: true })
        .where(eq(games.id, id))
        .returning();
      
      return updatedGame;
    });
  } catch (error) {
    console.error(`Error in verifyGame (${id}):`, error);
    throw error;
  }
};

/**
 * Delete a game and revert player ratings if game was verified
 */
const deleteGame = async (id) => {
  // Start a transaction since we need to update multiple tables
  try {
    return await db.transaction(async (tx) => {
      // Get the game to check if it was verified
      const [game] = await tx
        .select()
        .from(games)
        .where(eq(games.id, id));
      
      if (!game) {
        return false;
      }
      
      // If game was verified, revert player ratings
      if (game.verified) {
        // Get the players
        const whitePlayer = await tx
          .select()
          .from(players)
          .where(eq(players.id, game.whitePlayerId))
          .then(rows => rows[0]);
        
        const blackPlayer = await tx
          .select()
          .from(players)
          .where(eq(players.id, game.blackPlayerId))
          .then(rows => rows[0]);
        
        if (whitePlayer && blackPlayer) {
          // Calculate reverted Elo ratings
          const whiteRevertedElo = whitePlayer.currentElo - game.whiteEloChange;
          const blackRevertedElo = blackPlayer.currentElo - game.blackEloChange;
          
          // Update white player's rating
          await tx
            .update(players)
            .set({ currentElo: whiteRevertedElo })
            .where(eq(players.id, whitePlayer.id));
          
          // Update black player's rating
          await tx
            .update(players)
            .set({ currentElo: blackRevertedElo })
            .where(eq(players.id, blackPlayer.id));
        }
      }
      
      // Delete the game
      const [deletedGame] = await tx
        .delete(games)
        .where(eq(games.id, id))
        .returning();
      
      return !!deletedGame;
    });
  } catch (error) {
    console.error(`Error in deleteGame (${id}):`, error);
    throw error;
  }
};

module.exports = {
  getAllGames,
  getGameById,
  getGamesForPlayer,
  createGame,
  verifyGame,
  deleteGame
};
