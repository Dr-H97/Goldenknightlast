const { db } = require('../db');
const { games, players } = require('../schema');
const { eq, and, desc, asc, or } = require('drizzle-orm');
const { calculateNewRatings } = require('../utils/eloCalculator');

/**
 * Get all games with optional filters and sorting
 */
const getAllGames = async (sortBy = 'date', order = 'desc', verified = null, dateRange = null, specificDate = null, fromDate = null, toDate = null, playerId = null) => {
  try {
    // Build filtering conditions
    const conditions = [];
    
    if (verified !== null) {
      conditions.push(eq(games.verified, verified));
    }
    
    // Add date range filtering - last week, last month, or specific date
    if (dateRange) {
      const today = new Date();
      let startDate;
      
      console.log(`Filtering by dateRange: "${dateRange}"`);
      
      if (dateRange === 'week' || dateRange === 'last-week') {
        // Last 7 days
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
        console.log(`Date filter: ${startDate.toISOString()} to now`);
        console.log(`SQL date comparison: games.date >= ${startDate.toISOString()}`);
        
        // Debug current date and time for reference
        console.log(`Current time: ${today.toISOString()}`);
        
        // List all games for debugging
        db.select({
          id: games.id,
          date: games.date,
          whiteId: games.whitePlayerId,
          blackId: games.blackPlayerId,
          result: games.result
        }).from(games).orderBy(desc(games.date)).then(allGames => {
          console.log('All game dates:');
          allGames.forEach(g => console.log(`Game ${g.id}: ${g.date.toISOString()}`));
        });
        
        conditions.push(games.date >= startDate);
      } else if (dateRange === 'month' || dateRange === 'last-month') {
        // Last 30 days
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 30);
        console.log(`Date filter: ${startDate.toISOString()} to now`);
        conditions.push(games.date >= startDate);
      } else if (dateRange === 'year' || dateRange === 'last-year') {
        // Last 365 days
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 365);
        console.log(`Date filter: ${startDate.toISOString()} to now`);
        conditions.push(games.date >= startDate);
      }
    }
    
    // Add specific date filtering
    if (specificDate) {
      try {
        const date = new Date(specificDate);
        // Set to beginning of the day
        date.setHours(0, 0, 0, 0);
        
        // Create end date (end of the same day)
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        
        // Between start of day and end of day
        conditions.push(games.date >= date);
        conditions.push(games.date <= endDate);
      } catch (e) {
        console.error('Invalid date format for specificDate:', e);
      }
    }
    
    // Add from date filtering
    if (fromDate) {
      try {
        const date = new Date(fromDate);
        conditions.push(games.date >= date);
      } catch (e) {
        console.error('Invalid date format for fromDate:', e);
      }
    }
    
    // Add to date filtering
    if (toDate) {
      try {
        const date = new Date(toDate);
        conditions.push(games.date <= date);
      } catch (e) {
        console.error('Invalid date format for toDate:', e);
      }
    }
    
    // Add player filtering
    if (playerId) {
      conditions.push(
        or(
          eq(games.whitePlayerId, playerId),
          eq(games.blackPlayerId, playerId)
        )
      );
    }
    
    // Build query with filtering
    let query = db.select().from(games);
    
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
    
    // Execute the query to get base game data
    const gamesData = await query;
    
    // For each game, fetch the player info separately
    const enrichedGames = await Promise.all(gamesData.map(async (game) => {
      const [whitePlayer] = await db
        .select({
          id: players.id,
          name: players.name,
          currentElo: players.currentElo
        })
        .from(players)
        .where(eq(players.id, game.whitePlayerId));
        
      const [blackPlayer] = await db
        .select({
          id: players.id,
          name: players.name,
          currentElo: players.currentElo
        })
        .from(players)
        .where(eq(players.id, game.blackPlayerId));
        
      return {
        ...game,
        whitePlayer,
        blackPlayer
      };
    }));
    
    return enrichedGames;
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
    // Get the base game data first
    const [game] = await db
      .select()
      .from(games)
      .where(eq(games.id, id));
    
    if (!game) {
      return null;
    }
    
    // Get white player data
    const [whitePlayer] = await db
      .select({
        id: players.id,
        name: players.name,
        currentElo: players.currentElo
      })
      .from(players)
      .where(eq(players.id, game.whitePlayerId));
      
    // Get black player data
    const [blackPlayer] = await db
      .select({
        id: players.id,
        name: players.name,
        currentElo: players.currentElo
      })
      .from(players)
      .where(eq(players.id, game.blackPlayerId));
    
    // Combine the data
    return {
      ...game,
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
    // First get all games where the player is either white or black
    let query = db
      .select()
      .from(games)
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
    
    const gamesData = await query;
    
    // For each game, fetch the player info
    const enrichedGames = await Promise.all(gamesData.map(async (game) => {
      const [whitePlayer] = await db
        .select({
          id: players.id,
          name: players.name,
          currentElo: players.currentElo
        })
        .from(players)
        .where(eq(players.id, game.whitePlayerId));
        
      const [blackPlayer] = await db
        .select({
          id: players.id,
          name: players.name,
          currentElo: players.currentElo
        })
        .from(players)
        .where(eq(players.id, game.blackPlayerId));
        
      return {
        ...game,
        whitePlayer,
        blackPlayer
      };
    }));
    
    return enrichedGames;
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

/**
 * Update a game result and recalculate ELO ratings
 */
const updateGame = async (id, gameData) => {
  try {
    // Get the original game first to see if it's verified
    const [originalGame] = await db
      .select()
      .from(games)
      .where(eq(games.id, id));
    
    if (!originalGame) {
      return null;
    }
    
    const wasVerified = originalGame.verified;
    const isVerified = gameData.verified !== undefined ? gameData.verified : wasVerified;
    
    // If the game was previously verified, revert the ELO changes
    if (wasVerified) {
      // Get player data
      const [whitePlayer] = await db
        .select()
        .from(players)
        .where(eq(players.id, originalGame.whitePlayerId));
      
      const [blackPlayer] = await db
        .select()
        .from(players)
        .where(eq(players.id, originalGame.blackPlayerId));
      
      if (whitePlayer && blackPlayer) {
        // Revert the old ratings by applying the inverse changes
        const whiteElo = whitePlayer.currentElo - originalGame.whiteEloChange;
        const blackElo = blackPlayer.currentElo - originalGame.blackEloChange;
        
        // Update players with reverted ratings
        await db
          .update(players)
          .set({ currentElo: whiteElo })
          .where(eq(players.id, whitePlayer.id));
        
        await db
          .update(players)
          .set({ currentElo: blackElo })
          .where(eq(players.id, blackPlayer.id));
      }
    }
    
    // Create update object with only provided data
    const updateObject = {};
    if (gameData.result !== undefined) updateObject.result = gameData.result;
    if (gameData.verified !== undefined) updateObject.verified = gameData.verified;
    if (gameData.date !== undefined) updateObject.date = new Date(gameData.date);
    
    // Recalculate ELO changes if game is verified and result was changed
    let whiteEloChange = originalGame.whiteEloChange || 0;
    let blackEloChange = originalGame.blackEloChange || 0;
    
    if (isVerified && gameData.result !== undefined && gameData.result !== originalGame.result) {
      // Get current player ELOs
      const [whitePlayer] = await db
        .select()
        .from(players)
        .where(eq(players.id, originalGame.whitePlayerId));
      
      const [blackPlayer] = await db
        .select()
        .from(players)
        .where(eq(players.id, originalGame.blackPlayerId));
      
      if (whitePlayer && blackPlayer) {
        // Calculate new ratings based on updated result
        const { whiteNewElo, blackNewElo, whiteChange, blackChange } = calculateNewRatings(
          whitePlayer.currentElo,
          blackPlayer.currentElo,
          gameData.result
        );
        
        whiteEloChange = whiteChange;
        blackEloChange = blackChange;
        
        // Update ELO changes in the update object
        updateObject.whiteEloChange = whiteEloChange;
        updateObject.blackEloChange = blackEloChange;
        
        // Update players with new ratings
        await db
          .update(players)
          .set({ currentElo: whiteNewElo })
          .where(eq(players.id, whitePlayer.id));
        
        await db
          .update(players)
          .set({ currentElo: blackNewElo })
          .where(eq(players.id, blackPlayer.id));
      }
    }
    
    // Update the game record
    const [updatedGame] = await db
      .update(games)
      .set(updateObject)
      .where(eq(games.id, id))
      .returning();
    
    return updatedGame;
  } catch (error) {
    console.error(`Error in updateGame (${id}):`, error);
    throw error;
  }
};

module.exports = {
  getAllGames,
  getGameById,
  getGamesForPlayer,
  createGame,
  verifyGame,
  deleteGame,
  updateGame
};
